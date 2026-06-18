import React, { useState } from 'react';
import { ChartSpline, Users, Shield, LogOut, ArrowUpRight, ArrowDownRight, Settings, PlusCircle, Trash2, Calendar, Newspaper, Activity, Landmark, BellRing, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Room, BookingApplication, MaintenanceRequest, NewsArticle, Invoice } from '../types';

interface AdminPortalProps {
  adminUser: any;
  rooms: Room[];
  onLogout: () => void;
  applications: BookingApplication[];
  onApproveApplication: (appId: string) => void;
  onRejectApplication: (appId: string) => void;
  maintenanceRequests: MaintenanceRequest[];
  onUpdateMaintenanceStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => void;
  news: NewsArticle[];
  onAddNewsArticle: (article: NewsArticle) => void;
  onDeleteNewsArticle: (id: string) => void;
  invoices: Invoice[];
}

export default function AdminPortal({
  adminUser,
  rooms,
  onLogout,
  applications,
  onApproveApplication,
  onRejectApplication,
  maintenanceRequests,
  onUpdateMaintenanceStatus,
  news,
  onAddNewsArticle,
  onDeleteNewsArticle,
  invoices
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<string>('Bảng điều khiển');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // News Manager input state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCat, setNewsCat] = useState<'TIN TỨC KTX' | 'SỰ KIỆN' | 'THÔNG BÁO' | 'HOẠT ĐỘNG SV' | 'Quy định - Thủ tục'>('TIN TỨC KTX');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImg, setNewsImg] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80');

  const pendingApps = applications.filter(a => a.status === 'Pending');
  const activeIssues = maintenanceRequests.filter(m => m.status !== 'Resolved');

  // Multi-metrics
  const totalInvoicesPaidSum = invoices.filter(i => i.status === 'Paid').reduce((accum, i) => accum + i.amount, 14500000);
  const totalOccupiedSeats = rooms.reduce((accum, r) => accum + (r.capacity - r.available), 14);
  const totalCapacitySeats = rooms.reduce((accum, r) => accum + r.capacity, 28);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsSummary || !newsContent) {
      showToast('Vui lòng soạn thảo và bổ sung hoàn chỉnh thông tin các trường yêu cầu!', 'error');
      return;
    }

    const newArticle: NewsArticle = {
      id: 'news-' + Math.random().toString(36).substr(2, 9),
      title: newsTitle,
      category: newsCat,
      date: new Date().toLocaleDateString('vi-VN'),
      summary: newsSummary,
      content: newsContent,
      image: newsImg
    };

    onAddNewsArticle(newArticle);
    showToast('Đã soạn đăng và chuyển gửi thông báo mới công khai thành công!', 'success');
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
  };

  return (
    <div className="w-full flex bg-[#FDFBF7] min-h-screen text-left border-t border-[#EAE7E1] text-[#4A4A4A]">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-[200] max-w-sm rounded-[20px] shadow-lg border p-4 flex items-start gap-3 bg-white border-[#EAE7E1] animate-fade-in">
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-[#CB997E] shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-[#6B705C] shrink-0 mt-0.5" />}
          <div className="text-xs font-semibold text-[#4A4A4A] leading-relaxed">
            {toast.message}
          </div>
        </div>
      )}

      {/* Sidebar Controls left */}
      <aside className="w-64 bg-[#6B705C] text-slate-100 shrink-0 select-none flex flex-col justify-between border-r border-[#EAE7E1] p-0">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#CB997E] flex items-center justify-center text-white font-serif font-extrabold text-sm">A</span>
            <div>
              <div className="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
              <div className="text-[10px] text-[#FDFBF7]/85">Ban quản trị hệ thống</div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 text-xs text-[#FDFBF7]">
            {[
              { id: 'Bảng điều khiển', icon: ChartSpline },
              { id: 'Quản lý tin tức', icon: Newspaper },
              { id: 'Sự cố bảo trì', icon: Activity },
              { id: 'Duyệt lưu trú', icon: Users },
              { id: 'Cài đặt hệ thống', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold cursor-pointer transition-all text-left ${
                    activeTab === tab.id 
                      ? 'bg-[#CB997E] text-white shadow-xs' 
                      : 'hover:bg-white/10 text-[#FDFBF7]/85 hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{tab.id}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom logout prof */}
        <div className="p-4 border-t border-white/10">
          <div className="p-3 bg-white/15 rounded-2xl flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#CB997E] text-white font-extrabold flex items-center justify-center border border-white/10 font-mono text-sm leading-none">
              AD
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs truncate text-white">{adminUser.name}</div>
              <div className="text-[10px] text-[#FDFBF7]/85 font-mono">Quản trị tối cao</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Thoát đặc quyền</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#FDFBF7]">
        
        {/* Top Header details */}
        <header className="bg-white border-b border-[#EAE7E1] px-8 py-4.5 flex justify-between items-center shrink-0">
          <div className="text-[#4A4A4A]">
            <span className="text-xs text-[#8B8B8B] font-light">BẢNG QUẢN TRỊ TRUNG TÂM</span>
            <h2 className="font-serif font-light text-[#4A4A4A] text-lg leading-none mt-1">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#CB997E] border border-[#CB997E]/30 text-white rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Shield className="w-3.5 h-3.5 fill-white" />
              <span>Chế độ: ROOT ADMIN 🛡️</span>
            </div>
          </div>
        </header>

        {/* Workspace body panels */}
        <div className="p-8 flex-1 space-y-6">
          
          {/* TAB 1: Dashboard overview */}
          {activeTab === 'Bảng điều khiển' && (
            <div className="space-y-6">
              
              {/* Statistic widgets 4 cards bento */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                
                {/* Students residents card */}
                <div className="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
                  <span className="text-[10px] text-[#8B8B8B] font-bold uppercase block">Học viên đang ở</span>
                  <div className="text-2xl font-bold font-mono text-[#4A4A4A]">{totalOccupiedSeats} SV</div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                    <span>Hợp đồng có hiệu lực</span>
                  </div>
                </div>

                {/* Vacant rooms card */}
                <div className="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
                  <span className="text-[10px] text-[#8B8B8B] font-bold uppercase block">Tỷ suất khai thác giường</span>
                  <div className="text-2xl font-bold font-mono text-[#4A4A4A]">
                    {totalOccupiedSeats} / {totalCapacitySeats}
                  </div>
                  <div className="text-[11px] text-[#8B8B8B] font-light">
                    Hiệu suất lấp đầy cao KTX DNU
                  </div>
                </div>

                {/* Unpaid dues sum card */}
                <div className="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
                  <span className="text-[10px] text-[#8B8B8B] font-bold uppercase block">Doanh số tổng hợp</span>
                  <div className="text-2xl font-bold font-mono text-[#CB997E]">
                    {new Intl.NumberFormat('vi-VN').format(totalInvoicesPaidSum)}đ
                  </div>
                  <div className="text-[11px] text-[#6B705C] font-semibold flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 shrink-0" />
                    <span>Lệ phí kết toán niên vụ 2026</span>
                  </div>
                </div>

                {/* Technical issues pending */}
                <div className="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
                  <span className="text-[10px] text-[#8B8B8B] font-bold uppercase block">Lỗi kỹ thuật điện nước</span>
                  <div className="text-2xl font-bold font-mono text-[#CB997E]">{activeIssues.length} Sự cố</div>
                  <div className="text-[11px] text-[#CB997E] font-semibold flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                    <span>Cần nhanh chóng khắc phục</span>
                  </div>
                </div>

              </div>

              {/* Dynamic interactive SVG line charts (Revenue and Occupancy) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                
                {/* SVG Revenue Graph lines */}
                <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs">
                  <div className="flex justify-between items-baseline mb-4">
                    <h4 className="font-serif text-[#4A4A4A] text-sm font-light">Ước tính doanh thu túc xá Đại Nam</h4>
                    <span className="text-[10px] text-[#6B705C] font-bold uppercase">Biểu đồ ước lượng</span>
                  </div>
                  
                  {/* Clean SVG Area Line Chart */}
                  <div className="h-56 w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-[24px] p-4 flex items-end relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                      <polygon points="0,150 80,110 160,115 240,60 320,80 400,20 400,150" fill="rgba(107, 112, 92, 0.1)" />
                      <polyline points="0,150 80,110 160,115 240,60 320,80 400,20" fill="none" stroke="#6B705C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Plot points */}
                      <circle cx="80" cy="110" r="5" fill="#CB997E" />
                      <circle cx="240" cy="60" r="5" fill="#CB997E" />
                      <circle cx="400" cy="20" r="5" fill="#CB997E" />
                    </svg>

                    {/* Chart bottom labels axis */}
                    <div className="absolute bottom-1 left-0 right-0 px-4 flex justify-between text-[8px] font-mono font-bold text-[#8B8B8B]">
                      <span>Tháng 1</span>
                      <span>Tháng 2</span>
                      <span>Tháng 3</span>
                      <span>Tháng 4</span>
                      <span>Tháng 5</span>
                      <span>Tháng 6</span>
                    </div>
                  </div>
                </div>

                {/* SVG Occupancy rate bars bar chart */}
                <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs">
                  <div className="flex justify-between items-baseline mb-4">
                    <h4 className="font-serif text-[#4A4A4A] text-sm font-light">Tốc độ lấp đầy chỗ ở của Khối tòa</h4>
                    <span className="text-[10px] text-[#8B8B8B] font-mono">Hiệu suất phân khu</span>
                  </div>

                  {/* Clean SVG visual block chart */}
                  <div className="h-56 w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-[24px] p-6 flex justify-around items-end relative">
                    
                    {/* Bar 1 */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 bg-[#EAE7E1] rounded-t-xl h-36 relative flex items-end overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 bg-[#6B705C] h-[85%]" />
                      </div>
                      <span className="text-[10px] font-bold font-mono">Tòa A (85%)</span>
                    </div>

                    {/* Bar 2 */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 bg-[#EAE7E1] rounded-t-xl h-36 relative flex items-end overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 bg-[#CB997E] h-[92%]" />
                      </div>
                      <span className="text-[10px] font-bold font-mono">Tòa B (92%)</span>
                    </div>

                    {/* Bar 3 */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 bg-[#EAE7E1] rounded-t-xl h-36 relative flex items-end overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 bg-[#8B9178] h-[68%]" />
                      </div>
                      <span className="text-[10px] font-bold font-mono">Tòa C (68%)</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Recent Admin activity logs timeline list */}
              <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs text-left">
                <h4 className="font-serif text-[#4A4A4A] text-sm mb-4">Lược sử can thiệp hệ thống</h4>
                
                <div className="space-y-4 text-xs">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#6B705C]/15 text-[#6B705C] flex items-center justify-center shrink-0 font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-semibold text-[#4A4A4A]">Phê duyệt cập nhật danh sách cư dân KTX năm nhất đợt 2</div>
                      <p className="text-[11px] text-[#8B8B8B] mt-0.5">Thực hiện bởi ROOT ADMIN hệ thống</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-[#CB997E]/15 text-[#CB997E] flex items-center justify-center shrink-0 font-bold">
                      ⚡
                    </div>
                    <div>
                      <div className="font-semibold text-[#4A4A4A]">Tạo mới chuyên mục truyền thông sự kiện tháng hè</div>
                      <p className="text-[11px] text-[#8B8B8B] mt-0.5">Khởi tạo bởi phòng truyền thông trường</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Quản lý tin tức */}
          {activeTab === 'Quản lý tin tức' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form post news left */}
              <div className="lg:col-span-2 bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
                <h3 className="font-serif text-[#4A4A4A] text-lg mb-2">Đăng thông cáo & Bản tin sự kiện sinh viên</h3>
                <p className="text-xs text-[#8B8B8B] font-light mb-6">
                  Cập nhật các chỉ dẫn hữu ích: kế hoạch kiểm tra phòng an toàn, văn bản nộp tạm trú tạm vắng, hay thông điệp của ban chủ nhiệm trường.
                </p>

                <form onSubmit={handleCreateNews} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#4A4A4A]">Tiêu đề bài viết bản tin <span className="text-[#CB997E]">*</span></label>
                      <input 
                        type="text"
                        required
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                        placeholder="Nội quy tuần tra tháo rèm ban công phòng..."
                        className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#4A4A4A]">Chuyên mục tin đăng</label>
                      <select 
                        value={newsCat}
                        onChange={(e) => setNewsCat(e.target.value as any)}
                        className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C]"
                      >
                        <option value="TIN TỨC KTX">Tin tức nội trú KTX</option>
                        <option value="SỰ KIỆN">Hoạt động Sự kiện</option>
                        <option value="THÔNG BÁO">Thông báo chung</option>
                        <option value="HOẠT ĐỘNG SV">Sinh viên ngoại khóa</option>
                        <option value="Quy định - Thủ tục">Quy chế nội quy</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Đường dẫn ảnh tiêu điểm (Banner URL)</label>
                    <input 
                      type="url"
                      value={newsImg}
                      onChange={(e) => setNewsImg(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs font-mono select-all outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Lời tóm tắt ngắn mục lục (Summary) <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="text"
                      required
                      value={newsSummary}
                      onChange={(e) => setNewsSummary(e.target.value)}
                      placeholder="Câu tóm tắt đại ý bản tin..."
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C] transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Nội dung văn tự bài viết chi tiết <span className="text-[#CB997E]">*</span></label>
                    <textarea 
                      required
                      rows={6}
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      placeholder="Nhập phần văn bản mô tả..."
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-3 text-xs outline-none resize-none focus:border-[#6B705C] transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="px-6 py-3 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Xuất bản ngay</span>
                  </button>
                </form>
              </div>

              {/* News database table right */}
              <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-sm">
                <h4 className="font-serif text-[#4A4A4A] text-sm mb-4">Các tin tức đã phát hành</h4>
                
                <div className="space-y-3">
                  {news.map((item) => (
                    <div key={item.id} className="p-3.5 border border-[#EAE7E1] bg-[#FDFBF7]/50 rounded-2xl flex items-start justify-between gap-3 text-xs">
                      <div className="overflow-hidden">
                        <div className="font-bold text-[#4A4A4A] leading-tight line-clamp-1">{item.title}</div>
                        <div className="text-[10px] text-[#8B8B8B] font-mono mt-1">{item.category} • {item.date}</div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          onDeleteNewsArticle(item.id);
                          showToast('Đã thu hồi bản tin sự kiện ra khỏi trang chung thành công!', 'info');
                        }}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Delete news"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Sự cố bảo trì */}
          {activeTab === 'Sự cố bảo trì' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3.5">Lý lịch sửa chữa lỗi sự cố kỹ thuật</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm">
                {activeIssues.map((issue) => (
                  <div key={issue.id} className="p-5 border border-[#EAE7E1] bg-[#FDFBF7]/35 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-baseline mb-2 bg-[#FDFBF7] border border-[#EAE7E1] p-2 rounded-xl">
                        <span className="font-bold text-[#4A4A4A]">Phiếu: {issue.id}</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg ${
                          issue.priority === 'Critical' ? 'bg-[#CB997E]/20 text-[#CB997E]' : 'bg-[#6B705C]/20 text-[#6B705C]'
                        }`}>{issue.priority === 'Critical' ? 'Khẩn cấp' : 'Thường'}</span>
                      </div>
                      <h4 className="font-serif text-[#4A4A4A] text-base">Phòng {issue.roomNumber} - {issue.title}</h4>
                      <p className="text-xs text-[#8B8B8B] font-light mt-1">{issue.description}</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#EAE7E1] text-xs">
                      <button 
                        onClick={() => {
                          onUpdateMaintenanceStatus(issue.id, 'Resolved');
                          showToast('Đã đóng hồ sơ bảo trì cơ sở hạ tầng này!', 'success');
                        }}
                        className="w-1/2 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold py-2 rounded-full cursor-pointer text-center"
                      >
                        Khép lại sự cố
                      </button>
                      <span className="flex items-center justify-center italic text-[#8B8B8B] text-xs w-1/2 font-mono bg-[#FDFBF7] border border-[#EAE7E1] rounded-full">
                        Trạng thái: {issue.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Duyệt lưu trú */}
          {activeTab === 'Duyệt lưu trú' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3.5">Hồ sơ chờ phê duyệt phân phòng</h3>
              
              <div className="space-y-4">
                {pendingApps.map((app) => (
                  <div key={app.id} className="p-5 border border-[#EAE7E1] bg-[#FDFBF7]/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-serif text-slate-950 text-base">{app.fullName}</h4>
                      <p className="text-xs text-[#8B8B8B] mt-1 font-mono">MSSV: {app.studentId} • Lớp: {app.className} • Phòng muốn nạp: {app.roomNumber}</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          onApproveApplication(app.id);
                          showToast('Phê duyệt hồ sơ chỗ ở học viên thành công!', 'success');
                        }}
                        className="px-4 py-2 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold text-xs rounded-full cursor-pointer"
                      >
                        Phê duyệt
                      </button>
                      <button 
                        onClick={() => {
                          onRejectApplication(app.id);
                          showToast('Đã hủy bỏ bộ đề xuất đăng kí này!', 'info');
                        }}
                        className="px-4 py-2 bg-[#CB997E] hover:bg-[#b07d62] text-white font-bold text-xs rounded-full cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}

                {pendingApps.length === 0 && (
                  <div className="text-center py-12 text-[#8B8B8B] italic text-xs font-mono">Không có hồ sơ lưu trú nào đang đợi kiểm duyệt.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Cài đặt hệ thống */}
          {activeTab === 'Cài đặt hệ thống' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3">Thiết lập cấu hình tham số KTX</h3>

              <div className="space-y-5 max-w-xl text-xs md:text-sm pt-4">
                <div className="space-y-2">
                  <label className="font-bold text-[#4A4A4A]">1. Giờ giới nghiêm khóa cổng ban đêm</label>
                  <input type="text" defaultValue="22:30" className="w-full bg-[#FDFBF7] border border-[#EAE7E1] px-4 py-2 rounded-2xl outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-[#4A4A4A]">2. Quy định lệ phí chỗ ở nội trú sàn tối thiểu (VND/Tháng)</label>
                  <input type="number" defaultValue="1200000" className="w-full bg-[#FDFBF7] border border-[#EAE7E1] px-4 py-2 rounded-2xl outline-none" />
                </div>

                <button 
                  onClick={() => showToast('Ghi nhận thông tin tham số vận hành vĩ mô thành công!', 'success')}
                  className="px-6 py-2.5 bg-[#6B705C] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#8B9178]"
                >
                  Lưu thiết đặt cấu hình
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
