'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Loader2, X } from 'lucide-react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

interface LocationPickerMapProps {
  value: string;
  onChange: (location: string) => void;
}

interface LocationPreset {
  name: string;
  category: string;
  lat: number;
  lng: number;
}

const TOYOTA_PRESETS: LocationPreset[] = [
  {
    name: 'TMMIN Sunter Plant 1 (Jakarta Utara)',
    category: 'Toyota Plant',
    lat: -6.1428,
    lng: 106.8856,
  },
  {
    name: 'TMMIN Sunter Plant 2 (Jakarta Utara)',
    category: 'Toyota Plant',
    lat: -6.1481,
    lng: 106.8824,
  },
  {
    name: 'TMMIN Karawang Plant 1 (KIIC Karawang)',
    category: 'Toyota Plant',
    lat: -6.3685,
    lng: 107.2882,
  },
  {
    name: 'TMMIN Karawang Plant 2 (KIIC Karawang)',
    category: 'Toyota Plant',
    lat: -6.3652,
    lng: 107.2915,
  },
  {
    name: 'TMMIN Karawang Plant 3 (Engine Plant)',
    category: 'Toyota Plant',
    lat: -6.3615,
    lng: 107.2968,
  },
  {
    name: 'Gedung PGD (Press & Die) Sunter',
    category: 'Plant Area',
    lat: -6.1435,
    lng: 106.8862,
  },
  {
    name: 'Area Assembly Line 1 & 2',
    category: 'Plant Area',
    lat: -6.1422,
    lng: 106.8849,
  },
  {
    name: 'Welding & Painting Shop',
    category: 'Plant Area',
    lat: -6.1441,
    lng: 106.8871,
  },
];

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ value, onChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerInstanceRef = useRef<LeafletMarker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    { title: string; subtitle: string; lat: number; lng: number }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.1428,
    lng: 106.8856,
  });

  // 1. Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      // Custom red Toyota pin marker
      const customIcon = L.divIcon({
        className: 'custom-toyota-pin',
        html: `
          <div style="
            background-color: #EB0A1E;
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background-color: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
      });

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup('<b>Lokasi Pekerjaan Proyek</b><br>Geser pin untuk memindahkan titik.').openPopup();

      // Handle marker drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng });
        const autoText = `${value ? value.split(' (')[0] : 'Area Proyek'} (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`;
        onChange(autoText);
      });

      // Handle map click
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        const autoText = `${value ? value.split(' (')[0] : 'Area Proyek'} (${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)})`;
        onChange(autoText);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Autocomplete search logic
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setAutocompleteSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const queryLower = searchQuery.toLowerCase();

      // Check presets
      const matchedPresets = TOYOTA_PRESETS.filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          p.category.toLowerCase().includes(queryLower)
      ).map((p) => ({
        title: p.name,
        subtitle: p.category,
        lat: p.lat,
        lng: p.lng,
      }));

      // Query OpenStreetMap Nominatim for live Indonesian addresses
      let osmResults: { title: string; subtitle: string; lat: number; lng: number }[] = [];
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=id&limit=4`,
          {
            headers: {
              'Accept-Language': 'id',
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          osmResults = data.map((item: any) => ({
            title: item.name || item.display_name.split(',')[0],
            subtitle: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }));
        }
      } catch {
        // Ignore network errors
      }

      setAutocompleteSuggestions([...matchedPresets, ...osmResults]);
      setIsDropdownOpen(true);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectLocation = (item: { title: string; lat: number; lng: number }) => {
    setCoords({ lat: item.lat, lng: item.lng });
    setSearchQuery('');
    setIsDropdownOpen(false);

    const formattedLocation = `${item.title} (${item.lat.toFixed(5)}, ${item.lng.toFixed(5)})`;
    onChange(formattedLocation);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 17, { duration: 1.2 });
      markerInstanceRef.current.setLatLng([item.lat, item.lng]);
      markerInstanceRef.current.bindPopup(`<b>${item.title}</b>`).openPopup();
    }
  };

  return (
    <div className="w-full bg-white pt-2 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
        <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-toyota-red" />
          Detail Lokasi Proyek (Pilih pada Peta Leaflet + OpenStreetMap)
        </label>
        <span className="text-[11px] text-neutral-400">
          Klik peta atau cari dengan auto complete untuk menandai titik
        </span>
      </div>

      {/* Autocomplete Search Bar */}
      <div className="relative mb-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (autocompleteSuggestions.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Cari lokasi dengan auto complete (contoh: Sunter 1, Karawang, Assembly, dll)..."
            className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-toyota-red focus:border-toyota-red"
          />
          {searching ? (
            <Loader2 className="w-4 h-4 text-neutral-400 animate-spin absolute right-3" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className="absolute right-3 p-0.5 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {/* Autocomplete Dropdown List */}
        {isDropdownOpen && autocompleteSuggestions.length > 0 && (
          <div className="absolute z-[1000] w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-56 overflow-y-auto divide-y divide-neutral-100">
            {autocompleteSuggestions.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectLocation(item)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-start gap-2.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-toyota-red mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-800 truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Toyota Plant Presets Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[11px] text-neutral-400 font-medium mr-1">
          Preset Cepat:
        </span>
        {TOYOTA_PRESETS.slice(0, 5).map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => selectLocation({ title: preset.name, lat: preset.lat, lng: preset.lng })}
            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-toyota-red hover:border-red-200 border border-neutral-200 transition-colors"
          >
            {preset.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Map Canvas Container */}
      <div className="w-full h-64 sm:h-72 rounded border border-neutral-300 overflow-hidden relative shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Selected Location Detail Text Input */}
      <div className="mt-2.5">
        <label className="block text-[11px] font-medium text-neutral-500 mb-1">
          Keterangan detail lokasi yang tercatat:
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Lokasi terpilih akan muncul di sini (bisa ditambahkan catatan spesifik)"
          required
          className="w-full px-3 py-1.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded font-medium text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-toyota-red focus:border-toyota-red"
        />
      </div>
    </div>
  );
};

export default LocationPickerMap;
