'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyQRCodeProps {
  propertyId: string;
  propertyName: string;
  onClose?: () => void;
}

export default function PropertyQRCode({ propertyId, propertyName, onClose }: PropertyQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, propertyId, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [propertyId]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `property-qr-${propertyId}.png`;
      link.href = canvasRef.current.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(propertyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = propertyId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 text-center">
      <div className="mb-4">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
        <h3 className="text-lg font-bold text-green-800 mb-2">Property Added Successfully!</h3>
        <p className="text-sm text-muted-foreground">
          Your property "{propertyName}" has been registered with ID: <span className="font-mono font-bold">{propertyId}</span>
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-border inline-block mb-4">
        <canvas ref={canvasRef} className="block" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm font-mono">{propertyId}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleCopyId}
            className="h-6 px-2"
          >
            {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download QR
          </Button>
          {onClose && (
            <Button onClick={onClose} className="flex-1">
              Continue
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Save this QR code for quick property identification.</p>
          <p>You can also share this ID with customers for easy booking.</p>
        </div>
      </div>
    </div>
  );
}