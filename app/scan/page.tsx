'use client';

import React, { useState } from 'react';
import { ArrowLeft, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const router = useRouter();

  const handleScan = (result: Array<{rawValue: string}> | null) => {
    console.log('=== QR SCAN DEBUG ===');
    console.log('Raw QR Scan Result:', result);
    
    if (result && result.length > 0) {
      const scannedData = result[0].rawValue;
      console.log('Scanned Data:', scannedData);
      console.log('Data Type:', typeof scannedData);
      console.log('Data Length:', scannedData.length);
      
      setScanResult(scannedData);
      setIsScanning(false);
      
      // Check if scanned data is a parking location ID (format: PARK### or RENT###ABC)
      const isValidParkingId = scannedData.match(/^PARK\d{3}$/) || scannedData.match(/^RENT\d{3}[A-Z]{3}$/);
      console.log('Is Valid Parking ID?:', !!isValidParkingId);
      console.log('Regex Match Result:', isValidParkingId);
      
      if (isValidParkingId) {
        // Only proceed if window is available (client-side)
        if (typeof window !== 'undefined') {
          console.log('Window is available, proceeding...');
          
          // Get parking spot data from global window object and localStorage
          const parkingSpots = (window as Record<string, unknown>).parkingSpots as Array<{id: string, name: string, lat: number, lng: number, available: number, total: number, rate: string}> | undefined;
          const rentorSpots = JSON.parse(localStorage.getItem('rentorParkingSpots') || '[]') as Array<{id: string, name: string, lat: number, lng: number, available: number, total: number, rate: string}>;
          
          // Combine both spot types
          const allSpots = [...(parkingSpots || []), ...rentorSpots];
          
          console.log('Available Parking Spots:', parkingSpots);
          console.log('Available Rentor Spots:', rentorSpots);
          console.log('Total spots found:', allSpots.length);
          
          if (allSpots.length > 0) {
            console.log('All spot IDs:', allSpots.map(s => s.id));
          }
          
          const spot = allSpots.find(s => s.id === scannedData);
          console.log('Looking for spot with ID:', scannedData);
          console.log('Found matching spot:', spot);
          
          if (spot) {
            console.log('=== SPOT DATA ===');
            console.log('Spot ID:', spot.id);
            console.log('Spot Name:', spot.name);
            console.log('Coordinates:', spot.lat, spot.lng);
            console.log('Available/Total:', spot.available, '/', spot.total);
            console.log('Rate:', spot.rate);
            // Calculate distance and drive time from user location (Gokongwei Building)
            const userLat = 14.566401265497952;
            const userLng = 120.9932240439279;
            
            const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
              const dx = lat2 - lat1;
              const dy = lng2 - lng1;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance * 111000; // Convert to approximate meters
            };
            
            const distanceInMeters = calculateDistance(userLat, userLng, spot.lat, spot.lng);
            const distanceKm = distanceInMeters / 1000;
            const driveTimeMinutes = Math.max(1, Math.round(distanceKm * 3)); // 3 min per km estimate
            
            const distanceText = distanceKm < 1 ? `${Math.round(distanceInMeters)}m` : `${distanceKm.toFixed(1)}km`;
            const driveTimeText = `${driveTimeMinutes} min`;
            
            console.log('=== CALCULATED DATA ===');
            console.log('Distance (meters):', distanceInMeters);
            console.log('Distance (km):', distanceKm);
            console.log('Distance Text:', distanceText);
            console.log('Drive Time:', driveTimeText);
            
            // Focus on the parking spot on the map
            const focusFunction = (window as Record<string, unknown>).focusOnParkingSpot as ((spotId: string) => void) | undefined;
            // Store the result globally for the main page to pick up
            const spotData = {
              name: spot.name,
              distance: distanceText,
              driveTime: driveTimeText,
              price: spot.rate
            };
            
            console.log('=== STORING QR RESULT ===');
            console.log('Spot ID:', scannedData);
            console.log('Spot Data:', spotData);
            
            (window as Record<string, unknown>).pendingQRResult = {
              spotId: scannedData,
              spotData: spotData
            };
            
            console.log('✅ QR result stored globally');
            console.log('Navigating back to main page immediately...');
            
            // Navigate back to main page immediately
            router.push('/');
          } else {
            console.log('❌ No matching parking spot found for ID:', scannedData);
          }
        } else {
          console.log('❌ Window object not available');
        }
      } else {
        console.log('❌ Scanned data is not a valid parking ID format');
        console.log('Expected format: PARK### (e.g., PARK001) or RENT###ABC (e.g., RENT123ABC)');
        console.log('Received:', scannedData);
      }
    } else {
      console.log('❌ No scan result or empty result');
    }
    console.log('=== END QR SCAN DEBUG ===');
  };

  const handleError = (error: Error) => {
    console.error('QR Scanner Error:', error);
    setCameraError('Camera access denied or not available');
  };

  const startNewScan = () => {
    setScanResult(null);
    setIsScanning(true);
    setCameraError(null);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Scan QR Code</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Camera Container */}
      <div className="flex-1 relative">
        {isScanning && !cameraError && (
          <div className="relative w-full h-[calc(100vh-80px)]">
            {/* QR Scanner */}
            <Scanner
              onScan={handleScan}
              onError={handleError}
              styles={{
                container: {
                  width: '100%',
                  height: '100%'
                },
                video: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }
              }}
            />
          </div>
        )}

        {/* Camera Error State */}
        {cameraError && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-8">
            <Camera className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
            <p className="text-muted-foreground text-center mb-6">
              {cameraError}. Please allow camera access to scan QR codes.
            </p>
            <Button onClick={startNewScan}>
              Try Again
            </Button>
          </div>
        )}

        {/* Success State */}
        {scanResult && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">QR Code Scanned!</h3>
            <div className="bg-muted p-4 rounded-lg mb-6 max-w-sm w-full">
              <p className="text-sm text-muted-foreground mb-1">Scanned Content:</p>
              <p className="font-mono text-sm break-all">{scanResult}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={startNewScan}>
                Scan Another
              </Button>
              <Button onClick={goBack}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions - Only show when scanning */}
      {isScanning && !cameraError && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-6">
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="rounded-full w-16 h-16 p-0"
              disabled
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>
          <p className="text-center text-white text-sm mt-2">
            Camera is active - QR codes will be detected automatically
          </p>
        </div>
      )}
    </div>
  );
}