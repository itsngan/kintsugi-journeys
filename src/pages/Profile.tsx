import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentUserProfile } from '@/data/mockProfiles';
import { UserProfile, Tag } from '@/types/journey';
import JourneyGraph from '@/components/JourneyGraph';
import TagBadge from '@/components/TagBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Edit3, 
  Compass, 
  Plus, 
  Sparkles,
  Target,
  Briefcase,
  Heart
} from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(currentUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [newHelpTag, setNewHelpTag] = useState('');
  const [newNeedTag, setNewNeedTag] = useState('');

  const helpTags = profile.tags.filter(t => t.type === 'help');
  const needTags = profile.tags.filter(t => t.type === 'need');

  const addTag = (type: 'help' | 'need') => {
    const label = type === 'help' ? newHelpTag : newNeedTag;
    if (!label.trim()) return;

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      label: label.trim(),
      type,
    };

    setProfile(prev => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));

    if (type === 'help') {
      setNewHelpTag('');
    } else {
      setNewNeedTag('');
    }
  };

  const removeTag = (tagId: string) => {
    setProfile(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== tagId),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl text-foreground">Kintsugi</span>
          </div>
          <Button 
            variant="gold" 
            onClick={() => navigate('/discover')}
            className="gap-2"
          >
            <Compass className="w-4 h-4" />
            Discover
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <section className="mb-10 animate-slide-up">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/50 flex items-center justify-center border-3 border-primary/40 gold-glow">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors">
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <Input 
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="font-serif text-2xl mb-2"
                />
              ) : (
                <h1 className="font-serif text-3xl text-foreground mb-1">{profile.name}</h1>
              )}
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {profile.currentTitle}
                </span>
                <span>•</span>
                <span>{profile.currentIndustry}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Dream:</span>
                <span className="text-foreground">{profile.dreamTitle}</span>
                <span className="text-muted-foreground">in</span>
                <span className="text-foreground">{profile.dreamIndustry}</span>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Done' : 'Edit'}
            </Button>
          </div>

          {/* Bio */}
          <div className="mt-6">
            {isEditing ? (
              <Textarea 
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="resize-none"
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </section>

        {/* Journey Graph */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-2xl text-foreground">Your Journey</h2>
              <p className="text-sm text-muted-foreground">
                Drag nodes up for success, down for struggle
              </p>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-6 overflow-x-auto">
            <JourneyGraph 
              nodes={profile.journey}
              onNodesChange={(nodes) => setProfile(prev => ({ ...prev, journey: nodes }))}
              isEditable={true}
            />
          </div>
          
          <p className="mt-3 text-xs text-muted-foreground text-center">
            <span className="gold-text">Gold lines</span> trace your unique path • Click empty nodes to add your story
          </p>
        </section>

        {/* Tags Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-serif text-2xl text-foreground mb-6">Areas of Exchange</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Can Help With */}
            <div className="bg-card rounded-2xl border border-success/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-success" />
                </div>
                <h3 className="font-medium text-foreground">Can Help With</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {helpTags.map(tag => (
                  <TagBadge 
                    key={tag.id} 
                    tag={tag} 
                    onRemove={() => removeTag(tag.id)}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="Add skill or experience..."
                  value={newHelpTag}
                  onChange={(e) => setNewHelpTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag('help')}
                  className="flex-1"
                />
                <Button 
                  variant="success" 
                  size="icon"
                  onClick={() => addTag('help')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Need Help With */}
            <div className="bg-card rounded-2xl border border-help/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-help/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-help" />
                </div>
                <h3 className="font-medium text-foreground">Need Help With</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {needTags.map(tag => (
                  <TagBadge 
                    key={tag.id} 
                    tag={tag} 
                    onRemove={() => removeTag(tag.id)}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="Add area you need help..."
                  value={newNeedTag}
                  onChange={(e) => setNewNeedTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag('need')}
                  className="flex-1"
                />
                <Button 
                  variant="help" 
                  size="icon"
                  onClick={() => addTag('need')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
