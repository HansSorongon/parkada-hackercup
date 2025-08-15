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
  const [selectedSpot, setSelectedSpot] = useState<typeof parkingSpots[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // Parking data from the map component
  const generateParkingSpotsData = () => {
    const parkingLocations = [
      { name: "DLSU Parking Building", lat: 14.5640, lng: 120.9935, available: 25, total: 80 },
      { name: "Robinson's Place Manila", lat: 14.5599, lng: 120.9978, available: 0, total: 120 },
      { name: "Taft Avenue Commercial", lat: 14.5665, lng: 120.9925, available: 15, total: 60 },
      { name: "Vito Cruz Station Area", lat: 14.5634, lng: 120.9943, available: 2, total: 45 },
      { name: "Pedro Gil Street Parking", lat: 14.5680, lng: 120.9918, available: 0, total: 70 },
      { name: "Malate Church Area", lat: 14.5618, lng: 120.9955, available: 18, total: 55 },
      { name: "St. Scholastica Parking", lat: 14.5695, lng: 120.9910, available: 32, total: 90 },
      { name: "Taft-Pablo Ocampo Corner", lat: 14.5655, lng: 120.9920, available: 0, total: 40 },
      { name: "EGI Taft Tower", lat: 14.5620, lng: 120.9940, available: 12, total: 65 },
      { name: "Harrison Plaza Overflow", lat: 14.5605, lng: 120.9965, available: 8, total: 75 },
      { name: "CSB Parking Area", lat: 14.5685, lng: 120.9915, available: 22, total: 80 },
      { name: "Adriatico Street Parking", lat: 14.5630, lng: 120.9960, available: 14, total: 50 },
      { name: "Agno Street Commercial", lat: 14.5610, lng: 120.9945, available: 6, total: 45 },
      { name: "Taft Avenue MRT Parking", lat: 14.5640, lng: 120.9950, available: 0, total: 85 },
      { name: "Remedios Circle Area", lat: 14.5595, lng: 120.9985, available: 28, total: 95 },
      { name: "United Nations Avenue", lat: 14.5675, lng: 120.9905, available: 19, total: 70 },
      { name: "Quirino Avenue Junction", lat: 14.5590, lng: 120.9950, available: 0, total: 60 },
      { name: "Pres. Quirino Ave Parking", lat: 14.5585, lng: 120.9960, available: 11, total: 55 }
    ];

    return parkingLocations.map(location => {
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
        name: location.name,
        distance: distanceKm < 1 ? `${Math.round(distanceInMeters)}m` : `${distanceKm.toFixed(1)}km`,
        driveTime: `${driveTimeMinutes} min`,
        price: dynamicPrice,
        tags: tags.slice(0, 3), // Limit to 3 tags
        imageVariant: (location.available > 15 ? 'accent' : location.available > 5 ? 'secondary' : 'primary') as const,
        distanceInMeters,
        available: location.available,
        total: location.total
      };
    });
  };

  // Generate and sort parking spots by distance
  const parkingSpots = generateParkingSpotsData()
    .sort((a, b) => a.distanceInMeters - b.distanceInMeters);

  const handleSpotClick = (spot: typeof parkingSpots[0]) => {
    setSelectedSpot(spot);
    setIsDialogOpen(true);
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
