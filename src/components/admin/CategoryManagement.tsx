import React, { useState } from 'react';
import { FolderTree, Plus, BookOpen, Trash2, Edit3, Check, X, Sparkles } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Category } from '../../types/library';

export const CategoryManagement: React.FC = () => {
  const { categories, books, addCategory, updateCategory, deleteCategory } = useLibrary();
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Edit category modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await addCategory({
      name: newCatName,
      slug,
      icon: 'BookOpen',
      bookCount: 0,
      description: newCatDesc || 'Koleksi rujukan santri MA Az Zahrah',
      color: 'from-purple-500 to-indigo-600'
    });
    setAddedSuccess(true);
    setNewCatName('');
    setNewCatDesc('');
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    await updateCategory(editingCategory.id, {
      name: editName,
      description: editDesc,
      slug: editName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
    setEditingCategory(null);
  };

  const handleDelete = async (cat: Category) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) {
      await deleteCategory(cat.id);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Struktur Klasifikasi Koleksi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Kategori & Klasifikasi Buku
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Tambah, sunting nama/deskripsi, atau hapus klasifikasi buku perpustakaan
          </p>
        </div>
        <span className="text-xs font-bold text-[#6546C7] bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200 self-start sm:self-auto">
          {categories.length} Kategori Aktif
        </span>
      </div>

      {/* Add Category Form */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#6546C7]" />
          <span>Tambah Kategori Baru</span>
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Nama Kategori (contoh: Ushul Fikih Kontemporer)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Deskripsi singkat kategori..."
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              Tambah Kategori
            </button>
          </div>
        </form>
        {addedSuccess && (
          <p className="text-emerald-700 font-bold text-xs mt-2">
            Kategori baru berhasil ditambahkan!
          </p>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = books.filter((b) => b.category === cat.name).length;
          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-purple-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6546C7] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {count} Koleksi
                    </span>
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Sunting Kategori"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="font-extrabold text-sm text-gray-900 mt-3">{cat.name}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cat.description}</p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Slug: {cat.slug}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                Sunting Data Kategori
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Kategori:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Deskripsi Kategori:</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
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
