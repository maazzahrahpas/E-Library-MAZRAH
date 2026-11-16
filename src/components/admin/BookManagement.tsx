import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Download,
  Upload,
  Check,
  X,
  Layers,
  Star
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types/library';

export const BookManagement: React.FC = () => {
  const { books, categories, addBook, updateBook, deleteBook } = useLibrary();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState(2025);
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Fikih & Ushul Fikih');
  const [pages, setPages] = useState(150);
  const [format, setFormat] = useState<'pdf' | 'physical'>('pdf');
  const [classLevel, setClassLevel] = useState<'Semua' | 'X' | 'XI' | 'XII'>('Semua');
  const [totalCopies, setTotalCopies] = useState(10);
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
  const [synopsis, setSynopsis] = useState('');

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase();
    return (
      !search ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setPublisher('MA Az Zahrah Pasuruan Press');
    setYear(2025);
    setIsbn('978-623-');
    setCategory(categories[0]?.name || 'Fikih & Ushul Fikih');
    setPages(180);
    setFormat('pdf');
    setClassLevel('Semua');
    setTotalCopies(10);
    setCoverUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
    setSynopsis('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher);
    setYear(book.year);
    setIsbn(book.isbn || '');
    setCategory(book.category);
    setPages(book.pages);
    setFormat(book.format as any);
    setClassLevel(book.classLevel);
    setTotalCopies(book.totalCopies);
    setCoverUrl(book.coverUrl);
    setSynopsis(book.synopsis);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    if (editingBook) {
      const diff = totalCopies - editingBook.totalCopies;
      const nextAvailable = Math.max(0, Math.min(totalCopies, editingBook.availableCopies + diff));
      await updateBook(editingBook.id, {
        title,
        author,
        publisher,
        year,
        isbn,
        category,
        pages,
        format,
        classLevel,
        totalCopies,
        availableCopies: nextAvailable,
        coverUrl,
        synopsis
      });
    } else {
      await addBook({
        title,
        author,
        publisher,
        year,
        isbn,
        category,
        pages,
        format,
        classLevel,
        availableCopies: totalCopies,
        totalCopies,
        coverUrl,
        synopsis,
        rating: 5.0,
        reviewCount: 0,
        readsCount: 0
      });
    }

    setShowAddModal(false);
  };

  const handleDelete = async (bookId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini dari katalog?')) {
      await deleteBook(bookId);
    }
  };

  const exportCSV = () => {
    const headers = 'ID,Judul,Penulis,Kategori,Tahun,ISBN,Jumlah Eksemplar,Tersedia\n';
    const rows = books
      .map(
        (b) =>
          `"${b.id}","${b.title}","${b.author}","${b.category}",${b.year},"${b.isbn || ''}",${b.totalCopies},${b.availableCopies}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `katalog_buku_mazrah_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manajemen Inventaris Koleksi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Koleksi Buku & E-Book
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Tambah judul baru, perbarui data eksemplar, atau ekspor inventaris buku
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#6546C7] hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Buku Baru</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, penulis, kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Buku & Cover</th>
                <th className="p-4">Kategori & Kelas</th>
                <th className="p-4">Penerbit & Tahun</th>
                <th className="p-4">Format</th>
                <th className="p-4">Eksemplar</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
                      />
                      <div className="max-w-xs">
                        <p className="font-bold text-gray-900 line-clamp-2">{book.title}</p>
                        <p className="text-[11px] text-gray-500">{book.author}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-gray-800">{book.category}</span>
                    <div className="text-[10px] text-purple-700 font-bold">Kelas {book.classLevel}</div>
                  </td>

                  <td className="p-4 text-gray-600">
                    <div>{book.publisher}</div>
                    <div className="text-[11px] text-gray-400">{book.year}</div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        book.format === 'pdf' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {book.format === 'pdf' ? 'E-Book PDF' : 'Cetak Fisik'}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-gray-800">
                      {book.availableCopies} / {book.totalCopies}
                    </div>
                    <div className="text-[10px] text-gray-400">Tersedia di rak</div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{book.rating}</span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Sunting Buku"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Buku"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                {editingBook ? 'Sunting Data Buku' : 'Tambah Buku Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Judul Buku:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Penulis:</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Penerbit:</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tingkat Kelas:</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Semua">Semua Kelas</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Format:</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="pdf">E-Book PDF</option>
                    <option value="physical">Buku Cetak Fisik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tahun Terbit:</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jumlah Halaman:</label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Eksemplar:</label>
                  <input
                    type="number"
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL Cover Gambar:</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Sinopsis & Ringkasan:</label>
                <textarea
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingBook ? 'Simpan Perubahan' : 'Tambahkan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
