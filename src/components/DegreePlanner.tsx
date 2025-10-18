import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, GripVertical, Plus, X, Calendar, BookOpen, FileText, History, SlidersHorizontal } from 'lucide-react';
import CourseList from './CourseList';
import Template from './Template';
import PreviousCourses from './PreviousCourses';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';

interface Course {
  code: string;
  name: string;
  hours: number;
  id: string;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

interface DegreePlannerProps {
  major: string;
  onBack: (toHome?: boolean) => void;
}

// Mock data for demonstration
const initialSemesters: Semester[] = [
  {
    id: 'fall-1',
    name: 'Fall Year 1',
    courses: [
      { id: '1', code: 'CSCE 121', name: 'Programming Design', hours: 3 },
      { id: '2', code: 'MATH 151', name: 'Calculus I', hours: 4 },
      { id: '3', code: 'ENGL 104', name: 'Composition & Rhetoric', hours: 3 },
      { id: '4', code: 'CHEM 107', name: 'General Chemistry', hours: 4 },
    ],
  },
  {
    id: 'spring-1',
    name: 'Spring Year 1',
    courses: [
      { id: '5', code: 'CSCE 221', name: 'Data Structures', hours: 3 },
      { id: '6', code: 'MATH 152', name: 'Calculus II', hours: 4 },
      { id: '7', code: 'PHYS 206', name: 'Newtonian Mechanics', hours: 3 },
      { id: '8', code: 'HIST 105', name: 'History of US', hours: 3 },
    ],
  },
  {
    id: 'fall-2',
    name: 'Fall Year 2',
    courses: [
      { id: '9', code: 'CSCE 314', name: 'Programming Languages', hours: 3 },
      { id: '10', code: 'CSCE 312', name: 'Computer Organization', hours: 4 },
      { id: '11', code: 'MATH 304', name: 'Linear Algebra', hours: 3 },
    ],
  },
  {
    id: 'spring-2',
    name: 'Spring Year 2',
    courses: [
      { id: '12', code: 'CSCE 310', name: 'Database Systems', hours: 3 },
      { id: '13', code: 'CSCE 315', name: 'Software Engineering', hours: 3 },
    ],
  },
  {
    id: 'fall-3',
    name: 'Fall Year 3',
    courses: [
      { id: '14', code: 'CSCE 411', name: 'Design & Analysis of Algorithms', hours: 3 },
      { id: '15', code: 'CSCE 431', name: 'Software Engineering', hours: 3 },
      { id: '16', code: 'STAT 211', name: 'Principles of Statistics', hours: 3 },
      { id: '17', code: 'COMM 203', name: 'Public Speaking', hours: 3 },
    ],
  },
  {
    id: 'spring-3',
    name: 'Spring Year 3',
    courses: [
      { id: '18', code: 'CSCE 410', name: 'Operating Systems', hours: 3 },
      { id: '19', code: 'CSCE 420', name: 'Artificial Intelligence', hours: 3 },
      { id: '20', code: 'CSCE 482', name: 'Senior Capstone Design', hours: 3 },
      { id: '21', code: 'PHIL 240', name: 'Intro to Ethics', hours: 3 },
    ],
  },
  {
    id: 'fall-4',
    name: 'Fall Year 4',
    courses: [
      { id: '22', code: 'CSCE 435', name: 'Parallel Computing', hours: 3 },
      { id: '23', code: 'CSCE 470', name: 'Information Storage & Retrieval', hours: 3 },
      { id: '24', code: 'CSCE 489', name: 'Special Topics', hours: 3 },
      { id: '25', code: 'POLS 206', name: 'American National Government', hours: 3 },
    ],
  },
  {
    id: 'spring-4',
    name: 'Spring Year 4',
    courses: [
      { id: '26', code: 'CSCE 483', name: 'Computer Systems Design', hours: 3 },
      { id: '27', code: 'CSCE 491', name: 'Research', hours: 3 },
      { id: '28', code: 'ARTS 125', name: 'Visual Arts Appreciation', hours: 3 },
      { id: '29', code: 'PSYC 107', name: 'General Psychology', hours: 3 },
    ],
  },
];

function DegreePlanner({ major, onBack }: DegreePlannerProps) {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [maxHours, setMaxHours] = useState([16]);
  const [currentYear, setCurrentYear] = useState("Freshman");
  const [manuallyCompletedCourses, setManuallyCompletedCourses] = useState<Set<string>>(new Set());

  // Determine which semesters are completed based on current year
  const getCompletedSemesterIds = () => {
    switch (currentYear) {
      case "Freshman":
        return []; // No completed semesters
      case "Sophomore":
        return ['fall-1', 'spring-1']; // Year 1 completed
      case "Junior":
        return ['fall-1', 'spring-1', 'fall-2', 'spring-2']; // Years 1-2 completed
      case "Senior":
        return ['fall-1', 'spring-1', 'fall-2', 'spring-2', 'fall-3', 'spring-3']; // Years 1-3 completed
      case "Graduate":
        return ['fall-1', 'spring-1', 'fall-2', 'spring-2', 'fall-3', 'spring-3', 'fall-4', 'spring-4']; // All years completed
      default:
        return [];
    }
  };

  const completedSemesterIds = getCompletedSemesterIds();

  // Separate completed and incomplete courses considering both semester completion and manual completion
  const getAllCompletedCourses = () => {
    const completedSemesters: Semester[] = [];
    
    semesters.forEach(semester => {
      const isCompletedSemester = completedSemesterIds.includes(semester.id);
      const completedCoursesInSemester = semester.courses.filter(course => 
        isCompletedSemester || manuallyCompletedCourses.has(course.id)
      );
      
      if (completedCoursesInSemester.length > 0) {
        completedSemesters.push({
          ...semester,
          courses: completedCoursesInSemester
        });
      }
    });
    
    return completedSemesters;
  };

  const getAllIncompleteCourses = () => {
    const incompleteCourses: { course: Course; semesterName: string; semesterId: string }[] = [];
    
    semesters.forEach(semester => {
      const isCompletedSemester = completedSemesterIds.includes(semester.id);
      
      if (!isCompletedSemester) {
        semester.courses.forEach(course => {
          if (!manuallyCompletedCourses.has(course.id)) {
            incompleteCourses.push({ course, semesterName: semester.name, semesterId: semester.id });
          }
        });
      }
    });
    
    return incompleteCourses;
  };

  const completedCourses = getAllCompletedCourses();
  const incompleteCourses = getAllIncompleteCourses();

  const getTotalHours = (courses: Course[]) => {
    return courses.reduce((sum, course) => sum + course.hours, 0);
  };

  const getTotalCredits = () => {
    return semesters.reduce((sum, semester) => sum + getTotalHours(semester.courses), 0);
  };

  const getCompletedCredits = () => {
    const previousCoursesCredits = completedCourses.reduce((sum, semester) => sum + getTotalHours(semester.courses), 0);
    
    // Add credits from manually completed courses that are still in the planner
    const manuallyCompletedCredits = semesters.reduce((sum, semester) => {
      return sum + semester.courses
        .filter(course => manuallyCompletedCourses.has(course.id))
        .reduce((courseSum, course) => courseSum + course.hours, 0);
    }, 0);
    
    return previousCoursesCredits + manuallyCompletedCredits;
  };

  const toggleCourseCompletion = (courseId: string) => {
    const newCompletedCourses = new Set(manuallyCompletedCourses);
    if (newCompletedCourses.has(courseId)) {
      newCompletedCourses.delete(courseId);
    } else {
      newCompletedCourses.add(courseId);
    }
    setManuallyCompletedCourses(newCompletedCourses);
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    console.log('Remove course clicked:', courseId, 'from semester:', semesterId);
    setSemesters(semesters.map(semester =>
      semester.id === semesterId
        ? { ...semester, courses: semester.courses.filter(course => course.id !== courseId) }
        : semester
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 relative">
      {/* Logo in top left corner */}
      <div className="absolute top-6 left-6 z-10">
        <button 
          onClick={() => onBack(true)}
          className="text-3xl tracking-tight text-[rgba(85,0,0,0.98)] font-[Passion_One] font-bold italic hover:opacity-80 transition-opacity"
        >
          How-De-gree
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight text-[#800000] font-[Passion_One] font-bold italic">
            Academic Dashboard
          </h1>
          <p className="text-muted-foreground font-[Open_Sans]">{major}</p>
        </div>

        <Tabs defaultValue="planner" className="w-full">
          <TabsList className="flex w-full h-12 bg-white/90 backdrop-blur-sm shadow-sm border rounded-lg">
            <TabsTrigger value="planner" className="flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4">
              <Calendar className="h-4 w-4" />
              Degree Planner
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4">
              <BookOpen className="h-4 w-4" />
              Course Catalog
            </TabsTrigger>
            <TabsTrigger value="template" className="flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4">
              <FileText className="h-4 w-4" />
              Degree Template
            </TabsTrigger>
            <TabsTrigger value="previous" className="flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4">
              <History className="h-4 w-4" />
              Previous Courses
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4">
              <SlidersHorizontal className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="space-y-6 mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-[Passion_One] text-[#800000]">Progress Overview</h2>
                <Badge variant="secondary">
                  {getCompletedCredits()} / 120 Credits
                </Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${(getCompletedCredits() / 120) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {semesters.map((semester) => (
                <Card key={semester.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-[Passion_One] text-[#800000]">{semester.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            getTotalHours(semester.courses) >= maxHours[0] 
                              ? "destructive" 
                              : getTotalHours(semester.courses) >= maxHours[0] - 2 
                                ? "secondary" 
                                : "outline"
                          }
                        >
                          {getTotalHours(semester.courses)} / {maxHours[0]} hours
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {semester.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
                      >
                        <Checkbox
                          checked={manuallyCompletedCourses.has(course.id)}
                          onCheckedChange={() => toggleCourseCompletion(course.id)}
                        />
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium font-[Open_Sans]">{course.code}</span>
                            {course.name && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-sm font-[Open_Sans]">{course.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{course.hours}h</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCourse(semester.id, course.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity font-[Open_Sans]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 font-[Open_Sans]"
                      disabled={getTotalHours(semester.courses) >= maxHours[0]}
                      onClick={() => {
                        console.log('Add course button clicked for semester:', semester.id);
                        const currentSemesterHours = getTotalHours(semester.courses);
                        
                        if (currentSemesterHours >= maxHours[0]) {
                          alert(`Cannot add course: This semester already has ${currentSemesterHours} hours, which meets or exceeds the maximum of ${maxHours[0]} hours per semester.`);
                          return;
                        }
                        
                        const code = prompt('Enter course code (e.g., CSCE 121):');
                        if (code && code.trim()) {
                          const hoursInput = prompt('Enter credit hours (default is 3):', '3');
                          const hours = parseInt(hoursInput || '3');
                          
                          if (currentSemesterHours + hours > maxHours[0]) {
                            alert(`Cannot add course: Adding ${hours} hours would exceed the maximum of ${maxHours[0]} hours per semester. Current: ${currentSemesterHours} hours.`);
                            return;
                          }
                          
                          const course: Course = {
                            id: `course-${Date.now()}`,
                            code: code.trim(),
                            name: '', // Empty name since we're only asking for code
                            hours: hours
                          };
                          setSemesters(semesters.map(sem => 
                            sem.id === semester.id 
                              ? { ...sem, courses: [...sem.courses, course] }
                              : sem
                          ));
                          console.log('Course added:', course);
                        }
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {getTotalHours(semester.courses) >= maxHours[0] 
                        ? `Semester Full (${maxHours[0]} hrs)` 
                        : 'Add Course'
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                className="font-[Open_Sans]"
                onClick={() => {
                  console.log('Add semester button clicked');
                  const name = prompt('Enter semester name (e.g., Fall Year 3):');
                  if (name && name.trim()) {
                    const newSemester: Semester = {
                      id: `semester-${Date.now()}`,
                      name: name.trim(),
                      courses: []
                    };
                    setSemesters([...semesters, newSemester]);
                    console.log('Semester added:', newSemester);
                  }
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Semester
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <CourseList major={major} onBack={() => {}} />
          </TabsContent>

          <TabsContent value="template" className="mt-6">
            <Template major={major} onBack={() => {}} />
          </TabsContent>

          <TabsContent value="previous" className="mt-6">
            <PreviousCourses 
              major={major} 
              onBack={() => {}} 
              completedCourses={getAllCompletedCourses()}
              manuallyCompletedCourses={manuallyCompletedCourses}
              onToggleCourseCompletion={toggleCourseCompletion}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-[Passion_One] text-[#800000] mb-4">Academic Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
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
                        <SelectItem value="Graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground font-[Open_Sans]">
                      These settings will help customize your degree planning experience and course recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DegreePlanner;
