import React from 'react';
import { Tag } from '@/types/journey';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag, onRemove, size = 'md' }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        tag.type === 'help' 
          ? "bg-success/15 text-success border border-success/30 hover:bg-success/25" 
          : "bg-help/15 text-help border border-help/30 hover:bg-help/25"
      )}
    >
      {tag.label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default TagBadge;
