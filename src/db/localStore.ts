import fs from 'node:fs';
import path from 'node:path';

export interface StoredUser {
  id: number;
  uid: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  className: string;
  passwordHash: string | null;
  accessPin: string | null;
  createdAt: Date;
}

export interface StoredSchoolSettings {
  id: number;
  schoolName: string;
  examTheme: string;
  academicYear: string;
  footerText: string;
  updatedAt: Date;
}

export interface StoredQuestion {
  id: number;
  teacherId: number;
  subject: string;
  type: string;
  prompt: string;
  imageData: string | null;
  optionsJson: string | null;
  correctAnswer: string;
  points: number;
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredExam {
  id: number;
  teacherId: number;
  title: string;
  subject: string;
  examCode: string;
  description: string;
  durationMinutes: number;
  startTime: Date;
  endTime: Date;
  questionCount: number;
  kkm: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowStudentViewResult: boolean;
  isPublished: boolean;
  requireFullscreen: boolean;
  detectTabSwitch: boolean;
  detectWindowBlur: boolean;
  blockCopyPaste: boolean;
  maxViolations: number;
  violationAction: string;
  proctorPin: string;
  targetClassesJson: string;
  createdAt: Date;
}

export interface StoredExamQuestion {
  id: number;
  examId: number;
  questionId: number;
  orderIndex: number;
}

export interface StoredExamSession {
  id: number;
  examId: number;
  studentId: number;
  status: string;
  questionOrderJson: string;
  startedAt: Date;
  serverEndTime: Date;
  submittedAt: Date | null;
  lastSavedAt: Date;
  violationCount: number;
  autoScore: number;
  essayScore: number;
  maxPossibleScore: number;
  finalScore: number;
  essayGraded: boolean;
  teacherNotes: string;
}

export interface StoredStudentAnswer {
  id: number;
  sessionId: number;
  questionId: number;
  answerText: string;
  isFlagged: boolean;
  autoPoints: number;
  manualPoints: number;
  isCorrect: boolean | null;
  updatedAt: Date;
}

export interface StoredViolationLog {
  id: number;
  sessionId: number;
  examId: number;
  studentId: number;
  violationType: string;
  description: string;
  actionTaken: string;
  occurredAt: Date;
}

export interface StoreState {
  counters: {
    users: number;
    schoolSettings: number;
    questions: number;
    exams: number;
    examQuestions: number;
    examSessions: number;
    studentAnswers: number;
    violationLogs: number;
  };
  users: StoredUser[];
  schoolSettings: StoredSchoolSettings[];
  questions: StoredQuestion[];
  exams: StoredExam[];
  examQuestions: StoredExamQuestion[];
  examSessions: StoredExamSession[];
  studentAnswers: StoredStudentAnswer[];
  violationLogs: StoredViolationLog[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'cbt-store.json');

function emptyState(): StoreState {
  return {
    counters: {
      users: 0,
      schoolSettings: 0,
      questions: 0,
      exams: 0,
      examQuestions: 0,
      examSessions: 0,
      studentAnswers: 0,
      violationLogs: 0,
    },
    users: [],
    schoolSettings: [],
    questions: [],
    exams: [],
    examQuestions: [],
    examSessions: [],
    studentAnswers: [],
    violationLogs: [],
  };
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function toNullableDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function hydrateState(raw: any): StoreState {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;

  return {
    counters: { ...base.counters, ...(raw.counters || {}) },
    users: Array.isArray(raw.users)
      ? raw.users.map((u: any) => ({ ...u, createdAt: toDate(u.createdAt) }))
      : [],
    schoolSettings: Array.isArray(raw.schoolSettings)
      ? raw.schoolSettings.map((s: any) => ({ ...s, updatedAt: toDate(s.updatedAt) }))
      : [],
    questions: Array.isArray(raw.questions)
      ? raw.questions.map((q: any) => ({
          ...q,
          createdAt: toDate(q.createdAt),
          updatedAt: toDate(q.updatedAt),
        }))
      : [],
    exams: Array.isArray(raw.exams)
      ? raw.exams.map((e: any) => ({
          ...e,
          startTime: toDate(e.startTime),
          endTime: toDate(e.endTime),
          createdAt: toDate(e.createdAt),
        }))
      : [],
    examQuestions: Array.isArray(raw.examQuestions) ? raw.examQuestions : [],
    examSessions: Array.isArray(raw.examSessions)
      ? raw.examSessions.map((s: any) => ({
          ...s,
          startedAt: toDate(s.startedAt),
          serverEndTime: toDate(s.serverEndTime),
          submittedAt: toNullableDate(s.submittedAt),
          lastSavedAt: toDate(s.lastSavedAt),
        }))
      : [],
    studentAnswers: Array.isArray(raw.studentAnswers)
      ? raw.studentAnswers.map((a: any) => ({
          ...a,
          updatedAt: toDate(a.updatedAt),
        }))
      : [],
    violationLogs: Array.isArray(raw.violationLogs)
      ? raw.violationLogs.map((v: any) => ({
          ...v,
          occurredAt: toDate(v.occurredAt),
        }))
      : [],
  };
}

let cachedState: StoreState | null = null;

export function getStore(): StoreState {
  if (cachedState) return cachedState;
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf8');
      cachedState = hydrateState(JSON.parse(content));
      return cachedState;
    }
  } catch (err) {
    console.error('Failed to read local CBT store, initializing fresh state:', err);
  }
  cachedState = emptyState();
  return cachedState;
}

export function saveStore(): void {
  const state = getStore();
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(state), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
}

export function nextId(table: keyof StoreState['counters']): number {
  const state = getStore();
  state.counters[table] += 1;
  return state.counters[table];
}
