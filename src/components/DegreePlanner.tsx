import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, GripVertical, Plus, X, Calendar, BookOpen, History, GraduationCap } from 'lucide-react';
import CourseList from './CourseList';
import PreviousCourses from './PreviousCourses';
import DegreeEvaluation from './DegreeEvaluation';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import cpenData from '../data/ce_courses.json';
import coreCurriculumData from '../data/core_curriculum.json';

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

// Function to get UCC categories with progress
const getUccCategories = (completedCourses: string[]) => {
  const categories: { name: string; code: string; required: number; completed: number; courses: any[] }[] = [];
  
  Object.entries(coreCurriculumData["University Core Curriculum"]).forEach(([categoryName, categoryData]: [string, any]) => {
    if (categoryData.courses) {
      const completedInCategory = categoryData.courses.filter((course: any) => 
        completedCourses.includes(course.code)
      ).length;
      
      categories.push({
        name: categoryName,
        code: categoryName.toLowerCase().replace(/\s+/g, '-'),
        required: categoryData.credit_hours_required,
        completed: completedInCategory,
        courses: categoryData.courses
      });
    }
  });
  
  return categories;
};

// Function to get remaining courses in a specific category
const getRemainingCoursesInCategory = (categoryName: string, completedCourses: string[]) => {
  const category = Object.entries(coreCurriculumData["University Core Curriculum"])
    .find(([name]) => name === categoryName)?.[1];
  
  if (!category || !category.courses) return [];
  
  return category.courses
    .filter((course: any) => !completedCourses.includes(course.code))
    .map((course: any) => ({
      code: course.code,
      name: course.title,
      hours: course.hours
    }));
};

function DegreePlanner({ major, onBack }: DegreePlannerProps) {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
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

  // State for selected UCC courses
  const [selectedUccCourses, setSelectedUccCourses] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('selectedUccCourses');
    return saved ? JSON.parse(saved) : {};
  });

  // State for selected UCC category
  const [selectedUccCategory, setSelectedUccCategory] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('selectedUccCategory');
    return saved ? JSON.parse(saved) : {};
  });

  // State for TAMU courses (courses completed from degree plan)
  const [tamuCourses, setTamuCourses] = useState<Array<{code: string, timestamp: number}>>(() => {
    const saved = localStorage.getItem('tamuCourses');
    return saved ? JSON.parse(saved) : [];
  });

  const getTotalHours = (courses: Course[]) => {
    return courses.reduce((sum, course) => sum + course.hours, 0);
  };

  const getTotalCredits = () => {
    return semesters.reduce((sum, semester) => sum + getTotalHours(semester.courses), 0);
  };

  const getCompletedCredits = () => {
    let completedCredits = 0;
    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        // Check if this course is completed (checked)
        const courseCode = course.code === "UCC Elective" && selectedUccCourses[course.id] 
          ? selectedUccCourses[course.id] 
          : course.code;
        
        if (checkedCourses.has(courseCode)) {
          completedCredits += course.hours;
        }
      });
    });
    return completedCredits;
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    console.log('Remove course clicked:', courseId, 'from semester:', semesterId);
    setSemesters(semesters.map(semester =>
      semester.id === semesterId
        ? { ...semester, courses: semester.courses.filter(course => course.id !== courseId) }
        : semester
    ));
  };

  const removeSemester = (semesterId: string) => {
    console.log('Remove semester clicked:', semesterId);
    setSemesters(semesters.filter(semester => semester.id !== semesterId));
  };

  const handleCourseCompleted = (course: string) => {
    const newCompletedCourses = [...completedCourses, course];
    setCompletedCourses(newCompletedCourses);
    const newCheckedCourses = new Set([...checkedCourses, course]);
    setCheckedCourses(newCheckedCourses);
    
    // Add to TAMU courses if not already there
    const courseExists = tamuCourses.some(tamuCourse => tamuCourse.code === course);
    if (!courseExists) {
      const newTamuCourses = [...tamuCourses, { code: course, timestamp: Date.now() }];
      setTamuCourses(newTamuCourses);
      localStorage.setItem('tamuCourses', JSON.stringify(newTamuCourses));
    }
    
    // Show notification
    toast.success(`Added ${course}`, {
      description: "Course added to Previous Courses",
      duration: 3000,
    });
    
    localStorage.setItem('completedCourses', JSON.stringify(newCompletedCourses));
    localStorage.setItem('checkedCourses', JSON.stringify([...newCheckedCourses]));
  };

  const handleCourseUnchecked = (course: string) => {
    const newCompletedCourses = completedCourses.filter(c => c !== course);
    setCompletedCourses(newCompletedCourses);
    const newCheckedCourses = new Set(checkedCourses);
    newCheckedCourses.delete(course);
    setCheckedCourses(newCheckedCourses);
    
    // Remove from TAMU courses
    const newTamuCourses = tamuCourses.filter(tamuCourse => tamuCourse.code !== course);
    setTamuCourses(newTamuCourses);
    localStorage.setItem('tamuCourses', JSON.stringify(newTamuCourses));
    
    // Show notification
    toast.info(`Removed ${course}`, {
      description: "Course removed from Previous Courses",
      duration: 3000,
    });
    
    localStorage.setItem('completedCourses', JSON.stringify(newCompletedCourses));
    localStorage.setItem('checkedCourses', JSON.stringify([...newCheckedCourses]));
  };

  const toggleCourseCompletion = (course: string) => {
    if (checkedCourses.has(course)) {
      handleCourseUnchecked(course);
    } else {
      handleCourseCompleted(course);
    }
  };

  const handleUccCategorySelection = (courseId: string, selectedCategory: string) => {
    if (selectedCategory === "reset") {
      // Reset category and course selection
      const newSelectedCategory = { ...selectedUccCategory };
      const newSelectedUcc = { ...selectedUccCourses };
      delete newSelectedCategory[courseId];
      delete newSelectedUcc[courseId];
      setSelectedUccCategory(newSelectedCategory);
      setSelectedUccCourses(newSelectedUcc);
      localStorage.setItem('selectedUccCategory', JSON.stringify(newSelectedCategory));
      localStorage.setItem('selectedUccCourses', JSON.stringify(newSelectedUcc));
    } else {
      // Update with selected category
      const newSelectedCategory = { ...selectedUccCategory, [courseId]: selectedCategory };
      setSelectedUccCategory(newSelectedCategory);
      localStorage.setItem('selectedUccCategory', JSON.stringify(newSelectedCategory));
    }
  };

  const handleUccSelection = (courseId: string, selectedUccCode: string) => {
    if (selectedUccCode === "reset") {
      // Reset to default UCC Elective
      const newSelectedUcc = { ...selectedUccCourses };
      delete newSelectedUcc[courseId];
      setSelectedUccCourses(newSelectedUcc);
      localStorage.setItem('selectedUccCourses', JSON.stringify(newSelectedUcc));
    } else {
      // Update with selected UCC course
      const newSelectedUcc = { ...selectedUccCourses, [courseId]: selectedUccCode };
      setSelectedUccCourses(newSelectedUcc);
      localStorage.setItem('selectedUccCourses', JSON.stringify(newSelectedUcc));
    }
  };

  const getSemesterLabel = (semesterName: string) => {
    if (semesterName === currentSemester) {
      return `${semesterName} (Current Semester)`;
    }
    return semesterName;
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
            <TabsTrigger value="previous" className="flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4">
              <History className="h-4 w-4" />
              Previous Courses
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4">
              <GraduationCap className="h-4 w-4" />
              Degree Evaluation
            </TabsTrigger>
          </TabsList>


          <TabsContent value="planner" className="space-y-6 mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-[Passion_One] text-gray-800">Progress Overview</h2>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {getCompletedCredits()} / 120 Credits Completed
                  </Badge>
                  <Badge variant="outline">
                    {getTotalCredits()} Total Credits Planned
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((getCompletedCredits() / 120) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>0 credits</span>
                <span>{Math.round((getCompletedCredits() / 120) * 100)}% Complete</span>
                <span>120 credits</span>
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
                      <div className="flex items-center gap-2">
                        <Badge>{getTotalHours(semester.courses)} hours</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSemester(semester.id)}
                          className="opacity-60 hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Semester"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {semester.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Checkbox
                          checked={checkedCourses.has(course.code === "UCC Elective" && selectedUccCourses[course.id] ? selectedUccCourses[course.id] : course.code)}
                          onCheckedChange={() => toggleCourseCompletion(course.code === "UCC Elective" && selectedUccCourses[course.id] ? selectedUccCourses[course.id] : course.code)}
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          {course.code === "UCC Elective" ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium font-[Open_Sans]">
                                  {selectedUccCourses[course.id] || "UCC Elective"}
                                </span>
                                {course.name && (
                                  <>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-sm font-[Open_Sans]">
                                      {selectedUccCourses[course.id] 
                                        ? getRemainingCoursesInCategory(selectedUccCategory[course.id] || "", completedCourses).find(opt => opt.code === selectedUccCourses[course.id])?.name
                                        : course.name
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Category Selection */}
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground">Select Category:</Label>
                                <Select
                                  value={selectedUccCategory[course.id] || ""}
                                  onValueChange={(value: string) => handleUccCategorySelection(course.id, value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose UCC Category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="reset">Reset to UCC Elective</SelectItem>
                                    {getUccCategories(completedCourses).map((category) => (
                                      <SelectItem key={category.code} value={category.name}>
                                        {category.name} ({category.completed}/{category.required} credits)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Course Selection - Only show if category is selected */}
                              {selectedUccCategory[course.id] && (
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-muted-foreground">Select Course:</Label>
                                  <Select
                                    value={selectedUccCourses[course.id] || ""}
                                    onValueChange={(value: string) => handleUccSelection(course.id, value)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Choose specific course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="reset">Reset course selection</SelectItem>
                                      {getRemainingCoursesInCategory(selectedUccCategory[course.id], completedCourses).map((option) => (
                                        <SelectItem key={option.code} value={option.code}>
                                          {option.code} - {option.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium font-[Open_Sans]">{course.code}</span>
                              {course.name && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-sm font-[Open_Sans]">{course.name}</span>
                                </>
                              )}
                            </div>
                          )}
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

            <TabsContent value="previous" className="mt-6">
              <PreviousCourses 
                major={major} 
                onBack={() => {}} 
                completedCourses={completedCourses}
              />
            </TabsContent>

            <TabsContent value="evaluation" className="mt-6">
              <DegreeEvaluation 
                major={major} 
                onBack={() => {}} 
                completedCourses={completedCourses}
              />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DegreePlanner;