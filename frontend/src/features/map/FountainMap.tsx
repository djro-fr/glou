import type { Map, GeoJSONSource, MapMouseEvent, MapGeoJSONFeature } from "maplibre-gl";

import { useEffect, useRef, useState } from "react";

import type { Fountain } from "./types/fountain";

import "./FountainMap.scss";

import { getCSSVariable } from "../../shared/helpers/getCSSVariable";

import FountainDetails from "./FountainDetails";
import DistrictFilter from "./DistrictFilter";
import type { District } from "./types/district";

function fountainsToGeoJSON(fountains: Fountain[]) {
  return {
    type: "FeatureCollection" as const,
    features: fountains.map((fountain) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [fountain.longitude, fountain.latitude],
      },
      properties: {
        id: fountain.id,
        name: fountain.location_f,
        type: fountain.type_f,
        status: fountain.status_f,
      },
    })),
  };
}

// Loads the 3 pins and records them on map sprite
function loadPinImages(mapInstance: Map): Promise<void> {
  return Promise.all([
    mapInstance.loadImage('/icons/pin-open.png'),
    mapInstance.loadImage('/icons/pin-closed.png'),
    mapInstance.loadImage('/icons/pin.png'),
  ]).then(([openImg, closedImg, unknownImg]) => {
    if (!mapInstance.hasImage('pin-open')) {
      mapInstance.addImage('pin-open', openImg.data);
    }
    if (!mapInstance.hasImage('pin-closed')) {
      mapInstance.addImage('pin-closed', closedImg.data);
    }
    if (!mapInstance.hasImage('pin-unknown')) {
      mapInstance.addImage('pin-unknown', unknownImg.data);
    }
  });
}

function addFountainLayers(
  mapInstance: Map,
  geojson: ReturnType<typeof fountainsToGeoJSON>
) {
  mapInstance.addSource("fountains", {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  mapInstance.addLayer({
    id: "clusters",
    type: "circle",
    source: "fountains",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        getCSSVariable('--primary-700'),
        10,
        getCSSVariable('--primary-800'),
        50,
        getCSSVariable('--primary-900'),
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        15,
        10,
        20,
        50,
        25,
      ],
    },
  });

  mapInstance.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "fountains",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      'text-font': ['Metropolis Medium'],
      "text-size": 16,
      'text-anchor': 'center',
      'text-justify': 'center',
      'text-offset': [0, .2],
    },
    paint: {
      'text-color': getCSSVariable('--neutral-0'),
    },
  });

  mapInstance.addLayer({
    id: "unclustered-point",
    type: "symbol",
    source: "fountains",
    filter: ["!", ["has", "point_count"]],
    layout: {
      'icon-image': [
        'match',
        ['get', 'status'],
        'Ouverte', 'pin-open',
        'Fermée pour maintenance', 'pin-closed',
        'pin-unknown',
      ],
      'icon-size': 0.2,
      'icon-anchor': 'bottom',
    },
  });
}

function zoomToCluster(
  mapInstance: Map,
  clusterFeature: MapGeoJSONFeature
) {
  const clusterId = clusterFeature.properties?.cluster_id;
  const source = mapInstance.getSource('fountains') as GeoJSONSource;

  if (clusterFeature.geometry.type !== 'Point') return;
  const coordinates = clusterFeature.geometry.coordinates as [number, number];

  source.getClusterExpansionZoom(clusterId).then((zoom) => {
    mapInstance.easeTo({ center: coordinates, zoom });
  });
}

function handleClusterClick(mapInstance: Map, e: MapMouseEvent) {
  const features = mapInstance.queryRenderedFeatures(e.point, {
    layers: ['clusters'],
  });
  if (!features.length) return;
  zoomToCluster(mapInstance, features[0]);
}

function setupClusterInteractions(mapInstance: Map) {
  mapInstance.on('click', 'clusters', (e) => handleClusterClick(mapInstance, e));

  mapInstance.on('mouseenter', 'clusters', () => {
    mapInstance.getCanvas().style.cursor = 'pointer';
  });
  mapInstance.on('mouseleave', 'clusters', () => {
    mapInstance.getCanvas().style.cursor = '';
  });
}

function setupPinInteractions(
  mapInstance: Map,
  fountains: Fountain[],
  onPinClick: (fountain: Fountain) => void
) {
  mapInstance.on('click', 'unclustered-point', (e) => {
    if (!e.features?.length) return;

    const clickedId = e.features[0].properties?.id;
    const fountain = fountains.find((f) => f.id === clickedId);

    if (fountain) onPinClick(fountain);
  });

  mapInstance.on('mouseenter', 'unclustered-point', () => {
    mapInstance.getCanvas().style.cursor = 'pointer';
  });
  mapInstance.on('mouseleave', 'unclustered-point', () => {
    mapInstance.getCanvas().style.cursor = '';
  });
}

function handleMapLoad(
  mapInstance: Map,
  geojson: ReturnType<typeof fountainsToGeoJSON>,
  fountains: Fountain[],
  onPinClick: (fountain: Fountain) => void
) {
  loadPinImages(mapInstance).then(() => {
    addFountainLayers(mapInstance, geojson);
    setupClusterInteractions(mapInstance);
    setupPinInteractions(mapInstance, fountains, onPinClick);
  });
}

function initFountainLayer(
  mapInstance: Map,
  fountainsRef: React.RefObject<Fountain[]>,
  onPinClick: (fountain: Fountain) => void
) {
  fetch("http://localhost:3000/fountains")
    .then((res) => res.json())
    .then((fountains: Fountain[]) => {
      fountainsRef.current = fountains;
      const geojson = fountainsToGeoJSON(fountains);
      mapInstance.on("load", () => handleMapLoad(mapInstance, geojson, fountainsRef.current, onPinClick));
    });
}

function handleDistrictSelect(district: District | null) {
   console.log('District selected:', district);
}

function FountainMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const fountainsRef = useRef<Fountain[]>([]);
  const [selectedFountain, setSelectedFountain] = useState<Fountain | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    let mapInstance: Map | null = null;
    let cancelled = false;

    async function initMap() {
      const [{ Map: MapLibreMap, setWorkerUrl }, workerUrlModule] = await Promise.all([
        import("maplibre-gl"),
        import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"),
      ]);
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (cancelled || !mapContainer.current) return;

      setWorkerUrl(workerUrlModule.default);

      mapInstance = new MapLibreMap({
        container: mapContainer.current,
        style: "https://openmaptiles.geo.data.gouv.fr/styles/positron/style.json",
        center: [1.44, 43.6],
        fadeDuration: 0,
        zoom: 12,
      });
      map.current = mapInstance;

      initFountainLayer(mapInstance, fountainsRef, setSelectedFountain);
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstance?.remove();
    };
  }, []);

  return (
    <>
      <h1>Trouvez une fontaine d’eau potable</h1>
      <div ref={mapContainer} id="map" />
      {selectedFountain && (
        <FountainDetails fountain={selectedFountain} onClose={() => setSelectedFountain(null)} />
      )}
      <div className="filter-bar">
        <DistrictFilter onSelect={handleDistrictSelect} />
      </div>
    </>
  );
}

export default FountainMap;