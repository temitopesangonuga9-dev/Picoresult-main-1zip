import { collection, doc, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { db as firestoreDb } from "./firebase";
import { Database } from "../data";

// List of collections that correspond to Database arrays
const ARRAY_COLLECTIONS = [
  "admins",
  "students",
  "classes",
  "subjects",
  "teachers",
  "scores",
  "affectiveTraits",
  "psychomotorSkills",
  "subjectAssignments",
  "classTeacherAssignments",
  "scoreComponents"
];

export const syncDatabase = (onUpdate: (db: Database) => void, onError: (err: any) => void) => {
  const currentDb: Partial<Database> = {
    admins: [],
    students: [],
    classes: [],
    subjects: [],
    teachers: [],
    scores: [],
    affectiveTraits: [],
    psychomotorSkills: [],
    subjectAssignments: [],
    classTeacherAssignments: [],
    scoreComponents: [],
    sessions: [],
    terms: [],
    schoolSettings: {} as any,
    reportCardLayout: {} as any,
  };

  let loadedCollections = 0;
  const totalCollectionsCount = ARRAY_COLLECTIONS.length + 1; // arrays + settings/main
  const unsubs: (() => void)[] = [];
  let isFullyInitialized = false;

  const emit = () => onUpdate({ ...currentDb } as Database);

  const checkAndEmit = () => {
    if (loadedCollections >= totalCollectionsCount) {
      isFullyInitialized = true;
      emit();
    }
  };

  // Listen to array collections
  ARRAY_COLLECTIONS.forEach((colName) => {
    const unsub = onSnapshot(collection(firestoreDb, colName), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data() }));
      (currentDb as any)[colName] = items;
      
      if (isFullyInitialized) {
        emit();
      } else {
        loadedCollections++;
        checkAndEmit();
      }
    }, (err) => {
      console.error(`Sync error on collection ${colName}:`, err);
      onError(err);
    });
    unsubs.push(unsub);
  });

  // Listen to settings
  const unsubSettings = onSnapshot(doc(firestoreDb, "settings", "main"), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      currentDb.sessions = data.sessions || [];
      currentDb.terms = data.terms || [];
      currentDb.schoolSettings = data.schoolSettings || {} as any;
      currentDb.reportCardLayout = data.reportCardLayout || {} as any;
    }

    if (isFullyInitialized) {
      emit();
    } else {
      loadedCollections++;
      checkAndEmit();
    }
  }, (err) => {
    console.error(`Sync error on settings/main:`, err);
    onError(err);
  });
  unsubs.push(unsubSettings);

  return () => unsubs.forEach(unsub => unsub());
};

const getDocId = (colName: string, item: any): string => {
  if (colName === "scores") {
    return `${item.studentId}_${item.subjectId}_${item.session}_${item.term}`.replace(/\//g, "-");
  }
  if (colName === "affectiveTraits" || colName === "psychomotorSkills") {
    return `${item.studentId}_${item.session}_${item.term}`.replace(/\//g, "-");
  }
  return item.id || "";
};

export const saveDatabaseToFirestore = async (newDb: Database, oldDb?: Database) => {
  // Save settings doc
  await setDoc(doc(firestoreDb, "settings", "main"), {
    sessions: newDb.sessions,
    terms: newDb.terms,
    schoolSettings: newDb.schoolSettings,
    reportCardLayout: newDb.reportCardLayout,
  });

  const saveCollection = async (colName: string, newItems: any[], oldItems: any[] = []) => {
    if (!newItems) return;

    // Diff old vs new to find deleted items — no getDocs needed
    const newIds = new Set(newItems.map(item => getDocId(colName, item)));
    const deletedIds = oldItems
      .map(item => getDocId(colName, item))
      .filter(id => id && !newIds.has(id));

    // Batch delete removed items
    for (let i = 0; i < deletedIds.length; i += 500) {
      const batch = writeBatch(firestoreDb);
      deletedIds.slice(i, i + 500).forEach(id => {
        batch.delete(doc(firestoreDb, colName, id));
      });
      await batch.commit();
    }

    // Batch write all new/updated items
    for (let i = 0; i < newItems.length; i += 500) {
      const batch = writeBatch(firestoreDb);
      newItems.slice(i, i + 500).forEach(item => {
        const docId = getDocId(colName, item);
        if (docId) batch.set(doc(firestoreDb, colName, docId), item);
      });
      await batch.commit();
    }
  };

  await Promise.all([
    saveCollection("admins", newDb.admins, oldDb?.admins),
    saveCollection("students", newDb.students, oldDb?.students),
    saveCollection("classes", newDb.classes, oldDb?.classes),
    saveCollection("subjects", newDb.subjects, oldDb?.subjects),
    saveCollection("teachers", newDb.teachers, oldDb?.teachers),
    saveCollection("scores", newDb.scores, oldDb?.scores),
    saveCollection("affectiveTraits", newDb.affectiveTraits, oldDb?.affectiveTraits),
    saveCollection("psychomotorSkills", newDb.psychomotorSkills, oldDb?.psychomotorSkills),
    saveCollection("subjectAssignments", newDb.subjectAssignments, oldDb?.subjectAssignments),
    saveCollection("classTeacherAssignments", newDb.classTeacherAssignments, oldDb?.classTeacherAssignments),
    saveCollection("scoreComponents", newDb.scoreComponents || [], oldDb?.scoreComponents),
  ]);
};
