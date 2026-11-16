export type UserRole = 'super_admin' | 'admin' | 'guru' | 'siswa';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  classGrade?: 'X' | 'XI' | 'XII' | 'Guru' | 'Staff' | 'Admin';
  nisn?: string;
  phone?: string;
  points: number;
  badges: string[];
  booksReadCount: number;
  currentBorrowCount: number;
  readingStreakDays: number;
  lastReadDate?: string; // YYYY-MM-DD
  lastLoginDate?: string; // YYYY-MM-DD
  lastLoginBonusDate?: string; // YYYY-MM-DD
  lastDailyStreakRewardDate?: string; // YYYY-MM-DD
  dailyReadingGoalMinutes?: number;
  todayMinutesRead?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn?: string;
  category: string;
  synopsis: string;
  pages: number;
  format: 'pdf' | 'epub' | 'physical';
  coverUrl: string;
  fileUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  contentSnippet?: string; // Content for internal digital reader preview
  availableCopies: number;
  totalCopies: number;
  classLevel: 'Semua' | 'X' | 'XI' | 'XII';
  subject?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  readsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  bookCount: number;
  description: string;
  color?: string;
}

export type BorrowStatus = 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Dipinjam' | 'Terlambat' | 'Dikembalikan';

export interface Borrowing {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userClass?: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate?: string;
  status: BorrowStatus;
  fineAmount: number;
  notes?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  lastPage: number;
  totalPages: number;
  progressPercent: number;
  lastReadAt: string;
  completed: boolean;
  timeSpentMinutes: number;
  category?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  author: string;
  category: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'all' or specific uid
  title: string;
  message: string;
  type: 'peminjaman' | 'pengembalian' | 'buku_baru' | 'pengumuman' | 'prestasi' | 'pengingat';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  priority: 'normal' | 'penting';
  targetAudience: 'Semua' | 'Siswa' | 'Guru';
  createdAt: string;
}

export interface LiteracyChallenge {
  id: string;
  title: string;
  description: string;
  targetBooks: number;
  targetDays: number;
  rewardPoints: number;
  badgeReward: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
  isActive: boolean;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'streak' | 'challenge' | 'special';
  requiredPoints?: number;
  color: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  appName: string;
  madrasahName: string;
  maxBorrowDays: number;
  maxBorrowBooks: number;
  finePerDay: number;
  dailyReadingTargetMinutes: number;
  announcementBanner?: string;
}
