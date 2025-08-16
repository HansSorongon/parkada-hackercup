'use client';

import React, { useState, useEffect } from 'react';
import { Car, Clock, MapPin, DollarSign, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParkingSessionManager, type ParkingSession } from '@/lib/parking-session';
import { MockAuth } from '@/lib/auth';
import ParkingReceiptDialog from './ParkingReceiptDialog';

export default function ParkingSessionFloat() {
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [currentCost, setCurrentCost] = useState(0);
  const [duration, setDuration] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [completedSession, setCompletedSession] = useState<ParkingSession | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const checkForActiveSession = () => {
      const currentUser = MockAuth.getCurrentUser();
      if (!currentUser) {
        setActiveSession(null);
        return;
      }

      const session = ParkingSessionManager.getActiveSession(currentUser.id);
      setActiveSession(session);

      if (session) {
        const cost = ParkingSessionManager.getCurrentSessionCost(session);
        const dur = ParkingSessionManager.getSessionDuration(session);
        setCurrentCost(cost);
        setDuration(dur);
      }
    };

    // Check immediately
    checkForActiveSession();

    // Set up interval to update every 30 seconds
    const interval = setInterval(checkForActiveSession, 30000);

    // Listen for session updates
    const checkForUpdates = setInterval(() => {
      if (typeof window !== 'undefined' && (window as Record<string, unknown>).parkingSessionUpdate) {
        checkForActiveSession();
        (window as Record<string, unknown>).parkingSessionUpdate = false;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(checkForUpdates);
    };
  }, []);

  const handleEndSession = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!activeSession) {
      console.log('No active session to end');
      return;
    }

    console.log('Ending session:', activeSession.id);
    setIsEnding(true);
    try {
      const endedSession = ParkingSessionManager.endSession(activeSession.id);
      console.log('Session ended:', endedSession);
      if (endedSession) {
        console.log('Setting completedSession and showReceipt');
        setCompletedSession(endedSession);
        setShowReceipt(true);
        setActiveSession(null);
        setIsExpanded(false); // Close the expanded view
      }
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end parking session. Please try again.');
    } finally {
      setIsEnding(false);
    }
  };

  const handleFocusOnMap = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!activeSession) return;
    
    console.log('Focusing on map for spot:', activeSession.parkingSpotId);
    
    if (typeof window !== 'undefined') {
      const focusFunction = (window as Record<string, unknown>).focusOnParkingSpot as ((spotId: string) => void) | undefined;
      if (focusFunction) {
        focusFunction(activeSession.parkingSpotId);
      } else {
        console.warn('focusOnParkingSpot function not found on window');
      }
    }
  };

  return (
    <>
      {/* Mobile overlay - render first so widget appears above it */}
      {activeSession && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Floating Widget - only show when there's an active session */}
      {activeSession && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`bg-card border border-border rounded-lg shadow-lg transition-all duration-300 ${
            isExpanded ? 'w-80' : 'w-64'
          }`}>
            {/* Header */}
            <div 
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Currently Parked</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activeSession.parkingSpotName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">₱{currentCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{duration}</p>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border">
                {/* Session Details */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium truncate">{activeSession.parkingSpotName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Started:</span>
                    <span className="font-medium">
                      {new Date(activeSession.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="font-medium">₱{activeSession.hourlyRate}/hour</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 relative z-10"
                    onClick={handleFocusOnMap}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Show on Map
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1 relative z-10"
                    onClick={handleEndSession}
                    disabled={isEnding}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    {isEnding ? 'Ending...' : 'End Session'}
                  </Button>
                </div>

                {/* Live Updates Notice */}
                <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs text-blue-600 text-center">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Updates every 30 seconds
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parking Receipt Dialog */}
      <ParkingReceiptDialog
        isOpen={showReceipt && !!completedSession}
        onClose={() => {
          setShowReceipt(false);
          setCompletedSession(null);
        }}
        session={completedSession}
      />
    </>
  );
}
