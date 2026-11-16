import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { LandingPage } from './components/landing/LandingPage';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { BookCatalog } from './components/catalog/BookCatalog';
import { BookDetailModal } from './components/catalog/BookDetailModal';
import { DigitalReaderModal } from './components/reader/DigitalReaderModal';
import { GamificationHub } from './components/gamification/GamificationHub';
import { ShareAchievementModal } from './components/gamification/ShareAchievementModal';
import { PersonalAnalytics } from './components/analytics/PersonalAnalytics';
import { MyLoansView } from './components/loans/MyLoansView';
import { FavoritesView } from './components/catalog/FavoritesView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoanManagement } from './components/admin/LoanManagement';
import { BookManagement } from './components/admin/BookManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { LibraryReports } from './components/reports/LibraryReports';
import { Book } from './types/library';
import { testConnection } from './firebase/config';

function AppContent() {
  const {
    dailyRewardNotice,
    dismissDailyRewardNotice,
    authErrorNotice,
    dismissAuthErrorNotice
  } = useAuth();
  const [currentView, setCurrentView] = useState<string>('student-dashboard');

  // Modals state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [sharedBookTarget, setSharedBookTarget] = useState<Book | null>(null);

  // Test connection on initial load as required by Firebase skill
  useEffect(() => {
    testConnection();
  }, []);

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleReadBook = (book: Book) => {
    setReadingBook(book);
  };

  const handleOpenShareAchievement = (book?: Book) => {
    setSharedBookTarget(book || null);
    setShowShareModal(true);
  };

  // Render main view
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            onNavigate={setCurrentView}
            onOpenBook={handleOpenBook}
          />
        );
      case 'student-dashboard':
        return (
          <StudentDashboard
            onNavigate={setCurrentView}
            onOpenBook={handleOpenBook}
            onReadBook={handleReadBook}
          />
        );
      case 'catalog':
        return (
          <BookCatalog
            onOpenBook={handleOpenBook}
            onReadBook={handleReadBook}
          />
        );
      case 'my-loans':
        return (
          <MyLoansView
            onOpenBook={handleOpenBook}
            onReadBook={handleReadBook}
          />
        );
      case 'favorites':
        return (
          <FavoritesView
            onOpenBook={handleOpenBook}
            onReadBook={handleReadBook}
          />
        );
      case 'gamification':
        return (
          <GamificationHub
            onOpenShareModal={() => handleOpenShareAchievement()}
            onReadBook={handleReadBook}
          />
        );
      case 'analytics':
        return <PersonalAnalytics />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'admin':
        return (
          <AdminDashboard
            onNavigate={setCurrentView}
            onOpenBook={handleOpenBook}
          />
        );
      case 'loan-mgmt':
        return <LoanManagement />;
      case 'book-mgmt':
        return <BookManagement />;
      case 'cat-mgmt':
        return <CategoryManagement />;
      case 'superadmin':
        return <SuperAdminDashboard />;
      case 'reports':
        return <LibraryReports />;
      default:
        return (
          <StudentDashboard
            onNavigate={setCurrentView}
            onOpenBook={handleOpenBook}
            onReadBook={handleReadBook}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#24243A] flex flex-col font-sans selection:bg-purple-200">
      {/* Top Navbar */}
      <Navbar onNavigate={setCurrentView} activeView={currentView} />

      {/* Daily Streak / Auth Feedback Toast Banners */}
      {(dailyRewardNotice || authErrorNotice) && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-2">
          {dailyRewardNotice && (
            <div
              className={`rounded-2xl p-3.5 sm:px-5 border shadow-sm flex items-center justify-between gap-3 text-xs ${
                dailyRewardNotice.type === 'streak'
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200 text-orange-950'
                  : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div>
                <p className="font-black text-sm">{dailyRewardNotice.title}</p>
                <p className="opacity-90 mt-0.5">{dailyRewardNotice.message}</p>
              </div>
              <button
                onClick={dismissDailyRewardNotice}
                className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white font-bold text-gray-700 border border-gray-200 shrink-0"
              >
                Tutup
              </button>
            </div>
          )}

          {authErrorNotice && (
            <div className="rounded-2xl p-3.5 sm:px-5 border border-rose-200 bg-rose-50 text-rose-900 shadow-sm flex items-center justify-between gap-3 text-xs">
              <p className="font-semibold">{authErrorNotice}</p>
              <button
                onClick={dismissAuthErrorNotice}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 font-bold text-rose-700 border border-rose-200 shrink-0"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (hidden on public landing view) */}
        {currentView !== 'landing' && (
          <Sidebar currentView={currentView} onNavigate={setCurrentView} />
        )}

        {/* Content Area */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${currentView === 'landing' ? 'max-w-7xl mx-auto' : ''}`}>
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentView={currentView} onNavigate={setCurrentView} />

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onReadBook={handleReadBook}
          onShareAchievement={handleOpenShareAchievement}
        />
      )}

      {/* Interactive Digital Book Reader Modal */}
      {readingBook && (
        <DigitalReaderModal
          book={readingBook}
          onClose={() => setReadingBook(null)}
          onShareAchievement={handleOpenShareAchievement}
        />
      )}

      {/* Social Media Achievement Sharing Modal */}
      {showShareModal && (
        <ShareAchievementModal
          onClose={() => setShowShareModal(false)}
          sharedBook={sharedBookTarget}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <AppContent />
      </LibraryProvider>
    </AuthProvider>
  );
}
