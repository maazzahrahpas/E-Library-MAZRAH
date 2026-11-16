import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Download,
  Upload,
  X,
  Star,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types/library';
import { compressCoverImage, uploadPdfFile, formatFileSize } from '../../utils/fileUpload';

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
  const [coverUrl, setCoverUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState<number | undefined>(undefined);
  const [synopsis, setSynopsis] = useState('');

  // Upload & feedback states
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase();
    return (
      !search ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  const resetUploadInputs = () => {
    if (coverInputRef.current) coverInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

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
    setCoverUrl('');
    setFileUrl('');
    setPdfFileName('');
    setPdfFileSize(undefined);
    setSynopsis('');
    setFormError(null);
    setPdfUploadProgress(0);
    resetUploadInputs();
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
    setFormat(book.format === 'physical' ? 'physical' : 'pdf');
    setClassLevel(book.classLevel);
    setTotalCopies(book.totalCopies);
    setCoverUrl(book.coverUrl || '');
    setFileUrl(book.fileUrl || '');
    setPdfFileName(book.pdfFileName || (book.fileUrl ? 'Dokumen E-Book.pdf' : ''));
    setPdfFileSize(book.pdfFileSize);
    setSynopsis(book.synopsis || '');
    setFormError(null);
    setPdfUploadProgress(0);
    resetUploadInputs();
    setShowAddModal(true);
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setIsUploadingCover(true);
    try {
      const compressedDataUrl = await compressCoverImage(file);
      setCoverUrl(compressedDataUrl);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal memproses foto sampul.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setIsUploadingPdf(true);
    setPdfUploadProgress(10);
    try {
      const uploaded = await uploadPdfFile(file, (pct) => setPdfUploadProgress(pct));
      setFileUrl(uploaded.fileUrl);
      setPdfFileName(uploaded.fileName);
      setPdfFileSize(uploaded.fileSize);
      if (!title.trim()) {
        const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
        if (cleanTitle) setTitle(cleanTitle);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mengunggah file PDF.');
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setFileUrl('');
    setPdfFileName('');
    setPdfFileSize(undefined);
    setPdfUploadProgress(0);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !author.trim()) {
      setFormError('Judul buku dan nama penulis wajib diisi.');
      return;
    }

    if (!coverUrl) {
      setFormError('Harap unggah foto cover buku terlebih dahulu.');
      return;
    }

    if (format === 'pdf' && !fileUrl && !editingBook) {
      setFormError('Untuk buku format E-Book, harap unggah file PDF terlebih dahulu.');
      return;
    }

    if (isUploadingCover || isUploadingPdf) {
      setFormError('Tunggu hingga proses unggah foto atau file PDF selesai.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBook) {
        const diff = totalCopies - editingBook.totalCopies;
        const nextAvailable = Math.max(0, Math.min(totalCopies, editingBook.availableCopies + diff));
        await updateBook(editingBook.id, {
          title: title.trim(),
          author: author.trim(),
          publisher: publisher.trim(),
          year,
          isbn: isbn.trim(),
          category,
          pages,
          format,
          classLevel,
          totalCopies,
          availableCopies: nextAvailable,
          coverUrl,
          fileUrl: format === 'pdf' ? fileUrl || undefined : undefined,
          pdfFileName: format === 'pdf' ? pdfFileName || undefined : undefined,
          pdfFileSize: format === 'pdf' ? pdfFileSize : undefined,
          synopsis: synopsis.trim()
        });
      } else {
        await addBook({
          title: title.trim(),
          author: author.trim(),
          publisher: publisher.trim(),
          year,
          isbn: isbn.trim(),
          category,
          pages,
          format,
          classLevel,
          availableCopies: totalCopies,
          totalCopies,
          coverUrl,
          ...(format === 'pdf' && fileUrl
            ? {
                fileUrl,
                pdfFileName,
                pdfFileSize
              }
            : {}),
          synopsis: synopsis.trim(),
          rating: 5.0,
          reviewCount: 0,
          readsCount: 0
        });
      }
      setShowAddModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan data buku.');
    } finally {
      setIsSubmitting(false);
    }
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
            Tambah judul baru dengan unggah foto sampul & file PDF E-Book, kelola eksemplar, atau ekspor inventaris
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
                        className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0 bg-gray-100"
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
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          book.format === 'pdf' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {book.format === 'pdf' ? 'E-Book PDF' : 'Cetak Fisik'}
                      </span>
                      {book.format === 'pdf' && book.fileUrl && (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>PDF Terunggah</span>
                        </span>
                      )}
                    </div>
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

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Judul Buku:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fiqih Muamalah Kontemporer"
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
                    placeholder="Nama pengarang"
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
                    onChange={(e) => setClassLevel(e.target.value as 'Semua' | 'X' | 'XI' | 'XII')}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Semua">Semua Kelas</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jenis Koleksi:</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'pdf' | 'physical')}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden font-semibold text-purple-900"
                  >
                    <option value="pdf">E-Book (Upload PDF)</option>
                    <option value="physical">Buku Fisik (Di Perpustakaan)</option>
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
                    min={1}
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Cover Photo Upload (Replaces URL input completely) */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#6546C7]" />
                    <span>
                      {format === 'physical'
                        ? 'Foto Cover Buku Fisik (Wajib Unggah Foto):'
                        : 'Foto Cover E-Book (Unggah Gambar):'}
                    </span>
                  </label>
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="text-[11px] font-bold text-[#6546C7] hover:underline"
                    >
                      Ganti Foto
                    </button>
                  )}
                </div>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="hidden"
                />

                {coverUrl ? (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-purple-100">
                    <img
                      src={coverUrl}
                      alt="Pratinjau Cover Buku"
                      className="w-16 h-22 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Foto Cover Siap Disimpan</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Foto sampul otomatis dioptimalkan agar tampil cepat untuk seluruh santri.
                      </p>
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Ulang Foto</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isUploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full py-5 px-4 border-2 border-dashed border-purple-300 hover:border-[#6546C7] bg-white hover:bg-purple-50/40 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-center"
                  >
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="w-6 h-6 text-[#6546C7] animate-spin" />
                        <span className="font-bold text-purple-900">Memproses foto sampul...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6546C7] flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            Klik untuk Unggah Foto Cover Buku
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Ambil foto langsung atau pilih gambar JPG / PNG / WebP dari perangkat Anda
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* PDF E-Book File Upload when format === 'pdf' */}
              {format === 'pdf' ? (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Upload File E-Book (Format PDF):</span>
                    </label>
                    {fileUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Hapus File PDF
                      </button>
                    )}
                  </div>

                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handlePdfFileChange}
                    className="hidden"
                  />

                  {isUploadingPdf ? (
                    <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-2">
                      <div className="flex items-center justify-between font-bold text-blue-900">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Mengunggah file PDF...</span>
                        </span>
                        <span>{pdfUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${pdfUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : fileUrl ? (
                    <div className="bg-white p-3.5 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 truncate">
                            {pdfFileName || 'Dokumen E-Book.pdf'}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              Siap dibaca di E-Reader
                              {pdfFileSize ? ` • ${formatFileSize(pdfFileSize)}` : ''}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg shrink-0"
                      >
                        Ganti PDF
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      className="w-full py-5 px-4 border-2 border-dashed border-blue-300 hover:border-blue-600 bg-white hover:bg-blue-50/40 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          Klik untuk Upload File PDF E-Book
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Pilih file .pdf dari komputer atau perangkat Anda (maksimal 20 MB)
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Mode Buku Cetak (Tersedia di Perpustakaan)</p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      Tidak perlu mengunggah file PDF. Gunakan fitur unggah foto di atas untuk memotret atau memilih sampul buku fisik.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Sinopsis & Ringkasan:</label>
                <textarea
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Tuliskan ringkasan isi buku..."
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
                  disabled={isSubmitting || isUploadingCover || isUploadingPdf}
                  className="flex-1 py-2.5 bg-[#6546C7] hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingBook ? 'Simpan Perubahan' : 'Tambahkan Buku'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
