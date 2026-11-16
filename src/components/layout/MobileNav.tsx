import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  Trophy,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const { userProfile, isAdmin, isSuperAdmin } = useAuth();

  const studentTabs = [
    { id: 'student-dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'catalog', label: 'Katalog', icon: BookOpen },
    { id: 'my-loans', label: 'Pinjaman', icon: BookmarkCheck },
    { id: 'gamification', label: 'Peringkat', icon: Trophy },
    { id: 'analytics', label: 'Statistik', icon: BarChart3 }
  ];

  const adminTabs = [
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'loan-mgmt', label: 'Sirkulasi', icon: BookmarkCheck },
    { id: 'book-mgmt', label: 'Koleksi', icon: BookOpen },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'catalog', label: 'Katalog', icon: BookOpen }
  ];

  const superAdminTabs = [
    { id: 'superadmin', label: 'Super Admin', icon: ShieldAlert },
    { id: 'admin', label: 'Sirkulasi', icon: BookmarkCheck },
    { id: 'book-mgmt', label: 'Koleksi', icon: BookOpen },
    { id: 'reports', label: 'Laporan', icon: BarChart3 }
  ];

  let tabs = studentTabs;
  if (isSuperAdmin) tabs = superAdminTabs;
  else if (isAdmin) tabs = adminTabs;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition-all ${
              isActive
                ? 'text-[#6546C7] font-bold scale-105'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
