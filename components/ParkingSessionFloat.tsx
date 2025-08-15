'use client';

import React, { useState, useEffect } from 'react';
import { Car, Clock, MapPin, DollarSign, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParkingSessionManager, type ParkingSession } from '@/lib/parking-session';
import { MockAuth } from '@/lib/auth';

export default function ParkingSessionFloat() {
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [currentCost, setCurrentCost] = useState(0);
  const [duration, setDuration] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

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

  const handleEndSession = async () => {
    if (!activeSession) return;

    setIsEnding(true);
    try {
      const completedSession = ParkingSessionManager.endSession(activeSession.id);
      if (completedSession) {
        alert(`Parking session ended!\nDuration: ${ParkingSessionManager.getSessionDuration(completedSession)}\nTotal Cost: ₱${completedSession.totalCost?.toFixed(2)}`);
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end parking session. Please try again.');
    } finally {
      setIsEnding(false);
    }
  };

  const handleFocusOnMap = () => {
    if (!activeSession) return;
    
    if (typeof window !== 'undefined') {
      const focusFunction = (window as Record<string, unknown>).focusOnParkingSpot as ((spotId: string) => void) | undefined;
      focusFunction?.(activeSession.parkingSpotId);
    }
  };

  if (!activeSession) {
    return null;
  }

  return (
    <>
      {/* Floating Widget */}
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
                  className="flex-1"
                  onClick={handleFocusOnMap}
                >
                  <MapPin className="h-4 w-4" />
                  Show on Map
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleEndSession}
                  disabled={isEnding}
                >
                  <Square className="h-4 w-4" />
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

      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}