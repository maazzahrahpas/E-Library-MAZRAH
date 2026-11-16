import React, { useState } from 'react';
import {
  BookmarkCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Check,
  LogIn
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Book, Borrowing } from '../../types/library';

interface MyLoansViewProps {
  onOpenBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
}

export const MyLoansView: React.FC<MyLoansViewProps> = ({ onOpenBook, onReadBook }) => {
  const { myBorrowings, books, returnBook } = useLibrary();
  const { userProfile, loginWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'semua' | 'aktif' | 'selesai'>('aktif');

  const filteredLoans = myBorrowings.filter((loan) => {
    if (activeTab === 'aktif') {
      return loan.status === 'Dipinjam' || loan.status === 'Menunggu' || loan.status === 'Terlambat';
    }
    if (activeTab === 'selesai') {
      return loan.status === 'Dikembalikan' || loan.status === 'Ditolak';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Dipinjam':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Sedang Dipinjam' };
      case 'Menunggu':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'Menunggu Persetujuan' };
      case 'Terlambat':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse', text: 'Terlambat Kembali' };
      case 'Dikembalikan':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'Telah Dikembalikan' };
      case 'Ditolak':
        return { bg: 'bg-gray-100 text-gray-700 border-gray-200', text: 'Ditolak' };
      default:
        return { bg: 'bg-gray-100 text-gray-700 border-gray-200', text: status };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Layanan Sirkulasi Perpustakaan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Peminjaman Koleksi Saya
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {userProfile
              ? `Pantau status peminjaman buku fisik dan akses digital ${userProfile.displayName}`
              : 'Masuk dengan Google untuk melihat daftar peminjaman dan tanggal jatuh tempo Anda'}
          </p>
        </div>

        {/* Tab Filters */}
        {userProfile && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('aktif')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'aktif' ? 'bg-white text-[#6546C7] shadow-xs' : 'text-gray-600'
              }`}
            >
              Pinjaman Berjalan ({myBorrowings.filter((b) => b.status === 'Dipinjam' || b.status === 'Menunggu' || b.status === 'Terlambat').length})
            </button>
            <button
              onClick={() => setActiveTab('selesai')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'selesai' ? 'bg-white text-[#6546C7] shadow-xs' : 'text-gray-600'
              }`}
            >
              Riwayat Kembali
            </button>
            <button
              onClick={() => setActiveTab('semua')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'semua' ? 'bg-white text-[#6546C7] shadow-xs' : 'text-gray-600'
              }`}
            >
              Semua ({myBorrowings.length})
            </button>
          </div>
        )}
      </div>

      {/* Rules Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Ketentuan Sirkulasi MA Az Zahrah Pasuruan:</p>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Maksimal masa peminjaman adalah 7 hari kerja untuk santri dan 14-30 hari untuk dewan guru. Keterlambatan pengembalian buku fisik dikenakan infaq pemeliharaan koleksi Rp 1.000 / hari.
          </p>
        </div>
      </div>

      {/* Loans List */}
      {!userProfile ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
          <BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto" />
          <div>
            <h3 className="font-bold text-gray-800 text-base">Belum Masuk Akun</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              Silakan masuk dengan akun Google Anda untuk mengakses data sirkulasi dan daftar buku yang sedang Anda pinjam.
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
      ) : filteredLoans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
          <BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-700">Tidak ada data peminjaman</h3>
          <p className="text-xs text-gray-400">
            Anda belum memiliki transaksi peminjaman pada tab ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => {
            const statusInfo = getStatusBadge(loan.status);
            const book = books.find((b) => b.id === loan.bookId);

            return (
              <div
                key={loan.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs hover:border-purple-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={loan.bookCover}
                    alt={loan.bookTitle}
                    className="w-16 h-24 object-cover rounded-xl shadow-xs shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg}`}>
                        {statusInfo.text}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        ID: {loan.id.slice(0, 14)}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                      {loan.bookTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Pinjam: {loan.borrowDate}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Jatuh Tempo: {loan.dueDate}
                      </span>
                      {loan.fineAmount > 0 && (
                        <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          Denda: Rp {loan.fineAmount.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    {loan.notes && (
                      <p className="text-[11px] text-gray-500 italic">
                        Catatan: "{loan.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                  {(loan.status === 'Dipinjam' || loan.status === 'Terlambat') && (
                    <button
                      onClick={async () => {
                        if (confirm(`Kembalikan buku "${loan.bookTitle}" sekarang?`)) {
                          await returnBook(loan.id, 'Dikembalikan lewat menu Peminjaman Saya');
                        }
                      }}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      title="Kembalikan Buku ke Perpustakaan"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Kembalikan Buku</span>
                    </button>
                  )}
                  {book && (
                    <button
                      onClick={() => onReadBook(book)}
                      className="py-2 px-4 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Baca E-Book</span>
                    </button>
                  )}
                  {book && (
                    <button
                      onClick={() => onOpenBook(book)}
                      className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Detail Buku
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
