import React, { useState } from 'react';
import {
  X,
  Share2,
  Sparkles,
  Trophy,
  Flame,
  Award,
  BookOpen,
  Copy,
  Check,
  Send,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types/library';

interface ShareAchievementModalProps {
  onClose: () => void;
  sharedBook?: Book | null;
}

export const ShareAchievementModal: React.FC<ShareAchievementModalProps> = ({
  onClose,
  sharedBook
}) => {
  const { userProfile } = useAuth();
  const [copied, setCopied] = useState(false);

  const studentName = userProfile?.displayName || 'Santri MA Az Zahrah';
  const studentClass = userProfile?.classGrade || 'XI';
  const points = userProfile?.points ?? 0;
  const streak = userProfile?.readingStreakDays ?? 0;
  const booksRead = userProfile?.booksReadCount ?? 0;

  const shareText = sharedBook
    ? `Alhamdulillah! Saya baru saja membaca "${sharedBook.title}" di E-Library MAZRAH (MA AZ ZAHRAH Kota Pasuruan). Total poin literasi saya: ${points} Pts | Streak: ${streak} Hari. Ayo tingkatkan budaya literasi madrasah! #ELibraryMAZRAH #MAAzZahrahPasuruan #LiterasiMadrasah`
    : `Saya bangga menjadi bagian dari ekosistem literasi digital E-Library MAZRAH - MA AZ ZAHRAH Kota Pasuruan! 📚 Poin: ${points} Pts | 🔥 Streak: ${streak} Hari | 📖 ${booksRead} Buku Selesai. "Jelajahi Dunia, Mulai dari Membaca" #MAAzZahrahPasuruan #ELibraryMAZRAH`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#6546C7]" />
            <h2 className="font-bold text-sm text-gray-900">
              Bagikan Prestasi Literasi Santri
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Card Visual Preview */}
          <div
            id="achievement-card"
            className="rounded-3xl bg-gradient-to-br from-[#452b99] via-[#6546C7] to-[#3b82f6] text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-5"
          >
            {/* Background glowing orbs */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-amber-400/20 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

            {/* School & App Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src="/assets/aistudio/1783567162468_6ebfd163.png"
                    alt="Logo MA Az Zahrah Pasuruan"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-extrabold text-xs tracking-tight">E-Library MAZRAH</p>
                  <p className="text-[9px] text-white/70">MA AZ ZAHRAH PASURUAN</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 font-black text-[9px] uppercase tracking-wider">
                Kartu Prestasi
              </span>
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-3.5">
              <img
                src={
                  userProfile?.photoURL ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
                }
                alt={studentName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/40 shadow-md shrink-0"
              />
              <div className="overflow-hidden">
                <h3 className="font-black text-base sm:text-lg text-white truncate">
                  {studentName}
                </h3>
                <p className="text-xs text-amber-200 font-semibold">
                  {userProfile?.role === 'guru' ? 'Pendidik MA Az Zahrah' : `Santri Kelas ${studentClass} MA Az Zahrah`}
                </p>
              </div>
            </div>

            {/* Book Highlight (if shared from book or khatam) */}
            {sharedBook && (
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex items-center gap-3">
                <img
                  src={sharedBook.coverUrl}
                  alt={sharedBook.title}
                  className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-xs"
                />
                <div className="overflow-hidden text-xs">
                  <p className="font-bold text-white line-clamp-1">{sharedBook.title}</p>
                  <p className="text-[10px] text-white/70 truncate">{sharedBook.author}</p>
                  <p className="text-[10px] text-amber-300 font-semibold mt-1">
                    Khatam Dibaca &bull; +50 Poin
                  </p>
                </div>
              </div>
            )}

            {/* Metrics Triplet */}
            <div className="grid grid-cols-3 gap-2 bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <div>
                <p className="text-lg font-black text-amber-300 flex items-center justify-center gap-0.5">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                  {points}
                </p>
                <p className="text-[9px] text-white/70 font-semibold">Total Poin</p>
              </div>
              <div className="border-x border-white/15">
                <p className="text-lg font-black text-amber-300 flex items-center justify-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  {streak} Hari
                </p>
                <p className="text-[9px] text-white/70 font-semibold">Streak Baca</p>
              </div>
              <div>
                <p className="text-lg font-black text-amber-300 flex items-center justify-center gap-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {booksRead}
                </p>
                <p className="text-[9px] text-white/70 font-semibold">Buku Selesai</p>
              </div>
            </div>

            {/* Footer Quote */}
            <div className="text-center text-[10px] text-white/80 italic pt-1">
              "Jelajahi Dunia, Mulai dari Membaca."
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-700">Pilih Saluran Berbagi:</p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>X / Twitter</span>
              </a>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-[#6546C7] rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-purple-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Teks Berhasil Disalin!' : 'Salin Teks Kutipan Prestasi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
