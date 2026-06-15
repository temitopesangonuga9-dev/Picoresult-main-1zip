import React, { useState, useEffect, useRef } from "react";
import { Database, getDatabase } from "./data";
import LandingPage from "./components/LandingPage";
import AdminPortal from "./components/AdminPortal";
import TeacherPortal from "./components/TeacherPortal";
import StudentPortal from "./components/StudentPortal";
import ReportCard from "./components/ReportCard";
import { syncDatabase, saveDatabaseToFirestore } from "./lib/dbSync";

export default function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncFailed, setSyncFailed] = useState(false);
  const syncFailedRef = useRef(syncFailed);
  syncFailedRef.current = syncFailed;

  const [userRole, setUserRole] = useState<"landing" | "admin" | "teacher" | "student">("landing");
  const [userId, setUserId] = useState<string>("");
  const [reportView, setReportView] = useState<{
    studentId: string;
    session: string;
    term: string;
  } | null>(null);

  useEffect(() => {
    const unsub = syncDatabase((syncedDb) => {
      const hasAnyData = (syncedDb.students && syncedDb.students.length > 0) ||
                         (syncedDb.classes && syncedDb.classes.length > 0) ||
                         (syncedDb.schoolSettings && syncedDb.schoolSettings.schoolName);

      if (!hasAnyData) {
        const seeded = getDatabase();
        if (!syncFailedRef.current) {
          saveDatabaseToFirestore(seeded);
        }
        setDb(seeded);
      } else {
        setDb(syncedDb);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync error:", error);
      setSyncFailed(true);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLoginSuccess = (role: "admin" | "teacher" | "student", id: string) => {
    setUserRole(role);
    setUserId(id);
    setReportView(null);
  };

  const handleLogout = () => {
    setUserRole("landing");
    setUserId("");
    setReportView(null);
  };

  const handleUpdateDb = async (newDb: Database) => {
    const oldDb = db;
    setDb(newDb);
    try {
      await saveDatabaseToFirestore(newDb, oldDb ?? undefined);
      setSyncFailed(false);
    } catch (error: any) {
      console.error("Failed to save to Firestore:", error);
      setSyncFailed(true);
    }
  };

  // Back from printing goes back to student portal or whichever active portal trigger
  const handleBackToPortal = () => {
    setReportView(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!db) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Failed to load application data. Please check your network or refresh the page.</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans tracking-tight antialiased">
      {syncFailed && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center text-xs font-bold py-2 px-4 shadow-lg">
          ⚠ Cloud save failed — check your internet connection. Changes may not be saved. Refresh to retry.
        </div>
      )}
      {reportView ? (
        <ReportCard
          studentId={reportView.studentId}
          session={reportView.session}
          term={reportView.term}
          db={db}
          onBack={handleBackToPortal}
        />
      ) : (
        <>
          {userRole === "landing" && (
            <LandingPage db={db} onLoginSuccess={handleLoginSuccess} />
          )}

          {userRole === "admin" && (
            <AdminPortal db={db} onUpdateDb={handleUpdateDb} onLogout={handleLogout} />
          )}

          {userRole === "teacher" && (
            <TeacherPortal
              teacherId={userId}
              db={db}
              onUpdateDb={handleUpdateDb}
              onLogout={handleLogout}
            />
          )}

          {userRole === "student" && (
            <StudentPortal
              studentId={userId}
              db={db}
              onLogout={handleLogout}
              onUpdateDb={handleUpdateDb}
              onViewReport={(session, term) =>
                setReportView({ studentId: userId, session, term })
              }
            />
          )}
        </>
      )}
    </div>
  );
}
