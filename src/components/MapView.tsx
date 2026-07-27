import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City } from '../data/cities';
import type { Guess } from '../types';

interface MapViewProps {
  guesses: Guess[];
  targetCity: City | null; // only passed once the game has ended
  pendingPin: { lat: number; lon: number } | null;
  disabled: boolean;
  onPick: (lat: number, lon: number) => void;
}

function pinIcon(color: string, label?: string): L.DivIcon {
  return L.divIcon({
    className: 'wg-pin-wrapper',
    html: `<div class="wg-pin" style="--pin-color:${color}">${label ?? ''}</div>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
  });
}

export default function MapView({
  guesses,
  targetCity,
  pendingPin,
  disabled,
  onPick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onPickRef = useRef(onPick);
  const disabledRef = useRef(disabled);
  onPickRef.current = onPick;
  disabledRef.current = disabled;

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
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (disabledRef.current) return;
      onPickRef.current(e.latlng.lat, e.latlng.lng);
    });

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    guesses.forEach((guess, i) => {
      const color = guess.correct ? '#2e7d32' : '#c62828';
      L.marker([guess.lat, guess.lon], { icon: pinIcon(color, String(i + 1)) })
        .addTo(layer)
        .bindTooltip(`Guess ${i + 1}`, { direction: 'top', offset: [0, -30] });
    });

    if (pendingPin) {
      L.marker([pendingPin.lat, pendingPin.lon], {
        icon: pinIcon('#1565c0'),
        opacity: 0.9,
      }).addTo(layer);
    }

    if (targetCity) {
      L.marker([targetCity.lat, targetCity.lon], { icon: pinIcon('#f9a825', '★') })
        .addTo(layer)
        .bindTooltip(`${targetCity.name}, ${targetCity.country}`, {
          direction: 'top',
          offset: [0, -30],
          permanent: true,
        });

      const bounds = L.latLngBounds([
        [targetCity.lat, targetCity.lon],
        ...guesses.map((g): [number, number] => [g.lat, g.lon]),
      ]);
      map.fitBounds(bounds.pad(0.3), { maxZoom: 6 });
    }
  }, [guesses, pendingPin, targetCity]);

  return <div ref={containerRef} className="wg-map" />;
}
