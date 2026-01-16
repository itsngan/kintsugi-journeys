import React, { useState, useRef } from 'react';
import { UserProfile } from '@/types/journey';
import JourneyGraph from './JourneyGraph';
import TagBadge from './TagBadge';
import { User, Heart, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onViewProfile: () => void;
  matchingTags?: string[];
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onViewProfile,
  matchingTags = [],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = (e.clientY - startPos.current.y) * 0.3;
    setDragOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 100) {
      setSwipeDirection('right');
      setTimeout(onSwipeRight, 300);
    } else if (dragOffset.x < -100) {
      setSwipeDirection('left');
      setTimeout(onSwipeLeft, 300);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const dx = e.touches[0].clientX - startPos.current.x;
    const dy = (e.touches[0].clientY - startPos.current.y) * 0.3;
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = handleMouseUp;

  const rotation = dragOffset.x * 0.05;
  const opacity = 1 - Math.abs(dragOffset.x) / 500;

  const displayTags = profile.tags.filter(tag => 
    matchingTags.length === 0 || matchingTags.includes(tag.label)
  ).slice(0, 5);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-full max-w-md bg-card rounded-3xl border-2 border-border shadow-xl overflow-hidden cursor-grab active:cursor-grabbing",
        swipeDirection === 'right' && "animate-swipe-right",
        swipeDirection === 'left' && "animate-swipe-left",
        !swipeDirection && "transition-transform duration-200"
      )}
      style={{
        transform: swipeDirection 
          ? undefined 
          : `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity: swipeDirection ? undefined : opacity,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicators */}
      <div 
        className={cn(
          "absolute top-6 left-6 px-4 py-2 rounded-lg border-2 border-destructive bg-destructive/10 text-destructive font-bold text-xl rotate-[-20deg] transition-opacity z-10",
          dragOffset.x < -50 ? "opacity-100" : "opacity-0"
        )}
      >
        PASS
      </div>
      <div 
        className={cn(
          "absolute top-6 right-6 px-4 py-2 rounded-lg border-2 border-success bg-success/10 text-success font-bold text-xl rotate-[20deg] transition-opacity z-10",
          dragOffset.x > 50 ? "opacity-100" : "opacity-0"
        )}
      >
        CONNECT
      </div>

      <div className="p-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/50 flex items-center justify-center border-2 border-primary/40">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-2xl text-foreground">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.currentTitle}</p>
            <p className="text-xs text-muted-foreground/70">{profile.currentIndustry}</p>
          </div>
        </div>

        {/* Journey Graph */}
        <div className="mb-4 bg-background/50 rounded-xl p-3 -mx-1">
          <JourneyGraph 
            nodes={profile.journey} 
            isEditable={false} 
            compact 
          />
        </div>

        {/* Matching Tags */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Matching Areas</p>
          <div className="flex flex-wrap gap-2">
            {displayTags.map(tag => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        </div>

        {/* Bio preview */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {profile.bio}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 p-4 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSwipeDirection('left');
            setTimeout(onSwipeLeft, 300);
          }}
          className="w-14 h-14 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center hover:bg-destructive/20 transition-colors"
        >
          <X className="w-6 h-6 text-destructive" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile();
          }}
          className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <Eye className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSwipeDirection('right');
            setTimeout(onSwipeRight, 300);
          }}
          className="w-14 h-14 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center hover:bg-success/20 transition-colors"
        >
          <Heart className="w-6 h-6 text-success" />
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;
