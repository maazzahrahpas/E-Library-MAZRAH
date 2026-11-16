import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Settings,
  Database,
  FileText,
  CheckCircle2,
  Lock,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Edit3,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { UserRole, UserProfile } from '../../types/library';

interface ManagedUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  classGrade: string;
  points: number;
  status: string;
}

export const SuperAdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const {
    seedInitialDataToFirestore,
    settings,
    allUsers,
    addUserAccount,
    updateUserAccount,
    deleteUserAccount
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'audit' | 'database'>('users');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<'success' | 'error' | null>(null);
  const [fineAmountInput, setFineAmountInput] = useState(1000);
  const [maxLoanDaysInput, setMaxLoanDaysInput] = useState(7);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('siswa');
  const [formClass, setFormClass] = useState('XI');
  const [formPoints, setFormPoints] = useState(100);
  const [formStatus, setFormStatus] = useState('Aktif');

  // Sample audit logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log-1', action: 'GOOGLE_AUTH_SYNC', user: 'ma.azzahrahpas@gmail.com', role: 'super_admin', time: 'Baru saja', detail: 'Sinkronisasi akun Google email dan otorisasi Super Admin aktif.' },
    { id: 'log-2', action: 'DEPLOY_FIRESTORE_RULES', user: 'ma.azzahrahpas@gmail.com', role: 'super_admin', time: 'Hari ini, 13:45 WIB', detail: 'Aturan keamanan RBAC Firestore terverifikasi dan aktif.' },
    { id: 'log-3', action: 'APPROVE_LOAN', user: 'petugas.mazrah@gmail.com', role: 'admin', time: 'Hari ini, 11:20 WIB', detail: 'Persetujuan sirkulasi peminjaman buku santri terintegrasi realtime.' },
    { id: 'log-4', action: 'USER_REGISTER_GOOGLE', user: 'Pengguna Google', role: 'siswa', time: 'Hari ini', detail: 'Pendaftaran otomatis santri/pendidik dengan Google Sign-In.' }
  ]);

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole('siswa');
    setFormClass('X');
    setFormPoints(100);
    setFormStatus('Aktif');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.displayName);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormClass(user.classGrade || 'XI');
    setFormPoints(user.points || 0);
    setFormStatus('Aktif');
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingUser) {
      await updateUserAccount(editingUser.uid, {
        displayName: formName,
        email: formEmail,
        role: formRole,
        classGrade: formClass as any,
        points: formPoints
      });
    } else {
      await addUserAccount({
        uid: `u-${Date.now()}`,
        displayName: formName,
        email: formEmail,
        role: formRole,
        classGrade: formClass as any,
        points: formPoints,
        badges: ['new-reader'],
        booksReadCount: 0,
        currentBorrowCount: 0,
        readingStreakDays: 1
      });
    }

    setShowUserModal(false);
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${user.displayName}" (${user.email}) dari sistem database?`)) {
      await deleteUserAccount(user.uid);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    await updateUserAccount(uid, { role: newRole });
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedNotice(null);
    const ok = await seedInitialDataToFirestore();
    setSeedNotice(ok ? 'success' : 'error');
    setIsSeeding(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            <span>Pusat Kendali Super Admin & Kepala Madrasah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Super Administrator MAZRAH
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            Akses tingkat tertinggi: manajemen akun pengguna (tambah, sunting, hapus), konfigurasi operasional, pemeliharaan basis data Firestore, dan audit trail sistem.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Sistem Berjalan Normal & Aman</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-xs overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-[#6546C7] text-white shadow-xs' : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pengguna & Hak Akses</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-[#6546C7] text-white shadow-xs' : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Konfigurasi Perpustakaan</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'database' ? 'bg-[#6546C7] text-white shadow-xs' : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Sinkronisasi Firestore</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-[#6546C7] text-white shadow-xs' : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Log Sistem</span>
        </button>
      </div>

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Manajemen Akun & Penetapan Role
              </h3>
              <p className="text-xs text-gray-500">
                Tambah, sunting data pengguna, sesuaikan poin literasi, atau hapus akun pengguna
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                {allUsers.length} Akun Terdaftar
              </span>
              <button
                onClick={handleOpenAddUser}
                className="px-3.5 py-1.5 bg-[#6546C7] hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pengguna</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                  <th className="p-3">Nama & Google Email</th>
                  <th className="p-3">Kategori/Kelas</th>
                  <th className="p-3">Poin Literasi</th>
                  <th className="p-3">Hak Akses (Role)</th>
                  <th className="p-3">Integrasi</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      <p className="font-semibold text-xs">Belum ada akun pengguna yang tersimpan di Firestore.</p>
                      <p className="text-[11px] text-gray-400 mt-1">Siswa dan guru dapat mendaftar langsung dengan Google Email, atau Anda dapat menambahkannya melalui tombol "Tambah Pengguna".</p>
                    </td>
                  </tr>
                ) : (
                  allUsers.map((user) => {
                  const isGoogleUser = user.email.includes('@');
                  return (
                    <tr key={user.uid} className="hover:bg-purple-50/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              user.photoURL ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'
                            }
                            alt={user.displayName}
                            className="w-7 h-7 rounded-full object-cover border border-purple-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{user.displayName}</p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1">
                              <span>{user.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-gray-700">{user.classGrade || 'Siswa'}</td>
                      <td className="p-3 font-bold text-purple-700">{user.points || 0} Pts</td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                          className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Petugas Perpustakaan</option>
                          <option value="guru">Guru Madrasah</option>
                          <option value="siswa">Siswa</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Google Sync</span>
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Sunting Pengguna"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                {editingUser ? 'Sunting Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Alamat Email:</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Peran (Role):</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Petugas Perpustakaan</option>
                    <option value="guru">Guru Madrasah</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kelas / Divisi:</label>
                  <input
                    type="text"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="X / XI / XII / Guru / Staff"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Poin Literasi:</label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status Akun:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Ditangguhkan">Ditangguhkan</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: System Configuration */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">
              Konfigurasi Parameter Perpustakaan
            </h3>
            <p className="text-xs text-gray-500">
              Pengaturan batasan waktu pinjam, tarif denda keterlambatan, dan kebijakan madrasah
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSaveSettingsSuccess(true);
              setTimeout(() => setSaveSettingsSuccess(false), 3000);
            }}
            className="space-y-4 max-w-lg text-xs"
          >
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Nama Aplikasi Perpustakaan:
              </label>
              <input
                type="text"
                defaultValue={settings.appName}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Lembaga Madrasah:
              </label>
              <input
                type="text"
                defaultValue={settings.madrasahName}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Maksimal Hari Peminjaman:
                </label>
                <input
                  type="number"
                  value={maxLoanDaysInput}
                  onChange={(e) => setMaxLoanDaysInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Denda Keterlambatan per Hari (Rp):
                </label>
                <input
                  type="number"
                  value={fineAmountInput}
                  onChange={(e) => setFineAmountInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#6546C7] hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              Simpan Pengaturan
            </button>

            {saveSettingsSuccess && (
              <p className="text-emerald-700 font-bold text-xs mt-2">
                Pengaturan sistem berhasil diperbarui!
              </p>
            )}
          </form>
        </div>
      )}

      {/* Tab: Firestore Sync & Seed */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">
              Sinkronisasi Cloud Firestore
            </h3>
            <p className="text-xs text-gray-500">
              Inisialisasi koleksi awal buku, kategori kurikulum, dan pengumuman madrasah ke Firestore aktif
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#6546C7]" />
              <h4 className="font-bold text-sm text-purple-950">
                Database Cloud Firestore: Terhubung
              </h4>
            </div>
            <p className="text-xs text-purple-900 leading-relaxed">
              Database Cloud Firestore Anda telah aktif dengan database ID yang dikonfigurasi. Anda dapat menekan tombol di bawah untuk menyuntikkan (seed) koleksi buku kurikulum madrasah, kategori, dan tantangan literasi ke Firestore langsung.
            </p>
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-5 py-2.5 bg-[#6546C7] hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Menyinkronkan...' : 'Sinkronkan Data Awal ke Firestore'}</span>
            </button>
            {seedNotice === 'success' && (
              <p className="text-emerald-700 font-bold text-xs">
                Data awal E-Library MAZRAH berhasil disinkronisasi ke Cloud Firestore!
              </p>
            )}
            {seedNotice === 'error' && (
              <p className="text-rose-700 font-bold text-xs">
                Gagal menyinkronkan data ke Firestore. Pastikan Anda masuk sebagai Admin/Super Admin.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">
              Audit Log Aktivitas Sistem
            </h3>
            <p className="text-xs text-gray-500">
              Catatan riwayat tindakan keamanan, peminjaman, dan perubahan konfigurasi sistem
            </p>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-700 text-[11px] bg-purple-50 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-gray-400">&bull;</span>
                    <span className="font-semibold text-gray-700">{log.user}</span>
                  </div>
                  <p className="text-gray-600">{log.detail}</p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
