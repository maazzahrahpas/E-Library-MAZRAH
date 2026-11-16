import React, { useState } from 'react';
import { Heart, BookOpen, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types/library';

interface FavoritesViewProps {
  onOpenBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onOpenBook, onReadBook }) => {
  const { favorites, readingHistory, books, toggleFavorite } = useLibrary();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorit' | 'riwayat'>('favorit');

  const myFavorites = favorites.filter((f) => f.userId === userProfile?.uid);
  const myHistories = readingHistory.filter((h) => h.userId === userProfile?.uid);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Koleksi Favorit & Jejak Literasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Rak Pribadi Santri
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Buku yang ditandai untuk dibaca nanti dan riwayat sesi membaca santri {userProfile?.displayName}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('favorit')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'favorit' ? 'bg-white text-[#6546C7] shadow-xs' : 'text-gray-600'
            }`}
          >
            Buku Favorit ({myFavorites.length})
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'riwayat' ? 'bg-white text-[#6546C7] shadow-xs' : 'text-gray-600'
            }`}
          >
            Riwayat Baca ({myHistories.length})
          </button>
        </div>
      </div>

      {/* Tab: Favorites */}
      {activeTab === 'favorit' && (
        <div className="space-y-4">
          {myFavorites.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
              <Heart className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-700">Belum ada buku favorit</h3>
              <p className="text-xs text-gray-400">
                Tekan tombol hati pada katalog buku untuk menyimpannya ke rak favoritmu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myFavorites.map((fav) => {
                const book = books.find((b) => b.id === fav.bookId);
                return (
                  <div
                    key={fav.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs hover:border-purple-300 transition-all flex items-start gap-4"
                  >
                    <img
                      src={fav.bookCover}
                      alt={fav.bookTitle}
                      className="w-16 h-24 object-cover rounded-xl shadow-xs shrink-0"
                    />
                    <div className="flex-1 overflow-hidden space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {fav.category}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-2">
                          {fav.bookTitle}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">{fav.author}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {book && (
                          <button
                            onClick={() => onReadBook(book)}
                            className="px-3 py-1.5 bg-[#6546C7] hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Baca
                          </button>
                        )}
                        {book && (
                          <button
                            onClick={() => onOpenBook(book)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Detail
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Reading History */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          {myHistories.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 text-xs text-gray-400">
              Belum ada riwayat aktivitas membaca.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs divide-y divide-gray-100 text-xs overflow-hidden">
              {myHistories.map((hist) => {
                const book = books.find((b) => b.id === hist.bookId);
                return (
                  <div
                    key={hist.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={hist.bookCover}
                        alt={hist.bookTitle}
                        className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                          {hist.bookTitle}
                        </h4>
                        <p className="text-gray-500 text-[11px]">
                          Halaman terakhir: <strong>{hist.lastPage}</strong> dari {hist.totalPages} ({hist.progressPercent}%) &bull; Waktu baca: {hist.timeSpentMinutes} menit
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Terakhir dibuka: {hist.lastReadAt.split('T')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {book && (
                        <button
                          onClick={() => onReadBook(book)}
                          className="py-1.5 px-3 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Buka Reader</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
