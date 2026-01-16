import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

const SignIn: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Logo & Title */}
        <div className="mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-primary/30 mb-6 gold-glow">
            <Sparkles className="w-10 h-10 text-primary animate-pulse-gold" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-3">
            Kintsugi
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Mentorship through shared struggle
          </p>
        </div>

        {/* Kintsugi philosophy */}
        <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-2xl blur-sm" />
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20">
              <p className="text-foreground/90 leading-relaxed">
                Inspired by the Japanese art of repairing broken pottery with gold, 
                Kintsugi celebrates your <span className="gold-text font-medium">failures</span>, 
                <span className="gold-text font-medium"> detours</span>, and 
                <span className="gold-text font-medium"> growth</span>.
              </p>
              <p className="text-muted-foreground mt-3 text-sm">
                Because real mentorship happens when someone truly understands your journey.
              </p>
            </div>
          </div>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: '🔄', text: 'Give & receive help' },
            { icon: '🌱', text: 'Share your real journey' },
            { icon: '🤝', text: 'Connect by struggle' },
          ].map((item, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-colors"
            >
              <span className="text-2xl mb-2 block">{item.icon}</span>
              <span className="text-sm text-foreground/80">{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button 
            variant="gold" 
            size="xl" 
            className="w-full group"
            onClick={() => navigate('/profile')}
          >
            Create Your Journey
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="goldOutline" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/profile')}
          >
            Sign In
          </Button>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-muted-foreground/60 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Heart className="w-3 h-3 inline-block mr-1 text-primary/60" />
          Everyone is simply a person here. No titles, no hierarchy.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
