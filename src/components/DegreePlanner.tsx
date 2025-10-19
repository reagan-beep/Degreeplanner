import React, { useState, useEffect } from 'react';
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
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import cpenData from '../data/ce_courses.json';
import coreCurriculumData from '../data/core_curriculum.json';
import mathMinorData from '../data/math_minor_courses.json';
import areaElectivesData from '../data/area_cpen.json';
import CourseAnalyzer from '../services/CourseAnalyzer';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

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
  minor?: string;
  certificate?: string;
  maxHours?: number;
  currentYear?: string;
  currentSemester?: string;
  onBack: (toHome?: boolean) => void;
}

// Draggable Course Component
interface DraggableCourseProps {
  course: Course;
  semesterId: string;
  checkedCourses: Set<string>;
  selectedElectiveType: { [key: string]: string };
  selectedUccCourses: { [key: string]: string };
  selectedUccCategory: { [key: string]: string };
  minorDropdownSelections: { [key: string]: string };
  selectedAreaElectives: { [key: string]: string };
  selectedAreaTracks: { [key: string]: string };
  selectedMinorRequirement: { [key: string]: string };
  onToggleCourseCompletion: (course: string) => void;
  onRemoveCourse: (semesterId: string, courseId: string) => void;
  onUccCategorySelection: (courseId: string, selectedCategory: string) => void;
  onUccSelection: (courseId: string, selectedUccCode: string) => void;
  onMinorCourseSelection: (requirementId: string, selectedCourseCode: string) => void;
  onMinorDropdownSelection: (requirementId: string, selectedCourseCode: string) => void;
  onElectiveTypeSelection: (semesterId: string, electiveType: string) => void;
  onAreaTrackSelection: (courseId: string, selectedTrack: string) => void;
  onAreaElectiveSelection: (courseId: string, selectedCourseCode: string) => void;
  getRemainingCoursesInCategory: (categoryName: string, completedCourses: string[]) => any[];
  getUccCategories: (completedCourses: string[]) => any[];
  completedCourses: string[];
  getActualCourseCode: (course: Course) => string;
}

function DraggableCourse({
  course,
  semesterId,
  checkedCourses,
  selectedElectiveType,
  selectedUccCourses,
  selectedUccCategory,
  minorDropdownSelections,
  selectedAreaElectives,
  selectedAreaTracks,
  selectedMinorRequirement,
  onToggleCourseCompletion,
  onRemoveCourse,
  onUccCategorySelection,
  onUccSelection,
  onMinorCourseSelection,
  onMinorDropdownSelection,
  onElectiveTypeSelection,
  onAreaTrackSelection,
  onAreaElectiveSelection,
  getRemainingCoursesInCategory,
  getUccCategories,
  completedCourses,
  getActualCourseCode,
}: DraggableCourseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={checkedCourses.has(getActualCourseCode(course))}
        onCheckedChange={() => {
          const courseCode = getActualCourseCode(course);
          onToggleCourseCompletion(courseCode);
        }}
        className="h-4 w-4"
      />
      <div className="flex-1">
        {course.code === "UCC Elective" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium font-[Open_Sans]">
                {selectedElectiveType[course.id] === "UCC" && selectedUccCourses[course.id] 
                  ? selectedUccCourses[course.id] 
                  : selectedElectiveType[course.id] === "Minor" && minorDropdownSelections["req1"]
                  ? minorDropdownSelections["req1"]
                  : selectedElectiveType[course.id] === "Area Emphasis" && selectedAreaElectives[course.id]
                  ? selectedAreaElectives[course.id]
                  : selectedElectiveType[course.id] === "Area Emphasis"
                  ? "Area Elective"
                  : "Elective"}
              </span>
              {course.name && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-sm font-[Open_Sans]">
                    {selectedElectiveType[course.id] === "UCC" && selectedUccCourses[course.id]
                      ? getRemainingCoursesInCategory(selectedUccCategory[course.id] || "", completedCourses).find(opt => opt.code === selectedUccCourses[course.id])?.name
                      : selectedElectiveType[course.id] === "Minor" && minorDropdownSelections["req1"]
                      ? "Math Minor Course"
                      : selectedElectiveType[course.id] === "Area Emphasis" && selectedAreaElectives[course.id]
                      ? (() => {
                          const selectedCourse = areaElectivesData["Computer Engineering Area Electives"]["Depth Tracks"]
                            .flatMap(track => track.Courses)
                            .find(c => c.Course === selectedAreaElectives[course.id]);
                          return selectedCourse ? selectedCourse.Name : "Area Elective";
                        })()
                      : selectedElectiveType[course.id] === "Area Emphasis"
                      ? "Area Elective"
                      : course.name}
                  </span>
                </>
              )}
            </div>
            
            {/* Elective Type Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Select Elective Type:</Label>
              <Select
                value={selectedElectiveType[course.id] || ""}
                onValueChange={(value: string) => onElectiveTypeSelection(course.id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elective:" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reset">Reset selection</SelectItem>
                  <SelectItem value="UCC">UCC (University Core Curriculum)</SelectItem>
                  <SelectItem value="Minor">Minor Course</SelectItem>
                  <SelectItem value="Area Emphasis">Area Emphasis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* UCC Selection - Only show if UCC is selected */}
            {selectedElectiveType[course.id] === "UCC" && (
              <>
                {/* Category Selection */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Select UCC Category:</Label>
                  <Select
                    value={selectedUccCategory[course.id] || ""}
                    onValueChange={(value: string) => onUccCategorySelection(course.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose UCC Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reset">Reset category</SelectItem>
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
                      onValueChange={(value: string) => onUccSelection(course.id, value)}
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
              </>
            )}

            {/* Minor Selection - Only show if Minor is selected */}
            {selectedElectiveType[course.id] === "Minor" && (
              <div className="space-y-4">
                {/* Requirement 1: Select one from MATH 148, 152, 172 (4 hours) */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-blue-800">1) Select one from the following (4 credit hours)</h4>
                    <Badge variant="outline">4 hours required</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white rounded border">
                      <Checkbox
                        checked={selectedMinorRequirement[course.id] === "req1" && checkedCourses.has(minorDropdownSelections["req1"] || "")}
                        onCheckedChange={() => {
                          if (selectedMinorRequirement[course.id] === "req1") {
                            // Uncheck current selection
                            const selectedCourse = minorDropdownSelections["req1"];
                            if (selectedCourse) {
                              onToggleCourseCompletion(selectedCourse);
                            }
                            const newSelectedRequirement = { ...selectedMinorRequirement };
                            delete newSelectedRequirement[course.id];
                            // Note: This would need to be handled by parent component
                          } else {
                            // Check this requirement and uncheck others
                            // Note: This would need to be handled by parent component
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <Select
                          value={minorDropdownSelections["req1"] || ""}
                          onValueChange={(value) => onMinorDropdownSelection("req1", value)}
                          disabled={selectedMinorRequirement[course.id] !== "req1"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reset">Reset selection</SelectItem>
                            <SelectItem value="MATH 148">MATH 148 - Calculus II for Biological Sciences</SelectItem>
                            <SelectItem value="MATH 152">MATH 152 - Engineering Mathematics II (Major Course)</SelectItem>
                            <SelectItem value="MATH 172">MATH 172 - Calculus II</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirement 2: Select three from MATH 221, 251, 253, 300-499 (9 hours) */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-blue-800">2) Select three from the following (9 credit hours)</h4>
                    <Badge variant="outline">9 hours required</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="flex items-center gap-3 p-2 bg-white rounded border">
                        <Checkbox
                          checked={selectedMinorRequirement[course.id] === `req2_${num}` && checkedCourses.has(minorDropdownSelections[`req2_${num}`] || "")}
                          onCheckedChange={() => {
                            if (selectedMinorRequirement[course.id] === `req2_${num}`) {
                              // Uncheck current selection
                              const selectedCourse = minorDropdownSelections[`req2_${num}`];
                              if (selectedCourse) {
                                onToggleCourseCompletion(selectedCourse);
                              }
                              // Note: This would need to be handled by parent component
                            } else {
                              // Check this requirement and uncheck others
                              // Note: This would need to be handled by parent component
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <Select
                            value={minorDropdownSelections[`req2_${num}`] || ""}
                            onValueChange={(value) => onMinorDropdownSelection(`req2_${num}`, value)}
                            disabled={selectedMinorRequirement[course.id] !== `req2_${num}`}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={`Course ${num}`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reset">Reset selection</SelectItem>
                              <SelectItem value="MATH 221">MATH 221 - Several Variable Calculus</SelectItem>
                              <SelectItem value="MATH 251">MATH 251 - Engineering Mathematics III (Major Course)</SelectItem>
                              <SelectItem value="MATH 253">MATH 253 - Engineering Mathematics III</SelectItem>
                              <SelectItem value="MATH 300-499">MATH 300-499 - Upper-level Mathematics Courses (Major Course)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirement 3: Select a course from MATH 400-499 (3 hours) */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-blue-800">3) Select a course from MATH 400-499 (3 credit hours)</h4>
                    <Badge variant="outline">3 hours required</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white rounded border">
                      <Checkbox
                        checked={selectedMinorRequirement[course.id] === "req3" && checkedCourses.has(minorDropdownSelections["req3"] || "")}
                        onCheckedChange={() => {
                          if (selectedMinorRequirement[course.id] === "req3") {
                            // Uncheck current selection
                            const selectedCourse = minorDropdownSelections["req3"];
                            if (selectedCourse) {
                              onToggleCourseCompletion(selectedCourse);
                            }
                            // Note: This would need to be handled by parent component
                          } else {
                            // Check this requirement and uncheck others
                            // Note: This would need to be handled by parent component
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <Select
                          value={minorDropdownSelections["req3"] || ""}
                          onValueChange={(value) => onMinorDropdownSelection("req3", value)}
                          disabled={selectedMinorRequirement[course.id] !== "req3"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reset">Reset selection</SelectItem>
                            <SelectItem value="MATH 400-499">MATH 400-499 - Advanced Mathematics Courses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Area Electives - Only show if Area Emphasis is selected */}
            {selectedElectiveType[course.id] === "Area Emphasis" && (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded border">
                  <div className="space-y-3">
                    {/* Track Selection */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Select Track:</Label>
                      <Select
                        value={selectedAreaTracks[course.id] || ""}
                        onValueChange={(value) => onAreaTrackSelection(course.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a track" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reset">Reset track selection</SelectItem>
                          {areaElectivesData["Computer Engineering Area Electives"]["Depth Tracks"].map((track) => (
                            <SelectItem key={track["Track Name"]} value={track["Track Name"]}>
                              {track["Track Name"]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Course Selection - Only show if track is selected */}
                    {selectedAreaTracks[course.id] && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={checkedCourses.has(selectedAreaElectives[course.id] || "")}
                            onCheckedChange={() => {
                              const selectedCourse = selectedAreaElectives[course.id];
                              if (selectedCourse) {
                                onToggleCourseCompletion(selectedCourse);
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <div className="flex-1">
                            <Label className="text-sm font-medium">Select Course:</Label>
                            <Select
                              value={selectedAreaElectives[course.id] || ""}
                              onValueChange={(value) => onAreaElectiveSelection(course.id, value)}
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Choose a course" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reset">Reset course selection</SelectItem>
                                {areaElectivesData["Computer Engineering Area Electives"]["Depth Tracks"]
                                  .find(track => track["Track Name"] === selectedAreaTracks[course.id])
                                  ?.Courses.map((c) => (
                                    <SelectItem key={c.Course} value={c.Course}>
                                      {c.Course} - {c.Name} ({c.Credits}h)
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {selectedAreaElectives[course.id] && (
                          <div className="text-xs text-muted-foreground">
                            {(() => {
                              const selectedCourse = areaElectivesData["Computer Engineering Area Electives"]["Depth Tracks"]
                                .flatMap(track => track.Courses)
                                .find(c => c.Course === selectedAreaElectives[course.id]);
                              return selectedCourse ? `Credits: ${selectedCourse.Credits}` : '';
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
        onClick={() => onRemoveCourse(semesterId, course.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity font-[Open_Sans]"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Convert CPEN data to semester format with max hours constraint
const convertCpenDataToSemesters = (maxHoursPerSemester: number = 16): Semester[] => {
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

function DegreePlanner({ major, minor, certificate, maxHours, currentYear, currentSemester, onBack }: DegreePlannerProps) {
  // Helper function to get the actual course code for a course
  const getActualCourseCode = (course: Course): string => {
    if (course.code === "UCC Elective") {
      // For UCC electives, use the specific course that was selected
      if (selectedElectiveType[course.id] === "UCC" && selectedUccCourses[course.id]) {
        return selectedUccCourses[course.id];
      } else if (selectedElectiveType[course.id] === "Minor" && minorDropdownSelections["req1"]) {
        return minorDropdownSelections["req1"];
      } else if (selectedElectiveType[course.id] === "Area Emphasis" && selectedAreaElectives[course.id]) {
        return selectedAreaElectives[course.id];
      }
      // If no specific selection, keep as "UCC Elective" placeholder
    }
    return course.code;
  };

  // Helper function to check prerequisites and show warnings
  const checkPrerequisitesAndWarn = (courseCode: string, semesterName: string) => {
    const completedCoursesData = Array.from(checkedCourses).map(courseCode => ({
      code: courseCode,
      credits: 3
    }));
    
    const canTakeResult = CourseAnalyzer.canTakeCourse(courseCode, completedCoursesData);
    
    if (!canTakeResult.canTake) {
      // Extract prerequisite courses from the message
      const prereqMatch = canTakeResult.message.match(/Prerequisites: ([^.]+)/);
      const missingPrereqs = prereqMatch ? prereqMatch[1] : 'unknown prerequisites';
      
      toast.error(`Prerequisite Warning`, {
        description: `${courseCode} in ${semesterName} requires: ${missingPrereqs}. Consider taking prerequisites in earlier semesters.`,
        duration: 8000,
      });
      
      console.warn(`Prerequisite warning: ${courseCode} in ${semesterName} - ${canTakeResult.message}`);
    }
    
    return canTakeResult.canTake;
  };
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [completedCourses, setCompletedCourses] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedCourses');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSemesterState, setCurrentSemesterState] = useState<string>("Fall Year 1");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("planner");

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
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

  // State for elective type selection (UCC, Minor, Area Emphasis)
  const [selectedElectiveType, setSelectedElectiveType] = useState<{ [key: string]: string }>(() => {
    // Clear previously selected boxes on page load
    return {};
  });

  // State for selected minor courses
  const [selectedMinorCourses, setSelectedMinorCourses] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('selectedMinorCourses');
    return saved ? JSON.parse(saved) : {};
  });

  // State for minor course dropdown selections
  const [minorDropdownSelections, setMinorDropdownSelections] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('minorDropdownSelections');
    return saved ? JSON.parse(saved) : {};
  });

  // State for area elective selections
  const [selectedAreaElectives, setSelectedAreaElectives] = useState<{ [key: string]: string }>(() => {
    // Clear previously selected boxes on page load
    return {};
  });

  // State for area elective track selections
  const [selectedAreaTracks, setSelectedAreaTracks] = useState<{ [key: string]: string }>(() => {
    // Clear previously selected boxes on page load
    return {};
  });

  // State for selected minor requirement (single choice)
  const [selectedMinorRequirement, setSelectedMinorRequirement] = useState<{ [key: string]: string }>(() => {
    // Clear previously selected boxes on page load
    return {};
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
        const courseCode = getActualCourseCode(course);
        
        if (checkedCourses.has(courseCode)) {
          // For area electives, get the actual credit hours from the data
          if (selectedElectiveType[course.id] === "Area Emphasis" && selectedAreaElectives[course.id]) {
            const selectedCourse = areaElectivesData["Computer Engineering Area Electives"]["Depth Tracks"]
              .flatMap(track => track.Courses)
              .find(c => c.Course === selectedAreaElectives[course.id]);
            completedCredits += selectedCourse ? selectedCourse.Credits : course.hours;
          } else {
            completedCredits += course.hours;
          }
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

  const handleMinorCourseSelection = (requirementId: string, selectedCourseCode: string) => {
    if (selectedCourseCode === "reset") {
      // Reset minor course selection
      const newSelectedMinor = { ...selectedMinorCourses };
      delete newSelectedMinor[requirementId];
      setSelectedMinorCourses(newSelectedMinor);
      localStorage.setItem('selectedMinorCourses', JSON.stringify(newSelectedMinor));
    } else {
      // Update with selected minor course
      const newSelectedMinor = { ...selectedMinorCourses, [requirementId]: selectedCourseCode };
      setSelectedMinorCourses(newSelectedMinor);
      localStorage.setItem('selectedMinorCourses', JSON.stringify(newSelectedMinor));
    }
  };

  const handleMinorDropdownSelection = (requirementId: string, selectedCourseCode: string) => {
    // For single-choice minor selection, clear other selections first
    if (selectedCourseCode && selectedCourseCode !== 'reset') {
      // Clear all other minor selections for this course
      const newSelections = { ...minorDropdownSelections };
      Object.keys(newSelections).forEach(key => {
        if (key.startsWith(requirementId.split('_')[0])) {
          delete newSelections[key];
        }
      });
      newSelections[requirementId] = selectedCourseCode;
      setMinorDropdownSelections(newSelections);
      localStorage.setItem('minorDropdownSelections', JSON.stringify(newSelections));
      
      // Update selected minor requirement
      const newSelectedRequirement = { ...selectedMinorRequirement, [requirementId.split('_')[0]]: requirementId };
      setSelectedMinorRequirement(newSelectedRequirement);
      localStorage.setItem('selectedMinorRequirement', JSON.stringify(newSelectedRequirement));
      
      // Also add to completed courses if not already there
      if (!checkedCourses.has(selectedCourseCode)) {
        toggleCourseCompletion(selectedCourseCode);
      }
    } else if (selectedCourseCode === 'reset') {
      // Reset this specific selection
      const newSelections = { ...minorDropdownSelections };
      delete newSelections[requirementId];
      setMinorDropdownSelections(newSelections);
      localStorage.setItem('minorDropdownSelections', JSON.stringify(newSelections));
      
      // Clear selected minor requirement if this was the selected one
      const newSelectedRequirement = { ...selectedMinorRequirement };
      if (newSelectedRequirement[requirementId.split('_')[0]] === requirementId) {
        delete newSelectedRequirement[requirementId.split('_')[0]];
        setSelectedMinorRequirement(newSelectedRequirement);
        localStorage.setItem('selectedMinorRequirement', JSON.stringify(newSelectedRequirement));
      }
    }
  };

  const handleElectiveTypeSelection = (semesterId: string, electiveType: string) => {
    const newSelections = { ...selectedElectiveType, [semesterId]: electiveType };
    setSelectedElectiveType(newSelections);
    localStorage.setItem('selectedElectiveType', JSON.stringify(newSelections));
  };

  const handleAreaTrackSelection = (courseId: string, selectedTrack: string) => {
    if (selectedTrack === "reset") {
      const newTracks = { ...selectedAreaTracks };
      const newSelections = { ...selectedAreaElectives };
      delete newTracks[courseId];
      delete newSelections[courseId];
      setSelectedAreaTracks(newTracks);
      setSelectedAreaElectives(newSelections);
      localStorage.setItem('selectedAreaTracks', JSON.stringify(newTracks));
      localStorage.setItem('selectedAreaElectives', JSON.stringify(newSelections));
    } else {
      const newTracks = { ...selectedAreaTracks, [courseId]: selectedTrack };
      setSelectedAreaTracks(newTracks);
      localStorage.setItem('selectedAreaTracks', JSON.stringify(newTracks));
    }
  };

  const handleAreaElectiveSelection = (courseId: string, selectedCourseCode: string) => {
    if (selectedCourseCode === "reset") {
      const newSelections = { ...selectedAreaElectives };
      delete newSelections[courseId];
      setSelectedAreaElectives(newSelections);
      localStorage.setItem('selectedAreaElectives', JSON.stringify(newSelections));
    } else {
      const newSelections = { ...selectedAreaElectives, [courseId]: selectedCourseCode };
      setSelectedAreaElectives(newSelections);
      localStorage.setItem('selectedAreaElectives', JSON.stringify(newSelections));
    }
  };

  const getSemesterLabel = (semesterName: string) => {
    if (semesterName === currentSemesterState) {
      return `${semesterName} (Current Semester)`;
    }
    return semesterName;
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the source semester and course
    let sourceSemester: Semester | null = null;
    let sourceCourse: Course | null = null;
    let sourceIndex = -1;

    for (const semester of semesters) {
      const courseIndex = semester.courses.findIndex(course => course.id === activeId);
      if (courseIndex !== -1) {
        sourceSemester = semester;
        sourceCourse = semester.courses[courseIndex];
        sourceIndex = courseIndex;
        break;
      }
    }

    if (!sourceSemester || !sourceCourse) return;

    // Check if dropping on a semester (overId is a semester ID)
    const targetSemester = semesters.find(semester => semester.id === overId);
    
    if (targetSemester && targetSemester.id !== sourceSemester.id) {
      // Check prerequisites before moving course to different semester
      const actualCourseCode = getActualCourseCode(sourceCourse);
      const prerequisitesMet = checkPrerequisitesAndWarn(actualCourseCode, targetSemester.name);
      
      if (!prerequisitesMet) {
        // Still allow the move but show warning
        toast.info(`Course moved with prerequisite warning`, {
          description: `${actualCourseCode} moved to ${targetSemester.name} but prerequisites may not be met.`,
          duration: 5000,
        });
      }
    }
    
    if (targetSemester) {
      // Moving to a different semester
      if (sourceSemester.id !== targetSemester.id) {
        setSemesters(prevSemesters => 
          prevSemesters.map(semester => {
            if (semester.id === sourceSemester!.id) {
              // Remove from source semester
              return {
                ...semester,
                courses: semester.courses.filter(course => course.id !== activeId)
              };
            } else if (semester.id === targetSemester.id) {
              // Add to target semester
              return {
                ...semester,
                courses: [...semester.courses, sourceCourse!]
              };
            }
            return semester;
          })
        );
      }
    } else {
      // Check if dropping on another course (find which semester it belongs to)
      let targetSemester: Semester | null = null;
      let targetIndex = -1;

      for (const semester of semesters) {
        const courseIndex = semester.courses.findIndex(course => course.id === overId);
        if (courseIndex !== -1) {
          targetSemester = semester;
          targetIndex = courseIndex;
          break;
        }
      }

      if (targetSemester && sourceSemester) {
        if (sourceSemester.id === targetSemester.id) {
          // Reordering within the same semester
          const newCourses = [...sourceSemester.courses];
          const [removed] = newCourses.splice(sourceIndex, 1);
          newCourses.splice(targetIndex, 0, removed);

          setSemesters(prevSemesters =>
            prevSemesters.map(semester =>
              semester.id === sourceSemester!.id
                ? { ...semester, courses: newCourses }
                : semester
            )
          );
        } else {
          // Moving between different semesters
          setSemesters(prevSemesters =>
            prevSemesters.map(semester => {
              if (semester.id === sourceSemester!.id) {
                // Remove from source semester
                return {
                  ...semester,
                  courses: semester.courses.filter(course => course.id !== activeId)
                };
              } else if (semester.id === targetSemester!.id) {
                // Add to target semester at the target position
                const newCourses = [...semester.courses];
                newCourses.splice(targetIndex, 0, sourceCourse!);
                return {
                  ...semester,
                  courses: newCourses
                };
              }
              return semester;
            })
          );
        }
      }
    }
  };

  // Get the currently dragged course for the overlay
  const getDraggedCourse = () => {
    for (const semester of semesters) {
      const course = semester.courses.find(course => course.id === activeId);
      if (course) return course;
    }
    return null;
  };

  // Semi-intelligent scheduling functions
  const testScheduling = () => {
    console.log('Testing scheduling...');
    
    // Collect all prerequisite warnings
    const warnings: string[] = [];
    
    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        const actualCourseCode = getActualCourseCode(course);
        const completedCoursesData = Array.from(checkedCourses).map(courseCode => ({
          code: courseCode,
          credits: 3
        }));
        
        const canTakeResult = CourseAnalyzer.canTakeCourse(actualCourseCode, completedCoursesData);
        
        // Only show warnings for courses that actually have prerequisites and don't meet them
        if (!canTakeResult.canTake && canTakeResult.message && canTakeResult.message !== 'Course can be taken') {
          const prereqMatch = canTakeResult.message.match(/Prerequisites: ([^.]+)/);
          if (prereqMatch) {
            const missingPrereqs = prereqMatch[1];
            warnings.push(`${actualCourseCode} in ${semester.name} requires: ${missingPrereqs}`);
          }
        }
      });
    });
    
    // Show popup with all warnings
    if (warnings.length > 0) {
      const warningMessage = warnings.join('\n\n');
      const popupContent = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border: 2px solid #dc2626;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="
            color: #dc2626;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          ">⚠️ Prerequisite Warnings</div>
          <div style="
            color: #dc2626;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
            white-space: pre-line;
          ">${warningMessage}</div>
          <div style="
            color: #374151;
            font-size: 14px;
            text-align: center;
            font-style: italic;
          ">Consider taking prerequisites in earlier semesters.</div>
        </div>
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
        " onclick="this.parentNode.remove()"></div>
      `;
      
      const popup = document.createElement('div');
      popup.innerHTML = popupContent;
      document.body.appendChild(popup);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 10000);
    } else {
      const successContent = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 500px;
          width: 90%;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center;
        ">
          <div style="
            color: #10b981;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          ">✅ All courses meet their prerequisites!</div>
        </div>
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
        " onclick="this.parentNode.remove()"></div>
      `;
      
      const popup = document.createElement('div');
      popup.innerHTML = successContent;
      document.body.appendChild(popup);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 5000);
    }
  };

  const fillSemesters = () => {
    console.log('Filling semesters with courses...');
    console.log('Current semesters:', semesters);
    console.log('Checked courses:', Array.from(checkedCourses));
    console.log('Max hours per semester:', maxHours);
    
    // Get all available courses from the sample schedule
    const allSampleCourses = CourseAnalyzer.getAllCourses();
    console.log('All sample courses:', allSampleCourses.length);
    
    // Determine current semester based on user input
    const getCurrentSemesterName = () => {
      if (!currentYear || !currentSemester) return null;
      
      const yearMap: { [key: string]: string } = {
        'Freshman': 'Year 1',
        'Sophomore': 'Year 2', 
        'Junior': 'Year 3',
        'Senior': 'Year 4'
      };
      
      const semesterMap: { [key: string]: string } = {
        '1st': 'Fall',
        '2nd': 'Spring'
      };
      
      const year = yearMap[currentYear];
      const semester = semesterMap[currentSemester];
      
      if (year && semester) {
        return `${semester} ${year}`;
      }
      return null;
    };
    
    const currentSemesterName = getCurrentSemesterName();
    console.log('Current semester:', currentSemesterName);
    
    // Helper function to determine if a semester is in the past
    const isPastSemester = (semesterName: string): boolean => {
      if (!currentSemesterName) return false;
      
      const semesterOrder = [
        'Fall Year 1', 'Spring Year 1',
        'Fall Year 2', 'Spring Year 2', 
        'Fall Year 3', 'Spring Year 3',
        'Fall Year 4', 'Spring Year 4'
      ];
      
      const currentIndex = semesterOrder.indexOf(currentSemesterName);
      const semesterIndex = semesterOrder.indexOf(semesterName);
      
      return semesterIndex < currentIndex;
    };
    
    // Create comprehensive redistribution system
    const redistributeAllCourses = () => {
      // Collect all courses that need to be placed
      const allCoursesToPlace: any[] = [];
      
      // Add all sample courses (excluding completed ones)
      allSampleCourses.forEach(course => {
        if (!checkedCourses.has(course.course)) {
          allCoursesToPlace.push(course);
        }
      });
      
      console.log(`Total courses to place: ${allCoursesToPlace.length}`);
      
      // Sort courses by their original semester order and difficulty
      const semesterOrder = [
        'First Year Fall', 'First Year Spring',
        'Second Year Fall', 'Second Year Spring',
        'Third Year Fall', 'Third Year Spring',
        'Fourth Year Fall', 'Fourth Year Spring'
      ];
      
      allCoursesToPlace.sort((a, b) => {
        const aIndex = semesterOrder.indexOf(a.semester);
        const bIndex = semesterOrder.indexOf(b.semester);
        
        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }
        
        // Within same semester, sort by difficulty (easier courses first)
        return a.difficulty - b.difficulty;
      });
      
      // Create new semester structure - preserve existing courses but clear for redistribution
      const updatedSemesters: Semester[] = semesters.map(semester => {
        // Keep completed courses in their current semesters
        const preservedCourses: Course[] = [];
        semester.courses.forEach(course => {
          const actualCourseCode = getActualCourseCode(course);
          if (checkedCourses.has(actualCourseCode)) {
            preservedCourses.push(course);
          }
        });
        
        return {
          ...semester,
          courses: preservedCourses
        };
      });
      
      // Track completed courses for prerequisite checking
      let completedCoursesData = Array.from(checkedCourses).map(courseCode => ({
        code: courseCode,
        credits: 3
      }));
      
      // Place courses intelligently
      allCoursesToPlace.forEach(course => {
        const courseCode = course.course;
        
        // Map original semester to our semester names
        const semesterMapping: { [key: string]: string } = {
          'First Year Fall': 'Fall Year 1',
          'First Year Spring': 'Spring Year 1',
          'Second Year Fall': 'Fall Year 2',
          'Second Year Spring': 'Spring Year 2',
          'Third Year Fall': 'Fall Year 3',
          'Third Year Spring': 'Spring Year 3',
          'Fourth Year Fall': 'Fall Year 4',
          'Fourth Year Spring': 'Spring Year 4'
        };
        
        const targetSemesterName = semesterMapping[course.semester];
        const targetSemester = updatedSemesters.find(s => s.name === targetSemesterName);
        
        if (!targetSemester) {
          console.log(`Target semester not found for ${courseCode}: ${targetSemesterName}`);
          return;
        }
        
        // Check prerequisites
        const canTakeResult = CourseAnalyzer.canTakeCourse(courseCode, completedCoursesData);
        const shouldInclude = canTakeResult.canTake || 
          (!course.prereqs || course.prereqs.trim() === '') ||
          course.prereqs.includes('concurrent') ||
          course.prereqs.includes('or equivalent') ||
          course.prereqs.includes('placement');
        
        if (!shouldInclude) {
          console.log(`Skipping ${courseCode}: prerequisites not met - ${canTakeResult.message}`);
          return;
        }
        
        // Try to place in target semester first
        const targetHours = targetSemester.courses.reduce((sum, c) => sum + c.hours, 0);
        
        if (targetHours + course.credits <= (maxHours || 16) && !isPastSemester(targetSemester.name)) {
          // Place in target semester
          const newCourse: Course = {
            id: `course-${Date.now()}-${Math.random()}`,
            code: courseCode,
            name: course.name,
            hours: course.credits
          };
          
          targetSemester.courses.push(newCourse);
          completedCoursesData.push({
            code: courseCode,
            credits: course.credits
          });
          
          console.log(`Placed ${courseCode} in target semester ${targetSemesterName}`);
          
          // Show warning if prerequisites aren't met
          if (!canTakeResult.canTake) {
            const prereqMatch = canTakeResult.message.match(/Prerequisites: ([^.]+)/);
            const missingPrereqs = prereqMatch ? prereqMatch[1] : 'unknown prerequisites';
            
            toast.warning(`Prerequisite Warning`, {
              description: `${courseCode} added to ${targetSemesterName} but requires: ${missingPrereqs}. Consider taking prerequisites in earlier semesters.`,
              duration: 8000,
            });
          }
        } else {
          // Target semester is full or in the past, find alternative semester
          const sortedSemesters = [...updatedSemesters].sort((a, b) => {
            const yearA = parseInt(a.name.match(/Year (\d+)/)?.[1] || '0');
            const yearB = parseInt(b.name.match(/Year (\d+)/)?.[1] || '0');
            if (yearA !== yearB) return yearA - yearB;
            return a.name.includes('Fall') ? -1 : 1;
          });
          
          let placed = false;
          for (const semester of sortedSemesters) {
            // Skip past semesters
            if (isPastSemester(semester.name)) {
              continue;
            }
            
            const currentHours = semester.courses.reduce((sum, c) => sum + c.hours, 0);
            
            if (currentHours + course.credits <= (maxHours || 16)) {
              const newCourse: Course = {
                id: `course-${Date.now()}-${Math.random()}`,
                code: courseCode,
                name: course.name,
                hours: course.credits
              };
              
              semester.courses.push(newCourse);
              completedCoursesData.push({
                code: courseCode,
                credits: course.credits
              });
              
              console.log(`Placed ${courseCode} in alternative semester ${semester.name} (target was ${targetSemesterName})`);
              
              // Show warning if prerequisites aren't met
              if (!canTakeResult.canTake) {
                const prereqMatch = canTakeResult.message.match(/Prerequisites: ([^.]+)/);
                const missingPrereqs = prereqMatch ? prereqMatch[1] : 'unknown prerequisites';
                
                toast.warning(`Prerequisite Warning`, {
                  description: `${courseCode} added to ${semester.name} but requires: ${missingPrereqs}. Consider taking prerequisites in earlier semesters.`,
                  duration: 8000,
                });
              }
              
              placed = true;
              break;
            }
          }
          
          if (!placed) {
            console.log(`Could not place ${courseCode} - no available semesters with space`);
          }
        }
      });
      
      return updatedSemesters;
    };
    
    // Perform comprehensive redistribution
    const updatedSemesters = redistributeAllCourses();
    
    setSemesters(updatedSemesters);
    toast.success("Semesters filled with courses!", {
      description: `All courses redistributed based on ${maxHours || 16} max hours per semester`,
      duration: 3000,
    });
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
            <div className="space-y-1">
              <p className="text-muted-foreground font-[Open_Sans]">Major: {major}</p>
              {minor && <p className="text-muted-foreground font-[Open_Sans]">Minor: {minor}</p>}
              {certificate && <p className="text-muted-foreground font-[Open_Sans]">Certificate: {certificate}</p>}
              <p className="text-muted-foreground font-[Open_Sans]">Max Hours: {maxHours || 16}</p>
              <p className="text-muted-foreground font-[Open_Sans]">Current Year: {currentYear || 'Freshman'}</p>
              {currentSemester && <p className="text-muted-foreground font-[Open_Sans]">Current Semester: {currentSemester}</p>}
            </div>
          </div>
          <div className="w-24"></div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full h-12 bg-white/90 backdrop-blur-sm shadow-sm border rounded-lg">
            <TabsTrigger 
              value="planner" 
              className={`flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4 transition-all ${
                activeTab === "planner" 
                  ? "bg-gray-800 text-white shadow-md" 
                  : "hover:bg-gray-100"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Degree Planner
            </TabsTrigger>
            <TabsTrigger 
              value="courses" 
              className={`flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4 transition-all ${
                activeTab === "courses" 
                  ? "bg-gray-800 text-white shadow-md" 
                  : "hover:bg-gray-100"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Course Catalog
            </TabsTrigger>
            <TabsTrigger 
              value="previous" 
              className={`flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4 transition-all ${
                activeTab === "previous" 
                  ? "bg-gray-800 text-white shadow-md" 
                  : "hover:bg-gray-100"
              }`}
            >
              <History className="h-4 w-4" />
              Previous Courses
            </TabsTrigger>
            <TabsTrigger 
              value="evaluation" 
              className={`flex-1 flex items-center justify-center gap-2 font-[Open_Sans] px-4 transition-all ${
                activeTab === "evaluation" 
                  ? "bg-gray-800 text-white shadow-md" 
                  : "hover:bg-gray-100"
              }`}
            >
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

            {/* Semi-intelligent scheduling controls */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex gap-4">
                <Button 
                  onClick={testScheduling}
                  variant="outline"
                  className="font-[Open_Sans]"
                >
                  Test Prerequisite Checking
                </Button>
                <Button 
                  onClick={fillSemesters}
                  className="bg-black text-white border border-black hover:bg-gray-800 font-[Open_Sans]"
                >
                  Generate Degree Plan
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {semesters.map((semester) => (
                  <Card key={semester.id} id={semester.id}>
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
                      <SortableContext items={semester.courses.map(course => course.id)} strategy={verticalListSortingStrategy}>
                        {semester.courses.map((course) => (
                          <DraggableCourse
                            key={course.id}
                            course={course}
                            semesterId={semester.id}
                            checkedCourses={checkedCourses}
                            selectedElectiveType={selectedElectiveType}
                            selectedUccCourses={selectedUccCourses}
                            selectedUccCategory={selectedUccCategory}
                            minorDropdownSelections={minorDropdownSelections}
                            selectedAreaElectives={selectedAreaElectives}
                            selectedAreaTracks={selectedAreaTracks}
                            selectedMinorRequirement={selectedMinorRequirement}
                            onToggleCourseCompletion={toggleCourseCompletion}
                            onRemoveCourse={removeCourse}
                            onUccCategorySelection={handleUccCategorySelection}
                            onUccSelection={handleUccSelection}
                            onMinorCourseSelection={handleMinorCourseSelection}
                            onMinorDropdownSelection={handleMinorDropdownSelection}
                            onElectiveTypeSelection={handleElectiveTypeSelection}
                            onAreaTrackSelection={handleAreaTrackSelection}
                            onAreaElectiveSelection={handleAreaElectiveSelection}
                            getRemainingCoursesInCategory={getRemainingCoursesInCategory}
                            getUccCategories={getUccCategories}
                            completedCourses={completedCourses}
                            getActualCourseCode={getActualCourseCode}
                          />
                        ))}
                      </SortableContext>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2 font-[Open_Sans]"
                          onClick={() => {
                            console.log('Add course button clicked for semester:', semester.id);
                            const code = prompt('Enter course code (e.g., CSCE 121):');
                            if (code && code.trim()) {
                              const courseCode = code.trim();
                              
                              // Check prerequisites before adding
                              const prerequisitesMet = checkPrerequisitesAndWarn(courseCode, semester.name);
                              
                              const course: Course = {
                                id: `course-${Date.now()}`,
                                code: courseCode,
                                name: '', // Empty name since we're only asking for code
                                hours: 3 // Default to 3 credit hours
                              };
                              
                              setSemesters(semesters.map(sem => 
                                sem.id === semester.id 
                                  ? { ...sem, courses: [...sem.courses, course] }
                                  : sem
                              ));
                              
                              if (prerequisitesMet) {
                                toast.success(`Added ${courseCode}`, {
                                  description: `Course added to ${semester.name}`,
                                  duration: 3000,
                                });
                              }
                              
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

              <DragOverlay>
                {activeId ? (
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg shadow-lg border">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-[Open_Sans]">
                          {(() => {
                            const course = getDraggedCourse();
                            return course ? course.code : '';
                          })()}
                        </span>
                        {(() => {
                          const course = getDraggedCourse();
                          return course && course.name ? (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-sm font-[Open_Sans]">{course.name}</span>
                            </>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {(() => {
                        const course = getDraggedCourse();
                        return course ? `${course.hours}h` : '';
                      })()}
                    </Badge>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

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
            <CourseList major={major} minor={minor} onBack={() => {}} />
          </TabsContent>

          <TabsContent value="previous" className="mt-6">
            <PreviousCourses 
              major={major} 
              onBack={() => {}} 
              checkedCourses={checkedCourses}
            />
          </TabsContent>

          <TabsContent value="evaluation" className="mt-6">
            <DegreeEvaluation 
              major={major} 
              minor={minor}
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
