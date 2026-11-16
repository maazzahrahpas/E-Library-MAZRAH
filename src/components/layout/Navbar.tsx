import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Bell,
  Sparkles,
  Flame,
  Award,
  User as UserIcon,
  LogOut,
  LogIn,
  CheckCircle,
  Clock,
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { UserRole } from '../../types/library';

interface NavbarProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
  const {
    userProfile,
    loginWithGoogle,
    logout,
    currentUser,
    isAdmin,
    isSuperAdmin
  } = useAuth();

  const {
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationRead
  } = useLibrary();

  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleLabels: Record<UserRole, { label: string; color: string; bg: string }> = {
    super_admin: { label: 'Super Admin', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-200' },
    admin: { label: 'Petugas Perpus', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
    guru: { label: 'Guru Madrasah', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
    siswa: { label: `Siswa (${userProfile?.classGrade || 'XI'})`, color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' }
  };

  const currentRoleInfo = userProfile
    ? roleLabels[userProfile.role]
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-amber-400 text-purple-950 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
            Madrasah Hebat
          </span>
          <span className="opacity-90">
            MA AZ ZAHRAH KOTA PASURUAN &bull; <em>"Jelajahi Dunia, Mulai dari Membaca"</em>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] opacity-80">
          <span>Koleksi Digital 24/7</span>
          <span>&bull;</span>
          <span>Akreditasi Madrasah A</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer shrink-0 group"
        >
          <div className="w-11 h-11 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md shadow-emerald-900/10 border border-emerald-100 group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/assets/aistudio/1783567162468_6ebfd163.png"
              alt="Logo MA Az Zahrah Kota Pasuruan"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-gray-900">
                E-Library <span className="text-[#6546C7]">MAZRAH</span>
              </span>
              <span className="hidden md:inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                Resmi
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
              MA AZ ZAHRAH KOTA PASURUAN
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari buku, pengarang, tafsir, sains..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'catalog') {
                  onNavigate('catalog');
                }
              }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-xs sm:text-sm text-gray-800 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#6546C7]/30 focus:border-[#6546C7] transition-all"
            />
          </div>
        </div>

        {/* User and Actions Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Role Badge (Real Account) */}
          {currentRoleInfo && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${currentRoleInfo.bg} ${currentRoleInfo.color}`}>
              <Shield className="w-3.5 h-3.5" />
              <span>{currentRoleInfo.label}</span>
            </div>
          )}

          {/* Gamification Micro Stats (Points & Streak) */}
          {userProfile && (
            <div className="hidden lg:flex items-center gap-2">
              <div
                onClick={() => onNavigate('gamification')}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200/80 cursor-pointer transition-colors"
                title="Poin Literasi Santri"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{userProfile.points || 0} Poin</span>
              </div>
              <div
                onClick={() => onNavigate('gamification')}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200/80 cursor-pointer transition-colors"
                title="Streak Membaca Harian"
              >
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                <span>{userProfile.readingStreakDays || 0} Hari</span>
              </div>
            </div>
          )}

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifPopover(!showNotifPopover);
                setShowUserMenu(false);
              }}
              className="p-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#6546C7]" />
                    <span className="font-bold text-sm text-gray-900">Notifikasi</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {unreadCount} pesan baru
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      Belum ada notifikasi.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                          notif.isRead
                            ? 'bg-gray-50/70 text-gray-600 hover:bg-gray-100'
                            : 'bg-purple-50/80 text-gray-900 border border-purple-100 hover:bg-purple-100/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-semibold text-gray-900 line-clamp-1">
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#6546C7] shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar or Google Sign-in Button */}
          {!currentUser ? (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-[#6546C7] hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all shrink-0 active:scale-95"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifPopover(false);
                }}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="w-7 h-7 rounded-lg object-cover ring-2 ring-purple-500/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-[#6546C7] text-white flex items-center justify-center text-xs font-bold">
                    {userProfile?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate hidden md:inline-block">
                  {userProfile?.displayName?.split(' ')[0] || 'Pengguna'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && userProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {userProfile.displayName}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{userProfile.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Akun Google Terverifikasi</span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={() => {
                        onNavigate(
                          isSuperAdmin
                            ? 'superadmin'
                            : isAdmin
                            ? 'admin'
                            : 'student-dashboard'
                        );
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-purple-50 flex items-center gap-2.5"
                    >
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>
                        {isSuperAdmin
                          ? 'Pusat Kendali Super Admin'
                          : isAdmin
                          ? 'Dashboard Petugas'
                          : 'Dashboard Siswa'}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('my-loans');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-purple-50 flex items-center gap-2.5"
                    >
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Peminjaman Saya</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('analytics');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-purple-50 flex items-center gap-2.5"
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Statistik & Analisis Baca</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar Akun Google</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
