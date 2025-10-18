import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Download, FileText } from 'lucide-react';

interface TemplateProps {
  major: string;
  onBack: (toHome?: boolean) => void;
}

interface YearPlan {
  year: string;
  fall: string[];
  spring: string[];
}

// Mock template data
const degreeTemplate: YearPlan[] = [
  {
    year: 'Year 1',
    fall: [
      'CSCE 121 - Program Design (3h)',
      'MATH 151 - Calculus I (4h)',
      'ENGL 104 - Composition (3h)',
      'CHEM 107 - Chemistry (4h)',
      'UNIV 101 - First Year Seminar (1h)',
    ],
    spring: [
      'CSCE 221 - Data Structures (3h)',
      'MATH 152 - Calculus II (4h)',
      'PHYS 206 - Physics I (3h)',
      'HIST 105 - US History (3h)',
      'Elective (3h)',
    ],
  },
  {
    year: 'Year 2',
    fall: [
      'CSCE 222 - Discrete Math (3h)',
      'CSCE 312 - Computer Organization (4h)',
      'MATH 304 - Linear Algebra (3h)',
      'PHYS 207 - Physics II (3h)',
      'COMM 203 - Public Speaking (3h)',
    ],
    spring: [
      'CSCE 310 - Database Systems (3h)',
      'CSCE 314 - Programming Languages (3h)',
      'CSCE 315 - Software Engineering (3h)',
      'STAT 211 - Statistics (3h)',
      'Elective (3h)',
    ],
  },
  {
    year: 'Year 3',
    fall: [
      'CSCE 411 - Algorithm Design (3h)',
      'CSCE 410 - Operating Systems (3h)',
      'CSCE Elective (3h)',
      'Technical Elective (3h)',
      'General Elective (3h)',
    ],
    spring: [
      'CSCE 433 - Formal Languages (3h)',
      'CSCE Elective (3h)',
      'CSCE Elective (3h)',
      'Technical Elective (3h)',
      'General Elective (3h)',
    ],
  },
  {
    year: 'Year 4',
    fall: [
      'CSCE 482 - Senior Design I (3h)',
      'CSCE Elective (3h)',
      'CSCE Elective (3h)',
      'Technical Elective (3h)',
      'General Elective (3h)',
    ],
    spring: [
      'CSCE 483 - Senior Design II (3h)',
      'CSCE Elective (3h)',
      'Technical Elective (3h)',
      'General Elective (3h)',
      'General Elective (3h)',
    ],
  },
];

function Template({ major, onBack }: TemplateProps) {
  const getTotalCredits = (courses: string[]) => {
    return courses.reduce((sum, course) => {
      const match = course.match(/\((\d+)h\)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
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
          <div className="text-center flex-1">
            <h1 className="text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Degree Template
            </h1>
            <p className="text-muted-foreground">{major}</p>
          </div>
          <Button variant="outline" className="font-[Open_Sans]">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-[#800000] font-[Passion_One]">Standard 4-Year Plan</h2>
              <p className="text-sm text-muted-foreground">
                This is a suggested course sequence. Adjust based on your needs and prerequisites.
              </p>
            </div>
          </div>
          <Badge variant="secondary">120 Total Credits Required</Badge>
        </div>

        <div className="space-y-6">
          {degreeTemplate.map((yearPlan) => (
            <div key={yearPlan.year} className="space-y-4">
              <h2 className="text-center text-[#800000] font-[Passion_One]">{yearPlan.year}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#800000] font-[Passion_One]">Fall Semester</CardTitle>
                      <Badge>{getTotalCredits(yearPlan.fall)} hours</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {yearPlan.fall.map((course, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm p-2 rounded hover:bg-secondary/50 transition-colors"
                        >
                          <span className="text-muted-foreground mt-0.5">•</span>
                          <span>{course}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#800000] font-[Passion_One]">Spring Semester</CardTitle>
                      <Badge>{getTotalCredits(yearPlan.spring)} hours</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {yearPlan.spring.map((course, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm p-2 rounded hover:bg-secondary/50 transition-colors"
                        >
                          <span className="text-muted-foreground mt-0.5">•</span>
                          <span>{course}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="mb-3 text-[#800000] font-[Passion_One]">Important Notes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>Prerequisites must be completed before enrolling in subsequent courses</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Elective courses can be chosen based on your area of interest</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Some courses may only be offered in specific semesters</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Consult with your academic advisor before finalizing your schedule</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Template;
