'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Car, 
  Plus, 
  Upload, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Edit3,
  Camera,
  FileText,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { MockAuth, type User as UserType } from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  year: string;
  color: string;
  orcrNumber: string;
  verified: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [verificationId, setVerificationId] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    plateNumber: '',
    model: '',
    year: '',
    color: '',
    orcrNumber: '',
    orcrFile: null as File | null
  });
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);

  useEffect(() => {
    const user = MockAuth.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentUser(user);
    // Load user verification status and vehicles from localStorage
    const verified = localStorage.getItem(`user_verified_${user.id}`) === 'true';
    setIsAccountVerified(verified);
    
    const savedVehicles = localStorage.getItem(`user_vehicles_${user.id}`);
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    }
  }, [router]);

  const handleVerifyAccount = async () => {
    if (!verificationId || !currentUser) return;

    setIsVerifying(true);
    
    // Simulate ID verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    localStorage.setItem(`user_verified_${currentUser.id}`, 'true');
    setIsAccountVerified(true);
    setShowVerificationDialog(false);
    setIsVerifying(false);
    
    alert('Account verification successful! You can now add vehicles.');
  };

  const handleAddVehicle = async () => {
    if (!vehicleForm.plateNumber || !vehicleForm.model || !vehicleForm.year || 
        !vehicleForm.color || !vehicleForm.orcrNumber || !vehicleForm.orcrFile || !currentUser) {
      alert('Please fill in all fields and upload OR/CR document');
      return;
    }

    setIsAddingVehicle(true);
    
    // Simulate vehicle verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      plateNumber: vehicleForm.plateNumber.toUpperCase(),
      model: vehicleForm.model,
      year: vehicleForm.year,
      color: vehicleForm.color,
      orcrNumber: vehicleForm.orcrNumber,
      verified: true
    };
    
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    localStorage.setItem(`user_vehicles_${currentUser.id}`, JSON.stringify(updatedVehicles));
    
    setShowVehicleDialog(false);
    setVehicleForm({
      plateNumber: '',
      model: '',
      year: '',
      color: '',
      orcrNumber: '',
      orcrFile: null
    });
    setIsAddingVehicle(false);
    
    alert('Vehicle added successfully! It has been verified.');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  
  const colors = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 
    'Orange', 'Brown', 'Purple', 'Gold', 'Maroon', 'Navy', 'Beige'
  ];

  if (!currentUser) {
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
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account and vehicles</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* User Info */}
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{currentUser.name}</h3>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {isAccountVerified ? (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {currentUser.type}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Account Verification */}
        {!isAccountVerified && (
          <div className="bg-card rounded-xl p-4 border border-orange-200 bg-orange-50/50">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">Verify Your Account</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Upload a valid ID to verify your account and add vehicles.
                </p>
                <Button 
                  className="mt-3" 
                  size="sm"
                  onClick={() => setShowVerificationDialog(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Verify Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Section */}
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Car className="h-4 w-4" />
              My Vehicles
            </h3>
            <Button 
              size="sm"
              onClick={() => {
                if (!isAccountVerified) {
                  alert('Please verify your account first before adding vehicles');
                  return;
                }
                setShowVehicleDialog(true);
              }}
              disabled={!isAccountVerified}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No vehicles added yet</p>
              {isAccountVerified && (
                <p className="text-xs mt-1">Click "Add Vehicle" to get started</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{vehicle.plateNumber}</span>
                      {vehicle.verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.year} {vehicle.model} • {vehicle.color}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-card rounded-xl p-4 border">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </h3>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">•••• •••• •••• 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/27</p>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
        </div>
      </div>

      {/* Account Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Account</DialogTitle>
            <DialogDescription>
              Upload a valid government-issued ID to verify your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="id-upload">Government ID</Label>
              <div className="mt-2">
                <input
                  id="id-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setVerificationId(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('id-upload')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {verificationId ? verificationId.name : 'Upload ID Document'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Accepted: Driver's License, Passport, National ID
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyAccount}
              disabled={!verificationId || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Vehicle Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>
              Register your vehicle by providing details and OR/CR document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="plate">Plate Number</Label>
              <Input
                id="plate"
                placeholder="ABC1234"
                value={vehicleForm.plateNumber}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, plateNumber: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="model">Vehicle Model</Label>
              <Input
                id="model"
                placeholder="Honda Civic"
                value={vehicleForm.model}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={vehicleForm.year} onValueChange={(value) => setVehicleForm(prev => ({ ...prev, year: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Select value={vehicleForm.color} onValueChange={(value) => setVehicleForm(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="orcr">OR/CR Number</Label>
              <Input
                id="orcr"
                placeholder="OR/CR Document Number"
                value={vehicleForm.orcrNumber}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, orcrNumber: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="orcr-upload">OR/CR Document</Label>
              <div className="mt-2">
                <input
                  id="orcr-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, orcrFile: e.target.files?.[0] || null }))}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('orcr-upload')?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {vehicleForm.orcrFile ? vehicleForm.orcrFile.name : 'Upload OR/CR Document'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Required for vehicle verification
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVehicleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddVehicle}
              disabled={!vehicleForm.plateNumber || !vehicleForm.model || !vehicleForm.year || 
                       !vehicleForm.color || !vehicleForm.orcrNumber || !vehicleForm.orcrFile || isAddingVehicle}
            >
              {isAddingVehicle ? 'Adding Vehicle...' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}