// Parking session management system

export interface ParkingSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  parkingSpotId: string;
  parkingSpotName: string;
  hourlyRate: number;
  startTime: string;
  endTime?: string;
  duration?: number; // in hours
  totalCost?: number;
  status: 'active' | 'completed' | 'cancelled';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export class ParkingSessionManager {
  private static readonly STORAGE_KEY = 'parkingSessions';
  private static readonly ACTIVE_SESSION_KEY = 'activeParkingSession';

  // Get current active session for a user
  static getActiveSession(userId: string): ParkingSession | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(this.ACTIVE_SESSION_KEY);
    if (!stored) return null;
    
    const session: ParkingSession = JSON.parse(stored);
    return session.userId === userId ? session : null;
  }

  // Start a new parking session
  static startSession(
    userId: string,
    userName: string,
    userEmail: string,
    parkingSpot: {
      id: string;
      name: string;
      lat: number;
      lng: number;
      rate: string;
      address?: string;
    }
  ): ParkingSession {
    // End any existing active session first
    const existingSession = this.getActiveSession(userId);
    if (existingSession) {
      this.endSession(existingSession.id);
    }

    const session: ParkingSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      userEmail,
      parkingSpotId: parkingSpot.id,
      parkingSpotName: parkingSpot.name,
      hourlyRate: parseFloat(parkingSpot.rate.replace('₱', '')),
      startTime: new Date().toISOString(),
      status: 'active',
      location: {
        lat: parkingSpot.lat,
        lng: parkingSpot.lng,
        address: parkingSpot.address || parkingSpot.name
      }
    };

    if (typeof window !== 'undefined') {
      // Store active session
      localStorage.setItem(this.ACTIVE_SESSION_KEY, JSON.stringify(session));
      
      // Add to session history
      const sessions = this.getAllSessions();
      sessions.push(session);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      
      console.log('🚗 Parking session started:', session);
      
      // Trigger global update
      (window as Record<string, unknown>).parkingSessionUpdate = true;
    }

    return session;
  }

  // End the current parking session
  static endSession(sessionId: string): ParkingSession | null {
    if (typeof window === 'undefined') return null;

    const activeSession = JSON.parse(localStorage.getItem(this.ACTIVE_SESSION_KEY) || 'null');
    if (!activeSession || activeSession.id !== sessionId) {
      return null;
    }

    const endTime = new Date();
    const startTime = new Date(activeSession.startTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Apply minimum billing: minimum 1 hour charge even if parked for less
    const billedHours = Math.max(1, durationHours);
    const totalCost = billedHours * activeSession.hourlyRate;

    const completedSession: ParkingSession = {
      ...activeSession,
      endTime: endTime.toISOString(),
      duration: Math.round(durationHours * 100) / 100, // Actual duration for display
      totalCost: Math.round(totalCost * 100) / 100, // Cost based on minimum billing
      status: 'completed'
    };

    // Update session in history
    const sessions = this.getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = completedSession;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    }

    // Clear active session
    localStorage.removeItem(this.ACTIVE_SESSION_KEY);

    console.log('🏁 Parking session ended:', completedSession);
    
    // Trigger global update
    (window as Record<string, unknown>).parkingSessionUpdate = true;

    return completedSession;
  }

  // Get all parking sessions for a user
  static getUserSessions(userId: string): ParkingSession[] {
    if (typeof window === 'undefined') return [];
    
    const sessions = this.getAllSessions();
    return sessions.filter(session => session.userId === userId);
  }

  // Get all sessions (admin function)
  static getAllSessions(): ParkingSession[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Calculate current session cost
  static getCurrentSessionCost(session: ParkingSession): number {
    if (session.status !== 'active') {
      return session.totalCost || 0;
    }

    const now = new Date();
    const startTime = new Date(session.startTime);
    const durationMs = now.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return Math.round(durationHours * session.hourlyRate * 100) / 100;
  }

  // Get session duration in a readable format
  static getSessionDuration(session: ParkingSession): string {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = session.endTime ? new Date(session.endTime) : now;
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }

  // Check if user has any active session
  static hasActiveSession(userId: string): boolean {
    return this.getActiveSession(userId) !== null;
  }

  // Get sessions for a specific parking spot (for Rentor dashboard)
  static getSpotSessions(parkingSpotId: string): ParkingSession[] {
    const sessions = this.getAllSessions();
    return sessions.filter(session => session.parkingSpotId === parkingSpotId);
  }
}