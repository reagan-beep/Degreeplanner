import React, { useState, useEffect } from 'react';
import Login from './Login';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import stadiumImage from 'figma:asset/7d59c40440f5789bbeb9085df435daaea3cd54e9.png';

type WelcomeState = 'initial' | 'options';

interface User {
  email: string;
}

interface PageData {
  major: string;
  maxHours?: string;
  currentYear?: string;
}

interface WelcomeProps {
  onGoToSemester?: (data: PageData) => void;
  onGoToCourse?: (data: PageData) => void;
  onGoToTemplate?: (data: PageData) => void;
  onGoToPrevious?: (data: PageData) => void;
  welcomeState: WelcomeState;
  setWelcomeState: (state: WelcomeState) => void;
  lastMajor: string;
}

const majorSuggestions = [
  'Computer Engineering',
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Mathematics',
  'Physics',
  'Biology',
  'Business Administration',
  'Psychology',
  'Economics',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
];

function Welcome({ 
  onGoToSemester, 
  onGoToCourse, 
  onGoToTemplate, 
  onGoToPrevious, 
  welcomeState, 
  setWelcomeState, 
  lastMajor 
}: WelcomeProps) {
  const [major, setMajor] = useState(lastMajor || '');
  const [submitted, setSubmitted] = useState(!!lastMajor);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [path, setPath] = useState<'guest' | 'login' | null>(null);

  // Reset all state when returning to home
  useEffect(() => {
    if (welcomeState === 'initial') {
      setMajor('');
      setSubmitted(false);
      setLoading(false);
      setPath(null);
      setUser(null);
    }
  }, [welcomeState]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!major.trim()) return;
    setSubmitted(true);
    setLoading(true);

    // Simulate processing delay then go directly to degree planner
    setTimeout(() => {
      setLoading(false);
      onGoToSemester && onGoToSemester({ major });
    }, 1400);
  }

  // Show logo in top left when not on initial screen
  const showLogoTopLeft = path !== null || submitted;

  return (
    <div 
      className="min-h-screen bg-[rgb(243,243,243)] relative"
      style={
        path === 'login' 
          ? {
              backgroundImage: `url(${stadiumImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      {/* Black overlay for login page */}
      {path === 'login' && (
        <div className="absolute inset-0 bg-black/60"></div>
      )}

      {/* Logo in top left corner when appropriate */}
      {showLogoTopLeft && (
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => setWelcomeState('initial')}
            className="text-3xl tracking-tight text-[rgba(85,0,0,0.98)] font-[Passion_One] font-bold italic hover:opacity-80 transition-opacity"
          >
            How-De-gree
          </button>
        </div>
      )}

      {/* Initial welcome screen with scroll layout */}
      {welcomeState === 'initial' && !submitted && !path && (
        <div className="min-h-screen">
          {/* Hero section */}
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl tracking-tight text-[rgba(85,0,0,0.98)] font-[Passion_One] font-bold italic lg:text-[128px]">
                  Welcome to How-De-gree!
                </h1>
                <p className="text-[rgb(11,11,12)] font-[Open_Sans] text-lg">Your personalized degree planner.</p>
              </div>
              
              {/* Scroll indicator */}
              <div className="flex flex-col items-center space-y-4 mt-16">
                <p className="text-muted-foreground font-[Open_Sans]">Scroll down to get started</p>
                <div className="animate-bounce">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action section */}
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-[Passion_One] text-[rgba(85,0,0,0.98)]">Get Started</h2>
                <p className="text-muted-foreground font-[Open_Sans]">Choose how you'd like to begin planning your degree</p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="w-full font-[Open_Sans] h-12"
                  onClick={() => setPath('guest')}
                >
                  Continue as Guest
                </Button>
                <div className="text-center text-muted-foreground font-[Open_Sans]">or</div>
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full font-[Open_Sans] h-12"
                  onClick={() => setPath('login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form states */}
      {(welcomeState === 'initial' && !submitted && path) && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-8 relative z-10">
            {path === 'guest' && (
              <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="major-input">Enter your major</Label>
                    <Input
                      id="major-input"
                      placeholder="e.g. Computer Engineering"
                      list="major-suggestions"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                    />
                    <datalist id="major-suggestions">
                      {majorSuggestions.map((suggestion) => (
                        <option key={suggestion} value={suggestion} />
                      ))}
                    </datalist>
                  </div>
                  <Button type="submit" className="w-full font-[Open_Sans]">Continue</Button>
                </form>
                <Button 
                  variant="ghost"
                  className="w-full font-[Open_Sans]"
                  onClick={() => setPath(null)}
                >
                  Back
                </Button>
              </div>
            )}

            {path === 'login' && (
              <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
                {user ? (
                  <div className="space-y-4">
                    <p className="text-center">
                      Signed in as <strong>{user.email}</strong>
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="major-input">Enter your major</Label>
                        <Input
                          id="major-input"
                          placeholder="e.g. Computer Engineering"
                          list="major-suggestions"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                        />
                        <datalist id="major-suggestions">
                          {majorSuggestions.map((suggestion) => (
                            <option key={suggestion} value={suggestion} />
                          ))}
                        </datalist>
                      </div>
                      <Button type="submit" className="w-full font-[Open_Sans]">Continue</Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Login onLogin={(u) => setUser(u)} />
                    <Button 
                      variant="ghost"
                      className="w-full font-[Open_Sans]"
                      onClick={() => setPath(null)}
                    >
                      Back
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state after form submission */}
      {submitted && loading && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-8 relative z-10">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground font-[Open_Sans]">Formulating your degree plan...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Welcome;