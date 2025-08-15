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
        }).setView([14.5647, 120.9930], 16); // DLSU Taft Avenue

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

        // Create custom parking icon using inline SVG with dynamic colors
        const createParkingIcon = (available: number, total: number) => {
          const isAvailable = available > 0;
          // Using balanced colors - vibrant but not harsh
          const primaryColor = isAvailable ? '#22c55e' : '#ef4444';
          const strokeColor = isAvailable ? '#22c55e' : '#ef4444';
          
          return L.divIcon({
            html: `
              <div style="
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              ">
                <svg width="40" height="40" viewBox="0 0 442.2 555.29" xmlns="http://www.w3.org/2000/svg">
                  <path fill="${primaryColor}" d="M434.7,221.22c0,118-95.7,213.75-213.75,213.75S7.2,339.27,7.2,221.22A213.74,213.74,0,0,1,221,7.47C339,7.47,434.7,103.17,434.7,221.22Z"/>
                  <path fill="${primaryColor}" d="M427.2,221.22c-.27,82.12-50.19,158-126,190.1-76.73,32.51-168,14.27-226.59-44.72-62-62.4-77.8-160.64-37.48-239.13a209.09,209.09,0,0,1,101-95.28c42.11-18.68,90.7-22.19,135.19-10.5,78.83,20.73,139,87.91,151.52,168.34a208.67,208.67,0,0,1,2.29,31.19c0,9.65,15,9.67,15,0-.14-44.1-13.26-87.79-38.18-124.25a221.38,221.38,0,0,0-237-90.37c-49.65,12.4-93.65,42.41-124.13,83.38-57.15,76.83-57,186.33.35,263a221.12,221.12,0,0,0,232.87,82.61c84.46-21.6,150.6-94.14,163.5-180.5a234.87,234.87,0,0,0,2.62-33.82C442.23,211.56,427.23,211.55,427.2,221.22Z"/>
                  <path fill="${strokeColor}" stroke="${strokeColor}" stroke-miterlimit="10" d="M.5,555.3V221.22s4.65,199.47,198.87,209.26"/>
                  <path fill="#fff" stroke="#fff" stroke-miterlimit="10" d="M258.69,127.78H183.2a28.07,28.07,0,0,0-24.3,14L121.15,207.19a28.07,28.07,0,0,0,0,28.06l37.75,65.38a28.07,28.07,0,0,0,24.3,14h75.49a28.08,28.08,0,0,0,24.31-14L320.74,235.25a28,28,0,0,0,0-28.06L283,141.81A28.08,28.08,0,0,0,258.69,127.78Z"/>
                </svg>
              </div>
            `,
            className: 'custom-parking-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });
        };

        // Generate parking spots around DLSU area
        const generateParkingSpotsAroundDLSU = () => {
          const dlsuLat = 14.5647;
          const dlsuLng = 120.9930;
          const spots = [];
          
          // Specific parking locations around DLSU and Taft Avenue
          const parkingLocations = [
            { name: "DLSU Parking Building", lat: 14.5640, lng: 120.9935, distance: "50m" },
            { name: "Robinson's Place Manila", lat: 14.5599, lng: 120.9978, distance: "400m" },
            { name: "Taft Avenue Commercial", lat: 14.5665, lng: 120.9925, distance: "200m" },
            { name: "Vito Cruz Station Area", lat: 14.5634, lng: 120.9943, distance: "150m" },
            { name: "Pedro Gil Street Parking", lat: 14.5680, lng: 120.9918, distance: "350m" },
            { name: "Malate Church Area", lat: 14.5618, lng: 120.9955, distance: "250m" },
            { name: "St. Scholastica Parking", lat: 14.5695, lng: 120.9910, distance: "500m" },
            { name: "Taft-Pablo Ocampo Corner", lat: 14.5655, lng: 120.9920, distance: "180m" },
            { name: "EGI Taft Tower", lat: 14.5620, lng: 120.9940, distance: "300m" },
            { name: "Harrison Plaza Overflow", lat: 14.5605, lng: 120.9965, distance: "450m" },
            { name: "CSB Parking Area", lat: 14.5685, lng: 120.9915, distance: "400m" },
            { name: "Adriatico Street Parking", lat: 14.5630, lng: 120.9960, distance: "350m" },
            { name: "Agno Street Commercial", lat: 14.5610, lng: 120.9945, distance: "400m" },
            { name: "Taft Avenue MRT Parking", lat: 14.5640, lng: 120.9950, distance: "200m" },
            { name: "Remedios Circle Area", lat: 14.5595, lng: 120.9985, distance: "550m" },
            { name: "United Nations Avenue", lat: 14.5675, lng: 120.9905, distance: "450m" },
            { name: "Quirino Avenue Junction", lat: 14.5590, lng: 120.9950, distance: "600m" },
            { name: "Pres. Quirino Ave Parking", lat: 14.5585, lng: 120.9960, distance: "650m" }
          ];

          parkingLocations.forEach((location, index) => {
            // Make some spots unavailable for demo purposes
            let available, total;
            
            if (index === 1 || index === 4 || index === 7 || index === 12 || index === 16) {
              // These spots are full (0 available)
              available = 0;
              total = Math.floor(Math.random() * 80) + 40;
            } else if (index === 3 || index === 9 || index === 14) {
              // These spots are nearly full (1-3 spots left)
              available = Math.floor(Math.random() * 3) + 1;
              total = available + Math.floor(Math.random() * 70) + 30;
            } else {
              // These spots have good availability
              available = Math.floor(Math.random() * 40) + 10;
              total = available + Math.floor(Math.random() * 60) + 20;
            }
            
            spots.push({
              lat: location.lat,
              lng: location.lng,
              name: location.name,
              available: available,
              total: total,
              rate: "₱70"
            });
          });
          
          return spots;
        };

        const parkingSpots = generateParkingSpotsAroundDLSU();

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

        // Add user location pin at Gokongwei Building
        const userLocationIcon = L.divIcon({
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background-color: #3b82f6;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                width: 40px;
                height: 40px;
                background-color: rgba(59, 130, 246, 0.2);
                border-radius: 50%;
                position: absolute;
                top: -10px;
                left: -10px;
                animation: pulse 2s infinite;
              "></div>
            </div>
            <style>
              @keyframes pulse {
                0% { transform: scale(0.95); opacity: 1; }
                70% { transform: scale(1); opacity: 0.7; }
                100% { transform: scale(1.05); opacity: 0; }
              }
            </style>
          `,
          className: 'user-location-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Gokongwei Building coordinates (exact location)
        const gokongweiLat = 14.566401265497952;
        const gokongweiLng = 120.9932240439279;
        
        const userMarker = L.marker([gokongweiLat, gokongweiLng], { icon: userLocationIcon }).addTo(map);
        userMarker.bindPopup(`
          <div style="min-width: 150px; text-align: center;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #3b82f6;">Your Location</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Gokongwei Building, DLSU</p>
          </div>
        `);

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