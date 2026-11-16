import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Maximize,
  Minimize,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  Sparkles,
  Share2,
  Clock,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Book } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth, DAILY_STREAK_MIN_MINUTES, getLocalDateString } from '../../context/AuthContext';

interface DigitalReaderModalProps {
  book: Book;
  onClose: () => void;
  onShareAchievement?: (book: Book) => void;
}

export const DigitalReaderModal: React.FC<DigitalReaderModalProps> = ({
  book,
  onClose,
  onShareAchievement
}) => {
  const { saveReadingProgress, readingHistory } = useLibrary();
  const { userProfile } = useAuth();

  const existingHistory = readingHistory.find((h) => h.bookId === book.id);
  const initialPage = existingHistory?.lastPage || 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const totalPages = book.pages || 150;
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([1]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentPageRef = useRef<number>(initialPage);
  const syncedMinutesRef = useRef<number>(0);
  const elapsedSecondsRef = useRef<number>(0);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Real-time reading session timer: syncs elapsed whole minutes accurately every 60s
  useEffect(() => {
    if (!userProfile) return;

    const timer = window.setInterval(() => {
      elapsedSecondsRef.current += 1;
      setElapsedSeconds(elapsedSecondsRef.current);

      const wholeMinutesElapsed = Math.floor(elapsedSecondsRef.current / 60);
      if (wholeMinutesElapsed > syncedMinutesRef.current) {
        const delta = wholeMinutesElapsed - syncedMinutesRef.current;
        syncedMinutesRef.current = wholeMinutesElapsed;
        saveReadingProgress(book, currentPageRef.current, totalPages, delta);
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [book.id, totalPages, userProfile?.uid]);

  const handleCloseReader = async () => {
    if (userProfile) {
      const wholeMinutesElapsed = Math.floor(elapsedSecondsRef.current / 60);
      const unsyncedMinutes = wholeMinutesElapsed - syncedMinutesRef.current;
      // Credit 1 minute if the reader spent at least 30 seconds without a minute sync yet
      const finalDelta =
        unsyncedMinutes > 0
          ? unsyncedMinutes
          : elapsedSecondsRef.current >= 30 && syncedMinutesRef.current === 0
          ? 1
          : 0;

      if (finalDelta > 0) {
        syncedMinutesRef.current += finalDelta;
        await saveReadingProgress(book, currentPageRef.current, totalPages, finalDelta);
      }
    }
    onClose();
  };

  const isBookmarked = bookmarks.includes(currentPage);

  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(bookmarks.filter((p) => p !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  // Turn page and record page progress (without duplicating minutes on quick clicks)
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    currentPageRef.current = newPage;

    if (userProfile) {
      const wholeMinutesElapsed = Math.floor(elapsedSecondsRef.current / 60);
      const delta = Math.max(0, wholeMinutesElapsed - syncedMinutesRef.current);
      if (delta > 0) {
        syncedMinutesRef.current += delta;
      }
      saveReadingProgress(book, newPage, totalPages, delta);
    }

    if (newPage === totalPages && !showCelebration) {
      setShowCelebration(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const themeStyles = {
    light: 'bg-white text-gray-900 border-gray-200',
    sepia: 'bg-[#Fbf0d9] text-[#4a3b2c] border-[#ebd4b4]',
    dark: 'bg-[#181824] text-gray-100 border-gray-800'
  };

  const fontSizes = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-lg sm:text-xl leading-loose',
    xlarge: 'text-xl sm:text-2xl leading-loose'
  };

  const contentChapters = [
    {
      title: 'Mukadimah & Bismillah',
      text: `Bismillaahir-rahmaanir-rahiim. Segala puji bagi Allah SWT Tuhan semesta alam, Shalawat serta salam senantiasa tercurah kepada junjungan kita Nabi Muhammad SAW.\n\nBuku "${book.title}" ini diperuntukkan bagi segenap santri madrasah aliyah dan pembelajar yang bertekad memperdalam ilmu pengetahuan dan integritas moral (akhlakul karimah).\n\n"Bacalah dengan (menyebut) nama Tuhanmu yang menciptakan, Dia telah menciptakan manusia dari segumpal darah. Bacalah, dan Tuhanmulah Yang Mahamulia, Yang mengajar (manusia) dengan pena." (QS. Al-'Alaq: 1-4).`
    },
    {
      title: 'Bab I: Landasan dan Konsep Inti',
      text: book.contentSnippet || `Pembahasan utama pada bab pertama mencakup dasar-dasar konseptual, dalil-dalil syar'i, serta aplikasi sains praktis.\n\nDi lingkungan MA Az Zahrah Pasuruan, penguasaan literasi bukan sekadar hafalan teoritis melainkan pembentukan karakter santri yang kritis, beradab, dan tanggap terhadap perkembangan zaman.\n\nSetiap bab dirancang sistematis dilengkapi studi kasus kontekstual pesisir Pasuruan dan tantangan era digital.`
    },
    {
      title: 'Bab II: Pendalaman Materi & Diskusi Ilmiah',
      text: `Pada bab kedua ini, pembaca diajak mengkaji lebih mendalam terkait metodologi analisis, perbandingan madzhab keilmuan, serta korelasi antara riset modern dan khazanah keislaman klasik.\n\nKeberhasilan belajar ditentukan oleh kontinuitas (istiqamah) dalam membaca dan merangkum intisari ilmu pengetahuan.`
    },
    {
      title: 'Bab III: Penerapan Praktis dalam Keseharian',
      text: `Ilmu tanpa amal laksana pohon tanpa buah. Santri MA Az Zahrah didorong untuk mengamalkan setiap wawasan yang diperoleh dalam kehidupan berasrama, di madrasah, dan di tengah masyarakat luas.\n\nIntegritas, kejernihan berpikir, dan sikap tawadhu' menjadi cerminan sejati generasi berilmu.`
    },
    {
      title: 'Penutup & Khatam Pembelajaran',
      text: `Alhamdulillah, Anda telah menyelesaikan rangkaian pembahasan dalam buku "${book.title}". Semoga ilmu yang diperoleh berkah, bermanfaat bagi agama, nusa, dan bangsa.\n\nSelamat atas ketuntasan membaca! Poin literasi telah ditambahkan ke akun madrasah Anda.`
    }
  ];

  const currentChapterIndex = Math.min(
    contentChapters.length - 1,
    Math.floor(((currentPage - 1) / Math.max(1, totalPages)) * contentChapters.length)
  );
  const currentChapter = contentChapters[currentChapterIndex];

  const progressPercent = Math.round((currentPage / Math.max(1, totalPages)) * 100);

  const todayStr = getLocalDateString();
  const isTodayProfile =
    userProfile?.lastReadDate === todayStr || userProfile?.lastLoginDate === todayStr;
  const savedTodayMinutes = isTodayProfile ? (userProfile?.todayMinutesRead || 0) : 0;
  const sessionUnsyncedSec = elapsedSeconds % 60;
  const sessionMins = Math.floor(elapsedSeconds / 60);
  const formatTimer = `${String(sessionMins).padStart(2, '0')}:${String(sessionUnsyncedSec).padStart(2, '0')}`;
  const streakCompletedToday = savedTodayMinutes >= DAILY_STREAK_MIN_MINUTES;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-between animate-in fade-in">
      {/* Top Reader Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-2.5 flex items-center justify-between text-gray-800 gap-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={handleCloseReader}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Tutup Reader"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="overflow-hidden">
            <h2 className="text-xs sm:text-sm font-bold truncate text-gray-900">
              {book.title}
            </h2>
            <p className="text-[11px] text-gray-500 truncate">
              {book.author} &bull; {currentChapter.title}
            </p>
          </div>
        </div>

        {/* Reader Controls + Daily Streak Live Timer */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {userProfile && (
            <div
              className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                streakCompletedToday
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title="Progres Daily Reading Streak (minimal 15 menit hari ini)"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sesi {formatTimer}</span>
              <span className="opacity-40">|</span>
              <Flame className={`w-3.5 h-3.5 ${streakCompletedToday ? 'text-emerald-600' : 'text-rose-500 fill-rose-500'}`} />
              <span>
                {Math.min(savedTodayMinutes, DAILY_STREAK_MIN_MINUTES)}/{DAILY_STREAK_MIN_MINUTES} mnt
              </span>
            </div>
          )}

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              isBookmarked
                ? 'bg-amber-100 text-amber-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Tandai Halaman (Bookmark)"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">
              {isBookmarked ? 'Tersimpan' : 'Bookmark'}
            </span>
          </button>

          {/* Font Size Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 text-xs font-semibold">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg ${fontSize === 'normal' ? 'bg-white shadow-xs text-purple-700' : 'text-gray-600'}`}
              title="Huruf Standar"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg font-bold ${fontSize === 'large' ? 'bg-white shadow-xs text-purple-700' : 'text-gray-600'}`}
              title="Huruf Besar"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded-lg font-extrabold ${fontSize === 'xlarge' ? 'bg-white shadow-xs text-purple-700' : 'text-gray-600'}`}
              title="Huruf Ekstra Besar"
            >
              A++
            </button>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg ${theme === 'light' ? 'bg-white text-amber-600 shadow-xs' : 'text-gray-500'}`}
              title="Mode Terang"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-lg ${theme === 'sepia' ? 'bg-[#f0dfc4] text-amber-800 shadow-xs' : 'text-gray-500'}`}
              title="Mode Sepia (Kertas Lembut)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-amber-300 shadow-xs' : 'text-gray-500'}`}
              title="Mode Gelap"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl hidden sm:block"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Reading Page Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
        <div
          className={`w-full max-w-3xl min-h-[520px] rounded-2xl p-6 sm:p-12 shadow-2xl border transition-all flex flex-col justify-between ${themeStyles[theme]}`}
        >
          {/* Chapter header */}
          <div className="border-b pb-4 mb-6 border-current/15 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-bold opacity-70">
              {book.category} &bull; MA AZ ZAHRAH
            </span>
            <span className="text-xs font-semibold opacity-70">
              Hal {currentPage} dari {totalPages}
            </span>
          </div>

          {/* Book Content */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl sm:text-2xl font-black mb-4">
              {currentChapter.title}
            </h3>
            <div className={`space-y-4 whitespace-pre-line font-serif ${fontSizes[fontSize]}`}>
              {currentChapter.text}
            </div>
          </div>

          {/* Chapter footer note */}
          <div className="pt-6 border-t border-current/15 mt-6 flex items-center justify-between text-xs opacity-60">
            <span>E-Library MAZRAH Pasuruan</span>
            <span>Kemajuan: {progressPercent}%</span>
          </div>
        </div>
      </main>

      {/* Khatam Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-60 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">
              Alhamdulillah, Khatam!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Selamat, kamu telah menyelesaikan membaca buku <strong>"{book.title}"</strong>. Terus pertahankan semangat literasi santri MA Az Zahrah!
            </p>

            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>+50 Poin Literasi & Lencana Terbuka!</span>
            </div>

            <div className="flex gap-2 pt-2">
              {onShareAchievement && (
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    onShareAchievement(book);
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan Prestasi</span>
                </button>
              )}
              <button
                onClick={() => setShowCelebration(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Lanjut Membaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation & Page Slider */}
      <footer className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between text-gray-800 gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Page Slider */}
        <div className="flex-1 max-w-md flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            className="w-full accent-[#6546C7] h-2 bg-gray-200 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-bold text-gray-700 shrink-0 min-w-[65px] text-right">
            {currentPage} / {totalPages}
          </span>
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 sm:px-4 py-2 bg-[#6546C7] hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
