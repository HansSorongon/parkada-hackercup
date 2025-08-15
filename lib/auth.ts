// Mock authentication system for demo purposes

export interface User {
  id: string;
  email: string;
  name: string;
  type: 'renter' | 'rentor' | 'both';
  joinDate: string;
  avatar?: string;
}

export interface RentalHistory {
  id: string;
  parkingSpotId: string;
  parkingSpotName: string;
  renterId: string;
  renterName: string;
  renterEmail: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  hourlyRate: number;
  totalEarnings: number;
  status: 'completed' | 'active' | 'cancelled';
}

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: 'user1',
    email: 'john.doe@email.com',
    name: 'John Doe',
    type: 'rentor',
    joinDate: '2024-01-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 'user2',
    email: 'maria.santos@email.com',
    name: 'Maria Santos',
    type: 'rentor',
    joinDate: '2024-02-01',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 'user3',
    email: 'carlos.reyes@email.com',
    name: 'Carlos Reyes',
    type: 'both',
    joinDate: '2024-01-20',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 'user4',
    email: 'ana.cruz@email.com',
    name: 'Ana Cruz',
    type: 'renter',
    joinDate: '2024-02-10',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
  }
];

// Mock rental history for demo
const generateMockRentalHistory = (userId: string): RentalHistory[] => {
  const baseHistory: Omit<RentalHistory, 'id' | 'startTime' | 'endTime' | 'duration' | 'totalEarnings'>[] = [
    {
      parkingSpotId: 'RENT001',
      parkingSpotName: 'DLSU Parking Building',
      renterId: 'user4',
      renterName: 'Ana Cruz',
      renterEmail: 'ana.cruz@email.com',
      hourlyRate: 75,
      status: 'completed'
    },
    {
      parkingSpotId: 'RENT001',
      parkingSpotName: 'DLSU Parking Building',
      renterId: 'user3',
      renterName: 'Carlos Reyes',
      renterEmail: 'carlos.reyes@email.com',
      hourlyRate: 75,
      status: 'completed'
    },
    {
      parkingSpotId: 'RENT001',
      parkingSpotName: 'DLSU Parking Building',
      renterId: 'user4',
      renterName: 'Ana Cruz',
      renterEmail: 'ana.cruz@email.com',
      hourlyRate: 75,
      status: 'active'
    }
  ];

  return baseHistory.map((entry, index) => {
    const now = new Date();
    const startTime = new Date(now.getTime() - (index + 1) * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000);
    const duration = entry.status === 'active' ? Math.random() * 3 + 1 : Math.random() * 6 + 2;
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    return {
      ...entry,
      id: `rental_${userId}_${index + 1}`,
      startTime: startTime.toISOString(),
      endTime: entry.status === 'active' ? '' : endTime.toISOString(),
      duration: Math.round(duration * 10) / 10,
      totalEarnings: Math.round(duration * entry.hourlyRate * 100) / 100
    };
  });
};

export class MockAuth {
  private static currentUser: User | null = null;

  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // For demo, any password works
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    console.log('✅ User logged in:', user.name);
    return { success: true, user };
  }

  static async signup(email: string, password: string, name: string, type: 'renter' | 'rentor'): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      type,
      joinDate: new Date().toISOString().split('T')[0],
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`
    };
    
    MOCK_USERS.push(newUser);
    this.currentUser = newUser;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
    
    console.log('✅ User registered:', newUser.name);
    return { success: true, user: newUser };
  }

  static logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    console.log('👋 User logged out');
  }

  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  static getRentalHistory(userId: string): RentalHistory[] {
    // Get real parking sessions for user's properties
    if (typeof window !== 'undefined') {
      const { ParkingSessionManager } = require('./parking-session');
      
      // Get user's parking spots
      const rentorSpots = JSON.parse(localStorage.getItem('rentorParkingSpots') || '[]');
      const userSpots = rentorSpots.filter((spot: any) => spot.userId === userId);
      
      // Get all sessions for user's spots
      const realSessions: RentalHistory[] = [];
      userSpots.forEach((spot: any) => {
        const spotSessions = ParkingSessionManager.getSpotSessions(spot.id);
        spotSessions.forEach((session: any) => {
          realSessions.push({
            id: session.id,
            parkingSpotId: session.parkingSpotId,
            parkingSpotName: session.parkingSpotName,
            renterId: session.userId,
            renterName: session.userName,
            renterEmail: session.userEmail,
            startTime: session.startTime,
            endTime: session.endTime || '',
            duration: session.duration || 0,
            hourlyRate: session.hourlyRate,
            totalEarnings: session.totalCost || 0,
            status: session.status as 'completed' | 'active' | 'cancelled'
          });
        });
      });
      
      // If no real sessions, return mock data for demo
      if (realSessions.length === 0) {
        return generateMockRentalHistory(userId);
      }
      
      return realSessions;
    }
    
    return generateMockRentalHistory(userId);
  }

  static getTotalEarnings(userId: string): number {
    const history = this.getRentalHistory(userId);
    return history
      .filter(rental => rental.status === 'completed')
      .reduce((total, rental) => total + rental.totalEarnings, 0);
  }

  static getMonthlyEarnings(userId: string): number {
    const history = this.getRentalHistory(userId);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return history
      .filter(rental => 
        rental.status === 'completed' && 
        new Date(rental.startTime) >= oneMonthAgo
      )
      .reduce((total, rental) => total + rental.totalEarnings, 0);
  }

  static getActiveRentals(userId: string): RentalHistory[] {
    const history = this.getRentalHistory(userId);
    return history.filter(rental => rental.status === 'active');
  }

  static getAllUsers(): User[] {
    return [...MOCK_USERS];
  }
}