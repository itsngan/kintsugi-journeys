import React from 'react';
import { UserProfile } from '@/types/journey';
import JourneyGraph from './JourneyGraph';
import TagBadge from './TagBadge';
import { User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: UserProfile;
  matchingTags?: string[];
  onViewProfile?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile,
  style,
  matchingTags = [],
  onViewProfile,
  className 
}) => {
  const displayTags = profile.tags.filter(tag => 
    matchingTags.length === 0 || matchingTags.includes(tag.label)
  ).slice(0, 4);

  return (
    <div 
      className={cn(
        "bg-card rounded-2xl border border-border p-6 shadow-md hover:shadow-lg transition-all duration-300",
        "hover:border-primary/30",
        className
      )}
      style={style}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/30">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-xl text-foreground">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.currentTitle}</p>
          </div>
        </div>
        {onViewProfile && (
          <button 
            onClick={onViewProfile}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-primary" />
          </button>
        )}
      </div>

      {/* Mini Journey Graph */}
      <div className="mb-4 -mx-2">
        <JourneyGraph 
          nodes={profile.journey} 
          isEditable={false} 
          compact 
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {displayTags.map(tag => (
          <TagBadge key={tag.id} tag={tag} size="sm" />
        ))}
        {profile.tags.length > 4 && (
          <span className="text-xs text-muted-foreground px-2 py-0.5">
            +{profile.tags.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
