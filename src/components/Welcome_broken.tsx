import React, { useState, useEffect } from 'react';
import Login from './Login';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  ChevronDown, 
  ArrowRight, 
  Sparkles,
  Target,
  TrendingUp,
  Star,
  Zap,
  Trophy,
  Rocket
} from 'lucide-react';
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
  const [currentYear, setCurrentYear] = useState<string>('Freshman');
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
    if (!major.trim()) return;
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
        currentYear
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

      {/* Enhanced Colorful Hero Section with Animations */}
      {welcomeState === 'initial' && !submitted && !path && (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating Orbs with Animation */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-60 animate-float"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl opacity-50 animate-float-delayed"></div>
            <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-3xl opacity-40 animate-float-slow"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-2xl opacity-50 animate-float"></div>
            
            {/* Geometric Shapes */}
            <div className="absolute top-1/4 left-10 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rotate-45 rounded-lg opacity-30 animate-spin-slow"></div>
            <div className="absolute bottom-1/3 right-16 w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-40 animate-pulse"></div>
            
            {/* Particle Effects */}
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-twinkle"></div>
            <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-twinkle-delayed"></div>
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-twinkle"></div>
          </div>

          {/* Main Hero Content */}
          <div 
            className="min-h-screen flex items-center justify-center p-8 relative z-10"
            style={{
              transform: scrollY > 0 ? `translateY(${scrollY * 0.1}px)` : 'none',
              opacity: scrollY > 600 ? 0.3 : 1
            }}
          >
            <div className="text-center space-y-12 max-w-6xl">
              {/* Animated Badge */}
              <div className="flex justify-center animate-fade-in">
                <Badge className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  TEXAS A&M UNIVERSITY
                  <Sparkles className="w-5 h-5 ml-2" />
                </Badge>
              </div>

              {/* Main Title with Gradient and Animation */}
              <div className="space-y-8 animate-slide-up">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-[Passion_One] font-bold leading-none tracking-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                    How-De-gree
                  </span>
                </h1>
                
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    Plan Your Aggie Journey
                  </h2>
                  
                  <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Intelligent degree planning for Texas A&M students
                  </p>
                </div>
              </div>

              {/* Animated Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in-up">
                <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-200 hover:border-purple-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-900">Smart Planning</h3>
                    <p className="text-slate-600 leading-relaxed">AI-powered course sequencing</p>
                  </div>
                </div>

                <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-blue-200 hover:border-blue-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">Track Progress</h3>
                    <p className="text-slate-600 leading-relaxed">Real-time credit calculations</p>
                  </div>
                </div>

                <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-green-200 hover:border-green-400 transition-all duration-500 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Graduate Faster</h3>
                    <p className="text-slate-600 leading-relaxed">Optimized degree paths</p>
                  </div>
                </div>
              </div>

              {/* Enhanced CTA Button */}
              <div className="space-y-8 animate-fade-in-up">
                <Button 
                  size="lg"
                  onClick={() => {
                    const actionSection = document.getElementById('action-section');
                    if (actionSection) {
                      actionSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group h-16 px-12 text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-full transition-all duration-500 hover:scale-110 hover:shadow-2xl shadow-lg border-4 border-white/20 backdrop-blur-sm"
                >
                  <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  Start Your Journey
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
                
                <div className="flex justify-center items-center space-x-4 text-slate-600">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">🎓 Free for all Aggies</span>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
              </div>

              {/* Animated Scroll Indicator */}
              <div className="flex flex-col items-center space-y-4 mt-16 animate-fade-in">
                <p className="text-slate-500 font-medium">Discover your path below</p>
                <button 
                  onClick={() => {
                    const actionSection = document.getElementById('action-section');
                    if (actionSection) {
                      actionSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group flex flex-col items-center space-y-2 hover:scale-110 transition-all duration-300 cursor-pointer"
                >
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    <ChevronDown className="w-6 h-6 text-white animate-bounce group-hover:animate-none" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Colorful Action Section */}
          <div 
            id="action-section"
            className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 relative overflow-hidden"
            style={{
              opacity: scrollY > 300 ? 1 : Math.max(scrollY / 300, 0.3)
            }}
          >
            {/* Background Animation Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-20 w-20 h-20 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-xl opacity-30 animate-float"></div>
              <div className="absolute bottom-1/4 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-40 animate-float-delayed"></div>
            </div>

            <div className="w-full max-w-3xl space-y-16 relative z-10">
              {/* Section Header */}
              <div className="text-center space-y-8 animate-fade-in">
                <div className="flex justify-center">
                  <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl animate-pulse-glow">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-[Passion_One] font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Choose Your Path
                  </h2>
                  <p className="text-xl text-slate-600 leading-relaxed max-w-lg mx-auto">
                    Start your Texas A&M academic journey today
                  </p>
                </div>
              </div>
              
              {/* Enhanced Option Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                {/* Guest Option - Colorful Interactive Card */}
                <button 
                  className="group relative overflow-hidden p-10 bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-3xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl text-left transform hover:-translate-y-2"
                  onClick={() => setPath('guest')}
                >
                  {/* Card Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-blue-400/0 group-hover:from-purple-400/10 group-hover:via-purple-400/20 group-hover:to-blue-400/10 transition-all duration-500"></div>
                  
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
                        <Rocket className="w-4 h-4 mr-2" />
                        Quick Start
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Continue as Guest
                      </h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Jump right in and start planning your Aggie degree path with instant access
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-purple-600 group-hover:text-purple-700 transition-colors duration-300">
                      <span className="font-semibold text-lg">Get Started Now</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                      <Sparkles className="w-5 h-5 group-hover:animate-spin transition-all duration-300" />
                    </div>
                  </div>
                </button>
                
                {/* Sign In Option - Colorful Interactive Card */}
                <button 
                  className="group relative overflow-hidden p-10 bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl text-left transform hover:-translate-y-2"
                  onClick={() => setPath('login')}
                >
                  {/* Card Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-indigo-400/0 group-hover:from-blue-400/10 group-hover:via-blue-400/20 group-hover:to-indigo-400/10 transition-all duration-500"></div>
                  
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
                        <Star className="w-4 h-4 mr-2" />
                        Save Progress
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Sign In
                      </h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Access saved plans and track your academic journey with personalized features
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                      <span className="font-semibold text-lg">Access Account</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                      <Trophy className="w-5 h-5 group-hover:animate-bounce transition-all duration-300" />
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Enhanced Footer */}
              <div className="text-center space-y-6 animate-fade-in-up">
                <div className="flex justify-center">
                  <Badge className="bg-gradient-to-r from-red-600 to-red-800 text-white font-bold px-6 py-3 rounded-full text-lg shadow-lg">
                    🏛️ Built for Aggies, by Aggies
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-purple-600">150+</div>
                    <div className="text-sm text-slate-600 font-medium">Majors Supported</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">70K+</div>
                    <div className="text-sm text-slate-600 font-medium">Students Helped</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-indigo-600">4 Year</div>
                    <div className="text-sm text-slate-600 font-medium">Success Rate</div>
                  </div>
                </div>
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
                    <Label htmlFor="major-input">Enter your major</Label>
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
          {/* TAMU-themed action section */}
          <div 
            id="action-section"
            className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-white to-red-50"
            style={{
              opacity: scrollY > 300 ? 1 : Math.max(scrollY / 300, 0.3)
            }}
          >
            <div className="w-full max-w-2xl space-y-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-red-800 rounded-full">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-[Passion_One] text-red-900 font-bold">
                  How Do You Want to Start?
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed max-w-md mx-auto">
                  Choose your path to academic success at Texas A&M
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Option - Enhanced TAMU card */}
                <button 
                  className="group cursor-pointer p-8 bg-white rounded-3xl border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-2xl hover:scale-105 text-left"
                  onClick={() => setPath('guest')}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-red-100 group-hover:bg-red-200 rounded-xl transition-colors duration-300">
                        <Clock className="w-6 h-6 text-red-800" />
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Quick Start</Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-red-900">Continue as Guest</h3>
                      <p className="text-slate-600">Jump right in and start planning your Aggie degree path</p>
                    </div>
                    <div className="flex items-center text-red-700 group-hover:text-red-800 transition-colors duration-300">
                      <span className="font-medium">Get Started</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
                
                {/* Sign In Option - Enhanced TAMU card */}
                <button 
                  className="group cursor-pointer p-8 bg-white rounded-3xl border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-2xl hover:scale-105 text-left"
                  onClick={() => setPath('login')}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-red-100 group-hover:bg-red-200 rounded-xl transition-colors duration-300">
                        <BookOpen className="w-6 h-6 text-red-800" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Save Progress</Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-red-900">Sign In</h3>
                      <p className="text-slate-600">Access saved plans and track your academic journey</p>
                    </div>
                    <div className="flex items-center text-red-700 group-hover:text-red-800 transition-colors duration-300">
                      <span className="font-medium">Sign In</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-red-700 font-semibold">
                  🏛️ Built for Aggies, by Aggies
                </p>
                <div className="flex justify-center space-x-8 text-sm text-slate-500">
                  <span>✓ All TAMU Majors</span>
                  <span>✓ Prerequisites Mapped</span>
                  <span>✓ Course Tracking</span>
                </div>
              </div>
            </div>
          </div>        <SelectTrigger>
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
                          <Label className="font-[Open_Sans]">Current Year</Label>
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