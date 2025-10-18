import React, { useState } from "react";
import Welcome from "./components/Welcome";
import DegreePlanner from "./components/DegreePlanner";
import CourseList from "./components/CourseList";
import Template from "./components/Template";
import PreviousCourses from "./components/PreviousCourses";
import { Toaster } from "./components/ui/sonner";

type Page =
  | "welcome"
  | "semester"
  | "courses"
  | "template"
  | "previous";
type WelcomeState = "initial" | "options";

interface PageData {
  major: string;
  maxHours?: string;
  currentYear?: string;
}

function App() {
  const [page, setPage] = useState<Page>("welcome");
  const [welcomeState, setWelcomeState] =
    useState<WelcomeState>("initial");
  const [lastMajor, setLastMajor] = useState("");

  const handleBack = (toHome = false) => {
    if (toHome) {
      setPage("welcome");
      setWelcomeState("initial");
    } else {
      setPage("welcome");
      setWelcomeState("options");
    }
  };

  const handleGoToSemester = (data: PageData) => {
    setLastMajor(data.major);
    setPage("semester");
  };

  const handleGoToCourse = (data: PageData) => {
    setLastMajor(data.major);
    setPage("courses");
  };

  const handleGoToTemplate = (data: PageData) => {
    setLastMajor(data.major);
    setPage("template");
  };

  const handleGoToPrevious = (data: PageData) => {
    setLastMajor(data.major);
    setPage("previous");
  };

  return (
    <>
      {page === "welcome" && (
        <Welcome
          onGoToSemester={handleGoToSemester}
          onGoToCourse={handleGoToCourse}
          onGoToTemplate={handleGoToTemplate}
          onGoToPrevious={handleGoToPrevious}
          welcomeState={welcomeState}
          setWelcomeState={setWelcomeState}
          lastMajor={lastMajor}
        />
      )}

      {page === "semester" && (
        <DegreePlanner major={lastMajor} onBack={handleBack} />
      )}

      {page === "courses" && (
        <CourseList major={lastMajor} onBack={handleBack} />
      )}

      {page === "template" && (
        <Template major={lastMajor} onBack={handleBack} />
      )}

      {page === "previous" && (
        <PreviousCourses
          major={lastMajor}
          onBack={handleBack}
        />
      )}

      <Toaster />
    </>
  );
}

export default App;