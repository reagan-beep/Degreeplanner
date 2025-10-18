import React, { useState, useEffect } from 'react';
import Login from './Login';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
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
  const [showButtons, setShowButtons] = useState(welcomeState === 'options' && !!lastMajor);
  const [maxHours, setMaxHours] = useState([15]);
  const [currentYear, setCurrentYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [path, setPath] = useState<'guest' | 'login' | null>(null);

  // Reset all state when returning to home
  useEffect(() => {
    if (welcomeState === 'initial') {
      setMajor('');
      setSubmitted(false);
      setLoading(false);
      setShowButtons(false);
      setPath(null);
      setShowFilters(false);
      setUser(null);
      setMaxHours([15]);
      setCurrentYear('');
    }
  }, [welcomeState]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!major.trim()) return;
    setSubmitted(true);
    setLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      setLoading(false);
      setShowButtons(true);
      setWelcomeState('options');
    }, 1400);
  }

  // Show logo in top left when not on initial screen
  const showLogoTopLeft = path !== null || submitted;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-[rgb(243,243,243)] relative"
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
          <h1 className="text-3xl tracking-tight text-[rgba(85,0,0,0.98)] font-[Passion_One] font-bold italic">
            How-De-gree
          </h1>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-8 relative z-10">
        {!showLogoTopLeft && (
          <div className="text-center space-y-4">
            <h1 className="text-6xl tracking-tight bg-clip-text text-[rgba(85,0,0,0.98)] bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-lg font-[Passion_One] font-bold italic text-[128px]">
              Welcome to How-De-gree!
            </h1>
            <p className="text-[rgb(11,11,12)] font-[Open_Sans]">Your personalized degree planner.</p>
          </div>
        )}

        {welcomeState === 'initial' && !submitted && !path && (
          <div className="flex flex-col gap-4 items-center">
            <Button 
              size="lg"
              className="w-full max-w-sm"
              onClick={() => setPath('guest')}
            >
              Continue as Guest
            </Button>
            <div className="text-muted-foreground">or</div>
            <Button 
              size="lg"
              variant="outline"
              className="w-full max-w-sm"
              onClick={() => setPath('login')}
            >
              Sign In
            </Button>
          </div>
        )}

        {welcomeState === 'initial' && !submitted && path === 'guest' && (
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
              <Button type="submit" className="w-full">Continue</Button>
            </form>
            <Button 
              variant="ghost"
              className="w-full"
              onClick={() => setPath(null)}
            >
              Back
            </Button>
          </div>
        )}

        {welcomeState === 'initial' && !submitted && path === 'login' && (
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
                  <Button type="submit" className="w-full">Continue</Button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <Login onLogin={(u) => setUser(u)} />
                <Button 
                  variant="ghost"
                  className="w-full"
                  onClick={() => setPath(null)}
                >
                  Back
                </Button>
              </div>
            )}
          </div>
        )}

        {submitted && welcomeState === 'options' && (
          <div className="bg-white rounded-[30px] shadow-xl space-y-6 px-[40px] py-[32px]">
            {loading && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Formulating Degree Plan...</p>
              </div>
            )}

            {showButtons && (
              <div className="space-y-4">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full font-[Open_Sans]">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters 
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Settings & Options</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      <div className="space-y-4">
                        <Label>
                          Max Hours per Semester: {maxHours[0]}
                        </Label>
                        <Slider
                          min={12}
                          max={20}
                          step={1}
                          value={maxHours}
                          onValueChange={setMaxHours}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>12</span>
                          <span>16</span>
                          <span>20</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Current Year</Label>
                        <Select value={currentYear} onValueChange={setCurrentYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Freshman">Freshman</SelectItem>
                            <SelectItem value="Sophomore">Sophomore</SelectItem>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border-t pt-4">
                        <Button
                          onClick={() => {
                            onGoToPrevious && onGoToPrevious({ major });
                            setShowFilters(false);
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Previous Courses
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="grid gap-3">
                  <Button 
                    onClick={() => onGoToSemester && onGoToSemester({ major, maxHours: maxHours[0].toString(), currentYear })} 
                    size="lg" className="font-[Open_Sans]"
                  >
                    Degree Planner
                  </Button>
                  <Button 
                    onClick={() => onGoToCourse && onGoToCourse({ major })} 
                    variant="outline"
                    size="lg" className="font-[Open_Sans]"
                  >
                    Courses
                  </Button>
                  <Button
                    onClick={() => onGoToTemplate && onGoToTemplate({ major })}
                    variant="outline"
                    size="lg"
                  >
                    Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Welcome;
