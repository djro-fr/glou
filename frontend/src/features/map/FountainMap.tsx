import {Map, setWorkerUrl} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import { useEffect, useRef } from 'react';

import './FountainMap.scss'

setWorkerUrl(workerUrl);

function FountainMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  useEffect(() => {
    if (!mapContainer.current) return;
    const mapInstance = new Map({
      container: mapContainer.current,
      style: 'https://openmaptiles.geo.data.gouv.fr/styles/positron/style.json', // Positron style
      center: [1.44, 43.60], // Toulouse
      zoom: 12
    });
    map.current = mapInstance;
    return () => {
      // cleanup : détruire la carte à la démontée du composant
      mapInstance.remove();
    };
  }, []);
  return (
    <>
      <h1>Trouvez une fontaine d’eau potable</h1>   
      <div ref={mapContainer} id="map" className="map-container" /> 
    </>
  )
}

export default FountainMap
