'use client';

import React, { useState, useEffect } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ParkingCard from './ParkingCard';
import BookingDialog from './BookingDialog';
import { useRouter } from 'next/navigation';

interface BottomMenuProps {
  height: number;
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onHeaderClick: () => void;
}

export default function BottomMenu({ height, isDragging, onDragStart, onHeaderClick }: BottomMenuProps) {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parkingSpots, setParkingSpots] = useState<Array<{id: string, name: string, distance: string, driveTime: string, price: string, tags: string[], imageVariant: 'accent' | 'secondary' | 'primary', distanceInMeters: number, available: number, total: number}>>([]);
  const router = useRouter();

  // User location (Gokongwei Building)
  const userLat = 14.566401265497952;
  const userLng = 120.9932240439279;

  // Calculate euclidean distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const dx = lat2 - lat1;
    const dy = lng2 - lng1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Convert to approximate meters (rough approximation)
    const meters = distance * 111000;
    return meters;
  };

  // Get parking data from the map component (globally stored)
  const generateParkingSpotsData = () => {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const globalParkingSpots = (window as Record<string, unknown>).parkingSpots as Array<{id: string, name: string, lat: number, lng: number, available: number, total: number, rate: string}> | undefined;
    
    if (!globalParkingSpots) {
      // Fallback data if map hasn't loaded yet
      return [];
    }

    return globalParkingSpots.map(location => {
      const distanceInMeters = calculateDistance(userLat, userLng, location.lat, location.lng);
      const distanceKm = distanceInMeters / 1000;
      const driveTimeMinutes = Math.max(1, Math.round(distanceKm * 3)); // Rough estimate: 3 min per km
      
      // Dynamic pricing based on availability
      const dynamicPrice = location.available > 25 ? '₱65' : location.available > 10 ? '₱85' : '₱120';
      
      // Generate appropriate tags
      const tags = [];
      if (location.name.includes('Mall') || location.name.includes('Plaza')) tags.push('CCTV', 'Indoor');
      else if (location.name.includes('Street') || location.name.includes('Avenue')) tags.push('Outdoor', 'Street');
      else if (location.name.includes('Building') || location.name.includes('Tower')) tags.push('CCTV', 'Covered');
      else if (location.name.includes('Station')) tags.push('Transit', 'Busy');
      else if (location.name.includes('Church')) tags.push('Quiet', 'Safe');
      else tags.push('CCTV', 'Secure');
      
      if (location.available > 20) tags.push('Available');
      if (location.total > 80) tags.push('Large');

      return {
        id: location.id,
        name: location.name,
        distance: distanceKm < 1 ? `${Math.round(distanceInMeters)}m` : `${distanceKm.toFixed(1)}km`,
        driveTime: `${driveTimeMinutes} min`,
        price: dynamicPrice,
        tags: tags.slice(0, 3), // Limit to 3 tags
        imageVariant: location.available > 15 ? 'accent' as const : location.available > 5 ? 'secondary' as const : 'primary' as const,
        distanceInMeters,
        available: location.available,
        total: location.total
      };
    });
  };

  // Load parking spots when component mounts and when map data becomes available
  useEffect(() => {
    const loadParkingSpots = () => {
      const spots = generateParkingSpotsData().sort((a, b) => a.distanceInMeters - b.distanceInMeters);
      setParkingSpots(spots);
    };
    
    // Load immediately
    loadParkingSpots();
    
    // Also listen for when map data becomes available
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as Record<string, unknown>).parkingSpots) {
        loadParkingSpots();
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleSpotClick = (spot: typeof parkingSpots[0]) => {
    setSelectedSpot(spot);
    setIsDialogOpen(true);
    
    // Focus on the parking spot on the map
    if (spot.id && typeof window !== 'undefined') {
      const focusFunction = (window as Record<string, unknown>).focusOnParkingSpot as ((spotId: string) => void) | undefined;
      focusFunction?.(spot.id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSpot(null);
  };

  const handleScanQR = () => {
    router.push('/scan');
  };

  return (
    <>
      <BookingDialog 
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        parkingSpot={selectedSpot}
      />
    <div 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30 rounded-t-3xl overflow-hidden"
      style={{ 
        height: `${height}px`,
        transition: isDragging ? 'none' : 'height 0.3s ease-out'
      }}
    >
      {/* Drag Handle Header - Clickable */}
      <div
        className="w-full h-8 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/30"
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        onClick={onHeaderClick}
      >
        <div className="w-12 h-1.5 bg-muted-foreground rounded-full opacity-50" />
      </div>
      
      {/* Menu Content */}
      <div className="p-4 h-full overflow-y-auto">
        {/* Header with Scan QR Button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Nearby Parking</h3>
          <Button size="sm" onClick={handleScanQR}>
            <QrCode className="h-4 w-4" />
            <span className="font-bold">Scan QR</span>
          </Button>
        </div>
        
        {/* Parking List */}
        <div className="space-y-3">
          {parkingSpots.map((spot) => (
            <ParkingCard
              key={spot.name}
              name={spot.name}
              distance={spot.distance}
              driveTime={spot.driveTime}
              price={spot.price}
              tags={spot.tags}
              imageVariant={spot.imageVariant}
              onClick={() => handleSpotClick(spot)}
            />
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
