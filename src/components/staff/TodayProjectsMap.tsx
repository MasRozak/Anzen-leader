'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Navigation, Layers, RefreshCw, Clock, Users, Building, AlertCircle } from 'lucide-react';
import type { Map as LeafletMap, FeatureGroup as LeafletFeatureGroup } from 'leaflet';
import { AttendanceSummaryItem, extractProjectPins, ProjectMapPin, TOYOTA_DEFAULT_LOCATION } from '@/lib/utils';

interface TodayProjectsMapProps {
  records: AttendanceSummaryItem[];
}

export const TodayProjectsMap: React.FC<TodayProjectsMapProps> = ({ records }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersGroupRef = useRef<LeafletFeatureGroup | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'ongoing'>('all');
  const [activePinId, setActivePinId] = useState<string | null>(null);

  const allPins = useMemo(() => {
    return extractProjectPins(records);
  }, [records]);

  const ongoingCount = useMemo(() => {
    return allPins.filter((p) => p.isOngoing).length;
  }, [allPins]);

  const filteredPins = useMemo(() => {
    if (filterMode === 'ongoing') {
      return allPins.filter((p) => p.isOngoing);
    }
    return allPins;
  }, [allPins, filterMode]);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [TOYOTA_DEFAULT_LOCATION.lat, TOYOTA_DEFAULT_LOCATION.lng],
        zoom: 15,
        zoomControl: true,
      });

      // Standard OSM Tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.featureGroup().addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;

      renderMarkers(L, map, markersGroup, filteredPins);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Update markers when filteredPins changes
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersGroupRef.current) return;
      const L = await import('leaflet');
      renderMarkers(L, mapInstanceRef.current, markersGroupRef.current, filteredPins);
    }

    updateMarkers();
  }, [filteredPins]);

  const renderMarkers = (
    L: typeof import('leaflet'),
    map: LeafletMap,
    group: LeafletFeatureGroup,
    pins: ProjectMapPin[]
  ) => {
    group.clearLayers();

    if (pins.length === 0) {
      map.setView([TOYOTA_DEFAULT_LOCATION.lat, TOYOTA_DEFAULT_LOCATION.lng], 14);
      return;
    }

    pins.forEach((pin) => {
      // Create custom pin icon
      const pinColor = pin.isOngoing ? '#EB0A1E' : '#475569';
      const shadowColor = pin.isOngoing ? 'rgba(235, 10, 30, 0.45)' : 'rgba(71, 85, 105, 0.3)';
      const pulseHtml = pin.isOngoing
        ? `<div class="absolute -inset-1 rounded-full bg-red-500 opacity-60 animate-ping"></div>`
        : '';

      const customIcon = L.divIcon({
        className: 'custom-project-pin',
        html: `
          <div class="relative flex items-center justify-center">
            ${pulseHtml}
            <div style="
              background-color: ${pinColor};
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 3px 8px ${shadowColor};
              border: 2px solid #ffffff;
              cursor: pointer;
            ">
              <div style="
                width: 10px;
                height: 10px;
                background-color: #ffffff;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });

      // Clean, rich popup HTML
      const statusBadge = pin.isOngoing
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            ● Sedang Berlangsung
          </span>`
        : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            Terjadwal / Selesai
          </span>`;

      const popupHtml = `
        <div style="font-family: inherit; min-width: 230px; max-width: 280px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: #1f2937; line-height: 1.2;">
              ${pin.projectName}
            </span>
          </div>
          <div style="margin-bottom: 8px;">
            ${statusBadge}
          </div>
          <div style="font-size: 11px; color: #4b5563; line-height: 1.5; border-top: 1px solid #f3f4f6; padding-top: 6px;">
            <div><strong>Perusahaan:</strong> ${pin.companyName}</div>
            <div><strong>Anzen Leader:</strong> ${pin.anzenLeaderName}</div>
            <div><strong>Jam Kerja:</strong> ${pin.workStartTime} - ${pin.workEndTime}</div>
            <div><strong>Manpower:</strong> ${pin.manpowerCount} orang</div>
            ${pin.userDepartment ? `<div><strong>User Dept:</strong> ${pin.userDepartment}</div>` : ''}
            ${pin.locationDetail ? `<div style="font-size: 10px; color: #6b7280; margin-top: 4px; word-break: break-word;"><strong>Lokasi:</strong> ${pin.locationDetail}</div>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setActivePinId(pin.id);
      });

      group.addLayer(marker);
    });

    try {
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 16,
        });
      }
    } catch {
      // Ignore bounds error
    }
  };

  const handleResetView = () => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    try {
      const bounds = markersGroupRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 16,
        });
      } else {
        mapInstanceRef.current.setView([TOYOTA_DEFAULT_LOCATION.lat, TOYOTA_DEFAULT_LOCATION.lng], 15);
      }
    } catch {
      mapInstanceRef.current.setView([TOYOTA_DEFAULT_LOCATION.lat, TOYOTA_DEFAULT_LOCATION.lng], 15);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-toyota-red" />
            <h3 className="text-sm font-bold text-neutral-800">
              Sebaran Titik Proyek Hari Ini
            </h3>
            <span className="text-xs bg-neutral-200/80 text-neutral-700 px-2 py-0.5 rounded-full font-semibold">
              {allPins.length} Titik
            </span>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="inline-flex rounded-md shadow-xs bg-neutral-200/60 p-0.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Semua ({allPins.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('ongoing')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                filterMode === 'ongoing'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Berlangsung ({ongoingCount})
            </button>
          </div>

          {/* Reset Zoom Button */}
          <button
            type="button"
            onClick={handleResetView}
            title="Pusatkan Peta"
            className="p-1.5 text-neutral-600 bg-white border border-neutral-300 hover:bg-neutral-100 rounded text-xs flex items-center transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-80 sm:h-96 bg-neutral-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Empty State Overlay */}
        {allPins.length === 0 && (
          <div className="absolute inset-0 z-[500] bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-8 h-8 text-neutral-400 mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-neutral-700">
              Belum ada proyek yang tercatat untuk hari ini
            </p>
            <p className="text-[11px] text-neutral-500 max-w-sm mt-0.5">
              Titik lokasi proyek akan otomatis muncul di peta setelah Anzen Leader mengirimkan formulir absensi harian.
            </p>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs border border-neutral-200/80 rounded-md p-2 shadow-sm text-[11px] space-y-1">
          <div className="font-semibold text-neutral-700 text-[10px] uppercase tracking-wider mb-1">
            Keterangan Pin
          </div>
          <div className="flex items-center gap-1.5 text-neutral-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EB0A1E] ring-2 ring-red-200 inline-block" />
            <span>Sedang Berlangsung ({ongoingCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#475569] inline-block" />
            <span>Selesai / Terjadwal ({allPins.length - ongoingCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayProjectsMap;
