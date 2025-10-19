import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import cpenData from '../data/ce_courses.json';
import mathMinorData from '../data/math_minor_courses.json';

interface Course {
  code: string;
  name: string;
  hours: number;
  description: string;
  prerequisites: string;
  category: string;
}

interface CourseListProps {
  major: string;
  minor?: string;
  certificate?: string;
  onBack: (toHome?: boolean) => void;
}

// Convert CPEN data to Course format
const convertCpenToCourses = (): Course[] => {
  const cpenCourses = cpenData["Computer Engineering"];
  return cpenCourses.map((course, index) => {
    let courseCode = course.course;
    let courseName = course.name;
    
    if (course.course.includes("University Core Curriculum")) {
      courseCode = "UCC Elective";
      courseName = "University Core Curriculum";
    } else if (course.course.includes("Senior design")) {
      courseCode = "Senior Design";
      courseName = "Senior Design Project";
    }

    return {
      code: courseCode,
      name: Array.isArray(courseName) ? courseName[0] : (courseName || courseCode),
      hours: course.credits,
      description: course.prereqs || "No prerequisites listed",
      prerequisites: course.prereqs || "None",
      category: "Core"
    };
  });
};

// Convert Math Minor data to Course format
const convertMathMinorToCourses = (): Course[] => {
  const mathCourses = mathMinorData["Math Minor"];
  return mathCourses.map((course, index) => {
    let courseCode = course.course;
    let courseName = course.name;
    
    if (course.alternatives && course.alternatives.length > 0) {
      // Use the first alternative as the main course
      const mainCourse = course.alternatives[0];
      courseCode = mainCourse.course;
      courseName = Array.isArray(mainCourse.name) ? mainCourse.name[0] : mainCourse.name;
    }

    return {
      code: courseCode,
      name: Array.isArray(courseName) ? courseName[0] : (courseName || courseCode),
      hours: course.credits,
      description: course.note || course.prereqs || "No description available",
      prerequisites: course.prereqs || "None",
      category: "Minor"
    };
  });
};

const cpenCourses = convertCpenToCourses();
const mathMinorCourses = convertMathMinorToCourses();

function CourseList({ major, minor, certificate, onBack }: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Determine which courses to show based on major and minor
  let coursesToShow: Course[] = [];
  let sectionTitle = "";
  
  if (major.toLowerCase().includes('computer engineering')) {
    coursesToShow = cpenCourses;
    sectionTitle = "Computer Engineering Major Courses";
  }
  
  if (minor && minor.toLowerCase().includes('math')) {
    coursesToShow = [...coursesToShow, ...mathMinorCourses];
    sectionTitle = coursesToShow.length > mathMinorCourses.length ? 
      `${sectionTitle} & Math Minor Courses` : "Math Minor Courses";
  }

  const filteredCourses = coursesToShow.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

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
              Course Catalog
            </h1>
            <p className="text-muted-foreground">{major}</p>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Minor">Minor</SelectItem>
                <SelectItem value="Elective">Elective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {coursesToShow.length} courses
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{sectionTitle}</h2>
        </div>

        <div className="grid gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.code}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {course.code}
                      <Badge variant={course.category === 'Core' ? 'default' : 'secondary'}>
                        {course.category}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{course.name}</p>
                  </div>
                  <Badge variant="outline">{course.hours} hours</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{course.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Prerequisites:</span>
                  <span>{course.prerequisites}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseList;
