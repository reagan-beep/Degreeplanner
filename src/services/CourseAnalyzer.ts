// This file will help us analyze courses and prerequisites
// We'll start simple and build up from here

import cpenData from '../data/ce_courses.json';

interface CourseData {
  course: string;
  name: string;
  credits: number;
  prereqs: string;
  semester: string;
  difficulty?: number;
}

interface CompletedCourse {
  code: string;
  credits: number;
}

class CourseAnalyzer {
  private allCourses: CourseData[] = [];
  
  constructor() {
    // We'll load the course data here
    this.loadCourseData();
  }

  // Step 1: Load course data from your scraped JSON
  private loadCourseData() {
    // Get the Computer Engineering courses from your scraped data
    const cpenCourses = cpenData["Computer Engineering"];
    
    // Convert each course to our CourseData format
    this.allCourses = cpenCourses.map(course => ({
      course: course.course,
      name: Array.isArray(course.name) ? course.name[0] : course.name,
      credits: course.credits,
      prereqs: course.prereqs,
      semester: course.semester,
      difficulty: course.difficulty
    }));
    
    console.log(`Loaded ${this.allCourses.length} courses`);
  }

  // Step 2: Check if you can take a specific course
  canTakeCourse(courseCode: string, completedCourses: CompletedCourse[]): { canTake: boolean; message: string } {
    // Find the course in our data
    const course = this.allCourses.find(c => c.course === courseCode);
    if (!course) {
      return { canTake: false, message: `Course ${courseCode} not found` };
    }

    // If no prerequisites, you can take it
    if (!course.prereqs || course.prereqs.trim() === '') {
      return { canTake: true, message: `${courseCode} has no prerequisites - you can take it!` };
    }

    // Get the prerequisite course codes
    const prereqCodes = this.extractCourseCodes(course.prereqs);
    
    // Check if you've completed all prerequisites
    const completedCodes = completedCourses.map(c => c.code);
    const canTake = prereqCodes.every(prereq => completedCodes.includes(prereq));
    
    if (canTake) {
      return { canTake: true, message: `✅ You can take ${courseCode}! Prerequisites met: ${prereqCodes.join(', ')}` };
    } else {
      const missing = prereqCodes.filter(prereq => !completedCodes.includes(prereq));
      return { canTake: false, message: `❌ Cannot take ${courseCode}. Missing prerequisites: ${missing.join(', ')}` };
    }
  }

  // Helper method to get semester order for prerequisite checking
  private getSemesterOrder(): string[] {
    return [
      "First Year Fall",
      "First Year Spring", 
      "Second Year Fall",
      "Second Year Spring",
      "Third Year Fall",
      "Third Year Spring",
      "Fourth Year Fall",
      "Fourth Year Spring"
    ];
  }

  // Helper method to check if a semester comes before another
  private isSemesterBefore(semester1: string, semester2: string): boolean {
    const order = this.getSemesterOrder();
    const index1 = order.indexOf(semester1);
    const index2 = order.indexOf(semester2);
    return index1 < index2;
  }

  // Helper method to extract course codes from prerequisite text
  private extractCourseCodes(prereqText: string): string[] {
    // Look for patterns like "MATH 151", "CSCE 121", etc.
    const courseCodePattern = /([A-Z]{2,4}\s+\d{3})/g;
    const matches = prereqText.match(courseCodePattern) || [];
    
    // Remove duplicates and return
    return [...new Set(matches.map(match => match.trim()))];
  }

  // Step 3: Fill semesters with courses based on prerequisites and completed courses
  fillSemestersWithCourses(
    completedCourses: CompletedCourse[], 
    maxHoursPerSemester: number
  ): { semester: string; courses: CourseData[]; totalCredits: number }[] {
    const results: { semester: string; courses: CourseData[]; totalCredits: number }[] = [];
    const semesterOrder = this.getSemesterOrder();
    
    // Track which courses we've already scheduled
    const scheduledCourses = new Set<string>();
    
    // Add completed courses to scheduled courses
    completedCourses.forEach(course => {
      scheduledCourses.add(course.code);
    });
    
    // Process each semester in order
    for (const semester of semesterOrder) {
      const semesterCourses: CourseData[] = [];
      let totalCredits = 0;
      
      // Get courses that should be taken in this semester
      const coursesForSemester = this.allCourses.filter(course => 
        course.semester === semester && !scheduledCourses.has(course.course)
      );
      
      // Sort courses by priority (easier courses first, core courses first)
      const sortedCourses = coursesForSemester.sort((a, b) => {
        // Core courses first
        const aIsCore = this.isCoreCourse(a.course);
        const bIsCore = this.isCoreCourse(b.course);
        if (aIsCore !== bIsCore) return aIsCore ? -1 : 1;
        
        // Then by difficulty
        return (a.difficulty || 3) - (b.difficulty || 3);
      });
      
      // Add courses to semester until we reach max hours
      for (const course of sortedCourses) {
        // Check if we can take this course (prerequisites met)
        const canTakeResult = this.canTakeCourse(course.course, completedCourses);
        
        if (canTakeResult.canTake && totalCredits + course.credits <= maxHoursPerSemester) {
          semesterCourses.push(course);
          totalCredits += course.credits;
          scheduledCourses.add(course.course);
        }
      }
      
      results.push({
        semester,
        courses: semesterCourses,
        totalCredits
      });
    }
    
    return results;
  }

  // Helper method to check if a course is a core course
  private isCoreCourse(courseCode: string): boolean {
    // Core courses are typically required courses (not electives)
    const corePatterns = [
      /^MATH \d{3}$/,
      /^CSCE \d{3}$/,
      /^ENGL \d{3}$/,
      /^CHEM \d{3}$/,
      /^PHYS \d{3}$/,
      /^ENGR \d{3}$/,
      /^ECEN \d{3}$/
    ];
    
    return corePatterns.some(pattern => pattern.test(courseCode));
  }

  // Step 4: Get prerequisite courses for a specific course
  getPrerequisites(courseCode: string): string[] {
    const course = this.allCourses.find(c => c.course === courseCode);
    if (!course) return [];
    
    return this.extractCourseCodes(course.prereqs);
  }

  // Test method to see if our system works
  testPrerequisiteChecking(): string[] {
    const results: string[] = [];
    
    results.push("🧪 Testing prerequisite checking...");
    results.push(`Total courses loaded: ${this.allCourses.length}`);
    
    // Show first few courses to verify data is loaded
    results.push(`First 3 courses: ${JSON.stringify(this.allCourses.slice(0, 3), null, 2)}`);
    
    // Test with some sample completed courses
    const completedCourses = [
      { code: "MATH 151", credits: 4 },
      { code: "ENGL 104", credits: 3 }
    ];
    
    results.push(`Testing with completed courses: ${JSON.stringify(completedCourses)}`);
    
    // Test a few courses
    const math152Result = this.canTakeCourse("MATH 152", completedCourses);
    results.push(`MATH 152: ${math152Result.message}`);
    
    const csce121Result = this.canTakeCourse("CSCE 121", completedCourses);
    results.push(`CSCE 121: ${csce121Result.message}`);
    
    const csce221Result = this.canTakeCourse("CSCE 221", completedCourses);
    results.push(`CSCE 221: ${csce221Result.message}`);
    
    results.push("✅ Test complete!");
    
    // Test semester filling
    results.push("\n🎯 Testing Semester Filling:");
    const semesterResults = this.fillSemestersWithCourses(completedCourses, 16);
    
    semesterResults.forEach(result => {
      results.push(`\n${result.semester}: ${result.totalCredits} credits`);
      result.courses.forEach(course => {
        results.push(`  - ${course.course}: ${course.name} (${course.credits} credits)`);
      });
    });
    
    return results;
  }
}

// Export a single instance
export default new CourseAnalyzer();
