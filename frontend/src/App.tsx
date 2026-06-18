import React, { useState, useEffect } from 'react';
import { Home, Info, BookOpen, ShieldCheck, Mail, LogIn, LayoutDashboard, Menu, X, ArrowRight } from 'lucide-react';
import { AppScreen, UserRole, Room, BookingApplication, MaintenanceRequest, NewsArticle, Invoice, TransferRequest } from './types';
import { INITIAL_ROOMS, INITIAL_NEWS, INITIAL_APPLICATIONS, INITIAL_MAINTENANCE, INITIAL_INVOICES, INITIAL_TRANSFERS } from './data/mockData';

// Component imports
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import BookingView from './components/BookingView';
import NewsView from './components/NewsView';
import RulesView from './components/RulesView';
import ContactView from './components/ContactView';
import AuthView from './components/AuthView';
import StudentPortal from './components/StudentPortal';
import StaffPortal from './components/StaffPortal';
import AdminPortal from './components/AdminPortal';

export default function App() {
  // Screens state routing
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.Home);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.Guest);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Mobile menu control trigger
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Synchronized State Hub
  const [rooms, setRooms] = useState<Room[]>([]);
  const [applications, setApplications] = useState<BookingApplication[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);

  // Selected Booking preassigned room
  const [selectedBookingRoomNumber, setSelectedBookingRoomNumber] = useState<string>('');

  // Initial Seed & hydration from LocalStorage
  useEffect(() => {
    const cachedRooms = localStorage.getItem('dnu_rooms');
    const cachedNews = localStorage.getItem('dnu_news');
    const cachedApps = localStorage.getItem('dnu_apps');
    const cachedMaint = localStorage.getItem('dnu_maint');
    const cachedInvs = localStorage.getItem('dnu_invs');
    const cachedTf = localStorage.getItem('dnu_tf');

    if (cachedRooms) setRooms(JSON.parse(cachedRooms));
    else {
      setRooms(INITIAL_ROOMS);
      localStorage.setItem('dnu_rooms', JSON.stringify(INITIAL_ROOMS));
    }

    if (cachedNews) setNews(JSON.parse(cachedNews));
    else {
      setNews(INITIAL_NEWS);
      localStorage.setItem('dnu_news', JSON.stringify(INITIAL_NEWS));
    }

    if (cachedApps) setApplications(JSON.parse(cachedApps));
    else {
      setApplications(INITIAL_APPLICATIONS);
      localStorage.setItem('dnu_apps', JSON.stringify(INITIAL_APPLICATIONS));
    }

    if (cachedMaint) setMaintenance(JSON.parse(cachedMaint));
    else {
      setMaintenance(INITIAL_MAINTENANCE);
      localStorage.setItem('dnu_maint', JSON.stringify(INITIAL_MAINTENANCE));
    }

    if (cachedInvs) setInvoices(JSON.parse(cachedInvs));
    else {
      setInvoices(INITIAL_INVOICES);
      localStorage.setItem('dnu_invs', JSON.stringify(INITIAL_INVOICES));
    }

    if (cachedTf) setTransfers(JSON.parse(cachedTf));
    else {
      setTransfers(INITIAL_TRANSFERS);
      localStorage.setItem('dnu_tf', JSON.stringify(INITIAL_TRANSFERS));
    }
  }, []);

  // Save states helper utilities
  const saveRooms = (updated: Room[]) => {
    setRooms(updated);
    localStorage.setItem('dnu_rooms', JSON.stringify(updated));
  };

  const saveApps = (updated: BookingApplication[]) => {
    setApplications(updated);
    localStorage.setItem('dnu_apps', JSON.stringify(updated));
  };

  const saveMaint = (updated: MaintenanceRequest[]) => {
    setMaintenance(updated);
    localStorage.setItem('dnu_maint', JSON.stringify(updated));
  };

  const saveNews = (updated: NewsArticle[]) => {
    setNews(updated);
    localStorage.setItem('dnu_news', JSON.stringify(updated));
  };

  const saveInvs = (updated: Invoice[]) => {
    setInvoices(updated);
    localStorage.setItem('dnu_invs', JSON.stringify(updated));
  };

  const saveTf = (updated: TransferRequest[]) => {
    setTransfers(updated);
    localStorage.setItem('dnu_tf', JSON.stringify(updated));
  };

  // State handlers triggers
  const handleAddApplication = (newApp: BookingApplication) => {
    const updated = [newApp, ...applications];
    saveApps(updated);
  };

  const handleUpdateRoomVacancy = (roomId: string, decrement: boolean) => {
    const updated = rooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          available: Math.max(0, room.available + (decrement ? -1 : 1))
        };
      }
      return room;
    });
    saveRooms(updated);
  };

  const handleApproveApplication = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    // Approve status
    const updatedApps = applications.map(a => a.id === appId ? { ...a, status: 'Approved' as const } : a);
    saveApps(updatedApps);

    // If new student approved, let's append to room occupant list if any
    const updatedRooms = rooms.map(r => {
      if (r.id === app.roomId) {
        return {
          ...r,
          occupants: [...r.occupants, app.studentId]
        };
      }
      return r;
    });
    saveRooms(updatedRooms);
  };

  const handleRejectApplication = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const updatedApps = applications.map(a => a.id === appId ? { ...a, status: 'Rejected' as const } : a);
    saveApps(updatedApps);

    // Release slot room
    handleUpdateRoomVacancy(app.roomId, false);
  };

  const handleAddMaintenance = (newReq: MaintenanceRequest) => {
    const updated = [newReq, ...maintenance];
    saveMaint(updated);
  };

  const handleUpdateMaintenanceStatus = (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => {
    const updated = maintenance.map(m => m.id === id ? { ...m, status } : m);
    saveMaint(updated);
  };

  const handleAddNewsArticle = (newArt: NewsArticle) => {
    const updated = [newArt, ...news];
    saveNews(updated);
  };

  const handleDeleteNewsArticle = (id: string) => {
    const updated = news.filter(n => n.id !== id);
    saveNews(updated);
  };

  const handleAddInvoice = (newInv: Invoice) => {
    const updated = [newInv, ...invoices];
    saveInvs(updated);
  };

  const handlePayInvoice = (invoiceId: string) => {
    const updated = invoices.map(inv => inv.id === invoiceId ? { ...inv, status: 'Paid' as const } : inv);
    saveInvs(updated);
  };

  const handleAddTransfer = (newTf: TransferRequest) => {
    const updated = [newTf, ...transfers];
    saveTf(updated);
  };

  // Auth handler
  const handleLoginSuccess = (role: UserRole, userPayload: any) => {
    setCurrentUserRole(role);
    setCurrentUser(userPayload);
    
    // Jump directly to correct fullscreen portal dashboard screen layout
    if (role === UserRole.Student) setCurrentScreen(AppScreen.StudentPortal);
    else if (role === UserRole.Staff) setCurrentScreen(AppScreen.StaffPortal);
    else if (role === UserRole.Admin) setCurrentScreen(AppScreen.AdminPortal);
  };

  const handleLogout = () => {
    setCurrentUserRole(UserRole.Guest);
    setCurrentUser(null);
    setCurrentScreen(AppScreen.Home);
  };

  // Check if public view
  const isPublicScreen = [
    AppScreen.Home,
    AppScreen.About,
    AppScreen.Booking,
    AppScreen.News,
    AppScreen.Rules,
    AppScreen.Contact,
    AppScreen.Auth
  ].includes(currentScreen);

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col text-slate-800 antialiased selection:bg-orange-100 selection:text-orange-900">
      
      {/* 1. Global Navigation Top Header (Only for general landing public views) */}
      {isPublicScreen && (
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/60 z-50 shadow-xs">
          <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
            {/* Branding Logo group */}
            <div 
              onClick={() => navigateTo(AppScreen.Home)}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-lg shadow-sm group-hover:bg-primary-container transition-colors">
                DNU
              </div>
              <div className="text-left font-black tracking-widest text-slate-900 text-sm group-hover:text-primary transition-colors">
                KTX
                <span className="text-[9px] text-slate-400 block font-light tracking-normal lowercase">đại học đại nam</span>
              </div>
            </div>

            {/* Desktop Navigation links */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-600">
              {[
                { screen: AppScreen.Home, label: 'Trang chủ' },
                { screen: AppScreen.About, label: 'Giới thiệu' },
                { screen: AppScreen.Booking, label: 'Đăng ký phòng' },
                { screen: AppScreen.News, label: 'Tin tức' },
                { screen: AppScreen.Rules, label: 'Nội quy' },
                { screen: AppScreen.Contact, label: 'Liên hệ' }
              ].map(item => (
                <button
                  key={item.screen}
                  onClick={() => navigateTo(item.screen)}
                  className={`hover:text-primary transition-all cursor-pointer relative py-1.5 ${
                    currentScreen === item.screen ? 'text-primary' : ''
                  }`}
                >
                  <span>{item.label}</span>
                  {currentScreen === item.screen && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* User portal / auth action */}
            <div className="hidden lg:flex items-center gap-3">
              {currentUserRole === UserRole.Guest ? (
                <button 
                  onClick={() => navigateTo(AppScreen.Auth)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-lg hover:shadow-slate-950/10 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ĐĂNG NHẬP</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => {
                      if (currentUserRole === UserRole.Student) navigateTo(AppScreen.StudentPortal);
                      else if (currentUserRole === UserRole.Staff) navigateTo(AppScreen.StaffPortal);
                      else if (currentUserRole === UserRole.Admin) navigateTo(AppScreen.AdminPortal);
                    }}
                    className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>DASHBOARD</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-3.5 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu trigger button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Slide Drawer Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t bg-white px-6 py-4 flex flex-col gap-3 font-semibold text-sm">
              {[
                { screen: AppScreen.Home, label: 'Trang chủ' },
                { screen: AppScreen.About, label: 'Giới thiệu' },
                { screen: AppScreen.Booking, label: 'Đăng ký phòng' },
                { screen: AppScreen.News, label: 'Tin tức' },
                { screen: AppScreen.Rules, label: 'Nội quy' },
                { screen: AppScreen.Contact, label: 'Liên hệ' }
              ].map(item => (
                <button
                  key={item.screen}
                  onClick={() => navigateTo(item.screen)}
                  className={`w-full text-left py-2.5 hover:text-primary transition-all cursor-pointer ${
                    currentScreen === item.screen ? 'text-primary' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t pt-3 mt-1.5 flex flex-col gap-2">
                {currentUserRole === UserRole.Guest ? (
                  <button 
                    onClick={() => navigateTo(AppScreen.Auth)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-center text-xs font-bold cursor-pointer"
                  >
                    Đăng nhập hệ thống
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        if (currentUserRole === UserRole.Student) navigateTo(AppScreen.StudentPortal);
                        else if (currentUserRole === UserRole.Staff) navigateTo(AppScreen.StaffPortal);
                        else if (currentUserRole === UserRole.Admin) navigateTo(AppScreen.AdminPortal);
                      }}
                      className="w-full py-3 bg-primary text-white text-center rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Bảng điều khiển Portal
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full py-2.5 border text-center text-xs font-semibold rounded-xl text-slate-500 cursor-pointer"
                    >
                      Thoát đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      {/* 2. Workspace Body Routing */}
      <div className="flex-1 w-full flex flex-col">
        {currentScreen === AppScreen.Home && (
          <HomeView onNavigate={navigateTo} onSetSelectedBookingRoom={setSelectedBookingRoomNumber} />
        )}
        {currentScreen === AppScreen.About && (
          <AboutView onNavigate={navigateTo} />
        )}
        {currentScreen === AppScreen.Booking && (
          <BookingView 
            rooms={rooms} 
            onAddApplication={handleAddApplication} 
            onUpdateRoomVacancy={handleUpdateRoomVacancy} 
            initialSelectedRoomNumber={selectedBookingRoomNumber}
          />
        )}
        {currentScreen === AppScreen.News && (
          <NewsView articles={news} />
        )}
        {currentScreen === AppScreen.Rules && (
          <RulesView />
        )}
        {currentScreen === AppScreen.Contact && (
          <ContactView />
        )}
        {currentScreen === AppScreen.Auth && (
          <AuthView onLoginSuccess={handleLoginSuccess} />
        )}

        {/* Fullscreen Admin portals dashboards hiding parent container headers */}
        {currentScreen === AppScreen.StudentPortal && currentUser && (
          <StudentPortal 
            studentUser={currentUser} 
            rooms={rooms}
            onLogout={handleLogout}
            maintenanceRequests={maintenance}
            onAddMaintenance={handleAddMaintenance}
            onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
            invoices={invoices}
            onPayInvoice={handlePayInvoice}
            transferRequests={transfers}
            onAddTransfer={handleAddTransfer}
          />
        )}
        {currentScreen === AppScreen.StaffPortal && currentUser && (
          <StaffPortal 
            staffUser={currentUser}
            rooms={rooms}
            onLogout={handleLogout}
            applications={applications}
            onApproveApplication={handleApproveApplication}
            onRejectApplication={handleRejectApplication}
            onUpdateRoomVacancy={handleUpdateRoomVacancy}
            maintenanceRequests={maintenance}
            onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
            onAddInvoice={handleAddInvoice}
          />
        )}
        {currentScreen === AppScreen.AdminPortal && currentUser && (
          <AdminPortal 
            adminUser={currentUser}
            rooms={rooms}
            onLogout={handleLogout}
            applications={applications}
            onApproveApplication={handleApproveApplication}
            onRejectApplication={handleRejectApplication}
            maintenanceRequests={maintenance}
            onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
            news={news}
            onAddNewsArticle={handleAddNewsArticle}
            onDeleteNewsArticle={handleDeleteNewsArticle}
            invoices={invoices}
          />
        )}
      </div>

      {/* 3. Global Footer (Only for public landing views) */}
      {isPublicScreen && (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 text-xs">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">D</div>
                <span className="font-extrabold text-white text-sm tracking-wider">DNU KTX</span>
              </div>
              <p className="text-slate-500 font-light leading-relaxed">
                Hệ thống nộp đơn lưu trú ưu tiên, tính hợp đồng kĩ thuật phòng ở KTX Đại học Đại Nam.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-widest text-slate-300">Tính năng cốt lõi</h4>
              <ul className="space-y-2 text-slate-400 font-light">
                <li><button onClick={() => navigateTo(AppScreen.Booking)} className="hover:text-white hover:underline cursor-pointer">Tìm phòng KTX</button></li>
                <li><button onClick={() => navigateTo(AppScreen.Rules)} className="hover:text-white hover:underline cursor-pointer">Nội quy sinh hoạt</button></li>
                <li><button onClick={() => navigateTo(AppScreen.Auth)} className="hover:text-white hover:underline cursor-pointer">Cổng thông tin SV/Cán bộ</button></li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-widest text-slate-300">Ban quản lý Ký túc xá DNU</h4>
              <p className="text-slate-400 font-light leading-relaxed">
                📍 Địa chỉ: Phú Lãm, Hà Đông, Hà Nội (Nằm trong khuôn viên chính Trường Đại học Đại Nam).<br />
                📞 Hotline trực điện kỹ sư: <strong>0243.859.1484</strong> (Phục vụ 24/7).<br />
                ✉️ Email nộp thư hỗ trợ: <strong>ktx@dainam.edu.vn</strong>
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-800 text-center text-slate-500 text-[10px] items-center justify-between flex flex-col md:flex-row gap-4">
            <span>© 2026 Đại học Đại Nam. Được thiết kế tối ưu hóa bởi Cán bộ Công nghệ KTX. Bảo lưu mọi quyền lợi.</span>
            <div className="flex gap-4">
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300">Điều khoản sử dụng</a>
              <span>•</span>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300">Bảo mật thông tin</a>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
