import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Search, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
  onBack: (toHome?: boolean) => void;
}

// Mock course data
const mockCourses: Course[] = [
  {
    code: 'CSCE 121',
    name: 'Program Design and Concepts',
    hours: 3,
    description: 'Computational problem-solving techniques using the C++ programming language.',
    prerequisites: 'None',
    category: 'Core',
  },
  {
    code: 'CSCE 221',
    name: 'Data Structures and Algorithms',
    hours: 3,
    description: 'Specification, implementation, applications and analysis of basic data structures.',
    prerequisites: 'CSCE 121',
    category: 'Core',
  },
  {
    code: 'CSCE 310',
    name: 'Database Systems',
    hours: 3,
    description: 'Database design, implementation, and applications.',
    prerequisites: 'CSCE 221',
    category: 'Core',
  },
  {
    code: 'CSCE 312',
    name: 'Computer Organization',
    hours: 4,
    description: 'Computer organization, machine language, instruction execution.',
    prerequisites: 'CSCE 221',
    category: 'Core',
  },
  {
    code: 'CSCE 314',
    name: 'Programming Languages',
    hours: 3,
    description: 'Concepts of programming languages, paradigms, and language implementation.',
    prerequisites: 'CSCE 221',
    category: 'Core',
  },
  {
    code: 'CSCE 315',
    name: 'Programming Studio',
    hours: 3,
    description: 'Intensive software engineering group project.',
    prerequisites: 'CSCE 221',
    category: 'Core',
  },
  {
    code: 'CSCE 411',
    name: 'Design and Analysis of Algorithms',
    hours: 3,
    description: 'Analysis and design of computer algorithms.',
    prerequisites: 'CSCE 221, MATH 304',
    category: 'Core',
  },
  {
    code: 'CSCE 433',
    name: 'Formal Languages and Automata',
    hours: 3,
    description: 'Formal languages and automata theory.',
    prerequisites: 'CSCE 222',
    category: 'Elective',
  },
  {
    code: 'CSCE 431',
    name: 'Software Engineering',
    hours: 3,
    description: 'Application of engineering principles to software development.',
    prerequisites: 'CSCE 315',
    category: 'Elective',
  },
  {
    code: 'CSCE 462',
    name: 'Microcomputer Systems',
    hours: 4,
    description: 'Design and application of microprocessor-based systems.',
    prerequisites: 'CSCE 312',
    category: 'Elective',
  },
];

function CourseList({ major, onBack }: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Helper function to generate anex.us URL for a course
  const getAnexUrl = (courseCode: string) => {
    // Convert course code to anex.us format (e.g., "CSCE 121" -> "CSCE-121")
    const formattedCode = courseCode.replace(/\s+/g, '-');
    return `https://anex.us/grades/?dept=${formattedCode.split('-')[0]}&number=${formattedCode.split('-')[1]}`;
  };

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight text-[rgba(85,0,0,0.98)] font-[Passion_One] font-bold italic">
            Course Catalog
          </h1>
          <p className="text-muted-foreground">{major}</p>
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
                <SelectItem value="Elective">Elective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {mockCourses.length} courses
          </p>
        </div>

        <div className="grid gap-4">
          <TooltipProvider>
            {filteredCourses.map((course) => (
              <Tooltip key={course.code} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {course.code}
                            <Badge variant={course.category === 'Core' ? 'default' : 'secondary'}>
                              {course.category}
                            </Badge>
                            <a 
                              href={getAnexUrl(course.code)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
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
                </TooltipTrigger>
                <TooltipContent side="right" className="w-96 h-64 p-1">
                  <div className="w-full h-full">
                    <div className="text-sm font-medium mb-2 p-2">
                      Grade Distribution for {course.code}
                    </div>
                    <iframe
                      src={getAnexUrl(course.code)}
                      className="w-full h-48 border-0 rounded"
                      title={`Grade distribution for ${course.code}`}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
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
