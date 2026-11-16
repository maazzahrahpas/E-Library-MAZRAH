import React, { useState } from 'react';
import {
  X,
  Star,
  BookOpen,
  BookmarkCheck,
  Heart,
  Share2,
  Calendar,
  Building,
  User,
  Hash,
  Layers,
  Send,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3
} from 'lucide-react';
import { Book } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onReadBook: (book: Book) => void;
  onShareAchievement?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onReadBook,
  onShareAchievement
}) => {
  const { toggleFavorite, favorites, requestBorrow, addReview, deleteReview, updateBook, deleteBook, reviews, categories } = useLibrary();
  const { userProfile, isAdmin, isTeacher, loginWithGoogle } = useAuth();

  const isFav = favorites.some((f) => f.bookId === book.id && f.userId === userProfile?.uid);
  const [borrowDays, setBorrowDays] = useState<number>(isTeacher ? 14 : 7);

  React.useEffect(() => {
    setBorrowDays(isTeacher ? 14 : 7);
  }, [isTeacher]);

  const [borrowNotes, setBorrowNotes] = useState<string>('');
  const [isBorrowing, setIsBorrowing] = useState<boolean>(false);
  const [borrowSuccess, setBorrowSuccess] = useState<boolean>(false);

  // Admin Book Editing state
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);
  const [editPublisher, setEditPublisher] = useState(book.publisher);
  const [editYear, setEditYear] = useState(book.year);
  const [editCategory, setEditCategory] = useState(book.category);
  const [editCopies, setEditCopies] = useState(book.totalCopies);
  const [editSynopsis, setEditSynopsis] = useState(book.synopsis);

  // Review state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Filter reviews for this book
  const bookReviews = reviews.filter((r) => r.bookId === book.id);

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      loginWithGoogle();
      return;
    }
    setIsBorrowing(true);
    const ok = await requestBorrow(book, borrowDays, borrowNotes);
    setIsBorrowing(false);
    if (ok) {
      setBorrowSuccess(true);
      setTimeout(() => setBorrowSuccess(false), 4000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      loginWithGoogle();
      return;
    }
    if (!reviewComment.trim()) return;
    const ok = await addReview(book.id, book.title, reviewRating, reviewComment);
    if (ok) {
      setReviewComment('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
    }
  };

  const handleSaveBookEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const diff = editCopies - book.totalCopies;
    const nextAvailable = Math.max(0, Math.min(editCopies, book.availableCopies + diff));
    await updateBook(book.id, {
      title: editTitle,
      author: editAuthor,
      publisher: editPublisher,
      year: editYear,
      category: editCategory,
      totalCopies: editCopies,
      availableCopies: nextAvailable,
      synopsis: editSynopsis
    });
    setIsEditingBook(false);
  };

  const handleDeleteBook = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}" dari katalog?`)) {
      await deleteBook(book.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
              {book.category}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              Kelas {book.classLevel}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditingBook(!isEditingBook)}
                  className={`p-2 rounded-xl transition-all ${
                    isEditingBook
                      ? 'bg-purple-100 text-[#6546C7]'
                      : 'text-gray-400 hover:text-purple-700 hover:bg-gray-100'
                  }`}
                  title="Sunting Data Buku"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBook}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-gray-100 transition-all"
                  title="Hapus Buku dari Katalog"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                if (!userProfile) {
                  loginWithGoogle();
                  return;
                }
                toggleFavorite(book);
              }}
              className={`p-2 rounded-xl transition-all ${
                isFav
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-gray-400 hover:text-rose-600 hover:bg-gray-100'
              }`}
              title={isFav ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>
            {onShareAchievement && (
              <button
                onClick={() => onShareAchievement(book)}
                className="p-2 rounded-xl text-gray-400 hover:text-purple-700 hover:bg-gray-100 transition-all"
                title="Bagikan Buku"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Admin Edit Form if toggled */}
          {isEditingBook ? (
            <form onSubmit={handleSaveBookEdit} className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                <span className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-[#6546C7]" />
                  <span>Sunting Data Buku Ini</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingBook(false)}
                  className="text-gray-500 hover:text-gray-800 text-xs font-semibold"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Judul Buku:</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-purple-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Penulis:</label>
                  <input
                    type="text"
                    required
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full p-2 bg-white border border-purple-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Penerbit:</label>
                  <input
                    type="text"
                    value={editPublisher}
                    onChange={(e) => setEditPublisher(e.target.value)}
                    className="w-full p-2 bg-white border border-purple-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-purple-200 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tahun:</label>
                  <input
                    type="number"
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-purple-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Eksemplar:</label>
                  <input
                    type="number"
                    value={editCopies}
                    onChange={(e) => setEditCopies(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-purple-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Sinopsis:</label>
                <textarea
                  rows={3}
                  value={editSynopsis}
                  onChange={(e) => setEditSynopsis(e.target.value)}
                  className="w-full p-2 bg-white border border-purple-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBook(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          ) : null}
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            <div className="sm:col-span-4 shrink-0 flex justify-center">
              <div className="w-40 sm:w-full aspect-3/4 rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative group">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold px-2 py-1 rounded bg-black/70 text-white backdrop-blur-xs">
                  {book.format === 'pdf' ? 'Format E-Book' : 'Buku Fisik'}
                </span>
              </div>
            </div>

            <div className="sm:col-span-8 space-y-3">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {book.title}
              </h1>
              <p className="text-sm font-semibold text-purple-700">
                Oleh {book.author}
              </p>

              {/* Rating and read count */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{book.rating}</span>
                  <span className="text-gray-400 font-normal">({book.reviewCount} ulasan)</span>
                </div>
                <span className="text-gray-500 font-medium">
                  {book.readsCount} kali dibaca
                </span>
              </div>

              {/* Metadata Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{book.publisher}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Tahun {book.year}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>{book.pages} Halaman</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">ISBN: {book.isbn || 'Tersedia'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('borrow-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 min-w-[140px] px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Pinjam Buku Ini</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onReadBook(book);
                  }}
                  className="flex-1 min-w-[140px] px-4 py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Baca E-Book</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{book.availableCopies} dari {book.totalCopies} Eksemplar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-900">Sinopsis & Ikhtisar Buku</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
              {book.synopsis}
            </p>
          </div>

          {/* Loan Application Form */}
          <div id="borrow-section" className="bg-purple-50/70 rounded-2xl p-4 sm:p-5 border border-purple-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-[#6546C7]" />
                <h3 className="font-bold text-sm text-purple-950">
                  Formulir Peminjaman Koleksi {isTeacher ? '(Pendidik)' : '(Santri)'}
                </h3>
              </div>
              <span className="text-[11px] text-purple-700 font-semibold">
                {isTeacher ? 'Standar Pendidik 14 Hari' : 'Standar Santri 7 Hari'}
              </span>
            </div>

            {!userProfile ? (
              <div className="bg-white p-4 rounded-xl border border-purple-200 text-center space-y-2.5">
                <p className="text-xs font-semibold text-gray-700">
                  Untuk meminjam buku fisik atau mengakses koleksi penuh, silakan masuk dengan Akun Google terlebih dahulu.
                </p>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="px-4 py-2 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-2 transition-transform active:scale-95"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Masuk dengan Google untuk Pinjam</span>
                </button>
              </div>
            ) : borrowSuccess ? (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold">Permintaan peminjaman berhasil diproses!</p>
                  <p className="text-[11px] mt-0.5">Buku sekarang tercatat di dashboard peminjaman Anda dan terhubung realtime ke Petugas Perpustakaan & Super Admin.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBorrowSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Durasi Peminjaman:
                    </label>
                    <select
                      value={borrowDays}
                      onChange={(e) => setBorrowDays(Number(e.target.value))}
                      className="w-full bg-white border border-purple-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
                    >
                      <option value={3}>3 Hari (Koleksi Ringkas)</option>
                      <option value={7}>7 Hari (Standar Santri)</option>
                      <option value={14}>14 Hari (Standar Pendidik & Riset)</option>
                      <option value={30}>30 Hari (Modul Ajar Semester)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Catatan Keperluan:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Diskusi kelas, tugas makalah..."
                      value={borrowNotes}
                      onChange={(e) => setBorrowNotes(e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isBorrowing || book.availableCopies <= 0}
                  className="w-full py-2.5 bg-gradient-to-r from-[#6546C7] to-[#4285F4] hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>
                    {book.availableCopies > 0
                      ? 'Kirim Permintaan Peminjaman'
                      : 'Koleksi Sedang Habis Dipinjam'}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Reviews & Ratings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                Ulasan & Rating Santri ({bookReviews.length})
              </h3>
            </div>

            {/* Write Review Form */}
            <form
              onSubmit={handleReviewSubmit}
              className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">Tulis Ulasan Santri:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-hidden"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="Bagikan pandanganmu tentang isi buku ini untuk teman-teman santri lainnya..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
              />

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-purple-700 font-semibold">
                  +20 Poin Literasi untuk ulasan aktif!
                </span>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Ulasan</span>
                </button>
              </div>

              {reviewSubmitted && (
                <p className="text-emerald-700 font-bold text-[11px] text-right">
                  Ulasanmu berhasil dipublikasikan!
                </p>
              )}
            </form>

            {/* Review List */}
            <div className="space-y-3">
              {bookReviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  Belum ada ulasan untuk buku ini. Jadilah yang pertama memberikan ulasan!
                </p>
              ) : (
                bookReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            rev.userPhoto ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'
                          }
                          alt={rev.userName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-gray-800">{rev.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        {(isAdmin || rev.userId === userProfile?.uid) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Hapus ulasan ini?')) {
                                deleteReview(rev.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Hapus Ulasan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 pl-8">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
