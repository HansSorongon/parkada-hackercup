'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MockAuth, type User } from '@/lib/auth';
import PropertyQRCode from '@/components/PropertyQRCode';

export default function RentorPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    address: '',
    city: '',
    postalCode: '',
    propertyOwner: '',
    contactNumber: '',
    totalSpaces: '',
    availableSpaces: '',
    hourlyRate: '',
    description: '',
    documents: [] as File[]
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'pending' | 'verified' | 'rejected' | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [addressSearchResults, setAddressSearchResults] = useState<Array<{display_name: string, lat: string, lon: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<{display_name: string, lat: string, lon: string} | null>(null);
  const [approvedPropertyId, setApprovedPropertyId] = useState<string | null>(null);
  const [approvedPropertyName, setApprovedPropertyName] = useState<string>('');

  useEffect(() => {
    const user = MockAuth.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Search addresses using OpenStreetMap API
  const searchAddresses = async (address: string) => {
    if (!address.trim() || !formData.city.trim()) return;
    
    setIsSearching(true);
    const fullAddress = `${address}, ${formData.city}, Philippines`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=5&addressdetails=1`;

    try {
      console.log('🔍 Searching for addresses:', fullAddress);
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Parkada/1.0 (parkada@example.com)' }
      });
      const data = await response.json();

      console.log('📍 Search results:', data);
      setAddressSearchResults(data);
      
      if (data.length === 0) {
        alert("No addresses found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Error searching addresses:", error);
      alert("Error searching addresses. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectAddress = (result: {display_name: string, lat: string, lon: string}) => {
    setSelectedAddress(result);
    setCoordinates({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    });
    setAddressSearchResults([]);
    console.log('✅ Address selected:', result.display_name);
    console.log('📍 Coordinates:', result.lat, result.lon);
  };


  const handleSubmitVerification = async () => {
    setIsVerifying(true);
    setVerificationResult('pending');
    
    // Mock verification process
    console.log('📋 Starting mock verification process...');
    console.log('Form Data:', formData);
    console.log('Coordinates:', coordinates);
    
    // Simulate verification delay
    setTimeout(() => {
      // Always approve for demo purposes
      const isApproved = true;
      
      if (isApproved && coordinates && selectedAddress && currentUser) {
        // Save approved application to storage
        const propertyId = `RENT${Date.now().toString().slice(-3)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        const propertyName = formData.propertyOwner + "'s " + formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1);
        
        const approvedApplication = {
          id: propertyId,
          name: propertyName,
          lat: coordinates.lat,
          lng: coordinates.lng,
          available: parseInt(formData.availableSpaces) || 0,
          total: parseInt(formData.totalSpaces) || 0,
          rate: `₱${formData.hourlyRate}`,
          address: selectedAddress.display_name,
          propertyType: formData.propertyType,
          owner: formData.propertyOwner,
          contact: formData.contactNumber,
          description: formData.description,
          dateApproved: new Date().toISOString(),
          userId: currentUser.id,
          userEmail: currentUser.email
        };
        
        // Store the approved property info for QR code display
        setApprovedPropertyId(propertyId);
        setApprovedPropertyName(propertyName);
        
        // Store in localStorage and update global parking spots
        if (typeof window !== 'undefined') {
          const existingSpots = JSON.parse(localStorage.getItem('rentorParkingSpots') || '[]');
          const updatedSpots = [...existingSpots, approvedApplication];
          localStorage.setItem('rentorParkingSpots', JSON.stringify(updatedSpots));
          
          console.log('💾 Saved approved application:', approvedApplication);
          console.log('📦 Total Rentor spots now:', updatedSpots.length);
          
          // Trigger map refresh by updating global parking spots
          (window as Record<string, unknown>).refreshParkingSpots = true;
        }
      }
      
      setVerificationResult(isApproved ? 'verified' : 'rejected');
      setIsVerifying(false);
      
      console.log(`✅ Verification ${isApproved ? 'approved' : 'rejected'}`);
    }, 3000);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Become a Rentor</h1>
        <div className="w-10" />
      </div>

      {/* Progress Steps */}
      <div className="px-4 py-6 bg-card border-b border-border">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {currentStep === 1 && "Property Information"}
            {currentStep === 2 && "Document Verification"}
            {currentStep === 3 && "Review & Submit"}
          </p>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Step 1: Property Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-xl font-bold">Property Details</h2>
              <p className="text-muted-foreground">Tell us about your parking space</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Property Type</label>
                <select 
                  className="w-full p-3 border border-border rounded-lg bg-background"
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                >
                  <option value="">Select property type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed">Mixed Use</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Property Address</label>
                <input
                  type="text"
                  placeholder="Street address"
                  className="w-full p-3 border border-border rounded-lg bg-background"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full p-3 border border-border rounded-lg bg-background"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Postal Code</label>
                  <input
                    type="text"
                    placeholder="1234"
                    className="w-full p-3 border border-border rounded-lg bg-background"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Property Owner Name</label>
                <input
                  type="text"
                  placeholder="Full name as on documents"
                  className="w-full p-3 border border-border rounded-lg bg-background"
                  value={formData.propertyOwner}
                  onChange={(e) => handleInputChange('propertyOwner', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Number</label>
                <input
                  type="tel"
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full p-3 border border-border rounded-lg bg-background"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Total Parking Spaces</label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full p-3 border border-border rounded-lg bg-background"
                    value={formData.totalSpaces}
                    onChange={(e) => handleInputChange('totalSpaces', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Available for Rent</label>
                  <input
                    type="number"
                    placeholder="3"
                    className="w-full p-3 border border-border rounded-lg bg-background"
                    value={formData.availableSpaces}
                    onChange={(e) => handleInputChange('availableSpaces', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hourly Rate (₱)</label>
                <input
                  type="number"
                  placeholder="50"
                  className="w-full p-3 border border-border rounded-lg bg-background"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Additional information about your parking space..."
                  className="w-full p-3 border border-border rounded-lg bg-background h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              {formData.address && formData.city && !coordinates && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Search & Verify Address</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Search for your address and select the correct one from the results
                  </p>
                  <Button 
                    onClick={() => searchAddresses(formData.address)} 
                    disabled={isSearching}
                    className="w-full"
                  >
                    {isSearching ? 'Searching...' : 'Search Address'}
                  </Button>
                  
                  {/* Search Results */}
                  {addressSearchResults.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Select your address:</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {addressSearchResults.map((result, index) => (
                          <div 
                            key={index}
                            onClick={() => selectAddress(result)}
                            className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent hover:border-accent-foreground transition-colors"
                          >
                            <div className="text-sm font-medium">{result.display_name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Lat: {parseFloat(result.lat).toFixed(6)}, Lng: {parseFloat(result.lon).toFixed(6)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {coordinates && selectedAddress && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Address Verified</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <div className="font-medium">{selectedAddress.display_name}</div>
                    <div className="text-xs mt-1">
                      Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      setCoordinates(null);
                      setSelectedAddress(null);
                      setAddressSearchResults([]);
                    }}
                  >
                    Change Address
                  </Button>
                </div>
              )}
            </div>

            <Button 
              onClick={nextStep} 
              className="w-full"
              disabled={!formData.propertyType || !formData.address || !formData.city || !formData.propertyOwner || !coordinates}
            >
              Continue to Verification
            </Button>
          </div>
        )}

        {/* Step 2: Document Verification */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-xl font-bold">Document Verification</h2>
              <p className="text-muted-foreground">Upload proof of property ownership</p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Required Documents</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Meralco Bill (latest 3 months)</li>
                <li>• Property Tax Declaration</li>
                <li>• Transfer Certificate of Title (TCT)</li>
                <li>• Or other valid proof of ownership</li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Click to upload documents or drag and drop
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
              />
              <Button 
                onClick={() => document.getElementById('document-upload')?.click()}
                variant="outline"
              >
                Choose Files
              </Button>
            </div>

            {formData.documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Uploaded Documents</h3>
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="flex-1"
                disabled={formData.documents.length === 0}
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-xl font-bold">Review Application</h2>
              <p className="text-muted-foreground">Please review your information before submitting</p>
            </div>

            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-medium mb-3">Property Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="capitalize">{formData.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span>{formData.address}, {formData.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span>{formData.propertyOwner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spaces:</span>
                    <span>{formData.availableSpaces} of {formData.totalSpaces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span>₱{formData.hourlyRate}/hour</span>
                  </div>
                  {coordinates && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coordinates:</span>
                      <span className="text-xs">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-medium mb-3">Documents</h3>
                <div className="space-y-2">
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {verificationResult === null && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitVerification} 
                  className="flex-1"
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            )}

            {verificationResult === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                <h3 className="font-medium text-yellow-800">Verification in Progress</h3>
                <p className="text-sm text-yellow-600">Please wait while we verify your documents...</p>
              </div>
            )}

            {verificationResult === 'verified' && approvedPropertyId && (
              <PropertyQRCode 
                propertyId={approvedPropertyId}
                propertyName={approvedPropertyName}
                onClose={goBack}
              />
            )}

            {verificationResult === 'rejected' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <h3 className="font-medium text-red-800">Application Rejected</h3>
                <p className="text-sm text-red-600 mb-4">
                  We were unable to verify your documents. Please check your information and try again.
                </p>
                <Button onClick={() => {
                  setVerificationResult(null);
                  setCurrentStep(1);
                }} variant="outline" className="w-full">
                  Start Over
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}