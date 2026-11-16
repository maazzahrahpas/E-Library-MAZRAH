import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Users,
  BookOpen,
  BookmarkCheck,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export const LibraryReports: React.FC = () => {
  const { books, borrowings } = useLibrary();

  const totalLoans = borrowings.length;
  const returnedLoans = borrowings.filter((b) => b.status === 'Dikembalikan').length;
  const activeLoans = borrowings.filter((b) => b.status === 'Dipinjam').length;
  const lateLoans = borrowings.filter((b) => b.status === 'Terlambat').length;
  const totalFines = borrowings.reduce((acc, b) => acc + (b.fineAmount || 0), 0);

  // Class breakdown dynamically calculated from live borrowings
  const groups = [
    { key: 'X', label: 'Kelas X' },
    { key: 'XI', label: 'Kelas XI' },
    { key: 'XII', label: 'Kelas XII' },
    { key: 'Guru', label: 'Guru & Pendidik' }
  ];

  const classBreakdown = groups.map((g) => {
    const matched = borrowings.filter((b) => {
      const cls = (b.userClass || '').trim();
      if (g.key === 'Guru') return cls === 'Guru' || cls === 'Staff' || cls === 'Admin';
      return cls === g.key;
    });
    const active = matched.filter((b) => b.status === 'Dipinjam' || b.status === 'Menunggu' || b.status === 'Terlambat').length;
    const returned = matched.filter((b) => b.status === 'Dikembalikan').length;
    const total = matched.length;
    const percent = totalLoans === 0 ? 0 : Math.round((total / totalLoans) * 100);
    return { classGrade: g.label, active, returned, total, percent };
  });

  const exportLoansReportCSV = () => {
    const headers = 'ID Transaksi,Nama Santri,Kelas,Email,Judul Buku,Tanggal Pinjam,Jatuh Tempo,Status,Denda,Catatan\n';
    const rows = borrowings
      .map(
        (b) =>
          `"${b.id}","${b.userName}","${b.userClass || ''}","${b.userEmail}","${b.bookTitle}","${b.borrowDate}","${b.dueDate}","${b.status}",${b.fineAmount},"${b.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan_sirkulasi_mazrah_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Rekapitulasi & Pelaporan Resmi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Laporan Perpustakaan MAZRAH
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Rekap statistik sirkulasi, tingkat literasi kelas, dan rekap denda MA Az Zahrah Pasuruan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
          <button
            onClick={exportLoansReportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-gray-500">Total Transaksi</span>
          <p className="text-2xl font-black text-gray-900">{totalLoans}</p>
          <p className="text-[11px] text-gray-500">Seluruh riwayat sirkulasi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-gray-500">Buku Selesai Kembali</span>
          <p className="text-2xl font-black text-emerald-600">{returnedLoans}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">Tepat waktu & tertib</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-gray-500">Buku Sedang Berjalan</span>
          <p className="text-2xl font-black text-blue-600">{activeLoans}</p>
          <p className="text-[11px] text-blue-700 font-semibold">Dalam masa pinjam</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-gray-500">Total Infaq Denda</span>
          <p className="text-2xl font-black text-rose-600">Rp {totalFines.toLocaleString('id-ID')}</p>
          <p className="text-[11px] text-rose-700 font-semibold">Dana pemeliharaan buku</p>
        </div>
      </div>

      {/* Class Level Breakdown */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              Rekapitulasi Sirkulasi Per Tingkat Kelas
            </h3>
            <p className="text-xs text-gray-500">
              Perbandingan aktivitas literasi santri kelas X, XI, dan XII MA Az Zahrah
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Tahun Ajaran 2025/2026
          </span>
        </div>

        <div className="space-y-4">
          {classBreakdown.map((item) => (
            <div key={item.classGrade} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-gray-800">
                <span>{item.classGrade}</span>
                <span className="text-gray-500">
                  {item.active} Berjalan &bull; {item.returned} Selesai &bull; Total {item.total} Transaksi ({item.percent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6546C7] to-[#4285F4] rounded-full"
                  style={{ width: `${item.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Madrasah Sign-Off Box for Printable Document */}
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/1783567162468_6ebfd163.png"
            alt="Logo MA Az Zahrah Pasuruan"
            className="w-12 h-12 object-contain"
          />
          <div>
            <p className="font-bold text-gray-900">Perpustakaan Digital MA AZ ZAHRAH Kota Pasuruan</p>
            <p className="text-[11px] text-gray-500">Laporan digenerate otomatis melalui E-Library MAZRAH</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-bold text-gray-800 mt-2">Kepala Perpustakaan MAZRAH</p>
        </div>
      </div>
    </div>
  );
};
