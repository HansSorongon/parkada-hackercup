'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const router = useRouter();

  const handleScan = (result: any) => {
    console.log('QR Scan Result:', result);
    if (result && result.length > 0) {
      console.log('Scanned Data:', result[0].rawValue);
      setScanResult(result[0].rawValue);
      setIsScanning(false);
    }
  };

  const handleError = (error: any) => {
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