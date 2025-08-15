'use client';

import React, { useEffect, useState } from 'react';

interface MapProps {
  bottomMenuHeight: number;
}

export default function Map({ bottomMenuHeight }: MapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadMap = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');
        
        // Import Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Fix for default markers in Leaflet
        delete (L as any).Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Initialize the map
        const map = L.map('map', {
          zoomControl: false, // Disable default zoom control
          attributionControl: true
        }).setView([14.5995, 120.9842], 15); // Manila, Philippines

        // Add zoom control to the right side
        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        // CartoDB Voyager (clean with some color)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        // Create custom parking icon
        const createParkingIcon = (available: number, total: number) => {
          const isAvailable = available > 0;
          const color = isAvailable ? '#3b82f6' : '#ef4444';
          
          return L.divIcon({
            html: `
              <div style="
                background-color: ${color};
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                <span style="
                  color: white;
                  font-size: 16px;
                  font-weight: bold;
                ">P</span>
              </div>
            `,
            className: 'custom-parking-icon',
            iconSize: [35, 35],
            iconAnchor: [17, 17]
          });
        };

        // Generate random parking spots
        const generateRandomParkingSpots = () => {
          const centerLat = 14.5995;
          const centerLng = 120.9842;
          const spots = [];
          
          const parkingNames = [
            "SM Mall of Asia", "Robinsons Place Manila", "Cultural Center Parking", 
            "Seaside Boulevard", "CCP Complex", "Harrison Plaza", "Baclaran Church",
            "MOA Arena", "PICC Parking", "Malate District", "Intramuros Parking",
            "Manila Bay Area", "Roxas Boulevard", "Ermita District", "Port Area",
            "Luneta Park", "City Hall Parking", "Quiapo District", "Binondo Area",
            "Chinatown Parking"
          ];

          for (let i = 0; i < 20; i++) {
            const randomLat = centerLat + (Math.random() - 0.5) * 0.02;
            const randomLng = centerLng + (Math.random() - 0.5) * 0.02;
            
            const available = Math.floor(Math.random() * 50);
            const total = available + Math.floor(Math.random() * 100) + 50;
            const rates = ["₱70", "₱70", "₱70", "₱70", "₱70"]; // Base rate as per concept
            
            spots.push({
              lat: randomLat,
              lng: randomLng,
              name: parkingNames[i],
              available: available,
              total: total,
              rate: rates[Math.floor(Math.random() * rates.length)]
            });
          }
          
          return spots;
        };

        const parkingSpots = generateRandomParkingSpots();

        // Add parking markers to map
        parkingSpots.forEach(spot => {
          const icon = createParkingIcon(spot.available, spot.total);
          const marker = L.marker([spot.lat, spot.lng], { icon }).addTo(map);
          
          const statusText = spot.available > 0 ? 
            `${spot.available} of ${spot.total} spots available` : 
            'Full - No spots available';
          
          const statusColor = spot.available > 0 ? '#10b981' : '#ef4444';
          
          // Create a more dynamic pricing display
          const dynamicPrice = spot.available > 25 ? '₱65' : spot.available > 10 ? '₱85' : '₱120';
          
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${spot.name}</h3>
              <div style="color: ${statusColor}; font-weight: 500; margin-bottom: 4px;">
                ${statusText}
              </div>
              <div style="background: rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 8px; margin-bottom: 8px;">
                <div style="color: #3b82f6; font-weight: bold; font-size: 18px;">${dynamicPrice}</div>
                <div style="color: rgba(59, 130, 246, 0.7); font-size: 12px;">/hour</div>
              </div>
              <button 
                onclick="window.openParkingDialog && window.openParkingDialog('${spot.name}', '1.5 km', '4 min', '${dynamicPrice}')"
                style="
                  background-color: #3b82f6;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 12px;
                  cursor: pointer;
                  font-size: 14px;
                  width: 100%;
                  font-weight: 500;
                " ${spot.available === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                ${spot.available > 0 ? 'Reserve Spot' : 'Full'}
              </button>
            </div>
          `);
        });

        setMapLoaded(true);
      }
    };

    loadMap();
  }, []);

  return (
    <div 
      id="map" 
      className="w-full h-full relative z-0"
      style={{ paddingBottom: `${bottomMenuHeight}px` }}
    />
  );
}