import { Map, setWorkerUrl, type GeoJSONSource, type MapMouseEvent, type MapGeoJSONFeature} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { Fountain } from "./types/fountain";

import { useEffect, useRef } from "react";

import "./FountainMap.scss";

setWorkerUrl(workerUrl);

function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

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

function FountainMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new Map({
      container: mapContainer.current,
      style: "https://openmaptiles.geo.data.gouv.fr/styles/positron/style.json", // Positron style
      center: [1.44, 43.6], // Toulouse
      fadeDuration: 0, // no fade between zooms
      zoom: 12,
    });
    map.current = mapInstance;

    fetch("http://localhost:3000/fountains")
      .then((res) => res.json())
      .then((fountains: Fountain[]) => {
        const geojson = fountainsToGeoJSON(fountains);

        mapInstance.on("load", () => {
          loadPinImages(mapInstance).then(() => {
            addFountainLayers(mapInstance, geojson);
            setupClusterInteractions(mapInstance);
          });
        });
      });

    return () => {
      // cleanup when component unmounts
      mapInstance.remove();
    };
  }, []);

  return (
    <>
      <h1>Trouvez une fontaine d’eau potable</h1>
      <div ref={mapContainer} id="map" />
    </>
  );
}

export default FountainMap;