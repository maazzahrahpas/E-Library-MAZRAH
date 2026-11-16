import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  Trophy,
  BarChart3,
  Megaphone,
  Heart,
  Settings,
  ShieldAlert,
  FolderTree,
  FileSpreadsheet,
  Users,
  Compass,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { userProfile, isAdmin, isSuperAdmin } = useAuth();

  const studentNavItems = [
    { id: 'student-dashboard', label: 'Dashboard Siswa', icon: LayoutDashboard },
    { id: 'catalog', label: 'Katalog Buku Digital', icon: BookOpen },
    { id: 'my-loans', label: 'Peminjaman Saya', icon: BookmarkCheck },
    { id: 'favorites', label: 'Favorit & Riwayat', icon: Heart },
    { id: 'gamification', label: 'Gamifikasi & Leaderboard', icon: Trophy, badge: 'Hot' },
    { id: 'analytics', label: 'Analisis Kemajuan Baca', icon: BarChart3 },
    { id: 'announcements', label: 'Pengumuman Madrasah', icon: Megaphone }
  ];

  const adminNavItems = [
    { id: 'admin', label: 'Dashboard Petugas', icon: LayoutDashboard },
    { id: 'loan-mgmt', label: 'Sirkulasi & Peminjaman', icon: BookmarkCheck },
    { id: 'book-mgmt', label: 'Koleksi & E-Book', icon: BookOpen },
    { id: 'cat-mgmt', label: 'Kategori & Klasifikasi', icon: FolderTree },
    { id: 'reports', label: 'Laporan & Rekapitulasi', icon: FileSpreadsheet },
    { id: 'catalog', label: 'Pratinjau Katalog Siswa', icon: Compass }
  ];

  const superAdminNavItems = [
    { id: 'superadmin', label: 'Pusat Kendali Sistem', icon: ShieldAlert },
    { id: 'admin', label: 'Operasional Sirkulasi', icon: LayoutDashboard },
    { id: 'book-mgmt', label: 'Manajemen Koleksi', icon: BookOpen },
    { id: 'reports', label: 'Laporan Madrasah', icon: FileSpreadsheet },
    { id: 'catalog', label: 'Katalog Buku', icon: Compass }
  ];

  let items = studentNavItems;
  if (isSuperAdmin) {
    items = superAdminNavItems;
  } else if (isAdmin) {
    items = adminNavItems;
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Context Card */}
      <div className="p-4 border-b border-gray-100">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/60 rounded-xl p-3 border border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#6546C7] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {userProfile?.displayName?.charAt(0) || 'M'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-900 truncate">
                {userProfile?.displayName || 'Tamu MAZRAH'}
              </p>
              <p className="text-[11px] text-purple-700 font-medium capitalize">
                {userProfile
                  ? userProfile.role === 'siswa'
                    ? `Kelas ${userProfile.classGrade || 'XI'} MAZRAH`
                    : userProfile.role.replace('_', ' ')
                  : 'Pengunjung'}
              </p>
            </div>
          </div>

          {userProfile?.role === 'siswa' && (
            <div className="mt-2.5 pt-2 border-t border-purple-200/50 flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Poin Literasi:</span>
              <span className="font-extrabold text-[#6546C7] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                {userProfile.points} Pts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Menu Navigasi
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#6546C7] text-white shadow-md shadow-purple-600/20'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-amber-400 text-purple-950'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Daily Motivation / Info footer */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/70 flex items-center gap-2.5">
          <img
            src="/assets/aistudio/1783567162468_6ebfd163.png"
            alt="Logo MA Az Zahrah Pasuruan"
            className="w-9 h-9 object-contain shrink-0"
          />
          <div className="text-left overflow-hidden">
            <p className="text-[11px] font-bold text-gray-800 truncate">
              MA AZ ZAHRAH Pasuruan
            </p>
            <p className="text-[10px] text-gray-500 italic truncate">
              "Iqra' bismi rabbika"
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
