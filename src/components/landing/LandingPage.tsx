import React from 'react';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Users,
  CheckCircle2,
  Bookmark,
  Compass,
  Star,
  GraduationCap,
  Trophy,
  LogIn
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types/library';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenBook: (book: Book) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenBook }) => {
  const { books, categories } = useLibrary();
  const { userProfile, currentUser, loginWithGoogle } = useAuth();

  const featuredBooks = books.filter((b) => b.isFeatured || b.isPopular).slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#452b99] via-[#6546C7] to-[#3a72d7] text-white p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 bottom-0 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
              <img
                src="/assets/aistudio/1783567162468_6ebfd163.png"
                alt="Logo MA Az Zahrah Pasuruan"
                className="w-5 h-5 rounded-full bg-white p-0.5 object-contain"
              />
              <span>Perpustakaan Digital MA AZ ZAHRAH Pasuruan</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Jelajahi Dunia, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-white">
                Mulai dari Membaca.
              </span>
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
              Platform literasi dan perpustakaan digital resmi santri dan pendidik MA Az Zahrah Kota Pasuruan. Akses ribuan koleksi kurikulum madrasah, kitab kuning modern, literatur sains, serta peminjaman dan pengembalian mandiri secara realtime.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!currentUser ? (
                <button
                  onClick={loginWithGoogle}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2.5 transform active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Masuk dengan Google</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('student-dashboard')}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-[#6546C7] font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>Dashboard Saya</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('catalog')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-400/25 flex items-center gap-2 transform active:scale-95 transition-all"
              >
                <span>Jelajahi Katalog Buku</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick stats badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15 max-w-lg">
              <div>
                <p className="text-2xl font-black text-amber-300">{books.length}+</p>
                <p className="text-xs text-white/70">Koleksi Judul</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-300">{categories.length}</p>
                <p className="text-xs text-white/70">Klasifikasi Materi</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-300">100%</p>
                <p className="text-xs text-white/70">Akses Realtime</p>
              </div>
            </div>
          </div>

          {/* Hero visual cards showcase */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/15 text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                    Buku Rekomendasi Pekan Ini
                  </span>
                  <span className="text-[11px] text-white/70">Kelas X - XII</span>
                </div>

                {featuredBooks.slice(0, 2).map((book) => (
                  <div
                    key={book.id}
                    onClick={() => onOpenBook(book)}
                    className="flex gap-3 bg-white/10 hover:bg-white/20 p-2.5 rounded-xl cursor-pointer transition-all border border-white/10"
                  >
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-14 h-20 object-cover rounded-lg shadow-md shrink-0"
                    />
                    <div className="overflow-hidden flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-white/70 line-clamp-1 mt-0.5">
                          {book.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-amber-200">
                        <span className="flex items-center gap-0.5 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          {book.rating}
                        </span>
                        <span>&bull;</span>
                        <span>{book.pages} Hal</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-1 flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    E-Reader Digital Aktif
                  </span>
                  <span className="text-amber-300 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('catalog')}>
                    Lihat Semua &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Explorer */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Klasifikasi Koleksi Perpustakaan
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Jelajahi buku kurikulum keagamaan Kemenag dan sains Kemendikbud
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs sm:text-sm font-bold text-[#6546C7] hover:text-purple-800 flex items-center gap-1"
          >
            Semua Kategori <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog')}
              className="bg-white hover:bg-purple-50/50 p-4 rounded-2xl border border-gray-200/80 hover:border-purple-300 shadow-xs hover:shadow-md cursor-pointer transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color || 'from-purple-500 to-indigo-600'} text-white flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#6546C7] transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>{cat.bookCount} Judul</span>
                <span className="text-[#6546C7] font-semibold group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Books Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Koleksi Pilihan & Populer
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Buku yang paling banyak dibaca dan diulas oleh santri MA Az Zahrah
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs sm:text-sm font-bold text-[#6546C7] hover:text-purple-800"
          >
            Lihat Katalog Lengkap &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => onOpenBook(book)}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex flex-col group"
            >
              {/* Cover */}
              <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                  {book.category}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-400 text-purple-950 text-[10px] font-extrabold uppercase">
                  Kelas {book.classLevel}
                </span>
              </div>

              {/* Book Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#6546C7] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{book.author}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{book.rating}</span>
                    <span className="text-gray-400 font-normal">({book.reviewCount})</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {book.availableCopies} Tersedia
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gamification Teaser Banner */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
            <Trophy className="w-4 h-4 text-yellow-200" />
            <span>Tantangan Literasi & Papan Peringkat</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black">
            Kumpulkan Poin, Raih Lencana Kehormatan!
          </h3>
          <p className="text-white/90 text-xs sm:text-sm max-w-xl">
            Setiap halaman yang kamu baca di E-Library MAZRAH akan mencatat streak membaca harianmu. Jadilah Duta Literasi MA Az Zahrah dan bagikan prestasimu ke media sosial!
          </p>
        </div>

        <button
          onClick={() => onNavigate('gamification')}
          className="px-6 py-3 bg-white text-orange-900 font-black text-sm rounded-xl hover:bg-orange-50 shadow-lg active:scale-95 transition-all shrink-0"
        >
          Lihat Leaderboard Santri
        </button>
      </section>
    </div>
  );
};
