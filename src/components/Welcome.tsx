import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { ArrowRight, GraduationCap } from 'lucide-react';

interface User {
  id: string;
  name: string;
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
  welcomeState: 'initial' | 'login' | 'guest';
  lastMajor?: string;
}

function Welcome({ 
  onGoToSemester, 
  welcomeState, 
  lastMajor 
}: WelcomeProps) {
  const [major, setMajor] = useState(lastMajor || '');
  const [minor, setMinor] = useState('');
  const [certificate, setCertificate] = useState('');
  const [maxHours, setMaxHours] = useState<number[]>([16]);
  const [currentYear, setCurrentYear] = useState<string>('Freshman');
  const [currentSemester, setCurrentSemester] = useState<string>('1st');
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
      setCurrentSemester('1st');
      setYearError('');
      setSemesterError('');
      setSubmitted(false);
      setLoading(false);
      setUser(null);
      setPath(null);
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

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email
      };
      setUser(mockUser);
      setPath('login');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setPath('guest');
  };

  if (submitted && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-[Passion_One] text-gray-800">
              Welcome to How-De-gree!
            </CardTitle>
            <p className="text-muted-foreground font-[Open_Sans]">
              Let's get started with your degree planning journey.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-[Open_Sans] text-gray-700">
                Major: <span className="font-semibold text-blue-600">{major}</span>
              </p>
              {minor && (
                <p className="text-lg font-[Open_Sans] text-gray-700">
                  Minor: <span className="font-semibold text-purple-600">{minor}</span>
                </p>
              )}
              {certificate && (
                <p className="text-lg font-[Open_Sans] text-gray-700">
                  Certificate: <span className="font-semibold text-green-600">{certificate}</span>
                </p>
              )}
              <p className="text-lg font-[Open_Sans] text-gray-700">
                Max Hours: <span className="font-semibold text-orange-600">{maxHours[0]}</span>
              </p>
              <p className="text-lg font-[Open_Sans] text-gray-700">
                Current Year: <span className="font-semibold text-indigo-600">{currentYear}</span>
              </p>
              <p className="text-lg font-[Open_Sans] text-gray-700">
                Current Semester: <span className="font-semibold text-pink-600">{currentSemester}</span>
              </p>
            </div>
            <Button 
              onClick={() => onGoToSemester && onGoToSemester({ 
                major, 
                minor: minor.trim() || undefined, 
                certificate: certificate.trim() || undefined,
                maxHours: maxHours[0],
                currentYear,
                currentSemester
              })}
              className="w-full font-[Open_Sans]"
            >
              Continue to Degree Planner
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-[Open_Sans] text-gray-600">
              {path === 'login' ? 'Logging you in...' : 'Setting up your degree planner...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl tracking-tight text-[rgba(85,0,0,0.98)] font-[Passion_One] font-bold italic mb-4">
              How-De-gree
            </h1>
            <p className="text-xl text-gray-600 font-[Open_Sans] max-w-2xl mx-auto">
              Your intelligent degree planning companion for Texas A&M University. 
              Plan your academic journey with confidence and clarity.
            </p>
          </div>

          {/* Main content */}
          <div className="flex justify-center">
            {/* Form */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl font-[Passion_One] text-center text-gray-800">
                  Get Started
                </CardTitle>
                <p className="text-center text-muted-foreground font-[Open_Sans]">
                  Enter your academic information to begin planning
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="major-input">Enter your major *</Label>
                    <Input
                      id="major-input"
                      placeholder="e.g. Computer Engineering"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="transition-all duration-200 focus:scale-105"
                    />
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
                    className="w-full font-[Open_Sans] mt-6"
                    disabled={!major.trim()}
                  >
                    Start Planning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;