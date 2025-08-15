'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import BottomMenu from '@/components/BottomMenu';
import Map from '@/components/Map';
import BookingDialog from '@/components/BookingDialog';
import ParkingSessionFloat from '@/components/ParkingSessionFloat';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bottomMenuHeight, setBottomMenuHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapSelectedSpot, setMapSelectedSpot] = useState<{name: string, distance: string, driveTime: string, price: string, tags: string[], imageVariant: 'accent' | 'secondary' | 'primary'} | null>(null);
  
  // Breakpoints for the bottom menu
  const [menuBreakpoints, setMenuBreakpoints] = useState({
    collapsed: 120,  // Just showing the handle and scan button
    expanded: 600    // Almost full screen
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMenuBreakpoints({
        collapsed: 120,
        expanded: window.innerHeight * 0.75
      });

      // Global function for map popup dialogs
      (window as Record<string, unknown>).openParkingDialog = (name: string, distance: string, driveTime: string, price: string) => {
        console.log('🎯 openParkingDialog called with:', { name, distance, driveTime, price });
        const spot = {
          name,
          distance,
          driveTime,
          price,
          tags: ['CCTV', 'Outdoor'],
          imageVariant: 'accent' as const
        };
        setMapSelectedSpot(spot);
        setMapDialogOpen(true);
        console.log('✅ Dialog should be open now, mapDialogOpen set to true');
      };
      
      // Check for pending QR scan results
      const checkForQRResult = () => {
        const qrResult = (window as Record<string, unknown>).pendingQRResult as {spotId: string, spotData: any} | undefined;
        if (qrResult) {
          console.log('📱 Found pending QR result:', qrResult);
          
          // Focus on the parking spot
          const focusFunction = (window as Record<string, unknown>).focusOnParkingSpot as ((spotId: string) => void) | undefined;
          focusFunction?.(qrResult.spotId);
          
          // Open the dialog
          const openDialogFunction = (window as Record<string, unknown>).openParkingDialog as ((name: string, distance: string, driveTime: string, price: string) => void) | undefined;
          openDialogFunction?.(qrResult.spotData.name, qrResult.spotData.distance, qrResult.spotData.driveTime, qrResult.spotData.price);
          
          // Clear the pending result
          (window as Record<string, unknown>).pendingQRResult = null;
        }
      };
      
      // Check immediately and set up interval
      checkForQRResult();
      const interval = setInterval(checkForQRResult, 100);
      
      setTimeout(() => clearInterval(interval), 5000); // Stop checking after 5 seconds
    }
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const newHeight = window.innerHeight - clientY;
    
    if (newHeight >= menuBreakpoints.collapsed && newHeight <= menuBreakpoints.expanded) {
      setBottomMenuHeight(newHeight);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Snap to nearest breakpoint
    const current = bottomMenuHeight;
    const breakpoints = Object.values(menuBreakpoints);
    
    // Find the closest breakpoint
    let closestBreakpoint = breakpoints[0];
    let minDistance = Math.abs(current - breakpoints[0]);
    
    for (const breakpoint of breakpoints) {
      const distance = Math.abs(current - breakpoint);
      if (distance < minDistance) {
        minDistance = distance;
        closestBreakpoint = breakpoint;
      }
    }
    
    setBottomMenuHeight(closestBreakpoint);
  };

  const handleHeaderClick = () => {
    // Toggle between collapsed and expanded
    if (bottomMenuHeight <= (menuBreakpoints.collapsed + menuBreakpoints.expanded) / 2) {
      setBottomMenuHeight(menuBreakpoints.expanded);
    } else {
      setBottomMenuHeight(menuBreakpoints.collapsed);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-background">
      {/* Hamburger Menu Button */}
      <Button
        onClick={() => setSidebarOpen(true)}
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Parkada Logo Header */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <Image
          src="/parkada_logo.png"
          alt="Parkada"
          width={126}
          height={60}
          className="h-20 w-auto drop-shadow-lg"
          priority
        />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Map Container */}
      <Map bottomMenuHeight={bottomMenuHeight} />

      {/* Draggable Bottom Menu */}
      <BottomMenu
        height={bottomMenuHeight}
        isDragging={isDragging}
        onDragStart={handleDragStart}
        onHeaderClick={handleHeaderClick}
      />

      {/* Map Dialog for popup reservations */}
      <BookingDialog
        isOpen={mapDialogOpen}
        onClose={() => {
          setMapDialogOpen(false);
          setMapSelectedSpot(null);
        }}
        parkingSpot={mapSelectedSpot}
      />

      {/* Floating Parking Session Indicator */}
      <ParkingSessionFloat />
    </div>
  );
}
