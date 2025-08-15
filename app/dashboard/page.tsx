'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Calendar, MapPin, DollarSign, Users, Clock, CheckCircle, XCircle, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MockAuth, type User, type RentalHistory } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [activeRentals, setActiveRentals] = useState<RentalHistory[]>([]);

  useEffect(() => {
    const user = MockAuth.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.type !== 'rentor' && user.type !== 'both') {
      router.push('/');
      return;
    }

    const loadData = () => {
      setCurrentUser(user);
      const history = MockAuth.getRentalHistory(user.id);
      setRentalHistory(history);
      setTotalEarnings(MockAuth.getTotalEarnings(user.id));
      setMonthlyEarnings(MockAuth.getMonthlyEarnings(user.id));
      setActiveRentals(MockAuth.getActiveRentals(user.id));
    };

    loadData();

    // Listen for parking session updates
    const checkForUpdates = setInterval(() => {
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).parkingSessionUpdate) {
        loadData();
        (window as unknown as Record<string, unknown>).parkingSessionUpdate = false;
      }
    }, 1000);

    return () => clearInterval(checkForUpdates);
  }, [router]);

  const filteredHistory = rentalHistory.filter(rental => {
    if (filterStatus === 'all') return true;
    return rental.status === filterStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    return `${hours.toFixed(1)} hrs`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const goBack = () => {
    router.back();
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Rentor Dashboard</h1>
        <div className="w-10" />
      </div>

      <div className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
          <div className="flex items-center gap-4">
            {currentUser.avatar && (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {currentUser.name}!</h2>
              <p className="text-muted-foreground">Here's how your parking spaces are performing</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">₱{totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₱{monthlyEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <p className="text-2xl font-bold">{activeRentals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{rentalHistory.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Rentals */}
        {activeRentals.length > 0 && (
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Currently Active Rentals
            </h3>
            <div className="space-y-3">
              {activeRentals.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{rental.parkingSpotName}</p>
                      <p className="text-sm text-muted-foreground">
                        Rented by {rental.renterName} • Started {formatDate(rental.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">₱{rental.hourlyRate}/hr</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rental History */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rental History
            </h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No rental history found</p>
              <p className="text-sm">Your rental activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{rental.parkingSpotName}</p>
                      <p className="text-sm text-muted-foreground">
                        {rental.renterName} • {formatDate(rental.startTime)}
                        {rental.endTime && ` - ${formatDate(rental.endTime)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {rental.status === 'completed' ? `₱${rental.totalEarnings.toFixed(2)}` : `₱${rental.hourlyRate}/hr`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rental.status === 'completed' ? formatDuration(rental.duration) : 'In progress'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rental.status)}
                      <span className="text-sm capitalize">{rental.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => router.push('/rentor')}
              className="h-12 justify-start gap-3"
              variant="outline"
            >
              <MapPin className="h-5 w-5" />
              Add New Parking Space
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="h-12 justify-start gap-3"
              variant="outline"
            >
              <Eye className="h-5 w-5" />
              View Map
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}