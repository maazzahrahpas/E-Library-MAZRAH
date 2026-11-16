import React, { useState } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  Star,
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  BookmarkCheck
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types/library';

interface BookCatalogProps {
  onOpenBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({ onOpenBook, onReadBook }) => {
  const {
    books,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedClassLevel,
    setSelectedClassLevel
  } = useLibrary();

  const [selectedFormat, setSelectedFormat] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'populer' | 'rating' | 'terbaru' | 'dibaca'>('populer');

  // Filter books
  const filteredBooks = books.filter((book) => {
    // Search match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.category.toLowerCase().includes(q) ||
      (book.subject && book.subject.toLowerCase().includes(q));

    // Category match
    const matchesCategory =
      selectedCategory === 'Semua' || book.category === selectedCategory;

    // Class level match
    const matchesClass =
      selectedClassLevel === 'Semua' ||
      book.classLevel === 'Semua' ||
      book.classLevel === selectedClassLevel;

    // Format match
    const matchesFormat =
      selectedFormat === 'Semua' ||
      (selectedFormat === 'pdf' && book.format === 'pdf') ||
      (selectedFormat === 'physical' && book.format === 'physical');

    return matchesSearch && matchesCategory && matchesClass && matchesFormat;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'dibaca') return b.readsCount - a.readsCount;
    if (sortBy === 'terbaru') return b.year - a.year;
    return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Search Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Katalog Resmi MA AZ ZAHRAH Pasuruan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Katalog Buku & Modul Digital
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Temukan sumber rujukan materi pembelajaran, kitab keagamaan, literatur sains, dan buku pengayaan untuk santri kelas X, XI, dan XII.
          </p>
        </div>

        {/* Search input bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul buku, penulis, tafsir, fisika..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white text-gray-900 text-xs sm:text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 shadow-md"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        {/* Class level filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-gray-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Tingkat:
          </span>
          {['Semua', 'X', 'XI', 'XII'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedClassLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedClassLevel === lvl
                  ? 'bg-[#6546C7] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              {lvl === 'Semua' ? 'Semua Kelas' : `Kelas ${lvl}`}
            </button>
          ))}

          <span className="font-bold text-gray-500 ml-4 shrink-0">Format:</span>
          {['Semua', 'pdf', 'physical'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedFormat === fmt
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              {fmt === 'Semua' ? 'Semua Format' : fmt === 'pdf' ? 'E-Book Digital' : 'Buku Fisik'}
            </button>
          ))}

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl px-2.5 py-1 text-xs focus:outline-hidden"
            >
              <option value="populer">Terpopuler</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="dibaca">Paling Banyak Dibaca</option>
              <option value="terbaru">Tahun Terbaru</option>
            </select>
          </div>
        </div>

        {/* Categories scrollable pill list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'Semua'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Semua Kategori ({books.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? 'bg-[#6546C7] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
          <span>Menampilkan {sortedBooks.length} judul buku yang cocok</span>
          {(searchQuery || selectedCategory !== 'Semua' || selectedClassLevel !== 'Semua') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setSelectedClassLevel('Semua');
                setSelectedFormat('Semua');
              }}
              className="text-[#6546C7] hover:underline"
            >
              Hapus Semua Filter
            </button>
          )}
        </div>

        {sortedBooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-700">Tidak ada buku yang cocok</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter kategori untuk menemukan buku yang kamu cari.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sortedBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col group"
              >
                {/* Book Cover Image */}
                <div
                  onClick={() => onOpenBook(book)}
                  className="relative aspect-3/4 overflow-hidden bg-gray-100 cursor-pointer"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                    {book.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-400 text-purple-950 text-[10px] font-extrabold uppercase">
                    Kelas {book.classLevel}
                  </span>

                  {/* Format tag */}
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-white/90 text-gray-800 text-[10px] font-bold backdrop-blur-xs">
                    {book.format === 'pdf' ? 'E-Book PDF' : 'Buku Cetak'}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => onOpenBook(book)}
                      className="font-bold text-sm text-gray-900 line-clamp-2 cursor-pointer hover:text-[#6546C7] transition-colors"
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{book.author}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{book.rating}</span>
                        <span className="text-gray-400 font-normal">({book.reviewCount})</span>
                      </div>
                      <span className="text-[11px] font-medium text-gray-500">
                        {book.pages} Hal
                      </span>
                    </div>

                    {/* Quick Borrow, Read and Detail Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => onOpenBook(book)}
                        className="flex-1 py-1.5 px-2.5 bg-purple-50 hover:bg-purple-100 text-[#6546C7] rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-purple-200 shadow-xs transition-colors"
                        title="Pinjam Buku Ini"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Pinjam</span>
                      </button>
                      <button
                        onClick={() => onReadBook(book)}
                        className="flex-1 py-1.5 px-2.5 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Baca</span>
                      </button>
                      <button
                        onClick={() => onOpenBook(book)}
                        className="py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
