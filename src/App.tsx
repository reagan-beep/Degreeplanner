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
  minor?: string;
  certificate?: string;
  maxHours?: number;
  currentYear?: string;
  currentSemester?: string;
}

function App() {
  const [page, setPage] = useState<Page>("welcome");
  const [welcomeState, setWelcomeState] =
    useState<WelcomeState>("initial");
  const [lastMajor, setLastMajor] = useState("");
  const [lastMinor, setLastMinor] = useState("");
  const [lastCertificate, setLastCertificate] = useState("");
  const [lastMaxHours, setLastMaxHours] = useState<number>(16);
  const [lastCurrentYear, setLastCurrentYear] = useState<string>("Freshman");
  const [lastCurrentSemester, setLastCurrentSemester] = useState<string>("1st Semester");

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
    setLastMinor(data.minor || "");
    setLastCertificate(data.certificate || "");
    setLastMaxHours(data.maxHours || 16);
    setLastCurrentYear(data.currentYear || "Freshman");
    setLastCurrentSemester(data.currentSemester || "1st Semester");
    setPage("semester");
  };

  const handleGoToCourse = (data: PageData) => {
    setLastMajor(data.major);
    setLastMinor(data.minor || "");
    setLastCertificate(data.certificate || "");
    setLastMaxHours(data.maxHours || 16);
    setLastCurrentYear(data.currentYear || "Freshman");
    setLastCurrentSemester(data.currentSemester || "1st Semester");
    setPage("courses");
  };

  const handleGoToTemplate = (data: PageData) => {
    setLastMajor(data.major);
    setLastMinor(data.minor || "");
    setLastCertificate(data.certificate || "");
    setLastMaxHours(data.maxHours || 16);
    setLastCurrentYear(data.currentYear || "Freshman");
    setLastCurrentSemester(data.currentSemester || "1st Semester");
    setPage("template");
  };

  const handleGoToPrevious = (data: PageData) => {
    setLastMajor(data.major);
    setLastMinor(data.minor || "");
    setLastCertificate(data.certificate || "");
    setLastMaxHours(data.maxHours || 16);
    setLastCurrentYear(data.currentYear || "Freshman");
    setLastCurrentSemester(data.currentSemester || "1st Semester");
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
        <DegreePlanner 
          major={lastMajor} 
          minor={lastMinor}
          certificate={lastCertificate}
          maxHours={lastMaxHours}
          currentYear={lastCurrentYear}
          currentSemester={lastCurrentSemester}
          onBack={handleBack}
        />
      )}

      {page === "courses" && (
        <CourseList major={lastMajor} minor={lastMinor} onBack={handleBack} />
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