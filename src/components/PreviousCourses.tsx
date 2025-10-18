import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Course {
  code: string;
  timestamp: number;
}

interface TransferCourse {
  code: string;
  hours: string;
  timestamp: number;
}

interface PreviousCoursesProps {
  major: string;
  onBack: (toHome?: boolean) => void;
}

function PreviousCourses({ major, onBack }: PreviousCoursesProps) {
  const [tamuCourses, setTamuCourses] = useState<Course[]>([]);
  const [transferCourses, setTransferCourses] = useState<TransferCourse[]>([]);
  const [newTamuCourse, setNewTamuCourse] = useState({ code: '' });
  const [newTransferCourse, setNewTransferCourse] = useState({ code: '', hours: '' });

  const handleAddTamuCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTamuCourse.code.trim()) {
      const timestamp = Date.now();
      setTamuCourses([...tamuCourses, { ...newTamuCourse, timestamp }]);
      setNewTamuCourse({ code: '' });
      toast.success(`Added ${newTamuCourse.code} to TAMU courses`);
    }
  };

  const handleAddTransferCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransferCourse.code.trim() && newTransferCourse.hours.trim()) {
      const timestamp = Date.now();
      setTransferCourses([...transferCourses, { ...newTransferCourse, timestamp }]);
      setNewTransferCourse({ code: '', hours: '' });
      toast.success(`Added ${newTransferCourse.code} to transfer courses`);
    }
  };

  const handleRemoveTamuCourse = (index: number) => {
    setTamuCourses(tamuCourses.filter((_, i) => i !== index));
    toast.info('Course removed');
  };

  const handleRemoveTransferCourse = (index: number) => {
    setTransferCourses(transferCourses.filter((_, i) => i !== index));
    toast.info('Course removed');
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
        <div className="text-center space-y-2">
          <h1 className="text-5xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Previous Courses
          </h1>
          <p className="text-muted-foreground">For {major}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* TAMU Courses Section */}
          <Card>
            <CardHeader>
              <CardTitle>TAMU Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddTamuCourse} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="tamu-code">Course Code</Label>
                  <Input
                    id="tamu-code"
                    placeholder="e.g., CSCE 121"
                    value={newTamuCourse.code}
                    onChange={(e) => setNewTamuCourse({ code: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full font-[Open_Sans]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </form>

              <div className="space-y-2 mt-6">
                {tamuCourses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No TAMU courses added yet</p>
                ) : (
                  tamuCourses.map((course, index) => (
                    <div
                      key={course.timestamp}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{course.code}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTamuCourse(index)}
                        className="font-[Open_Sans]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transfer Courses Section */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddTransferCourse} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="transfer-code">Course Code</Label>
                  <Input
                    id="transfer-code"
                    placeholder="e.g., CS 101"
                    value={newTransferCourse.code}
                    onChange={(e) => setNewTransferCourse({ ...newTransferCourse, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-hours">Credit Hours</Label>
                  <Input
                    id="transfer-hours"
                    type="number"
                    placeholder="e.g., 3"
                    min="1"
                    max="5"
                    value={newTransferCourse.hours}
                    onChange={(e) => setNewTransferCourse({ ...newTransferCourse, hours: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full font-[Open_Sans]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </form>

              <div className="space-y-2 mt-6">
                {transferCourses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No transfer courses added yet</p>
                ) : (
                  transferCourses.map((course, index) => (
                    <div
                      key={course.timestamp}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{course.code}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-sm">{course.hours} credit hours</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTransferCourse(index)}
                        className="font-[Open_Sans]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => onBack()} variant="outline" size="lg" className="font-[Open_Sans]">
            Back to Options
          </Button>
          <Button onClick={() => onBack(true)} variant="outline" size="lg" className="font-[Open_Sans]">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PreviousCourses;
