import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  Flame,
  Award,
  Crown,
  Compass,
  Zap,
  GraduationCap,
  Moon,
  Share2,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowRight,
  TrendingUp,
  Target,
  Edit3,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { BADGE_DEFINITIONS } from '../../firebase/seedData';
import { Book, LiteracyChallenge } from '../../types/library';

interface GamificationHubProps {
  onOpenShareModal: () => void;
  onReadBook: (book: Book) => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  onOpenShareModal,
  onReadBook
}) => {
  const { userProfile, isAdmin } = useAuth();
  const { challenges, books, addChallenge, updateChallenge, deleteChallenge, allUsers } = useLibrary();

  const [leaderboardTab, setLeaderboardTab] = useState<'Semua' | 'X' | 'XI' | 'XII'>('Semua');

  // Challenge modal state
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<LiteracyChallenge | null>(null);
  const [chalTitle, setChalTitle] = useState('');
  const [chalDesc, setChalDesc] = useState('');
  const [chalBooks, setChalBooks] = useState(3);
  const [chalDays, setChalDays] = useState(14);
  const [chalPoints, setChalPoints] = useState(150);
  const [chalBadge, setChalBadge] = useState('Book Explorer');

  // Dynamically compute leaderboard from registered students in Firestore
  const studentUsers = allUsers.filter((u) => u.role === 'siswa');
  const sortedStudents = [...studentUsers].sort((a, b) => (b.points || 0) - (a.points || 0));

  const allLeaderboardData = sortedStudents.length > 0
    ? sortedStudents.map((u, idx) => ({
        rank: idx + 1,
        name: u.displayName,
        classGrade: u.classGrade || 'XI',
        points: u.points || 0,
        books: u.booksReadCount || 0,
        streak: u.readingStreakDays || 1,
        avatar: u.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isCurrentUser: u.uid === userProfile?.uid
      }))
    : userProfile && userProfile.role === 'siswa'
    ? [{
        rank: 1,
        name: userProfile.displayName,
        classGrade: userProfile.classGrade || 'XI',
        points: userProfile.points || 100,
        books: userProfile.booksReadCount || 0,
        streak: userProfile.readingStreakDays || 1,
        avatar: userProfile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isCurrentUser: true
      }]
    : [];

  const filteredLeaderboard = allLeaderboardData.filter((entry) => {
    if (leaderboardTab === 'Semua') return true;
    return entry.classGrade === leaderboardTab;
  });

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return Sparkles;
      case 'Compass': return Compass;
      case 'Flame': return Flame;
      case 'Award': return Award;
      case 'Crown': return Crown;
      case 'Zap': return Zap;
      case 'GraduationCap': return GraduationCap;
      case 'Moon': return Moon;
      default: return Award;
    }
  };

  const unlockedBadgeIds = userProfile?.badges || ['new-reader'];

  const handleOpenAddChallenge = () => {
    setEditingChallenge(null);
    setChalTitle('');
    setChalDesc('');
    setChalBooks(3);
    setChalDays(14);
    setChalPoints(150);
    setChalBadge('Book Explorer');
    setShowChallengeModal(true);
  };

  const handleOpenEditChallenge = (chal: LiteracyChallenge) => {
    setEditingChallenge(chal);
    setChalTitle(chal.title);
    setChalDesc(chal.description);
    setChalBooks(chal.targetBooks);
    setChalDays(chal.targetDays);
    setChalPoints(chal.rewardPoints);
    setChalBadge(chal.badgeReward);
    setShowChallengeModal(true);
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chalTitle.trim()) return;

    if (editingChallenge) {
      await updateChallenge(editingChallenge.id, {
        title: chalTitle,
        description: chalDesc,
        targetBooks: chalBooks,
        targetDays: chalDays,
        rewardPoints: chalPoints,
        badgeReward: chalBadge
      });
    } else {
      await addChallenge({
        title: chalTitle,
        description: chalDesc,
        targetBooks: chalBooks,
        targetDays: chalDays,
        rewardPoints: chalPoints,
        badgeReward: chalBadge,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + chalDays * 86400000).toISOString().split('T')[0],
        participantsCount: 0,
        isActive: true
      });
    }

    setShowChallengeModal(false);
  };

  const handleDeleteChallenge = async (chal: LiteracyChallenge) => {
    if (confirm(`Apakah Anda yakin ingin menghapus tantangan literasi "${chal.title}"?`)) {
      await deleteChallenge(chal.id);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Gamification Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#6546C7] text-white p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-yellow-200">
              <Trophy className="w-4 h-4" />
              <span>Ekosistem Gamifikasi Literasi Santri</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Pusat Prestasi & Papan Peringkat
            </h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Kumpulkan poin literasi dari setiap halaman bacaan, raih lencana kehormatan madrasah, dan jadilah inspirasi bagi seluruh santri MA Az Zahrah Pasuruan!
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/25 text-center shrink-0 space-y-2">
            <p className="text-xs text-white/80 font-bold">Pencapaian Pribadi</p>
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-2xl font-black text-amber-300">{userProfile?.points || 0}</p>
                <p className="text-[10px] text-white/80">Total Poin</p>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div>
                <p className="text-2xl font-black text-amber-300">{userProfile?.readingStreakDays || 1}</p>
                <p className="text-[10px] text-white/80">Streak Hari</p>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div>
                <p className="text-2xl font-black text-amber-300">{unlockedBadgeIds.length}</p>
                <p className="text-[10px] text-white/80">Lencana</p>
              </div>
            </div>

            <button
              onClick={onOpenShareModal}
              className="w-full mt-2 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Kartu Prestasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Point Rules Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-3">
        <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Cara Mendapatkan Poin Literasi MAZRAH</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
            <p className="font-extrabold text-[#6546C7] text-base">+10 Pts</p>
            <p className="text-gray-600 text-[11px] mt-0.5">Membaca E-Book di aplikasi</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
            <p className="font-extrabold text-amber-700 text-base">+50 Pts</p>
            <p className="text-gray-600 text-[11px] mt-0.5">Menuntaskan (khatam) 1 buku</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <p className="font-extrabold text-emerald-700 text-base">+20 Pts</p>
            <p className="text-gray-600 text-[11px] mt-0.5">Menulis resensi & ulasan santri</p>
          </div>
          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
            <p className="font-extrabold text-rose-600 text-base">+25 Pts</p>
            <p className="text-gray-600 text-[11px] mt-0.5">Streak membaca 7 hari beruntun</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 col-span-2 sm:col-span-1">
            <p className="font-extrabold text-blue-700 text-base">+150 Pts</p>
            <p className="text-gray-600 text-[11px] mt-0.5">Menyelesaikan tantangan bulanan</p>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-[#6546C7]" />
              <span>Lencana Kehormatan Literasi (Badges)</span>
            </h2>
            <p className="text-xs text-gray-500">
              Buka setiap lencana melalui konsistensi membaca dan aktivitas di perpustakaan
            </p>
          </div>
          <span className="text-xs font-bold text-[#6546C7] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {unlockedBadgeIds.length} dari {BADGE_DEFINITIONS.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {BADGE_DEFINITIONS.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);
            const Icon = getBadgeIcon(badge.icon);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white border-purple-200 shadow-xs hover:shadow-md'
                    : 'bg-gray-50/70 border-gray-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                        isUnlocked
                          ? `bg-gradient-to-tr ${badge.color}`
                          : 'bg-gray-300 text-gray-500'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Terbuka
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        Terkunci
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-xs sm:text-sm text-gray-900">
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-400">
                  <span>Syarat: {badge.requiredPoints} Pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>Papan Peringkat Literasi Madrasah (Leaderboard)</span>
            </h2>
            <p className="text-xs text-gray-500">
              Peringkat pembaca tergiat MA Az Zahrah Pasuruan diperbarui secara realtime
            </p>
          </div>

          {/* Leaderboard Class Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
            {(['Semua', 'X', 'XI', 'XII'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setLeaderboardTab(tab)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  leaderboardTab === tab
                    ? 'bg-white text-[#6546C7] shadow-xs'
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                {tab === 'Semua' ? 'Keseluruhan' : `Kelas ${tab}`}
              </button>
            ))}
          </div>
        </div>

        {filteredLeaderboard.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-2">
            <Trophy className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="font-bold text-gray-800 text-sm">Belum Ada Peringkat Santri</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Belum ada santri terdaftar pada kategori tingkat ini. Masuk dengan Google dan baca buku untuk memimpin peringkat literasi!
            </p>
          </div>
        ) : (
          <>
            {/* Podium Top 3 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 max-w-2xl mx-auto items-end">
          {/* Rank 2 */}
          {filteredLeaderboard[1] && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 text-center shadow-xs flex flex-col items-center order-1 h-[210px] justify-between">
              <div className="relative">
                <img
                  src={filteredLeaderboard[1].avatar}
                  alt={filteredLeaderboard[1].name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-gray-300"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-300 text-gray-800 text-xs font-black flex items-center justify-center shadow-xs">
                  2
                </span>
              </div>
              <div className="w-full">
                <p className="font-extrabold text-xs text-gray-900 truncate">
                  {filteredLeaderboard[1].name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-gray-500">Kelas {filteredLeaderboard[1].classGrade}</p>
                <p className="text-xs font-black text-[#6546C7] mt-1">
                  {filteredLeaderboard[1].points} Pts
                </p>
              </div>
              <div className="w-full h-8 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-600">
                Perak
              </div>
            </div>
          )}

          {/* Rank 1 (Champion) */}
          {filteredLeaderboard[0] && (
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-3 sm:p-4 border-2 border-amber-300 text-center shadow-md flex flex-col items-center order-2 h-[240px] justify-between relative">
              <Crown className="w-6 h-6 text-amber-500 fill-amber-400 -mb-2" />
              <div className="relative">
                <img
                  src={filteredLeaderboard[0].avatar}
                  alt={filteredLeaderboard[0].name}
                  className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover ring-4 ring-amber-400"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-purple-950 text-xs font-black flex items-center justify-center shadow-xs">
                  1
                </span>
              </div>
              <div className="w-full">
                <p className="font-extrabold text-xs sm:text-sm text-gray-900 truncate">
                  {filteredLeaderboard[0].name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-gray-500">Kelas {filteredLeaderboard[0].classGrade}</p>
                <p className="text-sm font-black text-amber-600 mt-1">
                  {filteredLeaderboard[0].points} Pts
                </p>
              </div>
              <div className="w-full h-10 bg-amber-400 text-purple-950 rounded-xl flex items-center justify-center text-[11px] font-black shadow-xs">
                Emas
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {filteredLeaderboard[2] && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 text-center shadow-xs flex flex-col items-center order-3 h-[190px] justify-between">
              <div className="relative">
                <img
                  src={filteredLeaderboard[2].avatar}
                  alt={filteredLeaderboard[2].name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-amber-700/40"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center shadow-xs">
                  3
                </span>
              </div>
              <div className="w-full">
                <p className="font-extrabold text-xs text-gray-900 truncate">
                  {filteredLeaderboard[2].name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-gray-500">Kelas {filteredLeaderboard[2].classGrade}</p>
                <p className="text-xs font-black text-[#6546C7] mt-1">
                  {filteredLeaderboard[2].points} Pts
                </p>
              </div>
              <div className="w-full h-6 bg-amber-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-amber-800">
                Perunggu
              </div>
            </div>
          )}
        </div>

        {/* Full Ranking Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-gray-100 text-xs">
            {filteredLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`p-3.5 sm:px-6 flex items-center justify-between gap-3 ${
                  entry.isCurrentUser ? 'bg-purple-50/80 font-bold border-l-4 border-l-[#6546C7]' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-black ${entry.rank <= 3 ? 'text-[#6546C7]' : 'text-gray-400'}`}>
                    #{entry.rank}
                  </span>
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                  />
                  <div>
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{entry.name}</span>
                      {entry.isCurrentUser && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#6546C7] text-white">
                          Kamu
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Kelas {entry.classGrade} &bull; {entry.books} buku &bull; streak {entry.streak} hari
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#6546C7] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    {entry.points} Pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}
      </div>

      {/* Active Literacy Challenges */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-500" />
              <span>Tantangan Literasi Madrasah Berhadiah</span>
            </h2>
            <p className="text-xs text-gray-500">
              Ikuti program tantangan membaca bulanan dan dapatkan sertifikat kehormatan
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddChallenge}
              className="px-3.5 py-2 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tantangan Baru</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {challenges.map((chal) => (
            <div
              key={chal.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                    {chal.targetDays} Hari
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      +{chal.rewardPoints} Pts
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-0.5 ml-1 border-l pl-1 border-gray-200">
                        <button
                          onClick={() => handleOpenEditChallenge(chal)}
                          className="p-1 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded"
                          title="Sunting Tantangan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(chal)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Tantangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-gray-900">
                  {chal.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {chal.description}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Target: {chal.targetBooks} Buku</span>
                  <span>{chal.participantsCount} Santri Terdaftar</span>
                </div>

                <button
                  onClick={() => {
                    const firstBook = books[0];
                    if (firstBook) onReadBook(firstBook);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-[#6546C7] to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                >
                  <span>Mulai Membaca Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                {editingChallenge ? 'Sunting Tantangan Literasi' : 'Tambah Tantangan Literasi'}
              </h3>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitChallenge} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Judul Tantangan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tantangan Khatam 5 Buku Ramadhan"
                  value={chalTitle}
                  onChange={(e) => setChalTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Deskripsi Tantangan:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Deskripsi kegiatan membaca dan kriteria kelulusan..."
                  value={chalDesc}
                  onChange={(e) => setChalDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Buku:</label>
                  <input
                    type="number"
                    min={1}
                    value={chalBooks}
                    onChange={(e) => setChalBooks(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Durasi (Hari):</label>
                  <input
                    type="number"
                    min={1}
                    value={chalDays}
                    onChange={(e) => setChalDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Poin Hadiah:</label>
                  <input
                    type="number"
                    min={10}
                    value={chalPoints}
                    onChange={(e) => setChalPoints(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Hadiah Lencana:</label>
                <select
                  value={chalBadge}
                  onChange={(e) => setChalBadge(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="New Reader">New Reader</option>
                  <option value="Book Explorer">Book Explorer</option>
                  <option value="Reading Enthusiast">Reading Enthusiast</option>
                  <option value="Master Reader">Master Reader</option>
                  <option value="Literacy Champion">Literacy Champion</option>
                  <option value="Madrasah Scholar">Madrasah Scholar</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChallengeModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingChallenge ? 'Simpan Perubahan' : 'Buat Tantangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
