'use client';

import React, { useState } from 'react';
import { QrCode, Clock, MapPin, Car, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parkingSpot: {
    name: string;
    distance: string;
    driveTime: string;
    price: string;
    tags: string[];
    imageVariant: 'primary' | 'secondary' | 'accent';
  } | null;
}

export default function BookingDialog({ isOpen, onClose, parkingSpot }: BookingDialogProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  
  // Sample user vehicles - in real app this would come from user profile
  const userVehicles = [
    { id: '1', plateNumber: 'ABC123', model: 'Honda Civic 2022' },
    { id: '2', plateNumber: 'XYZ789', model: 'Toyota Camry 2021' },
    { id: '3', plateNumber: 'DEF456', model: 'Mercedes-Benz E-Class AMG 53 4MATIC+ Sedan' },
    { id: '4', plateNumber: 'GHI321', model: 'BMW X5' },
  ];

  const truncateModel = (model: string, maxLength: number = 25) => {
    return model.length > maxLength ? model.substring(0, maxLength) + '...' : model;
  };

  if (!parkingSpot) return null;

  const getImageClasses = () => {
    switch (parkingSpot.imageVariant) {
      case 'primary':
        return 'bg-primary text-primary-foreground';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      case 'accent':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-accent text-accent-foreground';
    }
  };

  const getTagVariant = (index: number) => {
    const variants = ['secondary', 'outline', 'secondary'];
    return variants[index % variants.length] as 'default' | 'secondary' | 'destructive' | 'outline';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Reserve Parking Spot</DialogTitle>
          <DialogDescription>
            Book your parking space at {parkingSpot.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Parking Spot Info */}
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-muted rounded-xl flex-shrink-0 flex items-center justify-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getImageClasses()}`}>
                <span className="font-bold text-sm">P</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{parkingSpot.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                {parkingSpot.distance} away • {parkingSpot.driveTime} drive
              </div>
              <div className="flex gap-1 flex-wrap">
                {parkingSpot.tags.map((tag, index) => (
                  <Badge key={tag} variant={getTagVariant(index)} className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-primary/10 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70">Hourly Rate</p>
                <p className="text-2xl font-bold text-primary">{parkingSpot.price}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Dynamic Pricing</p>
                <p className="text-xs text-muted-foreground">Based on current demand</p>
              </div>
            </div>
          </div>

          {/* Booking Options */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Booking Options
            </h4>
            
            <div className="grid gap-3">
              {/* Instant Parking */}
              <div className="border rounded-xl p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Park Now</p>
                    <p className="text-sm text-muted-foreground">Scan QR code on arrival</p>
                  </div>
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Reserved Parking */}
              <div className="border rounded-xl p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reserve for Later</p>
                    <p className="text-sm text-muted-foreground">Schedule your parking time</p>
                  </div>
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Car className="h-4 w-4" />
              Select Vehicle
            </h4>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your vehicle" />
              </SelectTrigger>
              <SelectContent>
                {userVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Car className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{vehicle.plateNumber}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="truncate">{truncateModel(vehicle.model)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Method
            </h4>
            <div className="border rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/27</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Change
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1">
            <QrCode className="h-4 w-4" />
            Start Parking - {parkingSpot.price}/hr
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}