export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'teacher';
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  description?: string;
  active: boolean;
  createdAt: string;
  teacher?: User;
  studentCount?: number;
  _count?: { students: number };
}

export interface Student {
  id: string;
  name: string;
  birthDate?: string;
  gender: 'male' | 'female';
  classId?: string;
  parentName?: string;
  parentPhone?: string;
  parentPhone2?: string;
  address?: string;
  enrollmentDate?: string;
  photo?: string;
  notes?: string;
  active: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  noorAlBayanLevel: number;
  createdAt: string;
  class?: Class;
  attendance?: Attendance[];
  memorization?: Memorization[];
  payments?: Payment[];
  skills?: StudentSkill[];
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  recordedBy: string;
  createdAt: string;
  student?: Student;
}

export interface Memorization {
  id: string;
  studentId: string;
  type: 'sabak' | 'sabqi' | 'manzil';
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  totalAyahs: number;
  grade?: string;
  notes?: string;
  date: string;
  teacherId: string;
  createdAt: string;
  student?: Student;
  teacher?: User;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  type: 'registration' | 'monthly' | 'other';
  month?: string;
  year?: number;
  paymentDate: string;
  notes?: string;
  receivedBy: string;
  createdAt: string;
  student?: Student;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'admin' | 'teacher';
  createdBy?: string;
  createdAt: string;
}

export interface StudentSkill {
  id: string;
  studentId: string;
  skillName: string;
  skillCategory: string;
  rating: number;
  notes?: string;
  lastUpdated: string;
}

export interface Homework {
  id: string;
  title: string;
  subject?: string;
  description?: string;
  filePath?: string;
  classId?: string;
  createdAt: string;
  class?: Class;
}

export interface Setting {
  id: string;
  keyName: string;
  keyValue?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  todayAttendance: { present: number; absent: number; late: number; excused: number };
  monthlyRevenue: number;
  pendingApprovals: number;
  recentStudents: Student[];
  recentMemorization: Memorization[];
  attendanceTrend: { date: string; present: number; absent: number }[];
  paymentTrend: { month: string; amount: number }[];
  memorizationByType: { type: string; count: number }[];
  gradeDistribution: { grade: string; count: number }[];
}

export type AppView = 
  | 'dashboard' 
  | 'students' 
  | 'attendance' 
  | 'memorization' 
  | 'payments' 
  | 'classes' 
  | 'users' 
  | 'notifications' 
  | 'reports' 
  | 'settings' 
  | 'learning' 
  | 'backup';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}
