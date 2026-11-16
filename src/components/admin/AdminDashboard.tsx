import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileSpreadsheet,
  Megaphone,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types/library';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
  onOpenBook: (book: Book) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onOpenBook }) => {
  const { books, borrowings, updateBorrowStatus, announcements } = useLibrary();
  const { userProfile } = useAuth();

  const pendingBorrows = borrowings.filter((b) => b.status === 'Menunggu');
  const activeBorrows = borrowings.filter((b) => b.status === 'Dipinjam');
  const overdueBorrows = borrowings.filter((b) => b.status === 'Terlambat');
  const returnedBorrows = borrowings.filter((b) => b.status === 'Dikembalikan');

  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);

  const handleApprove = async (id: string) => {
    await updateBorrowStatus(id, 'Dipinjam', 0, 'Disetujui oleh petugas perpustakaan.');
  };

  const handleReject = async (id: string) => {
    await updateBorrowStatus(id, 'Ditolak', 0, 'Stok buku fisik sedang dipinjam atau dalam pemeliharaan.');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Panel Operasional Perpustakaan MAZRAH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard Petugas Perpustakaan
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            Kelola transaksi sirkulasi peminjaman, katalog buku digital, verifikasi anggota, dan laporan aktivitas literasi MA Az Zahrah Pasuruan.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('book-mgmt')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Buku Baru</span>
          </button>
          <button
            onClick={() => onNavigate('loan-mgmt')}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-colors"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Meja Sirkulasi</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-500">Total Koleksi</span>
            <BookOpen className="w-4 h-4 text-[#6546C7]" />
          </div>
          <p className="text-2xl font-black text-gray-900">{books.length} <span className="text-xs font-normal text-gray-500">Judul</span></p>
          <p className="text-[11px] text-gray-500">{totalCopies} total eksemplar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold text-gray-500">Antrian Verifikasi</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingBorrows.length} <span className="text-xs font-normal text-gray-500">Permintaan</span></p>
          <p className="text-[11px] text-amber-700 font-semibold">Perlu tindakan persetujuan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-xs font-bold text-gray-500">Sedang Dipinjam</span>
            <BookmarkCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-700">{activeBorrows.length} <span className="text-xs font-normal text-gray-500">Buku</span></p>
          <p className="text-[11px] text-gray-500">{availableCopies} eksemplar tersedia di rak</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-bold text-gray-500">Terlambat Kembali</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{overdueBorrows.length} <span className="text-xs font-normal text-gray-500">Peminjaman</span></p>
          <p className="text-[11px] text-rose-700 font-semibold">Dikenakan denda harian</p>
        </div>
      </div>

      {/* Pending Borrow Requests Approval Queue */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-base text-gray-900">
              Antrian Permintaan Peminjaman Santri ({pendingBorrows.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigate('loan-mgmt')}
            className="text-xs font-bold text-[#6546C7] hover:underline"
          >
            Buka Sirkulasi Penuh &rarr;
          </button>
        </div>

        {pendingBorrows.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
            Semua permintaan peminjaman telah diverifikasi. Tidak ada antrian tertunda.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingBorrows.map((loan) => (
              <div
                key={loan.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={loan.bookCover}
                    alt={loan.bookTitle}
                    className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
                  />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-gray-900">{loan.bookTitle}</p>
                    <p className="text-gray-600">
                      Pemohon: <strong>{loan.userName}</strong> (Kelas {loan.userClass || 'Siswa'})
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Tanggal Pengajuan: {loan.borrowDate} &bull; Keperluan: "{loan.notes || 'Pembelajaran'}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleReject(loan.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => handleApprove(loan.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui Peminjaman</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('book-mgmt')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-purple-300 cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6546C7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#6546C7] transition-colors">
            Manajemen Buku & E-Book
          </h3>
          <p className="text-xs text-gray-500">
            Tambah, sunting metadata, perbarui jumlah eksemplar, dan unggah modul PDF.
          </p>
        </div>

        <div
          onClick={() => onNavigate('loan-mgmt')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
            Transaksi Sirkulasi
          </h3>
          <p className="text-xs text-gray-500">
            Proses pengembalian, hitung denda keterlambatan, dan riwayat transaksi.
          </p>
        </div>

        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors">
            Laporan & Rekapitulasi
          </h3>
          <p className="text-xs text-gray-500">
            Ekspor data peminjaman, statistik literasi per kelas, dan unduh format CSV.
          </p>
        </div>
      </div>
    </div>
  );
};
