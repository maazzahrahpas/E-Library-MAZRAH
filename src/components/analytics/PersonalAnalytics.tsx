import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { useAuth, DAILY_STREAK_MIN_MINUTES, getLocalDateString } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';

export const PersonalAnalytics: React.FC = () => {
  const { userProfile, updateProfileData, loginWithGoogle } = useAuth();
  const { readingHistory } = useLibrary();

  const [targetInput, setTargetInput] = useState<number>(
    userProfile?.dailyReadingGoalMinutes || DAILY_STREAK_MIN_MINUTES
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile?.dailyReadingGoalMinutes) {
      setTargetInput(userProfile.dailyReadingGoalMinutes);
    }
  }, [userProfile?.dailyReadingGoalMinutes]);

  const todayStr = getLocalDateString();
  const isToday =
    userProfile?.lastReadDate === todayStr || userProfile?.lastLoginDate === todayStr;
  const todayMinutes = isToday ? (userProfile?.todayMinutesRead ?? 0) : 0;

  const historyMinutes = readingHistory.reduce((acc, h) => acc + (h.timeSpentMinutes || 0), 0);
  const totalMinutes = Math.max(historyMinutes, todayMinutes);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedBooksCount = readingHistory.filter((h) => h.completed).length;
  const inProgressBooksCount = readingHistory.filter((h) => !h.completed).length;
  const totalTrackedBooks = completedBooksCount + inProgressBooksCount;
  const completionRate =
    totalTrackedBooks === 0 ? 0 : Math.round((completedBooksCount / totalTrackedBooks) * 100);

  // Build real category breakdown from readingHistory
  const categoryColors = [
    'bg-emerald-500',
    'bg-purple-600',
    'bg-blue-500',
    'bg-amber-500',
    'bg-rose-500'
  ];

  const categoryCounts: Record<string, number> = {};
  readingHistory.forEach((h) => {
    const cat = h.category || 'Umum';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const totalCategoryEntries = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const categoryStats = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], idx) => ({
      name,
      count,
      percent: totalCategoryEntries === 0 ? 0 : Math.round((count / totalCategoryEntries) * 100),
      color: categoryColors[idx % categoryColors.length]
    }));

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    await updateProfileData({ dailyReadingGoalMinutes: targetInput });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!userProfile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
        <div>
          <h2 className="font-black text-lg text-gray-900">Analisis Membaca Pribadi</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Masuk dengan Google untuk memantau durasi membaca, ketuntasan buku, dan target Daily Reading Streak Anda secara realtime.
          </p>
        </div>
        <button
          onClick={loginWithGoogle}
          className="px-5 py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Masuk dengan Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Analytics Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistik Kemajuan Literasi Pribadi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Analisis Membaca
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Pantau durasi belajar, konsistensi harian, dan distribusi minat baca {userProfile.displayName}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-semibold text-gray-400">Status Akun:</span>
          <p className="text-sm font-extrabold text-[#6546C7]">
            {userProfile.role === 'guru'
              ? 'Pendidik MA Az Zahrah'
              : `Kelas ${userProfile.classGrade || 'XI'} MA Az Zahrah`}
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-bold text-gray-500">Total Waktu Baca</span>
            <Clock className="w-4 h-4 text-[#6546C7]" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {totalHours} <span className="text-xs font-normal text-gray-500">Jam</span>
          </p>
          <p className="text-[11px] text-gray-500 font-medium">{totalMinutes} menit terekam</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold text-gray-500">Tingkat Ketuntasan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{completionRate}%</p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {completedBooksCount} buku khatam sempurna
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold text-gray-500">Membaca Hari Ini</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {todayMinutes} <span className="text-xs font-normal text-gray-500">Mnt</span>
          </p>
          <p className="text-[11px] text-blue-700 font-semibold">
            {todayMinutes >= DAILY_STREAK_MIN_MINUTES
              ? 'Target streak 15m tercapai'
              : `Kurang ${DAILY_STREAK_MIN_MINUTES - todayMinutes} mnt lagi`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold text-gray-500">Streak Istiqamah</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {userProfile.readingStreakDays ?? 0}{' '}
            <span className="text-xs font-normal text-gray-500">Hari</span>
          </p>
          <p className="text-[11px] text-amber-700 font-semibold">Tanpa jeda membaca</p>
        </div>
      </div>

      {/* Category Breakdown & Today Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reading Progress Summary (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-gray-900">
                Riwayat Kemajuan Buku Digital
              </h3>
              <p className="text-xs text-gray-500">
                Progres halaman dan durasi membaca aktual per judul buku
              </p>
            </div>
            <span className="text-xs font-bold text-[#6546C7] bg-purple-50 px-2.5 py-1 rounded-lg">
              {readingHistory.length} Judul Dibuka
            </span>
          </div>

          {readingHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Belum ada aktivitas membaca tercatat. Buka salah satu buku di katalog untuk mulai mencatat kemajuan membaca Anda.
            </div>
          ) : (
            <div className="space-y-3">
              {readingHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span className="truncate max-w-[65%]">{item.bookTitle}</span>
                    <span className="text-gray-500">
                      {item.progressPercent}% ({item.timeSpentMinutes || 0} mnt)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.completed ? 'bg-emerald-500' : 'bg-[#6546C7]'
                      }`}
                      style={{ width: `${item.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-base text-gray-900">
              Minat & Kategori Buku Terbanyak
            </h3>
            <p className="text-xs text-gray-500">
              Distribusi topik bacaan berdasarkan buku yang pernah Anda baca
            </p>
          </div>

          {categoryStats.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              Statistik kategori akan tampil otomatis setelah Anda membuka buku di E-Reader.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {categoryStats.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>{cat.name}</span>
                    <span className="text-gray-500">{cat.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Target Setting Adjuster */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-100">
        <form onSubmit={handleSaveGoal} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6546C7] text-white flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">
                Atur Target Membaca Harian
              </h4>
              <p className="text-xs text-gray-500">
                Minimal 15 menit/hari untuk mempertahankan Daily Reading Streak.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs font-bold">
              {[15, 20, 30, 45].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setTargetInput(val)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    targetInput === val
                      ? 'bg-[#6546C7] text-white shadow-xs'
                      : 'text-gray-600 hover:text-purple-700'
                  }`}
                >
                  {val} Mnt
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              Simpan Target
            </button>
          </div>
        </form>

        {saveSuccess && (
          <p className="text-emerald-700 font-bold text-xs mt-3 text-right">
            Target membaca harian berhasil diperbarui menjadi {targetInput} menit/hari!
          </p>
        )}
      </div>
    </div>
  );
};
