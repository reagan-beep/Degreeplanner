import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, GripVertical, Plus } from 'lucide-react';

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
];

function DegreePlanner({ major, onBack }: DegreePlannerProps) {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);

  const getTotalHours = (courses: Course[]) => {
    return courses.reduce((sum, course) => sum + course.hours, 0);
  };

  const getTotalCredits = () => {
    return semesters.reduce((sum, semester) => sum + getTotalHours(semester.courses), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => onBack()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Degree Planner
            </h1>
            <p className="text-muted-foreground">{major}</p>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Progress Overview</h2>
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
                  <CardTitle>{semester.name}</CardTitle>
                  <Badge>{getTotalHours(semester.courses)} hours</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {semester.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{course.code}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm">{course.name}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{course.hours}h</Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Semester
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DegreePlanner;
