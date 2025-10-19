import React, { useState, useEffect } from 'react';
import Login from './Login';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
// import stadiumImage from 'figma:asset/7d59c40440f5789bbeb9085df435daaea3cd54e9.png';

type WelcomeState = 'initial' | 'options';

interface User {
  email: string;
}

interface PageData {
  major: string;
  minor?: string;
  certificate?: string;
  maxHours?: number;
  currentYear?: string;
  currentSemester?: string;
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
  const [minor, setMinor] = useState('');
  const [certificate, setCertificate] = useState('');
  const [maxHours, setMaxHours] = useState<number[]>([16]);
  const [currentYear, setCurrentYear] = useState<string>('');
  const [currentSemester, setCurrentSemester] = useState<string>('');
  const [yearError, setYearError] = useState<string>('');
  const [semesterError, setSemesterError] = useState<string>('');
  const [submitted, setSubmitted] = useState(!!lastMajor);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [path, setPath] = useState<'guest' | 'login' | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Scroll handler for animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset all state when returning to home
  useEffect(() => {
    if (welcomeState === 'initial') {
      setMajor('');
      setMinor('');
      setCertificate('');
      setMaxHours([16]);
      setCurrentYear('Freshman');
      setSubmitted(false);
      setLoading(false);
      setPath(null);
      setUser(null);
    }
  }, [welcomeState]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Clear previous errors
    setYearError('');
    setSemesterError('');
    
    // Validate required fields
    let hasErrors = false;
    
    if (!major.trim()) {
      hasErrors = true;
    }
    
    if (!currentYear || currentYear === '') {
      setYearError('Please select your current year');
      hasErrors = true;
    }
    
    if (!currentSemester || currentSemester === '') {
      setSemesterError('Please select your current semester');
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    setSubmitted(true);
    setLoading(true);

    // Simulate processing delay then go directly to degree planner
    setTimeout(() => {
      setLoading(false);
      onGoToSemester && onGoToSemester({ 
        major, 
        minor: minor.trim() || undefined, 
        certificate: certificate.trim() || undefined,
        maxHours: maxHours[0],
        currentYear,
        currentSemester
      });
    }, 1400);
  }

  // Show logo in top left when not on initial screen
  const showLogoTopLeft = path !== null || submitted;

  return (
    <div 
      className="min-h-screen bg-[rgb(243,243,243)] relative scroll-smooth"
      style={
        path === 'login' 
          ? {
              backgroundImage: `url(data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><rect fill="#f3f3f3" width="1000" height="1000"/></svg>')})`,
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
          <div 
            className="min-h-screen flex items-center justify-center p-4"
            style={{
              transform: scrollY > 0 ? `translateY(${scrollY * 0.1}px)` : 'none',
              opacity: scrollY > 600 ? 0.3 : 1
            }}
          >
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
                <button 
                  onClick={() => {
                    const actionSection = document.getElementById('action-section');
                    if (actionSection) {
                      actionSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="animate-bounce hover:animate-none transition-all duration-300 hover:scale-110 cursor-pointer"
                >
                  <svg className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action section */}
          <div 
            id="action-section"
            className="min-h-screen flex items-center justify-center p-4"
            style={{
              opacity: scrollY > 300 ? 1 : Math.max(scrollY / 300, 0.3)
            }}
          >
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-[Passion_One] text-[rgba(85,0,0,0.98)]">Get Started</h2>
                <p className="text-muted-foreground font-[Open_Sans]">Choose how you'd like to begin planning your degree</p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="w-full font-[Open_Sans] h-12 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => setPath('guest')}
                >
                  Continue as Guest
                </Button>
                <div className="text-center text-muted-foreground font-[Open_Sans]">or</div>
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full font-[Open_Sans] h-12 transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
              <div className="bg-white rounded-lg shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="major-input">Enter your major *</Label>
                    <Input
                      id="major-input"
                      placeholder="e.g. Computer Engineering"
                      list="major-suggestions"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="transition-all duration-200 focus:scale-105"
                    />
                    <datalist id="major-suggestions">
                      {majorSuggestions.map((suggestion) => (
                        <option key={suggestion} value={suggestion} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minor-input">Minor (optional)</Label>
                    <Input
                      id="minor-input"
                      placeholder="e.g. Mathematics"
                      value={minor}
                      onChange={(e) => setMinor(e.target.value)}
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="certificate-input">Certificate (optional)</Label>
                    <Input
                      id="certificate-input"
                      placeholder="e.g. Data Science"
                      value={certificate}
                      onChange={(e) => setCertificate(e.target.value)}
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                  
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-lg font-[Open_Sans]">Academic Settings</h3>
                    
                    <div className="space-y-2">
                      <Label className="font-[Open_Sans]">
                        Max Hours per Semester: {maxHours[0]}
                      </Label>
                      <Slider
                        min={12}
                        max={20}
                        step={1}
                        value={maxHours}
                        onValueChange={setMaxHours}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>12</span>
                        <span>16</span>
                        <span>20</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-[Open_Sans]">Current Year *</Label>
                      <Select 
                        value={currentYear || undefined} 
                        onValueChange={(value) => {
                          setCurrentYear(value);
                          if (yearError) setYearError('');
                        }}
                      >
                        <SelectTrigger className={yearError ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Freshman">Freshman</SelectItem>
                          <SelectItem value="Sophomore">Sophomore</SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                      {yearError && (
                        <p className="text-sm text-red-500 font-[Open_Sans]">{yearError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-[Open_Sans]">Current Semester *</Label>
                      <Select 
                        value={currentSemester || undefined} 
                        onValueChange={(value) => {
                          setCurrentSemester(value);
                          if (semesterError) setSemesterError('');
                        }}
                      >
                        <SelectTrigger className={semesterError ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">1st Semester</SelectItem>
                          <SelectItem value="2nd">2nd Semester</SelectItem>
                        </SelectContent>
                      </Select>
                      {semesterError && (
                        <p className="text-sm text-red-500 font-[Open_Sans]">{semesterError}</p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full font-[Open_Sans] transition-all duration-200 hover:scale-105"
                  >
                    Continue
                  </Button>
                </form>
                <Button 
                  variant="ghost"
                  className="w-full font-[Open_Sans] transition-all duration-200 hover:scale-105"
                  onClick={() => setPath(null)}
                >
                  Back
                </Button>
              </div>
            )}

            {path === 'login' && (
              <div className="bg-white rounded-lg shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                {user ? (
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-lg text-gray-700 font-[Open_Sans]">
                        Welcome back, <strong className="text-blue-600">{user.email}</strong>!
                      </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="major-input-login" className="font-[Open_Sans]">
                          Your Major *
                        </Label>
                        <Input
                          id="major-input-login"
                          placeholder="e.g. Computer Engineering"
                          list="major-suggestions-login"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                          className="transition-all duration-200 focus:scale-105"
                        />
                        <datalist id="major-suggestions-login">
                          {majorSuggestions.map((suggestion) => (
                            <option key={suggestion} value={suggestion} />
                          ))}
                        </datalist>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minor-input-login" className="font-[Open_Sans]">
                            Minor (Optional)
                          </Label>
                          <Input
                            id="minor-input-login"
                            placeholder="e.g. Mathematics"
                            value={minor}
                            onChange={(e) => setMinor(e.target.value)}
                            className="transition-all duration-200 focus:scale-105"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="certificate-input-login" className="font-[Open_Sans]">
                            Certificate (Optional)
                          </Label>
                          <Input
                            id="certificate-input-login"
                            placeholder="e.g. Data Science"
                            value={certificate}
                            onChange={(e) => setCertificate(e.target.value)}
                            className="transition-all duration-200 focus:scale-105"
                          />
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 space-y-4">
                        <h3 className="font-semibold text-lg font-[Open_Sans]">Academic Settings</h3>
                        
                        <div className="space-y-2">
                          <Label className="font-[Open_Sans]">
                            Max Hours per Semester: {maxHours[0]}
                          </Label>
                          <Slider
                            min={12}
                            max={20}
                            step={1}
                            value={maxHours}
                            onValueChange={setMaxHours}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>12</span>
                            <span>16</span>
                            <span>20</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-[Open_Sans]">Current Year *</Label>
                          <Select 
                            value={currentYear || undefined} 
                            onValueChange={(value) => {
                              setCurrentYear(value);
                              if (yearError) setYearError('');
                            }}
                          >
                            <SelectTrigger className={yearError ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Freshman">Freshman</SelectItem>
                              <SelectItem value="Sophomore">Sophomore</SelectItem>
                              <SelectItem value="Junior">Junior</SelectItem>
                              <SelectItem value="Senior">Senior</SelectItem>
                            </SelectContent>
                          </Select>
                          {yearError && (
                            <p className="text-sm text-red-500 font-[Open_Sans]">{yearError}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="font-[Open_Sans]">Current Semester *</Label>
                          <Select 
                            value={currentSemester || undefined} 
                            onValueChange={(value) => {
                              setCurrentSemester(value);
                              if (semesterError) setSemesterError('');
                            }}
                          >
                            <SelectTrigger className={semesterError ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1st">1st Semester</SelectItem>
                              <SelectItem value="2nd">2nd Semester</SelectItem>
                            </SelectContent>
                          </Select>
                          {semesterError && (
                            <p className="text-sm text-red-500 font-[Open_Sans]">{semesterError}</p>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full font-[Open_Sans] transition-all duration-200 hover:scale-105"
                      >
                        Create My Degree Plan
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <h2 className="text-3xl font-[Passion_One] font-bold text-gray-800">
                        Sign In
                      </h2>
                      <p className="text-gray-600 font-[Open_Sans]">
                        Access your saved degree plans and academic progress
                      </p>
                    </div>
                    
                    <Login onLogin={(u) => setUser(u)} />
                    
                    <Button 
                      variant="ghost"
                      className="w-full font-[Open_Sans] transition-all duration-200 hover:scale-105"
                      onClick={() => setPath(null)}
                    >
                      Back to Options
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
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="w-full max-w-2xl space-y-8 relative z-10">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-12 border border-white/20 animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-8 py-8">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-600 absolute top-0 left-0"></div>
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-[Passion_One] font-bold text-slate-800">
                    Creating Your Degree Plan
                  </h3>
                  <p className="text-slate-600 font-[Open_Sans] text-lg max-w-md">
                    We're analyzing course requirements and building your personalized academic roadmap...
                  </p>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Welcome;