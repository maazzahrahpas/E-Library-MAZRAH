import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, DocumentSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, UserRole } from '../types/library';

export interface DailyRewardNotice {
  id: string;
  type: 'login' | 'streak';
  points: number;
  streak?: number;
  title: string;
  message: string;
}

interface StreakLogResult {
  streakJustUnlocked: boolean;
  newStreak?: number;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  dailyRewardNotice: DailyRewardNotice | null;
  dismissDailyRewardNotice: () => void;
  authErrorNotice: string | null;
  dismissAuthErrorNotice: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addPoints: (amount: number, reason?: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  logDailyReadingTime: (minutes: number) => Promise<StreakLogResult>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DAILY_STREAK_MIN_MINUTES = 15;
export const DAILY_LOGIN_BONUS_POINTS = 5;
export const DAILY_STREAK_BONUS_POINTS = 25;

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

function stripUndefined<T extends object>(obj: T): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dailyRewardNotice, setDailyRewardNotice] = useState<DailyRewardNotice | null>(null);
  const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);

  const userProfileRef = useRef<UserProfile | null>(null);
  const updateLocalProfile = (next: UserProfile | null) => {
    userProfileRef.current = next;
    setUserProfile(next);
  };

  // Initialize Auth state listener with realtime profile sync from Cloud Firestore
  useEffect(() => {
    let unsubProfileDoc = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubProfileDoc();

      if (user) {
        setCurrentUser(user);
        const todayStr = getLocalDateString();
        const yesterdayStr = getYesterdayDateString();

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const isMainBootstrapAdmin = user.email === 'ma.azzahrahpas@gmail.com';
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const rawData = userSnap.data() as UserProfile;
            const data: UserProfile = {
              ...rawData,
              uid: rawData.uid || user.uid,
              badges: Array.isArray(rawData.badges) ? rawData.badges : ['new-reader'],
              points: rawData.points ?? 0,
              booksReadCount: rawData.booksReadCount ?? 0,
              currentBorrowCount: rawData.currentBorrowCount ?? 0,
              readingStreakDays: rawData.readingStreakDays ?? 0,
              todayMinutesRead: rawData.todayMinutesRead ?? 0,
              dailyReadingGoalMinutes: rawData.dailyReadingGoalMinutes ?? DAILY_STREAK_MIN_MINUTES
            };

            const updates: Partial<UserProfile> = {};

            // Ensure main superadmin email retains super_admin role
            if (isMainBootstrapAdmin && data.role !== 'super_admin') {
              updates.role = 'super_admin';
              updates.classGrade = 'Admin';
              await setDoc(doc(db, 'admins', user.uid), {
                email: user.email || '',
                role: 'super_admin',
                createdAt: new Date().toISOString()
              }, { merge: true });
            }

            // Roll over todayMinutesRead when entering a new calendar day
            const sameDayAsLastActivity =
              data.lastReadDate === todayStr || data.lastLoginDate === todayStr;
            if (!sameDayAsLastActivity && (data.todayMinutesRead || 0) !== 0) {
              updates.todayMinutesRead = 0;
            }

            // Reset broken reading streak if yesterday wasn't completed
            if (
              data.lastReadDate &&
              data.lastReadDate !== todayStr &&
              data.lastReadDate !== yesterdayStr &&
              (data.readingStreakDays || 0) > 0
            ) {
              updates.readingStreakDays = 0;
            }

            // Daily Login Check-In Reward (+5 Poin once per day)
            if (data.lastLoginBonusDate !== todayStr) {
              updates.points = (data.points || 0) + DAILY_LOGIN_BONUS_POINTS;
              updates.lastLoginDate = todayStr;
              updates.lastLoginBonusDate = todayStr;
              setDailyRewardNotice({
                id: `login-${todayStr}-${Date.now()}`,
                type: 'login',
                points: DAILY_LOGIN_BONUS_POINTS,
                title: 'Check-In Harian Berhasil!',
                message: `Selamat datang kembali! Kamu mendapatkan +${DAILY_LOGIN_BONUS_POINTS} Poin login harian. Baca minimal 15 menit hari ini untuk bonus +${DAILY_STREAK_BONUS_POINTS} Poin Streak!`
              });
            } else if (data.lastLoginDate !== todayStr) {
              updates.lastLoginDate = todayStr;
            }

            if (Object.keys(updates).length > 0) {
              updates.updatedAt = new Date().toISOString();
              const mergedProfile: UserProfile = { ...data, ...updates };
              updateLocalProfile(mergedProfile);
              await updateDoc(userDocRef, stripUndefined(updates));
            } else {
              updateLocalProfile(data);
            }
          } else {
            // New student / educator registration with Google
            const initialRole: UserRole = isMainBootstrapAdmin ? 'super_admin' : 'siswa';
            const welcomePlusDailyPoints = 100 + DAILY_LOGIN_BONUS_POINTS;
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || (isMainBootstrapAdmin ? 'Super Admin MAZRAH' : 'Santri MA Az Zahrah'),
              ...(user.photoURL ? { photoURL: user.photoURL } : {}),
              role: initialRole,
              classGrade: isMainBootstrapAdmin ? 'Admin' : 'XI',
              points: welcomePlusDailyPoints,
              badges: ['new-reader'],
              booksReadCount: 0,
              currentBorrowCount: 0,
              readingStreakDays: 0,
              dailyReadingGoalMinutes: DAILY_STREAK_MIN_MINUTES,
              todayMinutesRead: 0,
              lastLoginDate: todayStr,
              lastLoginBonusDate: todayStr,
              createdAt: new Date().toISOString()
            };

            await setDoc(userDocRef, stripUndefined(newProfile));
            updateLocalProfile(newProfile);

            setDailyRewardNotice({
              id: `welcome-${todayStr}-${Date.now()}`,
              type: 'login',
              points: welcomePlusDailyPoints,
              title: 'Selamat Bergabung di E-Library MAZRAH!',
              message: `Akun Google berhasil terdaftar (+100 Poin Selamat Datang & +${DAILY_LOGIN_BONUS_POINTS} Poin Login Harian). Baca 15 menit hari ini untuk memulai Daily Reading Streak!`
            });

            if (isMainBootstrapAdmin) {
              await setDoc(doc(db, 'admins', user.uid), {
                email: user.email || '',
                role: 'super_admin',
                createdAt: new Date().toISOString()
              });
            }
          }

          // Realtime listener for live role updates and admin modifications
          unsubProfileDoc = onSnapshot(userDocRef, (snap: DocumentSnapshot) => {
            if (snap.exists()) {
              const live = snap.data() as UserProfile;
              updateLocalProfile({
                ...live,
                uid: live.uid || user.uid,
                badges: Array.isArray(live.badges) ? live.badges : ['new-reader']
              });
            }
          }, (err: Error) => {
            console.warn('Live profile sync notice:', err);
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          updateLocalProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Pengguna MAZRAH',
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            role: user.email === 'ma.azzahrahpas@gmail.com' ? 'super_admin' : 'siswa',
            classGrade: user.email === 'ma.azzahrahpas@gmail.com' ? 'Admin' : 'XI',
            points: 105,
            badges: ['new-reader'],
            booksReadCount: 0,
            currentBorrowCount: 0,
            readingStreakDays: 0,
            dailyReadingGoalMinutes: DAILY_STREAK_MIN_MINUTES,
            todayMinutesRead: 0,
            lastLoginDate: todayStr,
            lastLoginBonusDate: todayStr,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Production: clean unauthenticated visitor state
        setCurrentUser(null);
        updateLocalProfile(null);
        setDailyRewardNotice(null);
      }
      setLoading(false);
    });

    return () => {
      unsubProfileDoc();
      unsubscribeAuth();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      setAuthErrorNotice(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/popup-blocked') {
        setAuthErrorNotice(
          'Popup Google Sign-In diblokir oleh browser. Harap izinkan popup di peramban Anda untuk melanjutkan login.'
        );
      } else if (
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/popup-closed-by-user'
      ) {
        console.info('Jendela Google Sign-In ditutup oleh pengguna.');
      } else {
        console.error('Google Sign In Error:', error);
        setAuthErrorNotice(
          'Terjadi kendala saat menghubungkan akun Google. Silakan periksa koneksi internet Anda atau coba kembali.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
      updateLocalProfile(null);
      setCurrentUser(null);
      setDailyRewardNotice(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const addPoints = async (amount: number, _reason?: string) => {
    const latest = userProfileRef.current;
    if (!latest || amount === 0) return;
    const newPoints = (latest.points || 0) + amount;
    const updated: UserProfile = { ...latest, points: newPoints };
    updateLocalProfile(updated);

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          points: newPoints,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const unlockBadge = async (badgeId: string) => {
    const latest = userProfileRef.current;
    if (!latest) return;
    const existingBadges = Array.isArray(latest.badges) ? latest.badges : [];
    if (existingBadges.includes(badgeId)) return;
    const newBadges = [...existingBadges, badgeId];
    const updated: UserProfile = { ...latest, badges: newBadges };
    updateLocalProfile(updated);

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          badges: newBadges,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const logDailyReadingTime = async (minutes: number): Promise<StreakLogResult> => {
    const latest = userProfileRef.current;
    if (!latest || minutes <= 0) {
      return { streakJustUnlocked: false };
    }

    const todayStr = getLocalDateString();
    const yesterdayStr = getYesterdayDateString();
    const isSameDay = latest.lastReadDate === todayStr || latest.lastLoginDate === todayStr;
    const baseTodayMinutes = isSameDay ? (latest.todayMinutesRead || 0) : 0;
    const newTodayMinutes = baseTodayMinutes + minutes;

    const qualifiesForStreak =
      newTodayMinutes >= DAILY_STREAK_MIN_MINUTES &&
      latest.lastDailyStreakRewardDate !== todayStr;

    if (qualifiesForStreak) {
      const continuedStreak = latest.lastReadDate === yesterdayStr;
      const newStreak = continuedStreak ? (latest.readingStreakDays || 0) + 1 : 1;
      const newPoints = (latest.points || 0) + DAILY_STREAK_BONUS_POINTS;
      const currentBadges = Array.isArray(latest.badges) ? latest.badges : [];
      const newBadges =
        newStreak >= 7 && !currentBadges.includes('daily-streaker')
          ? [...currentBadges, 'daily-streaker']
          : currentBadges;

      const patch: Partial<UserProfile> = {
        todayMinutesRead: newTodayMinutes,
        lastReadDate: todayStr,
        lastLoginDate: todayStr,
        lastDailyStreakRewardDate: todayStr,
        readingStreakDays: newStreak,
        points: newPoints,
        badges: newBadges,
        updatedAt: new Date().toISOString()
      };

      updateLocalProfile({ ...latest, ...patch });

      setDailyRewardNotice({
        id: `streak-${todayStr}-${Date.now()}`,
        type: 'streak',
        points: DAILY_STREAK_BONUS_POINTS,
        streak: newStreak,
        title: `Daily Reading Streak ${newStreak} Hari Tercapai!`,
        message: `Luar biasa! Kamu sudah login dan membaca minimal 15 menit hari ini. Bonus +${DAILY_STREAK_BONUS_POINTS} Poin Streak telah ditambahkan!`
      });

      if (currentUser) {
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), stripUndefined(patch));
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
        }
      }

      return { streakJustUnlocked: true, newStreak };
    }

    const patch: Partial<UserProfile> = {
      todayMinutesRead: newTodayMinutes,
      lastLoginDate: todayStr,
      updatedAt: new Date().toISOString()
    };

    updateLocalProfile({ ...latest, ...patch });

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), stripUndefined(patch));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }

    return { streakJustUnlocked: false };
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    const latest = userProfileRef.current;
    if (!latest) return;
    const updated: UserProfile = { ...latest, ...data };
    updateLocalProfile(updated);

    if (currentUser) {
      try {
        await updateDoc(
          doc(db, 'users', currentUser.uid),
          stripUndefined({
            ...data,
            updatedAt: new Date().toISOString()
          })
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const isSuperAdmin = userProfile?.role === 'super_admin';
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
  const isTeacher = userProfile?.role === 'guru';
  const isStudent = userProfile?.role === 'siswa';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isSuperAdmin,
        isTeacher,
        isStudent,
        dailyRewardNotice,
        dismissDailyRewardNotice: () => setDailyRewardNotice(null),
        authErrorNotice,
        dismissAuthErrorNotice: () => setAuthErrorNotice(null),
        loginWithGoogle,
        logout,
        addPoints,
        unlockBadge,
        logDailyReadingTime,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
