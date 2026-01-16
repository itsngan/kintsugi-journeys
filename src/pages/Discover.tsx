import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProfiles, currentUserProfile } from '@/data/mockProfiles';
import { UserProfile } from '@/types/journey';
import SwipeCard from '@/components/SwipeCard';
import ProfileCard from '@/components/ProfileCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  User, 
  Sparkles, 
  Heart,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [likedProfiles, setLikedProfiles] = useState<UserProfile[]>([]);
  const [passedProfiles, setPassedProfiles] = useState<string[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const schools = new Set<string>();
    const companies = new Set<string>();
    const tags = new Set<string>();

    mockProfiles.forEach(profile => {
      profile.journey.forEach(node => {
        if (node.company?.toLowerCase().includes('university') || 
            node.company?.toLowerCase().includes('college')) {
          schools.add(node.company);
        } else if (node.company && !node.isEmpty) {
          companies.add(node.company);
        }
      });
      profile.tags.forEach(tag => tags.add(tag.label));
    });

    return {
      schools: Array.from(schools),
      companies: Array.from(companies),
      tags: Array.from(tags),
    };
  }, []);

  // Get matching tags between current user and a profile
  const getMatchingTags = (profile: UserProfile) => {
    const userNeedLabels = currentUserProfile.tags
      .filter(t => t.type === 'need')
      .map(t => t.label);
    const userHelpLabels = currentUserProfile.tags
      .filter(t => t.type === 'help')
      .map(t => t.label);

    return profile.tags
      .filter(t => 
        (t.type === 'help' && userNeedLabels.includes(t.label)) ||
        (t.type === 'need' && userHelpLabels.includes(t.label))
      )
      .map(t => t.label);
  };

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    return mockProfiles
      .filter(profile => {
        if (passedProfiles.includes(profile.id)) return false;
        if (likedProfiles.some(p => p.id === profile.id)) return false;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = 
            profile.name.toLowerCase().includes(query) ||
            profile.currentTitle.toLowerCase().includes(query) ||
            profile.currentIndustry.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        if (selectedSchool) {
          const hasSchool = profile.journey.some(n => n.company === selectedSchool);
          if (!hasSchool) return false;
        }

        if (selectedCompany) {
          const hasCompany = profile.journey.some(n => n.company === selectedCompany);
          if (!hasCompany) return false;
        }

        if (selectedTag) {
          const hasTag = profile.tags.some(t => t.label === selectedTag);
          if (!hasTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aMatches = getMatchingTags(a).length;
        const bMatches = getMatchingTags(b).length;
        return bMatches - aMatches;
      });
  }, [searchQuery, selectedSchool, selectedCompany, selectedTag, passedProfiles, likedProfiles]);

  const topMatches = filteredProfiles.slice(0, 3);
  const swipeProfiles = filteredProfiles.slice(3);
  const currentSwipeProfile = swipeProfiles[currentCardIndex];

  const handleSwipeRight = () => {
    if (currentSwipeProfile) {
      setLikedProfiles(prev => [...prev, currentSwipeProfile]);
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handleSwipeLeft = () => {
    if (currentSwipeProfile) {
      setPassedProfiles(prev => [...prev, currentSwipeProfile.id]);
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const clearFilters = () => {
    setSelectedSchool('');
    setSelectedCompany('');
    setSelectedTag('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedSchool || selectedCompany || selectedTag || searchQuery;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl text-foreground">Kintsugi</span>
          </button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search & Filters */}
        <section className="mb-8 animate-slide-up">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, title, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showFilters && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Filter dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-xl border border-border animate-scale-in">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">School</label>
                <select 
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">All schools</option>
                  {filterOptions.schools.map(school => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Company</label>
                <select 
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">All companies</option>
                  {filterOptions.companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tag</label>
                <select 
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">All tags</option>
                  {filterOptions.tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline flex items-center gap-1 md:col-span-3"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* Liked Profiles */}
        {likedProfiles.length > 0 && (
          <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-success fill-success" />
              <h2 className="font-serif text-xl text-foreground">Liked ({likedProfiles.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedProfiles.map((profile, index) => (
                <ProfileCard 
                  key={profile.id}
                  profile={profile}
                  matchingTags={getMatchingTags(profile)}
                  onViewProfile={() => setViewingProfile(profile)}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                />
              ))}
            </div>
          </section>
        )}

        {/* Top Matches */}
        {topMatches.length > 0 && (
          <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl text-foreground">Top Matches</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topMatches.map((profile, index) => (
                <ProfileCard 
                  key={profile.id}
                  profile={profile}
                  matchingTags={getMatchingTags(profile)}
                  onViewProfile={() => setViewingProfile(profile)}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                />
              ))}
            </div>
          </section>
        )}

        {/* Swipe Discovery */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-xl text-foreground">Discover More</h2>
          </div>

          <div className="flex justify-center">
            {currentSwipeProfile ? (
              <SwipeCard 
                key={currentSwipeProfile.id}
                profile={currentSwipeProfile}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onViewProfile={() => setViewingProfile(currentSwipeProfile)}
                matchingTags={getMatchingTags(currentSwipeProfile)}
              />
            ) : (
              <div className="w-full max-w-md bg-card rounded-3xl border-2 border-dashed border-border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground text-sm">
                  You've seen all the profiles. Check back later for new connections.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Profile View Modal */}
      {viewingProfile && (
        <div 
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewingProfile(null)}
        >
          <div 
            className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/50 flex items-center justify-center border-2 border-primary/40">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">{viewingProfile.name}</h2>
                    <p className="text-muted-foreground">{viewingProfile.currentTitle}</p>
                    <p className="text-sm text-muted-foreground/70">{viewingProfile.currentIndustry}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingProfile(null)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-foreground/80 mb-6">{viewingProfile.bio}</p>

              <div className="mb-6">
                <h3 className="font-medium text-foreground mb-3">Their Journey</h3>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <JourneyGraph 
                    nodes={viewingProfile.journey}
                    isEditable={false}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {viewingProfile.tags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="goldOutline"
                  className="flex-1"
                  onClick={() => setViewingProfile(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="gold"
                  className="flex-1"
                  onClick={() => {
                    if (!likedProfiles.some(p => p.id === viewingProfile.id)) {
                      setLikedProfiles(prev => [...prev, viewingProfile]);
                    }
                    setViewingProfile(null);
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing import
import { JourneyNode } from '@/types/journey';
import JourneyGraph from '@/components/JourneyGraph';
import TagBadge from '@/components/TagBadge';

export default Discover;
