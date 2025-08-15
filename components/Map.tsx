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

        // Check if map container already exists and remove any existing map
        const mapContainer = document.getElementById('map');
        if (mapContainer && (window as Record<string, unknown>).mapInstance) {
          try {
            const existingMap = (window as Record<string, unknown>).mapInstance as any;
            if (existingMap.remove) {
              existingMap.remove();
            }
          } catch (error) {
            console.log('Existing map cleanup error:', error);
          }
        }

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
          const spots: Array<{id: string, lat: number, lng: number, name: string, available: number, total: number, rate: string}> = [];
          
          // Specific parking locations around DLSU and Taft Avenue
          const parkingLocations = [
            { id: "PARK001", name: "DLSU Parking Building", lat: 14.5640, lng: 120.9935, distance: "50m" },
            { id: "PARK002", name: "Robinson's Place Manila", lat: 14.5599, lng: 120.9978, distance: "400m" },
            { id: "PARK003", name: "Taft Avenue Commercial", lat: 14.5665, lng: 120.9925, distance: "200m" },
            { id: "PARK004", name: "Vito Cruz Station Area", lat: 14.5634, lng: 120.9943, distance: "150m" },
            { id: "PARK005", name: "Pedro Gil Street Parking", lat: 14.5680, lng: 120.9918, distance: "350m" },
            { id: "PARK006", name: "Malate Church Area", lat: 14.5618, lng: 120.9955, distance: "250m" },
            { id: "PARK007", name: "St. Scholastica Parking", lat: 14.5695, lng: 120.9910, distance: "500m" },
            { id: "PARK008", name: "Taft-Pablo Ocampo Corner", lat: 14.5655, lng: 120.9920, distance: "180m" },
            { id: "PARK009", name: "EGI Taft Tower", lat: 14.5620, lng: 120.9940, distance: "300m" },
            { id: "PARK010", name: "Harrison Plaza Overflow", lat: 14.5605, lng: 120.9965, distance: "450m" },
            { id: "PARK011", name: "CSB Parking Area", lat: 14.5685, lng: 120.9915, distance: "400m" },
            { id: "PARK012", name: "Adriatico Street Parking", lat: 14.5630, lng: 120.9960, distance: "350m" },
            { id: "PARK013", name: "Agno Street Commercial", lat: 14.5610, lng: 120.9945, distance: "400m" },
            { id: "PARK014", name: "Taft Avenue MRT Parking", lat: 14.5640, lng: 120.9950, distance: "200m" },
            { id: "PARK015", name: "Remedios Circle Area", lat: 14.5595, lng: 120.9985, distance: "550m" },
            { id: "PARK016", name: "United Nations Avenue", lat: 14.5675, lng: 120.9905, distance: "450m" },
            { id: "PARK017", name: "Quirino Avenue Junction", lat: 14.5590, lng: 120.9950, distance: "600m" },
            { id: "PARK018", name: "Pres. Quirino Ave Parking", lat: 14.5585, lng: 120.9960, distance: "650m" }
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
              id: location.id,
              lat: location.lat,
              lng: location.lng,
              name: location.name,
              available: available,
              total: total,
              rate: "₱70"
            });
          });
          
          // Add Rentor parking spots from localStorage
          if (typeof window !== 'undefined') {
            const rentorSpots = JSON.parse(localStorage.getItem('rentorParkingSpots') || '[]');
            console.log('🏢 Loading Rentor parking spots:', rentorSpots.length);
            
            rentorSpots.forEach((rentorSpot: any) => {
              spots.push({
                id: rentorSpot.id,
                lat: rentorSpot.lat,
                lng: rentorSpot.lng,
                name: rentorSpot.name,
                available: rentorSpot.available,
                total: rentorSpot.total,
                rate: rentorSpot.rate
              });
              console.log('➕ Added Rentor spot:', rentorSpot.name);
            });
          }
          
          return spots;
        };

        const loadAndRefreshParkingSpots = () => {
          const parkingSpots = generateParkingSpotsAroundDLSU();
          
          // Store parking spots and map instance globally for access from other components
          (window as Record<string, unknown>).parkingSpots = parkingSpots;
          (window as Record<string, unknown>).mapInstance = map;
          
          console.log('🗺️ Total parking spots loaded:', parkingSpots.length);
          return parkingSpots;
        };

        let parkingSpots = loadAndRefreshParkingSpots();
        
        // Function to refresh parking spots and markers
        const refreshParkingSpots = () => {
          console.log('🔄 Refreshing parking spots...');
          
          // Clear existing markers (except user location)
          map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              // Keep user location marker, remove parking markers
              const markerLatLng = layer.getLatLng();
              if (!(Math.abs(markerLatLng.lat - 14.566401265497952) < 0.0001 && Math.abs(markerLatLng.lng - 120.9932240439279) < 0.0001)) {
                map.removeLayer(layer);
              }
            }
          });
          
          // Reload parking spots
          parkingSpots = loadAndRefreshParkingSpots();
          
          // Re-add all parking markers
          addParkingMarkers(parkingSpots);
        };
        
        // Global refresh function
        (window as Record<string, unknown>).refreshParkingSpots = refreshParkingSpots;
        
        // Function to add parking markers
        const addParkingMarkers = (spots: typeof parkingSpots) => {
          spots.forEach(spot => {
            const icon = createParkingIcon(spot.available, spot.total);
            const marker = L.marker([spot.lat, spot.lng], { icon }).addTo(map);
            
            const statusText = spot.available > 0 ? 
              `${spot.available} of ${spot.total} spots available` : 
              'Full - No spots available';
            
            const statusColor = spot.available > 0 ? '#10b981' : '#ef4444';
            
            // Create a more dynamic pricing display
            const dynamicPrice = spot.rate || (spot.available > 25 ? '₱65' : spot.available > 10 ? '₱85' : '₱120');
            
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
        };
        
        // Function to focus on a specific parking spot
        (window as Record<string, unknown>).focusOnParkingSpot = (spotId: string) => {
          const spot = parkingSpots.find(s => s.id === spotId);
          if (spot && map) {
            map.setView([spot.lat, spot.lng], 18, { animate: true });
            // Find and open the marker popup
            map.eachLayer((layer) => {
              if (layer instanceof L.Marker) {
                const markerLatLng = layer.getLatLng();
                if (Math.abs(markerLatLng.lat - spot.lat) < 0.0001 && Math.abs(markerLatLng.lng - spot.lng) < 0.0001) {
                  layer.openPopup();
                }
              }
            });
          }
        };

        // Add parking markers to map
        addParkingMarkers(parkingSpots);
        
        // Periodic check for new Rentor applications
        const checkForNewSpots = setInterval(() => {
          if ((window as Record<string, unknown>).refreshParkingSpots === true) {
            console.log('🔔 New Rentor application detected, refreshing map...');
            refreshParkingSpots();
            (window as Record<string, unknown>).refreshParkingSpots = false;
          }
        }, 1000); // Check every second
        
        // Store cleanup function
        (window as Record<string, unknown>).cleanupMapInterval = () => clearInterval(checkForNewSpots);

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
    
    // Cleanup function to remove map instance
    return () => {
      const mapContainer = document.getElementById('map');
      if (mapContainer && (window as Record<string, unknown>).mapInstance) {
        try {
          const mapInstance = (window as Record<string, unknown>).mapInstance as any;
          if (mapInstance.remove) {
            mapInstance.remove();
          }
          (window as Record<string, unknown>).mapInstance = null;
          
          // Clean up interval
          const cleanupFn = (window as Record<string, unknown>).cleanupMapInterval as (() => void) | undefined;
          cleanupFn?.();
        } catch (error) {
          console.log('Map cleanup error:', error);
        }
      }
    };
  }, []);

  return (
    <div 
      id="map" 
      className="w-full h-full relative z-0"
      style={{ paddingBottom: `${bottomMenuHeight}px` }}
    />
  );
}