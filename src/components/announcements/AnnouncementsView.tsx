import React, { useState } from 'react';
import { Megaphone, Plus, Bell, Calendar, User, CheckCircle2, Edit3, Trash2, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types/library';

export const AnnouncementsView: React.FC = () => {
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useLibrary();
  const { isAdmin, userProfile } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'penting'>('normal');
  const [targetAudience, setTargetAudience] = useState<'Semua' | 'Siswa' | 'Guru'>('Semua');

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setContent('');
    setPriority('normal');
    setTargetAudience('Semua');
    setShowAddModal(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setTitle(ann.title);
    setContent(ann.content);
    setPriority(ann.priority);
    setTargetAudience(ann.targetAudience);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    if (editingAnnouncement) {
      await updateAnnouncement(editingAnnouncement.id, {
        title,
        content,
        priority,
        targetAudience
      });
    } else {
      await createAnnouncement({
        title,
        content,
        authorName: userProfile?.displayName || 'Petugas Perpustakaan',
        authorRole: isAdmin ? 'Petugas Perpustakaan' : 'Admin',
        priority,
        targetAudience
      });
    }

    setShowAddModal(false);
  };

  const handleDelete = async (annId: string, annTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengumuman "${annTitle}"?`)) {
      await deleteAnnouncement(annId);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Papan Informasi Resmi Madrasah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Warta & Pengumuman Perpustakaan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Kelola, sunting, atau hapus warta resmi MA Az Zahrah Pasuruan
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman Baru</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3 hover:border-purple-200 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {ann.priority === 'penting' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                      Pemberitahuan Penting
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 font-medium">
                    Sasaran: {ann.targetAudience}
                  </span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-gray-900">
                  {ann.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-gray-400">
                  {ann.createdAt.split('T')[0]}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Sunting Pengumuman"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id, ann.title)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold text-gray-700">{ann.authorName}</span>
                <span>({ann.authorRole})</span>
              </div>
              <span className="text-purple-700 font-semibold">MA AZ ZAHRAH Pasuruan</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                {editingAnnouncement ? 'Sunting Pengumuman' : 'Buat Pengumuman Baru'}
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
                <label className="block font-bold text-gray-700 mb-1">Judul Pengumuman:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Pengembalian Buku Akhir Semester"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prioritas:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="normal">Normal</option>
                    <option value="penting">Penting / Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sasaran:</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Semua">Semua Santri & Guru</option>
                    <option value="Siswa">Khusus Siswa</option>
                    <option value="Guru">Khusus Guru / Pendidik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Isi Pengumuman:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan detail pengumuman secara lengkap dan jelas..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
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
                  {editingAnnouncement ? 'Simpan Perubahan' : 'Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
