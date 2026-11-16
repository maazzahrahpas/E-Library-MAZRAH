import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth, DAILY_STREAK_BONUS_POINTS } from './AuthContext';
import {
  Book,
  Category,
  Borrowing,
  ReadingHistory,
  Favorite,
  Review,
  NotificationItem,
  Announcement,
  LiteracyChallenge,
  SystemSettings,
  BorrowStatus,
  UserProfile
} from '../types/library';
import {
  INITIAL_BOOKS,
  INITIAL_CATEGORIES,
  INITIAL_CHALLENGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SETTINGS
} from '../firebase/seedData';

interface LibraryContextType {
  books: Book[];
  categories: Category[];
  borrowings: Borrowing[];
  myBorrowings: Borrowing[];
  readingHistory: ReadingHistory[];
  favorites: Favorite[];
  reviews: Review[];
  notifications: NotificationItem[];
  announcements: Announcement[];
  challenges: LiteracyChallenge[];
  settings: SystemSettings;
  allUsers: UserProfile[];
  loading: boolean;
  requestBorrow: (book: Book, durationDays?: number, notes?: string) => Promise<boolean>;
  returnBook: (borrowId: string, notes?: string) => Promise<boolean>;
  updateBorrowStatus: (borrowId: string, status: BorrowStatus, fineAmount?: number, notes?: string) => Promise<boolean>;
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => Promise<boolean>;
  updateBook: (bookId: string, book: Partial<Book>) => Promise<boolean>;
  deleteBook: (bookId: string) => Promise<boolean>;
  toggleFavorite: (book: Book) => Promise<boolean>;
  saveReadingProgress: (book: Book, page: number, totalPages: number, minutes: number) => Promise<boolean>;
  addReview: (bookId: string, bookTitle: string, rating: number, comment: string) => Promise<boolean>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<boolean>;
  updateCategory: (categoryId: string, data: Partial<Category>) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAnnouncement: (annId: string, data: Partial<Announcement>) => Promise<boolean>;
  deleteAnnouncement: (annId: string) => Promise<boolean>;
  editBorrowing: (borrowId: string, data: Partial<Borrowing>) => Promise<boolean>;
  deleteBorrowing: (borrowId: string) => Promise<boolean>;
  addChallenge: (challenge: Omit<LiteracyChallenge, 'id'>) => Promise<boolean>;
  updateChallenge: (challengeId: string, data: Partial<LiteracyChallenge>) => Promise<boolean>;
  deleteChallenge: (challengeId: string) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<boolean>;
  addUserAccount: (user: Omit<UserProfile, 'createdAt'>) => Promise<boolean>;
  updateUserAccount: (uid: string, data: Partial<UserProfile>) => Promise<boolean>;
  deleteUserAccount: (uid: string) => Promise<boolean>;
  markNotificationRead: (notifId: string) => Promise<void>;
  seedInitialDataToFirestore: () => Promise<boolean>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedClassLevel: string;
  setSelectedClassLevel: (lvl: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

const WELCOME_NOTIFICATION: NotificationItem = {
  id: 'notif-welcome-mazrah',
  userId: 'all',
  title: 'Selamat Datang di E-Library MAZRAH!',
  message:
    'Aplikasi resmi perpustakaan digital MA Az Zahrah Pasuruan siap menemani perjalanan literasimu. Masuk dengan Google dan baca 15 menit setiap hari untuk bonus Streak!',
  type: 'pengumuman',
  isRead: false,
  createdAt: new Date().toISOString()
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    userProfile,
    isAdmin,
    addPoints,
    unlockBadge,
    logDailyReadingTime,
    updateProfileData
  } = useAuth();

  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([WELCOME_NOTIFICATION]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [challenges, setChallenges] = useState<LiteracyChallenge[]>(INITIAL_CHALLENGES);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter Global State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedClassLevel, setSelectedClassLevel] = useState<string>('Semua');

  // Public Firestore Realtime Listeners (accessible to all visitors & signed-in users)
  useEffect(() => {
    let unsubBooks = () => {};
    let unsubCategories = () => {};
    let unsubAnnouncements = () => {};
    let unsubReviews = () => {};
    let unsubChallenges = () => {};
    let unsubSettings = () => {};

    try {
      unsubBooks = onSnapshot(
        collection(db, 'books'),
        (snap) => {
          if (!snap.empty) {
            const loadedBooks: Book[] = [];
            snap.forEach((docSnap) => {
              loadedBooks.push({ id: docSnap.id, ...docSnap.data() } as Book);
            });
            setBooks(loadedBooks);
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'books');
        }
      );

      unsubCategories = onSnapshot(
        collection(db, 'categories'),
        (snap) => {
          if (!snap.empty) {
            const loadedCats: Category[] = [];
            snap.forEach((docSnap) => {
              loadedCats.push({ id: docSnap.id, ...docSnap.data() } as Category);
            });
            setCategories(loadedCats);
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'categories');
        }
      );

      unsubAnnouncements = onSnapshot(
        collection(db, 'announcements'),
        (snap) => {
          if (!snap.empty) {
            const loadedAnn: Announcement[] = [];
            snap.forEach((docSnap) => {
              loadedAnn.push({ id: docSnap.id, ...docSnap.data() } as Announcement);
            });
            setAnnouncements(loadedAnn);
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'announcements');
        }
      );

      unsubReviews = onSnapshot(
        collection(db, 'reviews'),
        (snap) => {
          const loadedReviews: Review[] = [];
          snap.forEach((docSnap) => {
            loadedReviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
          });
          setReviews(loadedReviews);
        },
        (err) => {
          console.warn('Realtime reviews notice:', err);
        }
      );

      unsubChallenges = onSnapshot(
        collection(db, 'challenges'),
        (snap) => {
          if (!snap.empty) {
            const loadedChallenges: LiteracyChallenge[] = [];
            snap.forEach((docSnap) => {
              loadedChallenges.push({ id: docSnap.id, ...docSnap.data() } as LiteracyChallenge);
            });
            setChallenges(loadedChallenges);
          }
        },
        (err) => {
          console.warn('Realtime challenges notice:', err);
        }
      );

      unsubSettings = onSnapshot(
        doc(db, 'settings', 'general'),
        (docSnap) => {
          if (docSnap.exists()) {
            setSettings(docSnap.data() as SystemSettings);
          }
        },
        (err) => {
          console.warn('Realtime settings notice:', err);
        }
      );
    } catch (e) {
      console.warn('Public realtime listener fallback active:', e);
    } finally {
      setLoading(false);
    }

    return () => {
      unsubBooks();
      unsubCategories();
      unsubAnnouncements();
      unsubReviews();
      unsubChallenges();
      unsubSettings();
    };
  }, []);

  // Authenticated-Only Firestore Realtime Listeners
  useEffect(() => {
    if (!currentUser?.uid) {
      setBorrowings([]);
      setReadingHistory([]);
      setFavorites([]);
      setAllUsers([]);
      setNotifications([WELCOME_NOTIFICATION]);
      return;
    }

    const uid = currentUser.uid;
    let unsubBorrowings = () => {};
    let unsubUsers = () => {};
    let unsubHistory = () => {};
    let unsubFavorites = () => {};
    let unsubNotifications = () => {};

    try {
      const borrowingsQuery = isAdmin
        ? collection(db, 'borrowings')
        : query(collection(db, 'borrowings'), where('userId', '==', uid));

      unsubBorrowings = onSnapshot(
        borrowingsQuery,
        (snap) => {
          const loadedBorrows: Borrowing[] = [];
          snap.forEach((docSnap) => {
            loadedBorrows.push({ id: docSnap.id, ...docSnap.data() } as Borrowing);
          });
          setBorrowings(loadedBorrows);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'borrowings');
        }
      );

      unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          const loadedUsers: UserProfile[] = [];
          snap.forEach((docSnap) => {
            loadedUsers.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
          });
          setAllUsers(loadedUsers);
        },
        (err) => {
          console.warn('Realtime users listener notice:', err);
        }
      );

      unsubHistory = onSnapshot(
        query(collection(db, 'reading_history'), where('userId', '==', uid)),
        (snap) => {
          const userHist: ReadingHistory[] = [];
          snap.forEach((docSnap) => {
            userHist.push({ id: docSnap.id, ...(docSnap.data() as Omit<ReadingHistory, 'id'>) });
          });
          setReadingHistory(userHist);
        },
        (err) => {
          console.warn('Reading history sync notice:', err);
        }
      );

      unsubFavorites = onSnapshot(
        query(collection(db, 'favorites'), where('userId', '==', uid)),
        (snap) => {
          const userFavs: Favorite[] = [];
          snap.forEach((docSnap) => {
            userFavs.push({ id: docSnap.id, ...(docSnap.data() as Omit<Favorite, 'id'>) });
          });
          setFavorites(userFavs);
        },
        (err) => {
          console.warn('Favorites sync notice:', err);
        }
      );

      const notificationsQuery = isAdmin
        ? collection(db, 'notifications')
        : query(collection(db, 'notifications'), where('userId', 'in', [uid, 'all']));

      unsubNotifications = onSnapshot(
        notificationsQuery,
        (snap) => {
          const loadedNotifs: NotificationItem[] = [];
          snap.forEach((docSnap) => {
            loadedNotifs.push({ id: docSnap.id, ...(docSnap.data() as Omit<NotificationItem, 'id'>) });
          });
          loadedNotifs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setNotifications(loadedNotifs.length > 0 ? loadedNotifs : [WELCOME_NOTIFICATION]);
        },
        (err) => {
          console.warn('Notifications sync notice:', err);
        }
      );
    } catch (e) {
      console.warn('Authenticated data sync notice:', e);
    }

    return () => {
      unsubBorrowings();
      unsubUsers();
      unsubHistory();
      unsubFavorites();
      unsubNotifications();
    };
  }, [currentUser?.uid, isAdmin]);

  // Request book loan (Integrated for Students & Teachers)
  const requestBorrow = async (book: Book, durationDays?: number, notes = ''): Promise<boolean> => {
    if (!userProfile || !currentUser) return false;
    if (book.availableCopies <= 0) return false;

    const days = durationDays || (userProfile.role === 'guru' ? 14 : 7);
    const borrowId = `borrow-${Date.now()}`;
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const dueStr = dueDate.toISOString().split('T')[0];

    const newBorrowing: Borrowing = {
      id: borrowId,
      userId: userProfile.uid,
      userEmail: userProfile.email,
      userName: userProfile.displayName,
      userClass: userProfile.classGrade || (userProfile.role === 'guru' ? 'Guru' : 'Siswa'),
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.coverUrl,
      borrowDate: todayStr,
      dueDate: dueStr,
      status: 'Dipinjam',
      fineAmount: 0,
      notes: notes || `Peminjaman aktif ${userProfile.role === 'guru' ? 'Guru/Pendidik' : 'Santri'} (${days} hari)`,
      createdAt: new Date().toISOString()
    };

    setBorrowings((prev) => [newBorrowing, ...prev]);

    setBooks((prev) =>
      prev.map((b) => (b.id === book.id ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b))
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-b1`,
      userId: userProfile.uid,
      title: 'Peminjaman Buku Berhasil!',
      message: `Peminjaman buku "${book.title}" aktif hingga ${dueStr}. Anda dapat membacanya sekarang atau mengembalikannya lewat dashboard.`,
      type: 'peminjaman',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}-b2`,
      userId: 'all',
      title: 'Sirkulasi Baru: Buku Dipinjam',
      message: `${userProfile.displayName} (${userProfile.classGrade || userProfile.role}) meminjam buku "${book.title}".`,
      type: 'peminjaman',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications((prev) => [newNotif, adminNotif, ...prev]);

    try {
      await setDoc(doc(db, 'borrowings', borrowId), stripUndefined(newBorrowing as unknown as Record<string, unknown>));
      await updateDoc(doc(db, 'books', book.id), {
        availableCopies: Math.max(0, (book.availableCopies || 1) - 1)
      });
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      await setDoc(doc(db, 'notifications', adminNotif.id), adminNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `borrowings/${borrowId}`);
    }

    return true;
  };

  // Return book (Direct action from Student and Educator Dashboard)
  const returnBook = async (borrowId: string, notes = ''): Promise<boolean> => {
    if (!userProfile || !currentUser) return false;
    const target = borrowings.find((b) => b.id === borrowId);
    if (!target || target.status === 'Dikembalikan') return false;

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedNotes = notes
      ? `${target.notes ? target.notes + ' | ' : ''}Pengembalian: ${notes}`
      : target.notes || 'Dikembalikan via dashboard pengguna';

    setBorrowings((prev) =>
      prev.map((b) =>
        b.id === borrowId
          ? {
              ...b,
              status: 'Dikembalikan',
              returnDate: todayStr,
              notes: updatedNotes,
              updatedAt: new Date().toISOString()
            }
          : b
      )
    );

    setBooks((prev) =>
      prev.map((book) =>
        book.id === target.bookId
          ? { ...book, availableCopies: Math.min(book.totalCopies, book.availableCopies + 1) }
          : book
      )
    );

    await addPoints(30, `Pengembalian tepat waktu: "${target.bookTitle}"`);

    const notifUser: NotificationItem = {
      id: `notif-${Date.now()}-ret`,
      userId: target.userId,
      title: 'Buku Berhasil Dikembalikan!',
      message: `Terima kasih! Buku "${target.bookTitle}" telah berhasil dikembalikan. Bonus +30 poin literasi telah ditambahkan.`,
      type: 'pengembalian',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const notifAdmin: NotificationItem = {
      id: `notif-${Date.now()}-admin`,
      userId: 'all',
      title: 'Pengembalian Buku Diterima',
      message: `${target.userName} (${target.userClass || 'Anggota'}) telah mengembalikan buku "${target.bookTitle}".`,
      type: 'pengembalian',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications((prev) => [notifUser, notifAdmin, ...prev]);

    try {
      await updateDoc(doc(db, 'borrowings', borrowId), {
        status: 'Dikembalikan',
        returnDate: todayStr,
        notes: updatedNotes,
        updatedAt: new Date().toISOString()
      });

      const bookRef = doc(db, 'books', target.bookId);
      const bookSnap = await getDoc(bookRef);
      if (bookSnap.exists()) {
        const curCopies = bookSnap.data().availableCopies || 0;
        const total = bookSnap.data().totalCopies || curCopies + 1;
        await updateDoc(bookRef, {
          availableCopies: Math.min(total, curCopies + 1)
        });
      }

      await setDoc(doc(db, 'notifications', notifUser.id), notifUser);
      await setDoc(doc(db, 'notifications', notifAdmin.id), notifAdmin);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `borrowings/${borrowId}`);
    }

    return true;
  };

  // Update loan status (Admin / Super Admin action)
  const updateBorrowStatus = async (
    borrowId: string,
    status: BorrowStatus,
    fineAmount = 0,
    notes = ''
  ): Promise<boolean> => {
    const targetBorrow = borrowings.find((b) => b.id === borrowId);
    const verifiedName = userProfile?.displayName || 'Petugas Perpustakaan';
    const returnDateVal =
      status === 'Dikembalikan'
        ? new Date().toISOString().split('T')[0]
        : targetBorrow?.returnDate;

    setBorrowings((prev) =>
      prev.map((b) =>
        b.id === borrowId
          ? {
              ...b,
              status,
              fineAmount,
              notes: notes || b.notes,
              ...(returnDateVal ? { returnDate: returnDateVal } : {}),
              verifiedBy: verifiedName,
              updatedAt: new Date().toISOString()
            }
          : b
      )
    );

    if (targetBorrow) {
      // Restore book stock if admin marks returned or rejects an active loan
      if (
        (status === 'Dikembalikan' || status === 'Ditolak') &&
        targetBorrow.status !== 'Dikembalikan' &&
        targetBorrow.status !== 'Ditolak'
      ) {
        setBooks((prev) =>
          prev.map((book) =>
            book.id === targetBorrow.bookId
              ? { ...book, availableCopies: Math.min(book.totalCopies, book.availableCopies + 1) }
              : book
          )
        );
      }

      const notifMsg =
        status === 'Disetujui' || status === 'Dipinjam'
          ? `Peminjaman buku "${targetBorrow.bookTitle}" telah DISETUJUI. Silakan ambil fisik buku atau nikmati akses digitalnya.`
          : status === 'Ditolak'
          ? `Mohon maaf, peminjaman buku "${targetBorrow.bookTitle}" DITOLAK. Catatan: ${notes || 'Koleksi sedang dalam pemeliharaan.'}`
          : status === 'Dikembalikan'
          ? `Buku "${targetBorrow.bookTitle}" telah berhasil DIKEMBALIKAN. Terima kasih atas ketertiban Anda.`
          : `Status peminjaman buku "${targetBorrow.bookTitle}" diperbarui menjadi ${status}.`;

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: targetBorrow.userId,
        title: `Pembaruan Peminjaman: ${status}`,
        message: notifMsg,
        type: 'peminjaman',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications((prev) => [notif, ...prev]);

      if (status === 'Dikembalikan' && fineAmount === 0 && targetBorrow.userId === userProfile?.uid) {
        await addPoints(30, 'Mengembalikan buku tepat waktu');
      }

      try {
        await updateDoc(
          doc(db, 'borrowings', borrowId),
          stripUndefined({
            status,
            fineAmount,
            notes: notes || targetBorrow.notes || '',
            returnDate: returnDateVal,
            verifiedBy: verifiedName,
            updatedAt: new Date().toISOString()
          })
        );

        if (
          (status === 'Dikembalikan' || status === 'Ditolak') &&
          targetBorrow.status !== 'Dikembalikan' &&
          targetBorrow.status !== 'Ditolak'
        ) {
          const bookRef = doc(db, 'books', targetBorrow.bookId);
          const bookSnap = await getDoc(bookRef);
          if (bookSnap.exists()) {
            const curCopies = bookSnap.data().availableCopies || 0;
            const total = bookSnap.data().totalCopies || curCopies + 1;
            await updateDoc(bookRef, {
              availableCopies: Math.min(total, curCopies + 1)
            });
          }
        }

        await setDoc(doc(db, 'notifications', notif.id), notif);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `borrowings/${borrowId}`);
      }
    }

    return true;
  };

  // Add Book
  const addBook = async (bookData: Omit<Book, 'id' | 'createdAt'>): Promise<boolean> => {
    const newId = `book-${Date.now()}`;
    const newBook: Book = {
      ...bookData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    setBooks((prev) => [newBook, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'Koleksi Buku Baru Ditambahkan!',
      message: `Buku baru "${newBook.title}" karya ${newBook.author} kini tersedia di rak digital MAZRAH.`,
      type: 'buku_baru',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [newNotif, ...prev]);

    try {
      await setDoc(doc(db, 'books', newId), stripUndefined(newBook as unknown as Record<string, unknown>));
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `books/${newId}`);
    }

    return true;
  };

  // Update Book
  const updateBook = async (bookId: string, bookData: Partial<Book>): Promise<boolean> => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, ...bookData, updatedAt: new Date().toISOString() } : b))
    );

    try {
      await updateDoc(
        doc(db, 'books', bookId),
        stripUndefined({
          ...bookData,
          updatedAt: new Date().toISOString()
        } as Record<string, unknown>)
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `books/${bookId}`);
    }

    return true;
  };

  // Delete Book
  const deleteBook = async (bookId: string): Promise<boolean> => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));

    try {
      await deleteDoc(doc(db, 'books', bookId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `books/${bookId}`);
    }

    return true;
  };

  // Toggle Favorite
  const toggleFavorite = async (book: Book): Promise<boolean> => {
    if (!userProfile || !currentUser) return false;
    const existing = favorites.find((f) => f.bookId === book.id && f.userId === userProfile.uid);

    if (existing) {
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      try {
        await deleteDoc(doc(db, 'favorites', existing.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `favorites/${existing.id}`);
      }
      return false;
    } else {
      const favId = `fav-${userProfile.uid}-${book.id}`;
      const newFav: Favorite = {
        id: favId,
        userId: userProfile.uid,
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.coverUrl,
        author: book.author,
        category: book.category,
        createdAt: new Date().toISOString()
      };
      setFavorites((prev) => [newFav, ...prev]);
      try {
        await setDoc(doc(db, 'favorites', favId), newFav);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `favorites/${favId}`);
      }
      return true;
    }
  };

  // Save Reading Progress & Daily Reading Streak Integration
  const saveReadingProgress = async (
    book: Book,
    page: number,
    totalPages: number,
    minutes: number
  ): Promise<boolean> => {
    if (!userProfile || !currentUser) return false;

    const existing = readingHistory.find((h) => h.bookId === book.id && h.userId === userProfile.uid);
    const prevMinutes = existing?.timeSpentMinutes || 0;
    const accumulatedMinutes = prevMinutes + Math.max(0, minutes);
    const wasAlreadyCompleted = existing?.completed === true;
    const isNowCompleted = wasAlreadyCompleted || page >= totalPages;

    const progress = Math.min(100, Math.round((page / Math.max(1, totalPages)) * 100));
    const historyId = `hist-${userProfile.uid}-${book.id}`;

    const newHist: ReadingHistory = {
      id: historyId,
      userId: userProfile.uid,
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.coverUrl,
      lastPage: page,
      totalPages,
      progressPercent: isNowCompleted ? 100 : progress,
      lastReadAt: new Date().toISOString(),
      completed: isNowCompleted,
      timeSpentMinutes: accumulatedMinutes,
      category: book.category
    };

    setReadingHistory((prev) => {
      const idx = prev.findIndex((h) => h.bookId === book.id && h.userId === userProfile.uid);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newHist;
        return copy;
      }
      return [newHist, ...prev];
    });

    // Log reading minutes to Daily Reading Streak tracker
    if (minutes > 0) {
      const streakResult = await logDailyReadingTime(minutes);
      await addPoints(10, 'Sesi membaca digital');

      if (streakResult.streakJustUnlocked) {
        const streakNotif: NotificationItem = {
          id: `notif-${Date.now()}-streak`,
          userId: userProfile.uid,
          title: `Daily Reading Streak ${streakResult.newStreak} Hari!`,
          message: `Alhamdulillah! Kamu telah membaca minimal 15 menit hari ini dan meraih bonus +${DAILY_STREAK_BONUS_POINTS} Poin Literasi.`,
          type: 'prestasi',
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications((prev) => [streakNotif, ...prev]);
        try {
          await setDoc(doc(db, 'notifications', streakNotif.id), streakNotif);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `notifications/${streakNotif.id}`);
        }
      }
    }

    // Award first-time book completion rewards
    if (!wasAlreadyCompleted && page >= totalPages) {
      const newBooksReadCount = (userProfile.booksReadCount || 0) + 1;
      await updateProfileData({ booksReadCount: newBooksReadCount });
      await addPoints(50, `Khatam membaca buku: ${book.title}`);
      await unlockBadge('book-explorer');
      if (newBooksReadCount >= 5) {
        await unlockBadge('master-reader');
      }
    }

    try {
      await setDoc(
        doc(db, 'reading_history', historyId),
        stripUndefined(newHist as unknown as Record<string, unknown>)
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reading_history/${historyId}`);
    }

    return true;
  };

  // Add Review
  const addReview = async (
    bookId: string,
    bookTitle: string,
    rating: number,
    comment: string
  ): Promise<boolean> => {
    if (!userProfile || !currentUser) return false;
    const revId = `rev-${Date.now()}`;
    const newRev: Review = {
      id: revId,
      bookId,
      bookTitle,
      userId: userProfile.uid,
      userName: userProfile.displayName,
      ...(userProfile.photoURL ? { userPhoto: userProfile.photoURL } : {}),
      rating,
      comment,
      isApproved: true,
      createdAt: new Date().toISOString()
    };

    setReviews((prev) => [newRev, ...prev]);
    await addPoints(20, 'Menulis ulasan buku');

    try {
      await setDoc(doc(db, 'reviews', revId), stripUndefined(newRev as unknown as Record<string, unknown>));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${revId}`);
    }

    return true;
  };

  // Create Announcement
  const createAnnouncement = async (
    announcementData: Omit<Announcement, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    const annId = `ann-${Date.now()}`;
    const newAnn: Announcement = {
      ...announcementData,
      id: annId,
      createdAt: new Date().toISOString()
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: `Pengumuman: ${newAnn.title}`,
      message: newAnn.content.slice(0, 120) + (newAnn.content.length > 120 ? '...' : ''),
      type: 'pengumuman',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [notif, ...prev]);

    try {
      await setDoc(doc(db, 'announcements', annId), newAnn);
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `announcements/${annId}`);
    }

    return true;
  };

  const addAnnouncement = createAnnouncement;

  const updateAnnouncement = async (annId: string, data: Partial<Announcement>): Promise<boolean> => {
    setAnnouncements((prev) => prev.map((a) => (a.id === annId ? { ...a, ...data } : a)));
    try {
      await updateDoc(doc(db, 'announcements', annId), stripUndefined(data as Record<string, unknown>));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `announcements/${annId}`);
    }
    return true;
  };

  const deleteAnnouncement = async (annId: string): Promise<boolean> => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
    try {
      await deleteDoc(doc(db, 'announcements', annId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${annId}`);
    }
    return true;
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<boolean> => {
    const catId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...categoryData,
      id: catId
    };
    setCategories((prev) => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'categories', catId), stripUndefined(newCat as unknown as Record<string, unknown>));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${catId}`);
    }
    return true;
  };

  const updateCategory = async (categoryId: string, data: Partial<Category>): Promise<boolean> => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...data } : c)));
    try {
      await updateDoc(doc(db, 'categories', categoryId), stripUndefined(data as Record<string, unknown>));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${categoryId}`);
    }
    return true;
  };

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${categoryId}`);
    }
    return true;
  };

  const editBorrowing = async (borrowId: string, data: Partial<Borrowing>): Promise<boolean> => {
    setBorrowings((prev) =>
      prev.map((b) => (b.id === borrowId ? { ...b, ...data, updatedAt: new Date().toISOString() } : b))
    );
    try {
      await updateDoc(
        doc(db, 'borrowings', borrowId),
        stripUndefined({
          ...data,
          updatedAt: new Date().toISOString()
        } as Record<string, unknown>)
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `borrowings/${borrowId}`);
    }
    return true;
  };

  const deleteBorrowing = async (borrowId: string): Promise<boolean> => {
    setBorrowings((prev) => prev.filter((b) => b.id !== borrowId));
    try {
      await deleteDoc(doc(db, 'borrowings', borrowId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `borrowings/${borrowId}`);
    }
    return true;
  };

  const addChallenge = async (challengeData: Omit<LiteracyChallenge, 'id'>): Promise<boolean> => {
    const chalId = `chal-${Date.now()}`;
    const newChal: LiteracyChallenge = {
      ...challengeData,
      id: chalId
    };
    setChallenges((prev) => [newChal, ...prev]);
    try {
      await setDoc(doc(db, 'challenges', chalId), newChal);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `challenges/${chalId}`);
    }
    return true;
  };

  const updateChallenge = async (challengeId: string, data: Partial<LiteracyChallenge>): Promise<boolean> => {
    setChallenges((prev) => prev.map((c) => (c.id === challengeId ? { ...c, ...data } : c)));
    try {
      await updateDoc(doc(db, 'challenges', challengeId), stripUndefined(data as Record<string, unknown>));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${challengeId}`);
    }
    return true;
  };

  const deleteChallenge = async (challengeId: string): Promise<boolean> => {
    setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
    try {
      await deleteDoc(doc(db, 'challenges', challengeId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `challenges/${challengeId}`);
    }
    return true;
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
    }
    return true;
  };

  const markNotificationRead = async (notifId: string) => {
    const target = notifications.find((n) => n.id === notifId);
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
    if (!currentUser || !target || notifId === 'notif-welcome-mazrah') return;
    if (target.userId === currentUser.uid || isAdmin) {
      try {
        await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notifications/${notifId}`);
      }
    }
  };

  const addUserAccount = async (userData: Omit<UserProfile, 'createdAt'>): Promise<boolean> => {
    const newUser: UserProfile = {
      ...userData,
      createdAt: new Date().toISOString()
    };

    setAllUsers((prev) => [newUser, ...prev]);

    try {
      await setDoc(doc(db, 'users', newUser.uid), stripUndefined(newUser as unknown as Record<string, unknown>));
      if (newUser.role === 'super_admin' || newUser.role === 'admin') {
        await setDoc(doc(db, 'admins', newUser.uid), {
          email: newUser.email,
          role: newUser.role,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${newUser.uid}`);
    }

    return true;
  };

  const updateUserAccount = async (uid: string, data: Partial<UserProfile>): Promise<boolean> => {
    setAllUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, ...data, updatedAt: new Date().toISOString() } : u))
    );

    try {
      await updateDoc(
        doc(db, 'users', uid),
        stripUndefined({
          ...data,
          updatedAt: new Date().toISOString()
        } as Record<string, unknown>)
      );

      if (data.role === 'super_admin' || data.role === 'admin') {
        await setDoc(
          doc(db, 'admins', uid),
          {
            role: data.role,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      } else if (data.role && (data.role === 'siswa' || data.role === 'guru')) {
        const target = allUsers.find((u) => u.uid === uid);
        if (target?.email !== 'ma.azzahrahpas@gmail.com') {
          try {
            await deleteDoc(doc(db, 'admins', uid));
          } catch (_) {
            // ignore if admin record didn't exist
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }

    return true;
  };

  const deleteUserAccount = async (uid: string): Promise<boolean> => {
    setAllUsers((prev) => prev.filter((u) => u.uid !== uid));

    try {
      await deleteDoc(doc(db, 'users', uid));
      try {
        await deleteDoc(doc(db, 'admins', uid));
      } catch (_) {
        // ignore if admin record didn't exist
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
    }

    return true;
  };

  const seedInitialDataToFirestore = async (): Promise<boolean> => {
    try {
      for (const book of INITIAL_BOOKS) {
        await setDoc(doc(db, 'books', book.id), book);
      }
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      for (const ann of INITIAL_ANNOUNCEMENTS) {
        await setDoc(doc(db, 'announcements', ann.id), ann);
      }
      for (const chal of INITIAL_CHALLENGES) {
        await setDoc(doc(db, 'challenges', chal.id), chal);
      }
      await setDoc(doc(db, 'settings', 'general'), INITIAL_SETTINGS);
      return true;
    } catch (err) {
      console.error('Error seeding data:', err);
      handleFirestoreError(err, OperationType.WRITE, 'seed');
      return false;
    }
  };

  const myBorrowings = borrowings.filter(
    (b) => userProfile?.uid && b.userId === userProfile.uid
  );

  return (
    <LibraryContext.Provider
      value={{
        books,
        categories,
        borrowings,
        myBorrowings,
        readingHistory,
        favorites,
        reviews,
        notifications,
        announcements,
        challenges,
        settings,
        allUsers,
        loading,
        requestBorrow,
        returnBook,
        updateBorrowStatus,
        addBook,
        updateBook,
        deleteBook,
        addCategory,
        updateCategory,
        deleteCategory,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        editBorrowing,
        deleteBorrowing,
        addChallenge,
        updateChallenge,
        deleteChallenge,
        deleteReview,
        toggleFavorite,
        saveReadingProgress,
        addReview,
        createAnnouncement,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount,
        markNotificationRead,
        seedInitialDataToFirestore,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedClassLevel,
        setSelectedClassLevel
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
};
