'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ParkingReceipt from './ParkingReceipt';
import { ParkingSession } from '@/lib/parking-session';
import { MockAuth } from '@/lib/auth';

interface ParkingReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: ParkingSession | null;
}

export default function ParkingReceiptDialog({ isOpen, onClose, session }: ParkingReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Early return if dialog shouldn't be shown
  if (!isOpen || !session || !session.endTime) {
    return null;
  }

  // Get user vehicle info (in real app, this would be passed from session)
  const currentUser = MockAuth.getCurrentUser();
  const userVehicles = currentUser ? MockAuth.getUserVehicles(currentUser.id) : [];
  const vehicle = userVehicles[0] || { plateNumber: 'N/A', model: 'N/A' }; // Use first vehicle as default

  const receiptData = {
    id: session.id,
    parkingSpotName: session.parkingSpotName,
    parkingSpotAddress: session.location.address,
    userName: session.userName,
    userEmail: session.userEmail,
    vehiclePlate: vehicle.plateNumber,
    vehicleModel: vehicle.model,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.duration || 0,
    hourlyRate: session.hourlyRate,
    totalCost: session.totalCost || 0,
    paymentMethod: 'Card ending in 4242'
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    
    try {
      // First try html2canvas approach
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        height: receiptRef.current.scrollHeight,
        width: receiptRef.current.scrollWidth,
        scrollX: 0,
        scrollY: 0,
        windowWidth: receiptRef.current.scrollWidth,
        windowHeight: receiptRef.current.scrollHeight,
        foreignObjectRendering: true,
        removeContainer: true,
        ignoreElements: (element) => {
          try {
            const style = window.getComputedStyle(element);
            const bgColor = style.backgroundColor || '';
            const color = style.color || '';
            const borderColor = style.borderColor || '';
            
            // Skip elements with unsupported color functions
            const unsupportedColors = ['lab(', 'oklch(', 'lch(', 'hwb('];
            return unsupportedColors.some(func => 
              bgColor.includes(func) || 
              color.includes(func) || 
              borderColor.includes(func)
            );
          } catch (e) {
            // If we can't get computed styles, skip the element
            return true;
          }
        },
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `parking-receipt-${session.id}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating receipt image:', error);
      
      // Fallback: Use browser print to save as PDF
      try {
        const printWindow = window.open('', '_blank');
        if (printWindow && receiptRef.current) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Parking Receipt - ${session.id}</title>
                <style>
                  body { 
                    font-family: monospace; 
                    margin: 20px; 
                    background: white;
                  }
                  @media print {
                    body { margin: 0; }
                  }
                </style>
              </head>
              <body>
                ${receiptRef.current.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      } catch (printError) {
        console.error('Print fallback failed:', printError);
        alert('Failed to generate receipt. Please try using your browser\'s print function.');
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Parking Receipt',
        text: `Parking receipt for ${session.parkingSpotName}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers without Web Share API
      alert('Share functionality would be implemented here');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle>Parking Receipt</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </DialogHeader>

        <div 
          ref={receiptRef}
          className="receipt-container" 
          style={{ 
            fontFamily: 'monospace',
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
        >
          <ParkingReceipt sessionData={receiptData} />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Save Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}