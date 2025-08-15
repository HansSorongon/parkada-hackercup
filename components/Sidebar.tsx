'use client';

import React from 'react';
import { User, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-sidebar transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-lg`}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Image
            src="/parkada_logo.png"
            alt="Parkada"
            width={120}
            height={40}
            className="h-10 w-auto"
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
          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground h-auto p-3">
                <User className="h-5 w-5" />
                Profile
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-sidebar-accent text-sidebar-foreground h-auto p-3">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </li>
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