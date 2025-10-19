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
import cpenData from '../data/ce_courses.json';
import CourseAnalyzer from '../services/CourseAnalyzer';

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

// Convert CPEN data to semester format
const convertCpenDataToSemesters = (): Semester[] => {
  const cpenCourses = cpenData["Computer Engineering"];
  const semesters: { [key: string]: Course[] } = {};

  cpenCourses.forEach((course, index) => {
    const semesterKey = course.semester;
    if (!semesters[semesterKey]) {
      semesters[semesterKey] = [];
    }

    // Handle courses with alternatives
    if (course.alternatives && course.alternatives.length > 0) {
      // Add the first alternative as the main course
      const mainCourse = course.alternatives[0];
      semesters[semesterKey].push({
        id: `course-${index}`,
        code: mainCourse.course,
        name: mainCourse.name,
        hours: mainCourse.credits
      });
    } else {
      // Handle UCC courses with special naming
      let courseCode = course.course;
      let courseName = course.name;
      
      if (course.course.includes("University Core Curriculum")) {
        courseCode = "UCC Elective";
        courseName = "University Core Curriculum";
      } else if (course.course.includes("Senior design")) {
        courseCode = "Senior Design";
        courseName = "Senior Design Project";
      }

      semesters[semesterKey].push({
        id: `course-${index}`,
        code: courseCode,
        name: Array.isArray(courseName) ? courseName[0] : (courseName || courseCode),
        hours: course.credits
      });
    }
  });

  // Convert to array format with proper semester names
  const semesterArray: Semester[] = [];
  
  // Define semester order and mapping
  const semesterMapping = {
    "First Year Fall": "Fall Year 1",
    "First Year Spring": "Spring Year 1", 
    "Second Year Fall": "Fall Year 2",
    "Second Year Spring": "Spring Year 2",
    "Third Year Fall": "Fall Year 3",
    "Third Year Spring": "Spring Year 3",
    "Fourth Year Fall": "Fall Year 4",
    "Fourth Year Spring": "Spring Year 4"
  };

  Object.entries(semesterMapping).forEach(([cpenSemester, displaySemester]) => {
    if (semesters[cpenSemester]) {
      semesterArray.push({
        id: cpenSemester.toLowerCase().replace(/\s+/g, '-'),
        name: displaySemester,
        courses: semesters[cpenSemester]
      });
    }
  });

  return semesterArray;
};

const initialSemesters: Semester[] = convertCpenDataToSemesters();

function DegreePlanner({ major, onBack }: DegreePlannerProps) {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [maxHours, setMaxHours] = useState([16]);
  const [currentYear, setCurrentYear] = useState("Freshman");
  const [completedCourses, setCompletedCourses] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedCourses');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSemester, setCurrentSemester] = useState<string>("Fall Year 1");
  
  // Load checked courses from localStorage on component mount
  const [checkedCourses, setCheckedCourses] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('checkedCourses');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [testResults, setTestResults] = useState<string>("");

  const getTotalHours = (courses: Course[]) => {
    return courses.reduce((sum, course) => sum + course.hours, 0);
  };

  const getTotalCredits = () => {
    return semesters.reduce((sum, semester) => sum + getTotalHours(semester.courses), 0);
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    console.log('Remove course clicked:', courseId, 'from semester:', semesterId);
    setSemesters(semesters.map(semester =>
      semester.id === semesterId
        ? { ...semester, courses: semester.courses.filter(course => course.id !== courseId) }
        : semester
    ));
  };

  const handleCourseCompleted = (course: string) => {
    const newCompletedCourses = [...completedCourses, course];
    setCompletedCourses(newCompletedCourses);
    const newCheckedCourses = new Set([...checkedCourses, course]);
    setCheckedCourses(newCheckedCourses);
    localStorage.setItem('completedCourses', JSON.stringify(newCompletedCourses));
    localStorage.setItem('checkedCourses', JSON.stringify([...newCheckedCourses]));
  };

  const handleCourseUnchecked = (course: string) => {
    const newCompletedCourses = completedCourses.filter(c => c !== course);
    setCompletedCourses(newCompletedCourses);
    const newCheckedCourses = new Set(checkedCourses);
    newCheckedCourses.delete(course);
    setCheckedCourses(newCheckedCourses);
    localStorage.setItem('completedCourses', JSON.stringify(newCompletedCourses));
    localStorage.setItem('checkedCourses', JSON.stringify([...newCheckedCourses]));
  };

  const getSemesterLabel = (semesterName: string) => {
    if (semesterName === currentSemester) {
      return `${semesterName} (Current Semester)`;
    }
    return semesterName;
  };

  // Fill semesters with courses based on completed courses
  const fillSemesters = () => {
    try {
      // Convert completed courses to the format expected by CourseAnalyzer
      const completedCoursesForAnalyzer = completedCourses.map(course => ({
        code: course,
        credits: 3 // Default credits, could be improved
      }));
      
      // Get semester filling results
      const semesterResults = CourseAnalyzer.fillSemestersWithCourses(
        completedCoursesForAnalyzer, 
        maxHours[0]
      );
      
      // Convert results to our semester format
      const newSemesters: Semester[] = semesterResults.map(result => ({
        id: result.semester.toLowerCase().replace(/\s+/g, '-'),
        name: result.semester.replace('First', 'Year 1').replace('Second', 'Year 2').replace('Third', 'Year 3').replace('Fourth', 'Year 4'),
        courses: result.courses.map(course => ({
          id: `course-${Date.now()}-${Math.random()}`,
          code: course.course,
          name: course.name,
          hours: course.credits
        }))
      }));
      
      // Update semesters
      setSemesters(newSemesters);
      
      // Show success message
      setTestResults(`✅ Filled ${newSemesters.length} semesters with courses! Check the Degree Planner tab to see the results.`);
      
    } catch (error) {
      setTestResults(`Error filling semesters: ${error}`);
    }
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
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => onBack(true)} className="font-[Open_Sans]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl tracking-tight text-[#800000] font-[Passion_One] font-bold italic">
              Academic Dashboard
            </h1>
            <p className="text-muted-foreground font-[Open_Sans]">{major}</p>
          </div>
          <div className="w-24"></div>
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

           {/* Semester Selection Dropdown */}
           <div className="mt-4 flex justify-center">
             <div className="bg-white rounded-lg shadow-sm border p-4">
               <Label className="font-[Open_Sans] text-sm font-medium mb-2 block">
                 Select Current Semester:
               </Label>
               <Select value={currentSemester} onValueChange={setCurrentSemester}>
                 <SelectTrigger className="w-64">
                   <SelectValue placeholder="Select semester" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Fall Year 1">Fall Year 1</SelectItem>
                   <SelectItem value="Spring Year 1">Spring Year 1</SelectItem>
                   <SelectItem value="Fall Year 2">Fall Year 2</SelectItem>
                   <SelectItem value="Spring Year 2">Spring Year 2</SelectItem>
                   <SelectItem value="Fall Year 3">Fall Year 3</SelectItem>
                   <SelectItem value="Spring Year 3">Spring Year 3</SelectItem>
                   <SelectItem value="Fall Year 4">Fall Year 4</SelectItem>
                   <SelectItem value="Spring Year 4">Spring Year 4</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>

          {/* Semester Filling Button */}
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={fillSemesters}
              className="font-[Open_Sans] bg-blue-600 hover:bg-blue-700"
            >
              🎯 Fill Semesters with Courses
            </Button>
          </div>

           {/* Test Results Display */}
           {testResults && (
             <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
               <h3 className="font-semibold text-blue-800 mb-2">Test Results:</h3>
               <div className="bg-white p-3 rounded border text-sm font-mono whitespace-pre-line text-gray-700">
                 {testResults}
               </div>
             </div>
           )}

          <TabsContent value="planner" className="space-y-6 mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-[Passion_One] text-gray-800">Progress Overview</h2>
                <Badge variant="secondary">
                  {getTotalCredits()} / 120 Credits
                </Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${(getTotalCredits() / 120) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {semesters.map((semester) => (
                <Card key={semester.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-[Passion_One]">
                        {getSemesterLabel(semester.name)}
                      </CardTitle>
                      <Badge>{getTotalHours(semester.courses)} hours</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {semester.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
                      >
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
                      onClick={() => {
                        console.log('Add course button clicked for semester:', semester.id);
                        const code = prompt('Enter course code (e.g., CSCE 121):');
                        if (code && code.trim()) {
                          const course: Course = {
                            id: `course-${Date.now()}`,
                            code: code.trim(),
                            name: '', // Empty name since we're only asking for code
                            hours: 3 // Default to 3 credit hours
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
                      Add Course
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
            <Template 
              major={major} 
              onBack={() => {}} 
              onCourseCompleted={handleCourseCompleted}
              onCourseUnchecked={handleCourseUnchecked}
              checkedCourses={checkedCourses}
            />
          </TabsContent>

          <TabsContent value="previous" className="mt-6">
            <PreviousCourses major={major} onBack={() => {}} completedCourses={completedCourses} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-[Passion_One] text-gray-800 mb-4">Academic Settings</h2>
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
