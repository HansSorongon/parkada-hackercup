'use client';

import React, { useState, useEffect } from 'react';
import { User, Settings, X, Building2, LogIn, LogOut, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MockAuth, type User as AuthUser } from '@/lib/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(MockAuth.getCurrentUser());
  }, [isOpen]); // Check auth status when sidebar opens

  const handleLogin = () => {
    router.push('/login');
    onClose();
  };

  const handleLogout = () => {
    MockAuth.logout();
    setCurrentUser(null);
    onClose();
  };

  const handleDashboard = () => {
    router.push('/dashboard');
    onClose();
  };

  const handleProfile = () => {
    router.push('/profile');
    onClose();
  };
  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-sidebar transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-lg`}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Image
            src="/parkada_logo_2.png"
            alt="Parkada"
            width={144}
            height={48}
            className="h-12 w-auto"
          />
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4">
          {/* User Profile Section */}
          {currentUser && (
            <div 
              className="mb-4 p-3 bg-sidebar-accent rounded-lg cursor-pointer hover:bg-sidebar-accent/80 transition-colors"
              onClick={handleProfile}
            >
              <div className="flex items-center gap-3">
                {currentUser.avatar && (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
                  <p className="text-xs text-sidebar-foreground/70 capitalize">{currentUser.type}</p>
                </div>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {!currentUser ? (
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground h-auto p-3 font-bold"
                  onClick={handleLogin}
                >
                  <LogIn className="h-5 w-5 stroke-[2.5]" />
                  Sign In
                </Button>
              </li>
            ) : (
              <>
                {(currentUser.type === 'rentor' || currentUser.type === 'both') && (
                  <>
                    <li>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground h-auto p-3 font-bold"
                        onClick={handleDashboard}
                      >
                        <BarChart3 className="h-5 w-5 stroke-[2.5]" />
                        Dashboard
                      </Button>
                    </li>
                    <li>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground h-auto p-3 font-bold"
                        onClick={() => {
                          router.push('/rentor');
                          onClose();
                        }}
                      >
                        <Building2 className="h-5 w-5 stroke-[2.5]" />
                        Add New Property
                      </Button>
                    </li>
                  </>
                )}
                
                {currentUser.type === 'renter' && (
                  <li>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground h-auto p-3 font-bold"
                      onClick={() => {
                        router.push('/rentor');
                        onClose();
                      }}
                    >
                      <Building2 className="h-5 w-5 stroke-[2.5]" />
                      Become a Rentor
                    </Button>
                  </li>
                )}

                <li>
                  <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground h-auto p-3 font-bold">
                    <Settings className="h-5 w-5 stroke-[2.5]" />
                    Settings
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground h-auto p-3 font-bold text-red-400 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 stroke-[2.5]" />
                    Sign Out
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
}