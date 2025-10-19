import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import coreCurriculumData from '../data/core_curriculum.json';
import mathMinorData from '../data/math_minor_courses.json';

interface DegreeEvaluationProps {
  major: string;
  minor?: string;
  certificate?: string;
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
  alternatives: any[];
}

function DegreeEvaluation({ major, minor, certificate, completedCourses, onBack }: DegreeEvaluationProps) {
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

    const mathMinorCourses = mathMinorData["Math Minor"];
    return mathMinorCourses.map(minorCourse => {
      const requiredHours = minorCourse.credits;
      const availableCourses = minorCourse.alternatives ? 
        minorCourse.alternatives.map(alt => alt.course) : 
        [minorCourse.course];
      
      // Find completed courses in this minor requirement
      const completedInMinor = completedCourseCodes.filter(courseCode => 
        availableCourses.includes(courseCode)
      );
      
      // Calculate completed hours
      const completedHours = completedInMinor.reduce((total, courseCode) => {
        const course = minorCourse.alternatives?.find(alt => alt.course === courseCode);
        return total + (course ? course.credits : minorCourse.credits);
      }, 0);
      
      const remainingHours = Math.max(0, requiredHours - completedHours);
      const percentage = Math.min(100, (completedHours / requiredHours) * 100);
      
      return {
        course: minorCourse.course,
        required: requiredHours,
        completed: completedHours,
        remaining: remainingHours,
        percentage,
        completedCourses: completedInMinor,
        availableCourses,
        alternatives: minorCourse.alternatives || []
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

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => onBack()} className="font-[Open_Sans]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Degree Evaluation
            </h1>
            <p className="text-muted-foreground">University Core Curriculum Progress</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Core Curriculum Progress</span>
              <Badge variant="secondary">
                {totalCompleted}/{totalRequired} hours completed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{overallPercentage.toFixed(1)}%</span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${getOverallProgressBgColor()}`}>
                  <div 
                    className={`h-full transition-all duration-300 ${getOverallProgressColor()}`}
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
                  <div className="text-sm text-muted-foreground">Completed Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{totalRemaining}</div>
                  <div className="text-sm text-muted-foreground">Remaining Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalRequired}</div>
                  <div className="text-sm text-muted-foreground">Total Required</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minor Progress */}
        {minor && minor.toLowerCase().includes('math') && minorProgress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Math Minor Progress</span>
                <Badge variant="secondary">
                  {minorTotalCompleted}/{minorTotalRequired} hours completed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{minorOverallPercentage.toFixed(1)}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${
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
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{minorTotalCompleted}</div>
                    <div className="text-sm text-muted-foreground">Completed Hours</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{minorTotalRemaining}</div>
                    <div className="text-sm text-muted-foreground">Remaining Hours</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{minorTotalRequired}</div>
                    <div className="text-sm text-muted-foreground">Total Required</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        <div className="grid gap-4">
          {categoryProgress.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(category)}
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(category)}>
                      {getStatusText(category)}
                    </Badge>
                    <Badge variant="outline">
                      {category.completed}/{category.required} hours
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{category.percentage.toFixed(1)}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${getProgressBarBgColor(category)}`}>
                      <div 
                        className={`h-full transition-all duration-300 ${getProgressBarColor(category)}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {category.completedCourses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">Completed Courses:</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.completedCourses.map((course) => (
                          <Badge key={course} variant="secondary" className="bg-green-100 text-green-800">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {category.remaining > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">
                        Still Need: {category.remaining} hours
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Consider taking courses from this category to complete your core curriculum requirements.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Minor Course Breakdown */}
        {minor && minor.toLowerCase().includes('math') && minorProgress.length > 0 && (
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Math Minor Requirements</h2>
            {minorProgress.map((minorCourse) => (
              <Card key={minorCourse.course}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {minorCourse.completed >= minorCourse.required ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : minorCourse.completed > 0 ? (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <CardTitle className="text-lg">{minorCourse.course}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        minorCourse.completed >= minorCourse.required ? 'bg-green-100 text-green-800' :
                        minorCourse.completed > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }>
                        {minorCourse.completed >= minorCourse.required ? 'Complete' :
                         minorCourse.completed > 0 ? 'In Progress' : 'Not Started'}
                      </Badge>
                      <Badge variant="outline">
                        {minorCourse.completed}/{minorCourse.required} hours
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{minorCourse.percentage.toFixed(1)}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
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
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2">Completed Courses:</h4>
                        <div className="flex flex-wrap gap-2">
                          {minorCourse.completedCourses.map((course) => (
                            <Badge key={course} variant="secondary" className="bg-green-100 text-green-800">
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {minorCourse.remaining > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2">
                          Still Need: {minorCourse.remaining} hours
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Consider taking courses from the available alternatives to complete this minor requirement.
                        </p>
                        {minorCourse.alternatives.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-blue-700 mb-1">Available Options:</h5>
                            <div className="flex flex-wrap gap-1">
                              {minorCourse.alternatives.map((alt, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {alt.course}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                You have completed <strong>{totalCompleted}</strong> out of <strong>{totalRequired}</strong> required 
                University Core Curriculum hours.
              </p>
              {totalRemaining > 0 ? (
                <p className="text-sm text-red-600">
                  You still need <strong>{totalRemaining}</strong> more hours to complete your core curriculum requirements.
                </p>
              ) : (
                <p className="text-sm text-green-600">
                  <strong>Congratulations!</strong> You have completed all University Core Curriculum requirements.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DegreeEvaluation;
