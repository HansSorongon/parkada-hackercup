'use client';

import React, { useState, useEffect } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ParkingCard from './ParkingCard';
import BookingDialog from './BookingDialog';

interface BottomMenuProps {
  height: number;
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onHeaderClick: () => void;
}

export default function BottomMenu({ height, isDragging, onDragStart, onHeaderClick }: BottomMenuProps) {
  const [selectedSpot, setSelectedSpot] = useState<typeof parkingSpots[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sample parking data with dynamic pricing
  const parkingSpots = [
    {
      name: "SM Mall of Asia",
      distance: "0.8 km",
      driveTime: "3 min",
      price: "₱85",
      tags: ["CCTV", "Indoor", "Roofed"],
      imageVariant: "accent" as const
    },
    {
      name: "Cultural Center",
      distance: "1.2 km", 
      driveTime: "5 min",
      price: "₱120",
      tags: ["CCTV", "Outdoor", "Wide Space"],
      imageVariant: "secondary" as const
    },
    {
      name: "Harrison Plaza",
      distance: "2.1 km",
      driveTime: "8 min", 
      price: "₱65",
      tags: ["Secured Gate", "Indoor"],
      imageVariant: "primary" as const
    }
  ];

  const handleSpotClick = (spot: typeof parkingSpots[0]) => {
    setSelectedSpot(spot);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSpot(null);
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
          <h3 className="text-lg font-semibold text-foreground">Nearby Parking</h3>
          <Button size="sm">
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
