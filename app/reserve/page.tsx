'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Car, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import { useRouter, useSearchParams } from 'next/navigation';
import { MockAuth, type UserVehicle } from '@/lib/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ParkingSpotData {
  name: string;
  distance: string;
  driveTime: string;
  price: string;
  tags: string[];
  imageVariant: 'primary' | 'secondary' | 'accent';
}

export default function ReservePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [parkingSpot, setParkingSpot] = useState<ParkingSpotData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('09:00 AM');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isReserving, setIsReserving] = useState(false);
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([]);

  useEffect(() => {
    const spotParam = searchParams.get('spot');
    if (spotParam) {
      try {
        const spotData = JSON.parse(decodeURIComponent(spotParam));
        setParkingSpot(spotData);
      } catch (error) {
        console.error('Error parsing spot data:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }

    // Load user vehicles
    const currentUser = MockAuth.getCurrentUser();
    if (currentUser) {
      const vehicles = MockAuth.getUserVehicles(currentUser.id);
      setUserVehicles(vehicles);
    }
  }, [searchParams, router]);

  const handleReservation = async () => {
    if (!selectedDate || !selectedTime || !selectedVehicle || !parkingSpot) {
      alert('Please fill in all required fields');
      return;
    }

    const currentUser = MockAuth.getCurrentUser();
    if (!currentUser) {
      alert('Please log in to make a reservation');
      return;
    }

    setIsReserving(true);

    try {
      const reservationDateTime = `${selectedDate.toLocaleDateString()} at ${selectedTime}`;
      
      // Simulate reservation creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Parking reserved successfully!\n\nLocation: ${parkingSpot.name}\nDate & Time: ${reservationDateTime}\nRate: ${parkingSpot.price}/hour`);
      
      router.push('/');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };


  const truncateModel = (model: string, maxLength: number = 25) => {
    return model.length > maxLength ? model.substring(0, maxLength) + '...' : model;
  };

  const getImageClasses = () => {
    if (!parkingSpot) return 'bg-accent text-accent-foreground';
    
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

  if (!parkingSpot) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Reserve Parking</h1>
            <p className="text-sm text-muted-foreground">Schedule your parking time</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Parking Spot Info */}
        <div className="bg-card rounded-xl p-4 border">
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
          <div className="bg-primary/10 p-3 rounded-lg mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/70">Hourly Rate</p>
                <p className="text-xl font-bold text-primary">{parkingSpot.price}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Dynamic Pricing</p>
                <p className="text-xs text-muted-foreground">Based on current demand</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="bg-card rounded-xl p-4 border space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Select Date & Time
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <div className="flex items-center gap-2 w-full">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                  <Select value={selectedTime.split(':')[0]} onValueChange={(hour) => {
                    const [, minute] = selectedTime.split(':');
                    const [min, period] = minute.split(' ');
                    setSelectedTime(`${hour}:${min} ${period}`);
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const h = i + 1;
                        return h.toString().padStart(2, "0");
                      }).map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <span className="text-muted-foreground">:</span>
                  
                  <Select value={selectedTime.split(':')[1]?.split(' ')[0]} onValueChange={(minute) => {
                    const hour = selectedTime.split(':')[0];
                    const period = selectedTime.split(' ')[1];
                    setSelectedTime(`${hour}:${minute} ${period}`);
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedTime.split(' ')[1]} onValueChange={(period) => {
                    const [hour, minute] = selectedTime.split(':');
                    const min = minute.split(' ')[0];
                    setSelectedTime(`${hour}:${min} ${period}`);
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="bg-card rounded-xl p-4 border space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Car className="h-4 w-4" />
            Select Vehicle
          </h3>
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
        <div className="bg-card rounded-xl p-4 border space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Method
          </h3>
          <div className="border rounded-lg p-3">
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

        {/* Reserve Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleReservation}
          disabled={!selectedDate || !selectedTime || !selectedVehicle || isReserving}
        >
          <Check className="h-4 w-4 mr-2" />
          {isReserving ? 'Creating Reservation...' : `Reserve Parking - ${parkingSpot.price}/hr`}
        </Button>
      </div>
    </div>
  );
}