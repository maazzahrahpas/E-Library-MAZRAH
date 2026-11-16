import React, { useState } from 'react';
import {
  BookmarkCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Calendar,
  AlertTriangle,
  User,
  Printer,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { BorrowStatus, Borrowing } from '../../types/library';

export const LoanManagement: React.FC = () => {
  const { borrowings, updateBorrowStatus, editBorrowing, deleteBorrowing } = useLibrary();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [selectedLoan, setSelectedLoan] = useState<Borrowing | null>(null);
  const [returnFine, setReturnFine] = useState<number>(0);
  const [returnNotes, setReturnNotes] = useState<string>('');

  // Editing loan modal state
  const [editingLoan, setEditingLoan] = useState<Borrowing | null>(null);
  const [editStatus, setEditStatus] = useState<BorrowStatus>('Dipinjam');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editFine, setEditFine] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  const filtered = borrowings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      b.bookTitle.toLowerCase().includes(q) ||
      b.userName.toLowerCase().includes(q) ||
      b.userEmail.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q);

    const matchStatus = filterStatus === 'Semua' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenReturnModal = (loan: Borrowing) => {
    setSelectedLoan(loan);
    const today = new Date();
    const due = new Date(loan.dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && loan.status !== 'Dikembalikan') {
      setReturnFine(diffDays * 1000);
      setReturnNotes(`Terlambat ${diffDays} hari (Infaq denda Rp ${ (diffDays * 1000).toLocaleString('id-ID') })`);
    } else {
      setReturnFine(0);
      setReturnNotes('Buku fisik dikembalikan dalam kondisi baik.');
    }
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    await updateBorrowStatus(selectedLoan.id, 'Dikembalikan', returnFine, returnNotes);
    setSelectedLoan(null);
  };

  const handleOpenEdit = (loan: Borrowing) => {
    setEditingLoan(loan);
    setEditStatus(loan.status);
    setEditDueDate(loan.dueDate);
    setEditFine(loan.fineAmount || 0);
    setEditNotes(loan.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;
    await editBorrowing(editingLoan.id, {
      status: editStatus,
      dueDate: editDueDate,
      fineAmount: editFine,
      notes: editNotes
    });
    setEditingLoan(null);
  };

  const handleDelete = async (loan: Borrowing) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan sirkulasi buku "${loan.bookTitle}" untuk santri ${loan.userName}?`)) {
      await deleteBorrowing(loan.id);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Manajemen Sirkulasi & Transaksi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Meja Sirkulasi Perpustakaan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Kelola persetujuan, perbarui status/jatuh tempo, proses pengembalian, atau hapus data transaksi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri, judul buku, ID transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {['Semua', 'Menunggu', 'Dipinjam', 'Terlambat', 'Dikembalikan', 'Ditolak'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-[#6546C7] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Circulation Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">ID & Santri</th>
                <th className="p-4">Koleksi Buku</th>
                <th className="p-4">Tgl Pinjam</th>
                <th className="p-4">Jatuh Tempo</th>
                <th className="p-4">Status</th>
                <th className="p-4">Denda</th>
                <th className="p-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Tidak ada transaksi peminjaman yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{item.userName}</div>
                      <div className="text-[11px] text-gray-500">
                        Kelas {item.userClass} &bull; {item.userEmail}
                      </div>
                      <div className="text-[10px] text-purple-700 font-mono mt-0.5">
                        {item.id.slice(0, 16)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2.5 max-w-xs">
                        <img
                          src={item.bookCover}
                          alt={item.bookTitle}
                          className="w-8 h-12 object-cover rounded-md shrink-0 shadow-xs"
                        />
                        <span className="font-bold text-gray-900 line-clamp-2">
                          {item.bookTitle}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-medium text-gray-600">{item.borrowDate}</td>
                    <td className="p-4 font-bold text-gray-900">{item.dueDate}</td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          item.status === 'Dipinjam'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'Menunggu'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'Terlambat'
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : item.status === 'Dikembalikan'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {item.fineAmount > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          Rp {item.fineAmount.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-gray-400">Rp 0</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'Menunggu' && (
                          <>
                            <button
                              onClick={() =>
                                updateBorrowStatus(item.id, 'Dipinjam', 0, 'Disetujui oleh petugas.')
                              }
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                              title="Setujui Peminjaman"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() =>
                                updateBorrowStatus(item.id, 'Ditolak', 0, 'Ditolak oleh petugas.')
                              }
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors"
                              title="Tolak Peminjaman"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                        {(item.status === 'Dipinjam' || item.status === 'Terlambat') && (
                          <button
                            onClick={() => handleOpenReturnModal(item)}
                            className="px-2.5 py-1 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-1 transition-colors"
                            title="Proses Pengembalian"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Kembalikan</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Sunting Transaksi"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Catatan Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Book Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                Proses Pengembalian Buku
              </h3>
              <button
                onClick={() => setSelectedLoan(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl space-y-1 text-xs">
              <p className="font-bold text-gray-900">{selectedLoan.bookTitle}</p>
              <p className="text-gray-500">Santri: {selectedLoan.userName} (Kelas {selectedLoan.userClass})</p>
              <p className="text-gray-500">Jatuh Tempo: {selectedLoan.dueDate}</p>
            </div>

            <form onSubmit={handleProcessReturn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Infaq Denda Keterlambatan (Rp):
                </label>
                <input
                  type="number"
                  value={returnFine}
                  onChange={(e) => setReturnFine(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-bold text-rose-600 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Catatan Kondisi Fisik Buku:
                </label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Kondisi baik, halaman lengkap..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoan(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Konfirmasi Kembali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Loan Record Modal */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                Sunting Transaksi Sirkulasi
              </h3>
              <button
                onClick={() => setEditingLoan(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl space-y-1 text-xs">
              <p className="font-bold text-gray-900">{editingLoan.bookTitle}</p>
              <p className="text-gray-500">Santri: {editingLoan.userName} (Kelas {editingLoan.userClass})</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Status Transaksi:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as BorrowStatus)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Dipinjam">Dipinjam</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Dikembalikan">Dikembalikan</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tanggal Jatuh Tempo:</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Denda (Rp):</label>
                <input
                  type="number"
                  value={editFine}
                  onChange={(e) => setEditFine(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Transaksi:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLoan(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
