import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import coreCurriculumData from '../data/core_curriculum.json';
import mathMinorData from '../data/math_minor_courses.json';

interface DegreeEvaluationProps {
  major: string;
  minor?: string;
  completedCourses: string[];
  onBack: (toHome?: boolean) => void;
}

interface CategoryProgress {
  category: string;
  required: number;
  completed: number;
  remaining: number;
  percentage: number;
  completedCourses: string[];
  availableCourses: string[];
}

interface MinorProgress {
  course: string;
  required: number;
  completed: number;
  remaining: number;
  percentage: number;
  completedCourses: string[];
  availableCourses: string[];
  alternatives: Array<{
    code: string;
    name: string;
    credits: number;
    isMajor?: boolean;
  }>;
  majorOverlapCourses?: string[];
}

function DegreeEvaluation({ major, minor, completedCourses, onBack }: DegreeEvaluationProps) {
  // Extract course codes from completed courses (remove descriptions)
  const completedCourseCodes = completedCourses.map(course => {
    // Extract course code from strings like "CHEM 107 - General Chemistry for Engineering Students (3h)"
    const match = course.match(/^([A-Z]{2,4}\s+\d{3})/);
    return match ? match[1] : course;
  });

  // Calculate progress for each core curriculum category
  const calculateCategoryProgress = (): CategoryProgress[] => {
    const coreCurriculum = coreCurriculumData["University Core Curriculum"];
    const categories = Object.keys(coreCurriculum);
    
    return categories.map(categoryName => {
      const category = coreCurriculum[categoryName];
      const requiredHours = category.credit_hours_required;
      const availableCourses = category.courses.map(course => course.code);
      
      // Find completed courses in this category
      const completedInCategory = completedCourseCodes.filter(courseCode => 
        availableCourses.includes(courseCode)
      );
      
      // Calculate completed hours
      const completedHours = completedInCategory.reduce((total, courseCode) => {
        const course = category.courses.find(c => c.code === courseCode);
        return total + (course ? course.hours : 0);
      }, 0);
      
      const remainingHours = Math.max(0, requiredHours - completedHours);
      const percentage = Math.min(100, (completedHours / requiredHours) * 100);
      
      return {
        category: categoryName,
        required: requiredHours,
        completed: completedHours,
        remaining: remainingHours,
        percentage,
        completedCourses: completedInCategory,
        availableCourses
      };
    });
  };

  // Calculate minor progress if minor is specified
  const calculateMinorProgress = (): MinorProgress[] => {
    if (!minor || !minor.toLowerCase().includes('math')) {
      return [];
    }

    // Define math minor requirements with major course overlap indicators
    const mathMinorRequirements = [
      {
        course: "MATH 148/152/172",
        required: 4,
        availableCourses: ["MATH 148", "MATH 152", "MATH 172"],
        alternatives: [
          { code: "MATH 148", name: "Calculus II for Biological Sciences", credits: 4, isMajor: false },
          { code: "MATH 152", name: "Engineering Mathematics II", credits: 4, isMajor: true },
          { code: "MATH 172", name: "Calculus II", credits: 4, isMajor: false }
        ]
      },
      {
        course: "MATH 221/251/253/300-499",
        required: 9,
        availableCourses: ["MATH 221", "MATH 251", "MATH 253", "MATH 300-499"],
        alternatives: [
          { code: "MATH 221", name: "Several Variable Calculus", credits: 3, isMajor: false },
          { code: "MATH 251", name: "Engineering Mathematics III", credits: 3, isMajor: true },
          { code: "MATH 253", name: "Engineering Mathematics III", credits: 3, isMajor: false },
          { code: "MATH 300-499", name: "Upper-level Mathematics Courses (e.g., MATH 308)", credits: 3, isMajor: true }
        ]
      },
      {
        course: "MATH 400-499",
        required: 3,
        availableCourses: ["MATH 400-499"],
        alternatives: [
          { code: "MATH 400-499", name: "Advanced Mathematics Courses", credits: 3, isMajor: false }
        ]
      }
    ];

    return mathMinorRequirements.map(requirement => {
      // Find completed courses in this minor requirement
      const completedInMinor = completedCourseCodes.filter(courseCode =>
        requirement.availableCourses.includes(courseCode)
      );

      // Calculate completed hours
      const completedHours = completedInMinor.reduce((total, courseCode) => {
        const course = requirement.alternatives.find(alt => alt.code === courseCode);
        return total + (course ? course.credits : 3); // Default to 3 if not found
      }, 0);

      const remainingHours = Math.max(0, requirement.required - completedHours);
      const percentage = Math.min(100, (completedHours / requirement.required) * 100);

      // Identify which completed courses are also major courses
      const majorOverlapCourses = completedInMinor.filter(courseCode => {
        const course = requirement.alternatives.find(alt => alt.code === courseCode);
        return course?.isMajor || false;
      });

      return {
        course: requirement.course,
        required: requirement.required,
        completed: completedHours,
        remaining: remainingHours,
        percentage,
        completedCourses: completedInMinor,
        availableCourses: requirement.availableCourses,
        alternatives: requirement.alternatives,
        majorOverlapCourses: majorOverlapCourses
      };
    });
  };

  const categoryProgress = calculateCategoryProgress();
  const minorProgress = calculateMinorProgress();
  
  const totalRequired = categoryProgress.reduce((sum, cat) => sum + cat.required, 0);
  const totalCompleted = categoryProgress.reduce((sum, cat) => sum + cat.completed, 0);
  const totalRemaining = totalRequired - totalCompleted;
  const overallPercentage = (totalCompleted / totalRequired) * 100;

  const minorTotalRequired = minorProgress.reduce((sum, minor) => sum + minor.required, 0);
  const minorTotalCompleted = minorProgress.reduce((sum, minor) => sum + minor.completed, 0);
  const minorTotalRemaining = minorTotalRequired - minorTotalCompleted;
  const minorOverallPercentage = minorTotalRequired > 0 ? (minorTotalCompleted / minorTotalRequired) * 100 : 0;

  const getStatusIcon = (category: CategoryProgress) => {
    if (category.completed >= category.required) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (category.completed > 0) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusText = (category: CategoryProgress) => {
    if (category.completed >= category.required) {
      return "Complete";
    } else if (category.completed > 0) {
      return "In Progress";
    } else {
      return "Not Started";
    }
  };

  const getProgressBarColor = (category: CategoryProgress) => {
    if (category.completed >= category.required) {
      return "bg-green-500"; // Green for completed
    } else if (category.completed > 0) {
      return "bg-yellow-500"; // Yellow for in progress
    } else {
      return "bg-red-500"; // Red for not started
    }
  };

  const getStatusColor = (category: CategoryProgress) => {
    if (category.completed >= category.required) {
      return "bg-green-100 text-green-800";
    } else if (category.completed > 0) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const getProgressBarBgColor = (category: CategoryProgress) => {
    if (category.completed >= category.required) {
      return "bg-green-100"; // Light green background for completed
    } else if (category.completed > 0) {
      return "bg-yellow-100"; // Light yellow background for in progress
    } else {
      return "bg-red-100"; // Light red background for not started
    }
  };

  const getOverallProgressColor = () => {
    if (overallPercentage >= 100) {
      return "bg-green-500"; // Green for fully completed
    } else if (overallPercentage > 0) {
      return "bg-yellow-500"; // Yellow for partially completed
    } else {
      return "bg-red-500"; // Red for not started
    }
  };

  const getOverallProgressBgColor = () => {
    if (overallPercentage >= 100) {
      return "bg-green-100"; // Light green background for completed
    } else if (overallPercentage > 0) {
      return "bg-yellow-100"; // Light yellow background for in progress
    } else {
      return "bg-red-100"; // Light red background for not started
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* University Core Curriculum Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-[Passion_One] text-[#800000] mb-2">University Core Curriculum</h2>
          </div>

          {/* Overall Core Curriculum Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <Badge variant="secondary" className="text-xs">
                  {totalCompleted}/{totalRequired} hours completed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{overallPercentage.toFixed(1)}%</span>
                  </div>
                  <div className={`w-full h-1 rounded-full overflow-hidden ${getOverallProgressBgColor()}`}>
                    <div 
                      className={`h-full transition-all duration-300 ${getOverallProgressColor()}`}
                      style={{ width: `${overallPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown - Condensed with smaller progress bars */}
          <div className="grid gap-2">
            {categoryProgress.map((category) => (
              <Card key={category.category} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(category)}
                    <h3 className="font-medium text-sm">{category.category}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={getStatusColor(category)}>
                      {getStatusText(category)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {category.completed}/{category.required}h
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{category.percentage.toFixed(1)}%</span>
                  </div>
                  <div className={`w-full h-1 rounded-full overflow-hidden ${getProgressBarBgColor(category)}`}>
                    <div 
                      className={`h-full transition-all duration-300 ${getProgressBarColor(category)}`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  
                  {category.completedCourses.length > 0 && (
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-1">
                        {category.completedCourses.map((course) => (
                          <Badge key={course} variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {category.remaining > 0 && (
                    <div className="mt-1">
                      <div className="text-xs text-red-600">
                        Still need: {category.remaining} hours
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Math Minor Section - Moved to bottom */}
        {minor && minor.toLowerCase().includes('math') && minorProgress.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="text-center">
              <h2 className="text-2xl font-[Passion_One] text-[#800000] mb-2">Math Minor Requirements</h2>
            </div>

            {/* Minor Progress Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Minor Progress</span>
                  <Badge variant="secondary" className="text-xs">
                    {minorTotalCompleted}/{minorTotalRequired} hours completed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{minorOverallPercentage.toFixed(1)}%</span>
                    </div>
                    <div className={`w-full h-1 rounded-full overflow-hidden ${
                      minorOverallPercentage >= 100 ? 'bg-green-100' : 
                      minorOverallPercentage > 0 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <div 
                        className={`h-full transition-all duration-300 ${
                          minorOverallPercentage >= 100 ? 'bg-green-500' : 
                          minorOverallPercentage > 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${minorOverallPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Minor Requirements Details */}
            <div className="grid gap-2">
              {minorProgress.map((minorCourse) => (
                <Card key={minorCourse.course} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {minorCourse.completed >= minorCourse.required ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : minorCourse.completed > 0 ? (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                      <h4 className="font-medium text-sm">{minorCourse.course}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={
                        minorCourse.completed >= minorCourse.required ? 'bg-green-100 text-green-800' :
                        minorCourse.completed > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }>
                        {minorCourse.completed >= minorCourse.required ? 'Complete' :
                         minorCourse.completed > 0 ? 'In Progress' : 'Not Started'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {minorCourse.completed}/{minorCourse.required}h
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{minorCourse.percentage.toFixed(1)}%</span>
                    </div>
                    <div className={`w-full h-1 rounded-full overflow-hidden ${
                      minorCourse.completed >= minorCourse.required ? 'bg-green-100' :
                      minorCourse.completed > 0 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <div 
                        className={`h-full transition-all duration-300 ${
                          minorCourse.completed >= minorCourse.required ? 'bg-green-500' :
                          minorCourse.completed > 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${minorCourse.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {minorCourse.completedCourses.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {minorCourse.completedCourses.map((course) => {
                          const isMajorCourse = minorCourse.majorOverlapCourses?.includes(course);
                          return (
                            <Badge 
                              key={course} 
                              variant="secondary" 
                              className="text-xs bg-green-100 text-green-800"
                            >
                              {course} {isMajorCourse && '(Major)'}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {minorCourse.remaining > 0 && minorCourse.alternatives.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Available Options:</div>
                      <div className="flex flex-wrap gap-1">
                        {minorCourse.alternatives.map((alt, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className={`text-xs ${alt.isMajor ? 'bg-green-50 border-green-200 text-green-800' : ''}`}
                          >
                            {alt.code} {alt.isMajor && '(Major)'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Minor Selected Message */}
        {(!minor || !minor.toLowerCase().includes('math') || minorProgress.length === 0) && (
          <div className="mt-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Minor Progress</span>
                  <Badge variant="outline" className="text-xs">No Minor Selected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center py-4">
                  <div className="text-gray-500 text-sm mb-1">No Minor Selected</div>
                  <div className="text-xs text-muted-foreground">
                    Select a minor in the Degree Planner to track progress here.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

export default DegreeEvaluation;
