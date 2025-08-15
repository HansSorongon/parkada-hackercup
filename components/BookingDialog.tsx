'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Car, CreditCard, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockAuth, type UserVehicle } from '@/lib/auth';
import { ParkingSessionManager } from '@/lib/parking-session';
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
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([]);

  const handleStartParking = async () => {
    const currentUser = MockAuth.getCurrentUser();
    if (!currentUser) {
      alert('Please log in to start parking');
      return;
    }

    if (!selectedVehicle) {
      alert('Please select a vehicle');
      return;
    }

    if (!parkingSpot) return;

    setIsStarting(true);

    try {
      // Get parking spot coordinates from global data
      const parkingSpots = (window as Record<string, unknown>).parkingSpots as Array<{id: string, name: string, lat: number, lng: number, rate: string}> | undefined;
      const spotData = parkingSpots?.find(spot => spot.name === parkingSpot.name);

      if (!spotData) {
        alert('Parking spot data not found');
        return;
      }

      // Start parking session
      const session = ParkingSessionManager.startSession(
        currentUser.id,
        currentUser.name,
        currentUser.email,
        {
          id: spotData.id,
          name: spotData.name,
          lat: spotData.lat,
          lng: spotData.lng,
          rate: parkingSpot.price,
          address: parkingSpot.name
        }
      );

      console.log('🚗 Parking session started:', session);
      
      // Show success message
      alert(`Parking session started at ${parkingSpot.name}!\nRate: ${parkingSpot.price}/hour`);
      
      onClose();
    } catch (error) {
      console.error('Error starting parking session:', error);
      alert('Failed to start parking session. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    const currentUser = MockAuth.getCurrentUser();
    if (currentUser && isOpen) {
      const vehicles = MockAuth.getUserVehicles(currentUser.id);
      setUserVehicles(vehicles);
    }
  }, [isOpen]);

  const handleReserveForLater = () => {
    if (!parkingSpot) return;

    // Navigate to reservation page with parking spot data
    const spotData = encodeURIComponent(JSON.stringify({
      name: parkingSpot.name,
      distance: parkingSpot.distance,
      driveTime: parkingSpot.driveTime,
      price: parkingSpot.price,
      tags: parkingSpot.tags,
      imageVariant: parkingSpot.imageVariant
    }));
    
    router.push(`/reserve?spot=${spotData}`);
    onClose();
  };

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
            
            {/* Reserved Parking */}
            <div 
              className="border rounded-xl p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={handleReserveForLater}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reserve for Later</p>
                  <p className="text-sm text-muted-foreground">Schedule your parking time on next page</p>
                </div>
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Car className="h-4 w-4" />
              Select Vehicle
            </h4>
            {userVehicles.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No vehicles registered</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => router.push('/profile')}
                >
                  Add a vehicle in Profile
                </Button>
              </div>
            ) : (
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
                        <span className="truncate">{truncateModel(`${vehicle.year} ${vehicle.model}`)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
          <Button 
            className="flex-1"
            onClick={handleStartParking}
            disabled={!selectedVehicle || isStarting}
          >
            <Play className="h-4 w-4" />
            {isStarting ? 'Starting...' : `Start Parking - ${parkingSpot.price}/hr`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}