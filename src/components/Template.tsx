// we can probably delete this

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import cpenData from '../data/ce_courses.json';

interface TemplateProps {
  major: string;
  onBack: (toHome?: boolean) => void;
  onCourseCompleted?: (course: string) => void;
  onCourseUnchecked?: (course: string) => void;
  checkedCourses?: Set<string>;
}

interface YearPlan {
  year: string;
  fall: string[];
  spring: string[];
}

// Convert CPEN data to template format
const convertCpenToTemplate = (): YearPlan[] => {
  const cpenCourses = cpenData["Computer Engineering"];
  const yearPlans: { [key: string]: { fall: string[], spring: string[] } } = {};

  cpenCourses.forEach((course) => {
    const semesterKey = course.semester;
    
    // Extract year from semester
    let year = "";
    if (semesterKey.includes("First Year")) year = "Year 1";
    else if (semesterKey.includes("Second Year")) year = "Year 2";
    else if (semesterKey.includes("Third Year")) year = "Year 3";
    else if (semesterKey.includes("Fourth Year")) year = "Year 4";

    if (!yearPlans[year]) {
      yearPlans[year] = { fall: [], spring: [] };
    }

    // Format course string
    let courseCode = course.course;
    if (course.course.includes("University Core Curriculum")) {
      courseCode = "UCC Elective";
    } else if (course.course.includes("Senior design")) {
      courseCode = "Senior Design";
    }

    const courseString = `${courseCode} - ${course.name || courseCode} (${course.credits}h)`;
    
    if (semesterKey.includes("Fall")) {
      yearPlans[year].fall.push(courseString);
    } else if (semesterKey.includes("Spring")) {
      yearPlans[year].spring.push(courseString);
    }
  });

  // Convert to array format
  return Object.entries(yearPlans).map(([year, courses]) => ({
    year,
    fall: courses.fall,
    spring: courses.spring
  }));
};

const degreeTemplate: YearPlan[] = convertCpenToTemplate();

function Template({ major, onBack, onCourseCompleted, onCourseUnchecked, checkedCourses = new Set() }: TemplateProps) {

  const getTotalCredits = (courses: string[]) => {
    return courses.reduce((sum, course) => {
      const match = course.match(/\((\d+)h\)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
  };

  const handleCourseCheck = (course: string, checked: boolean) => {
    if (checked) {
      onCourseCompleted?.(course);
      toast.success(`Added ${course} to previous courses`);
    } else {
      onCourseUnchecked?.(course);
      toast.info(`Removed ${course} from previous courses`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => onBack()} className="font-[Open_Sans]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Degree Template
            </h1>
            <p className="text-muted-foreground">{major}</p>
          </div>
          <Button variant="outline" className="font-[Open_Sans]">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2>Standard 4-Year Plan</h2>
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
              <h2 className="text-center">{yearPlan.year}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Fall Semester</CardTitle>
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
                          <Checkbox
                            id={`fall-${yearPlan.year}-${index}`}
                            checked={checkedCourses.has(course)}
                            onCheckedChange={(checked) => handleCourseCheck(course, checked as boolean)}
                            className="mt-0.5"
                          />
                          <label 
                            htmlFor={`fall-${yearPlan.year}-${index}`}
                            className={`flex-1 cursor-pointer ${checkedCourses.has(course) ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {course}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Spring Semester</CardTitle>
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
                          <Checkbox
                            id={`spring-${yearPlan.year}-${index}`}
                            checked={checkedCourses.has(course)}
                            onCheckedChange={(checked) => handleCourseCheck(course, checked as boolean)}
                            className="mt-0.5"
                          />
                          <label 
                            htmlFor={`spring-${yearPlan.year}-${index}`}
                            className={`flex-1 cursor-pointer ${checkedCourses.has(course) ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {course}
                          </label>
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
          <h3 className="mb-3">Important Notes</h3>
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
