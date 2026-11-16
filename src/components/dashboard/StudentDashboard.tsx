import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Flame,
  BookOpen,
  BookmarkCheck,
  Trophy,
  Clock,
  Bell,
  CheckCircle2,
  RotateCcw,
  Plus,
  X,
  Check,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  useAuth,
  DAILY_STREAK_MIN_MINUTES,
  DAILY_LOGIN_BONUS_POINTS,
  DAILY_STREAK_BONUS_POINTS,
  getLocalDateString
} from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { Book, Borrowing } from '../../types/library';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
  onOpenBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenBook,
  onReadBook
}) => {
  const { userProfile, isTeacher, loginWithGoogle, dailyRewardNotice } = useAuth();
  const {
    books,
    myBorrowings,
    readingHistory,
    announcements,
    returnBook,
    requestBorrow
  } = useLibrary();

  // Quick Borrow Modal State
  const [showBorrowModal, setShowBorrowModal] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowDuration, setBorrowDuration] = useState<number>(isTeacher ? 14 : 7);
  const [borrowNotes, setBorrowNotes] = useState<string>('');
  const [borrowSuccess, setBorrowSuccess] = useState<boolean>(false);

  // Return Book Modal State
  const [returningLoan, setReturningLoan] = useState<Borrowing | null>(null);
  const [returnNotes, setReturnNotes] = useState<string>('Kondisi buku baik, selesai dipelajari');

  useEffect(() => {
    setBorrowDuration(isTeacher ? 14 : 7);
  }, [isTeacher]);

  // Trigger celebratory confetti when the user unlocks today's Daily Reading Streak
  useEffect(() => {
    if (dailyRewardNotice?.type === 'streak') {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.65 }
      });
    }
  }, [dailyRewardNotice?.id]);

  // Daily Reading Streak calculations
  const todayStr = getLocalDateString();
  const isSameDayActivity =
    userProfile?.lastReadDate === todayStr || userProfile?.lastLoginDate === todayStr;
  const todayMinutes = isSameDayActivity ? (userProfile?.todayMinutesRead || 0) : 0;
  const streakMinRequired = DAILY_STREAK_MIN_MINUTES;
  const streakMinutesPercent = Math.min(100, Math.round((todayMinutes / streakMinRequired) * 100));
  const loggedInToday = userProfile?.lastLoginDate === todayStr;
  const streakCompletedToday =
    userProfile?.lastDailyStreakRewardDate === todayStr || todayMinutes >= streakMinRequired;
  const currentStreakDays = userProfile?.readingStreakDays || 0;
  const remainingMinutes = Math.max(0, streakMinRequired - todayMinutes);

  // 7-day visual streak chain
  const filledChainCount = Math.min(7, currentStreakDays);

  // Active loans
  const activeLoans = myBorrowings.filter(
    (b) => b.status === 'Dipinjam' || b.status === 'Menunggu' || b.status === 'Terlambat'
  );

  // Recent reads
  const recentHistories = readingHistory.slice(0, 3);

  // Recommendations for this grade (or all if not logged in)
  const gradeRecommendations = books
    .filter(
      (b) =>
        b.classLevel === 'Semua' ||
        (userProfile?.classGrade ? b.classLevel === userProfile.classGrade : true)
    )
    .slice(0, 4);

  const handleOpenBorrow = (bookToBorrow?: Book) => {
    if (!userProfile) {
      loginWithGoogle();
      return;
    }
    setSelectedBook(bookToBorrow || books[0] || null);
    setShowBorrowModal(true);
  };

  const handleStartDailyReading = () => {
    const latestHistBook = recentHistories[0]
      ? books.find((b) => b.id === recentHistories[0].bookId)
      : undefined;
    const bookToOpen = latestHistBook || gradeRecommendations[0] || books[0];
    if (bookToOpen) {
      onReadBook(bookToOpen);
    } else {
      onNavigate('catalog');
    }
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Welcome Banner */}
      {!userProfile ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#452b99] via-[#6546C7] to-[#3b82f6] text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pusat Literasi & Perpustakaan Digital</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Assalamu’alaikum, Selamat Datang di MAZRAH!
              </h1>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Platform resmi MA Az Zahrah Kota Pasuruan. Masuk dengan akun Google Anda untuk meminjam buku fisik, membaca modul digital, meraih bonus Daily Reading Streak, dan mengumpulkan poin literasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={loginWithGoogle}
                className="px-5 py-3 bg-white hover:bg-gray-50 text-purple-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Masuk dengan Google</span>
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Jelajahi Katalog</span>
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5334b3] via-[#6546C7] to-[#4285F4] text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isTeacher
                    ? 'Pendidik & Dewan Guru MA Az Zahrah'
                    : `Santri Berprestasi • Kelas ${userProfile.classGrade || 'XI'} MA Az Zahrah`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Assalamu’alaikum, {userProfile.displayName}!
              </h1>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                {isTeacher
                  ? 'Selamat datang di Portal Pendidik MA AZ ZAHRAH. Pinjam buku referensi ajar, bahan pengayaan, dan pantau aktivitas literasi santri madrasah.'
                  : 'Selamat datang kembali di E-Library MAZRAH. Mari lanjutkan membaca modul keilmuan dan pertahankan streak literasimu hari ini.'}
              </p>
            </div>

            {/* Quick CTA */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleOpenBorrow()}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Pinjam Buku Baru</span>
              </button>
              <button
                onClick={() => onNavigate('gamification')}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Katalog</span>
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        </div>
      )}

      {/* Gamification & Daily Goal Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Poin Card */}
        <div
          onClick={() => onNavigate('gamification')}
          className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Poin</p>
            <p className="text-xl font-black text-gray-900">{userProfile?.points || 0}</p>
            <p className="text-[10px] text-amber-700 font-semibold">+5 login • +25 streak</p>
          </div>
        </div>

        {/* Streak Card */}
        <div
          onClick={() => onNavigate('gamification')}
          className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-rose-500 text-rose-500 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Daily Reading Streak</p>
            <p className="text-xl font-black text-gray-900">{currentStreakDays} Hari</p>
            <p className="text-[10px] text-rose-600 font-semibold">
              {streakCompletedToday ? 'Tercapai hari ini!' : 'Target 15 mnt/hari'}
            </p>
          </div>
        </div>

        {/* Buku Selesai */}
        <div
          onClick={() => onNavigate('analytics')}
          className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6546C7] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Buku Dibaca</p>
            <p className="text-xl font-black text-gray-900">{userProfile?.booksReadCount || 0} Judul</p>
            <p className="text-[10px] text-purple-700 font-semibold">Khatam & pengayaan</p>
          </div>
        </div>

        {/* Pinjaman Aktif */}
        <div
          onClick={() => onNavigate('my-loans')}
          className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Peminjaman</p>
            <p className="text-xl font-black text-gray-900">{activeLoans.length} Buku</p>
            <p className="text-[10px] text-blue-600 font-semibold">
              {activeLoans.some((l) => l.status === 'Terlambat') ? 'Ada terlambat' : 'Tepat waktu'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Reading Streak Feature Widget */}
      {userProfile ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-orange-200/80 shadow-xs space-y-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  streakCompletedToday
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white'
                    : 'bg-gradient-to-tr from-orange-500 to-rose-500 text-white'
                }`}
              >
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-base text-gray-900">
                    Daily Reading Streak: {currentStreakDays} Hari Beruntun
                  </h3>
                  {streakCompletedToday ? (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Target Hari Ini Tercapai!
                    </span>
                  ) : (
                    <span className="text-[11px] font-extrabold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                      Butuh {remainingMinutes} Menit Lagi
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Login setiap hari (+{DAILY_LOGIN_BONUS_POINTS} Poin) dan baca minimal {streakMinRequired} menit (+{DAILY_STREAK_BONUS_POINTS} Poin Streak) untuk menjaga rekor membaca beruntun Anda.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartDailyReading}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                streakCompletedToday
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#6546C7] hover:bg-purple-700 text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{streakCompletedToday ? 'Baca Tambahan' : 'Mulai Baca Sekarang'}</span>
            </button>
          </div>

          {/* Two Daily Streak Requirements + 7-Day Visual Strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Requirement 1: Daily Login Check-in */}
            <div
              className={`md:col-span-4 p-3.5 rounded-2xl border flex items-center justify-between ${
                loggedInToday
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${
                    loggedInToday ? 'text-emerald-600 fill-emerald-100' : 'text-gray-400'
                  }`}
                />
                <div className="text-xs">
                  <p className="font-bold">1. Login Harian</p>
                  <p className="text-[11px] opacity-80">
                    {loggedInToday ? 'Tercatat hari ini' : 'Belum tercatat'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                +{DAILY_LOGIN_BONUS_POINTS} Pts
              </span>
            </div>

            {/* Requirement 2: 15-Minute Reading Progress */}
            <div className="md:col-span-5 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#6546C7]" />
                  <span>
                    2. Membaca Minimal {streakMinRequired} Menit ({todayMinutes}/{streakMinRequired} mnt)
                  </span>
                </span>
                <span className="text-[11px] font-black text-[#6546C7]">
                  +{DAILY_STREAK_BONUS_POINTS} Pts
                </span>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-purple-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    streakCompletedToday
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-[#6546C7] to-[#4285F4]'
                  }`}
                  style={{ width: `${streakMinutesPercent}%` }}
                ></div>
              </div>
            </div>

            {/* 7-Day Cycle Indicator */}
            <div className="md:col-span-3 p-3 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                <span>Siklus 7 Hari</span>
                <span className="text-orange-600">{filledChainCount}/7 Hari</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const active = i < filledChainCount;
                  return (
                    <div
                      key={i}
                      className={`h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                        active
                          ? 'bg-gradient-to-b from-orange-400 to-rose-500 text-white shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-400'
                      }`}
                      title={`Hari ke-${i + 1}`}
                    >
                      {active ? '✓' : i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900">
                Fitur Daily Reading Streak
              </h3>
              <p className="text-xs text-gray-600">
                Masuk dengan Google setiap hari (+5 Poin) dan baca minimal 15 menit (+25 Poin Streak) untuk membangun rekor literasi Anda!
              </p>
            </div>
          </div>
          <button
            onClick={loginWithGoogle}
            className="px-4 py-2 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 inline-flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Mulai Streak Hari Ini</span>
          </button>
        </div>
      )}

      {/* Two Column Layout: Continue Reading & Active Loans with RETURN BUTTONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Continue Reading (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6546C7]" />
              <span>Lanjutkan Membaca</span>
            </h2>
            <button
              onClick={() => onNavigate('favorites')}
              className="text-xs font-semibold text-[#6546C7] hover:underline"
            >
              Riwayat Lengkap &rarr;
            </button>
          </div>

          {recentHistories.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-xs text-gray-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-gray-300" />
              <p>Belum ada riwayat membaca tercatat.</p>
              <button
                onClick={() => onNavigate('catalog')}
                className="text-xs text-[#6546C7] font-bold hover:underline"
              >
                Buka Katalog Buku Digital &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentHistories.map((hist) => {
                const book = books.find((b) => b.id === hist.bookId);
                return (
                  <div
                    key={hist.id}
                    className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-purple-300 transition-all flex items-center gap-4 group"
                  >
                    <img
                      src={hist.bookCover}
                      alt={hist.bookTitle}
                      className="w-14 h-20 object-cover rounded-xl shadow-xs shrink-0"
                    />
                    <div className="flex-1 overflow-hidden space-y-2">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate group-hover:text-[#6546C7] transition-colors">
                          {hist.bookTitle}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Halaman {hist.lastPage} dari {hist.totalPages} ({hist.progressPercent}%)
                        </p>
                      </div>

                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${hist.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (book) onReadBook(book);
                      }}
                      className="px-3.5 py-2 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
                    >
                      Lanjut
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Loans & Deadlines (6 cols) with Return Feature */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-blue-600" />
              <span>Peminjaman Aktif Saya</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenBorrow()}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#6546C7] font-bold text-xs rounded-lg border border-purple-200 flex items-center gap-1 transition-colors"
                title="Pinjam Buku Baru"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pinjam Buku</span>
              </button>
              <button
                onClick={() => onNavigate('my-loans')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Semua &rarr;
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {!userProfile ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center space-y-3">
                <BookmarkCheck className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500 font-medium">
                  Masuk dengan Google untuk mengaktifkan layanan peminjaman mandiri.
                </p>
                <button
                  onClick={loginWithGoogle}
                  className="px-4 py-2 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk dengan Google</span>
                </button>
              </div>
            ) : activeLoans.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center space-y-3">
                <BookmarkCheck className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500 font-medium">
                  Anda belum memiliki peminjaman aktif saat ini.
                </p>
                <button
                  onClick={() => handleOpenBorrow()}
                  className="px-4 py-2 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Pinjam Buku Sekarang</span>
                </button>
              </div>
            ) : (
              activeLoans.map((loan) => {
                const book = books.find((b) => b.id === loan.bookId);
                return (
                  <div
                    key={loan.id}
                    className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={loan.bookCover}
                          alt={loan.bookTitle}
                          className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-1">
                            {loan.bookTitle}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Jatuh tempo: <span className="font-semibold text-gray-700">{loan.dueDate}</span>
                          </p>
                          {loan.fineAmount > 0 && (
                            <span className="font-bold text-rose-600 text-[10px]">
                              Denda: Rp {loan.fineAmount.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          loan.status === 'Dipinjam'
                            ? 'bg-blue-100 text-blue-800'
                            : loan.status === 'Terlambat'
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>

                    {/* Return Action & Read Action */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setReturningLoan(loan);
                          setReturnNotes('Buku selesai dibaca, dikembalikan via dashboard');
                        }}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Kembalikan Buku</span>
                      </button>
                      {book && (
                        <button
                          onClick={() => onReadBook(book)}
                          className="py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Baca</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grade Level Curriculum Recommendations with PINJAM BUTTON */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gray-900">
              Rekomendasi Modul {userProfile?.role === 'guru' ? 'Referensi Pendidik' : `Kelas ${userProfile?.classGrade || 'XI'}`}
            </h2>
            <p className="text-xs text-gray-500">
              Buku teks dan pengayaan yang disesuaikan dengan kurikulum MA Az Zahrah
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-[#6546C7] hover:underline"
          >
            Lihat Semua &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {gradeRecommendations.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-purple-300 transition-all flex flex-col group"
            >
              <div
                onClick={() => onOpenBook(book)}
                className="aspect-3/4 overflow-hidden bg-gray-100 relative cursor-pointer"
              >
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                  {book.category}
                </span>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/90 text-gray-800 text-[9px] font-bold">
                  Tersedia: {book.availableCopies}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4
                    onClick={() => onOpenBook(book)}
                    className="font-bold text-xs text-gray-900 line-clamp-2 cursor-pointer hover:text-[#6546C7] transition-colors"
                  >
                    {book.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{book.author}</p>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleOpenBorrow(book)}
                    className="flex-1 py-1.5 bg-[#6546C7] hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <BookmarkCheck className="w-3 h-3" />
                    <span>Pinjam</span>
                  </button>
                  <button
                    onClick={() => onOpenBook(book)}
                    className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Madrasah Announcements Section */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-3xl p-5 border border-purple-100 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#6546C7]" />
            <h3 className="font-bold text-sm text-gray-900">
              Pengumuman Perpustakaan MA AZ ZAHRAH
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {announcements.slice(0, 2).map((ann) => (
              <div
                key={ann.id}
                className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 line-clamp-1">{ann.title}</span>
                  {ann.priority === 'penting' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      Penting
                    </span>
                  )}
                </div>
                <p className="text-gray-600 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
                <p className="text-[10px] text-gray-400">
                  Oleh {ann.authorName} &bull; {ann.createdAt.split('T')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Borrow Modal for Student & Teacher */}
      {showBorrowModal && userProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-[#6546C7]" />
                <h3 className="font-bold text-base text-gray-900">
                  Formulir Peminjaman Buku {isTeacher ? 'Pendidik' : 'Santri'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowBorrowModal(false);
                  setBorrowSuccess(false);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {borrowSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Peminjaman Berhasil!</p>
                  <p className="text-emerald-700 mt-0.5">
                    Data transaksi peminjaman telah tercatat di Firestore dan terhubung langsung ke meja sirkulasi Petugas & Super Admin.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedBook) return;
                  const ok = await requestBorrow(selectedBook, borrowDuration, borrowNotes);
                  if (ok) {
                    setBorrowSuccess(true);
                    setTimeout(() => {
                      setBorrowSuccess(false);
                      setShowBorrowModal(false);
                    }, 2000);
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Pilih Buku dari Koleksi:
                  </label>
                  <select
                    value={selectedBook?.id || ''}
                    onChange={(e) => {
                      const found = books.find((b) => b.id === e.target.value);
                      if (found) setSelectedBook(found);
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden font-medium text-gray-800"
                  >
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.author}) - Sisa {b.availableCopies} Eksemplar
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBook && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
                    <img
                      src={selectedBook.coverUrl}
                      alt={selectedBook.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{selectedBook.title}</h4>
                      <p className="text-[11px] text-gray-500">{selectedBook.author} &bull; {selectedBook.category}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {selectedBook.availableCopies > 0 ? `Tersedia ${selectedBook.availableCopies} eksemplar` : 'Sedang Habis'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Durasi Pinjam:
                    </label>
                    <select
                      value={borrowDuration}
                      onChange={(e) => setBorrowDuration(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                    >
                      <option value={3}>3 Hari (Koleksi Ringkas)</option>
                      <option value={7}>7 Hari (Standar Santri)</option>
                      <option value={14}>14 Hari (Standar Pendidik)</option>
                      <option value={30}>30 Hari (Riset / Modul Ajar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Peminjam:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${userProfile?.displayName} (${userProfile?.classGrade || userProfile?.role})`}
                      className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Catatan Keperluan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Modul ajar semester genap, telaah fikih, tugas kelompok..."
                    value={borrowNotes}
                    onChange={(e) => setBorrowNotes(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBorrowModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedBook || selectedBook.availableCopies <= 0}
                    className="flex-1 py-2.5 bg-[#6546C7] hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Konfirmasi Pinjam</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Return Book Modal */}
      {returningLoan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-gray-900">
                  Kembalikan Buku
                </h3>
              </div>
              <button
                onClick={() => setReturningLoan(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
              <img
                src={returningLoan.bookCover}
                alt={returningLoan.bookTitle}
                className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
              />
              <div className="text-xs">
                <h4 className="font-bold text-gray-900 line-clamp-1">{returningLoan.bookTitle}</h4>
                <p className="text-[11px] text-gray-500">Dipinjam sejak: {returningLoan.borrowDate}</p>
                <p className="text-[11px] text-gray-500">Jatuh tempo: {returningLoan.dueDate}</p>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-[#6546C7]">
                <Sparkles className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>Bonus Literasi: +30 Poin</span>
              </p>
              <p className="text-[11px] text-purple-700 leading-relaxed">
                Pengembalian buku tepat waktu akan langsung menambah poin literasi Anda dan memperbarui status di Meja Sirkulasi Petugas & Super Admin secara realtime.
              </p>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-gray-700 mb-1">
                Catatan Kondisi Buku:
              </label>
              <input
                type="text"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setReturningLoan(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  await returnBook(returningLoan.id, returnNotes);
                  setReturningLoan(null);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Konfirmasi Pengembalian</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
