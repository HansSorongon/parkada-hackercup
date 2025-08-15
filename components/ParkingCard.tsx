'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ParkingCardProps {
  name: string;
  distance: string;
  driveTime: string;
  price: string;
  tags: string[];
  imageVariant: 'primary' | 'secondary' | 'accent';
  onClick?: () => void;
}

export default function ParkingCard({ 
  name, 
  distance, 
  driveTime, 
  price, 
  tags, 
  imageVariant,
  onClick 
}: ParkingCardProps) {
  const getImageClasses = () => {
    switch (imageVariant) {
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

  return (
    <div 
      className="p-4 bg-card border border-border rounded-xl shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Parking Image */}
        <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getImageClasses()}`}>
            <span className="font-bold text-xs">P</span>
          </div>
        </div>
        
        {/* Parking Details - Left Side */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm mb-1">{name}</h4>
          
          <p className="text-xs text-muted-foreground mb-2">{distance} away • {driveTime} drive</p>
          
          {/* Tags */}
          <div className="flex gap-1 flex-wrap">
            {tags.map((tag, index) => (
              <Badge 
                key={tag} 
                variant={getTagVariant(index)}
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Pricing - Right Side */}
        <div className="flex flex-col items-end justify-center text-right">
          <div className="bg-primary/10 px-3 py-2 rounded-xl">
            <p className="text-lg font-bold text-primary">{price}</p>
            <p className="text-xs text-primary/70">/hour</p>
          </div>
        </div>
      </div>
    </div>
  );
}
