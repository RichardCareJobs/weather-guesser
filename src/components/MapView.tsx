import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City } from '../data/cities';

interface MapViewProps {
  city: City | null;
}

function cityPinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'wg-pin-wrapper',
    html: `<div class="wg-pin"></div>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
  });
}

export default function MapView({ city }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const shownCityIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1,
      worldCopyJump: true,
      zoomControl: false,
      attributionControl: false,
    });

    // CARTO's "Voyager" basemap renders place labels in English (falling back
    // to the local name when no English name exists) instead of the local
    // language used by the standard OSM tiles. (Wikimedia's osm-intl tiles
    // have the same effect but return 403 for non-Wikimedia sites.)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      subdomains: 'abcd',
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors © CARTO',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !city) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    const marker = L.marker([city.lat, city.lon], { icon: cityPinIcon() }).addTo(map);
    marker.bindTooltip(`${city.name}, ${city.country}`, {
      direction: 'top',
      offset: [0, -32],
      permanent: true,
      className: 'wg-city-tooltip',
    });
    markerRef.current = marker;

    const isFirstCity = shownCityIdRef.current === null;
    shownCityIdRef.current = city.id;
    map.flyTo([city.lat, city.lon], 6, {
      duration: isFirstCity ? 1.1 : 1.6,
    });
  }, [city]);

  return <div ref={containerRef} className="wg-map" />;
}
