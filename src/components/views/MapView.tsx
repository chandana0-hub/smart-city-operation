import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Layers, Crosshair, MapPin } from 'lucide-react';
import { MasterIncident, RegionZone } from '../../types';

interface MapViewProps {
  incidents: MasterIncident[];
  onInspectCluster: (incidentId: string) => void;
  activeRegion: RegionZone;
  onRegionChange: (region: RegionZone) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  onInspectCluster,
  activeRegion,
  onRegionChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapRef.current = map;
    }

    // Force map resize check
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers when incidents or activeRegion change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered =
      activeRegion === 'All'
        ? incidents
        : incidents.filter((i) => i.region === activeRegion);

    filtered.forEach((inc) => {
      const isCritical = inc.priority === 'Critical';
      const isHigh = inc.priority === 'High';
      const pinColor = isCritical ? '#EF4444' : isHigh ? '#F59E0B' : '#00ADB5';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="background-color: ${pinColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 0 14px ${pinColor}99; cursor: pointer;">
            <span style="color: white; font-size: 11px; font-weight: 800; font-family: monospace;">${inc.linkedReportsCount}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([inc.lat, inc.lng], { icon: customIcon });

      // Create Popup content element with React handler
      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'sans-serif';
      popupContent.style.padding = '4px';

      popupContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #00ADB5;">${inc.id}</span>
          <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${pinColor}22; color: ${pinColor};">${inc.priority}</span>
        </div>
        <div style="font-size: 13px; font-weight: bold; color: #FFFFFF; line-height: 1.3; margin-bottom: 6px;">${inc.title}</div>
        <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 3px;"><strong>Consolidated:</strong> ${inc.linkedReportsCount} Citizen Tickets</div>
        <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 3px;"><strong>Department:</strong> ${inc.department}</div>
        <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 8px;"><strong>Work Order:</strong> #${inc.workOrderId}</div>
        <button id="inspect-btn-${inc.id}" style="width: 100%; padding: 6px 10px; background: #00ADB5; color: #0B192C; font-weight: bold; font-size: 11px; border: none; border-radius: 6px; cursor: pointer; transition: 0.2s;">
          Inspect 20 Linked Reports
        </button>
      `;

      // Attach button click event
      const btn = popupContent.querySelector(`#inspect-btn-${inc.id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          onInspectCluster(inc.id);
        });
      }

      marker.bindPopup(popupContent, { minWidth: 220 });
      markersLayerRef.current?.addLayer(marker);
    });

    // Recenter if specific region chosen
    if (activeRegion === 'Central Metro - Ward 03') {
      mapRef.current.setView([12.9716, 77.5946], 14);
    } else if (activeRegion === 'North Zone - Ward 14') {
      mapRef.current.setView([12.992, 77.585], 14);
    } else if (activeRegion === 'East Industrial - Ward 21') {
      mapRef.current.setView([12.965, 77.635], 14);
    }
  }, [incidents, activeRegion, onInspectCluster]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([12.9716, 77.5946], 13);
    }
  };

  return (
    <section className="space-y-4 animate-in fade-in duration-300">
      {/* Title & Priority Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Live OpenStreetMap Civic Incident GIS
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00ADB5] border border-cyan-500/30">
              Leaflet Dynamic GIS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial visualization of master incidents color-coded by AI risk priority.
          </p>
        </div>

        {/* Priority Legend */}
        <div className="flex items-center gap-3 text-xs bg-[#0F2744] px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm" />
            <span>Critical</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm" />
            <span>High</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#00ADB5] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ADB5] inline-block shadow-sm" />
            <span>Medium</span>
          </span>
        </div>
      </div>

      {/* Map Card */}
      <div className="glassmorphism rounded-3xl p-2.5 border border-slate-800 overflow-hidden shadow-2xl relative">
        <div ref={mapContainerRef} className="w-full h-[540px] sm:h-[600px] rounded-2xl z-10" />

        {/* Floating Controls Top-Right */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
          <button
            onClick={handleRecenter}
            className="p-2.5 rounded-xl glassmorphism hover:bg-[#163355] text-[#00ADB5] border border-cyan-500/40 shadow-xl transition"
            title="Recenter to Central Metro"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Legend Overlay Bottom-Left */}
        <div className="absolute bottom-6 left-6 z-20 glassmorphism p-3.5 rounded-2xl border border-cyan-500/30 text-xs space-y-1.5 shadow-2xl max-w-xs pointer-events-auto">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#00ADB5]" />
            <span>Deduplication Overlay</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Numbered pins depict consolidated clusters. Clicking any marker reveals incident metrics and enables inspecting all underlying citizen submissions.
          </p>
        </div>
      </div>
    </section>
  );
};
