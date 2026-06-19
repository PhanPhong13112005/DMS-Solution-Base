import React, { useState } from 'react';
import { LayoutDashboard, Users, UserPlus, Wrench, ShieldAlert, CheckCircle, XCircle, LogOut, Search, PlusCircle, Building, Receipt, FilePlus, Sparkles, Filter, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Room, BookingApplication, MaintenanceRequest, NewsArticle, Invoice } from '../types';

interface StaffPortalProps {
  staffUser: any;
  rooms: Room[];
  onLogout: () => void;
  applications: BookingApplication[];
  onApproveApplication: (appId: string) => void;
  onRejectApplication: (appId: string) => void;
  onUpdateRoomVacancy: (roomId: string, decrement: boolean) => void;
  maintenanceRequests: MaintenanceRequest[];
  onUpdateMaintenanceStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => void;
  onAddInvoice: (inv: Invoice) => void;
}

export default function StaffPortal({
  staffUser,
  rooms,
  onLogout,
  applications,
  onApproveApplication,
  onRejectApplication,
  onUpdateRoomVacancy,
  maintenanceRequests,
  onUpdateMaintenanceStatus,
  onAddInvoice
}: StaffPortalProps) {
  const [activeTab, setActiveTab] = useState<string>('Tổng quan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Invoice creator form state
  const [billRoom, setBillRoom] = useState<string>('101-Tòa B');
  const [billMonth, setBillMonth] = useState<string>('Tháng 6/2026');
  const [billType, setBillType] = useState<'Điện nước' | 'Phí dịch vụ'>('Điện nước');
  const [billAmount, setBillAmount] = useState<string>('245000');

  const pendingApps = applications.filter(a => a.status === 'Pending');
  const activeIssues = maintenanceRequests.filter(m => m.status !== 'Resolved');
  const urgentIssues = activeIssues.filter(i => i.priority === 'Critical');

  // Fast statistics count computation
  const totalStudentsCount = rooms.reduce((accum, r) => accum + (r.capacity - r.available), 12);
  const totalVacantSlots = rooms.reduce((accum, r) => accum + r.available, 0);
  const totalCompletedCollection = 14500000; // Simulated VND

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // fast billing trigger
  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billRoom || !billAmount) {
      showToast('Vui lòng khai nhập mã hiệu phòng và số tiền hóa đơn!', 'error');
      return;
    }

    const amt = parseFloat(billAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Số tiền hóa đơn nhập vào chưa hợp lệ!', 'error');
      return;
    }

    const newInvoice: Invoice = {
      id: 'inv-' + Math.random().toString(36).substr(2, 9),
      roomNumber: billRoom,
      studentId: 'DNU-COMMON',
      month: billMonth,
      amount: amt,
      type: billType,
      status: 'Unpaid',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddInvoice(newInvoice);
    showToast('Phát hành biểu mẫu hóa đơn thành công! Hệ thống đã gửi báo phí tới phòng liên đới.', 'success');
    setBillAmount('');
  };

  return (
    <div className="w-full flex bg-[#FDFBF7] min-h-screen text-left border-t border-[#EAE7E1] text-[#4A4A4A]">
      
      {/* Toast alert system */}
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

      {/* Sidebar Controls */}
      <aside className="w-64 bg-[#6B705C] text-slate-100 shrink-0 select-none flex flex-col justify-between border-r border-[#EAE7E1] p-0">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#CB997E] flex items-center justify-center text-white font-serif font-extrabold text-sm">C</span>
            <div>
              <div className="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
              <div className="text-[10px] text-[#FDFBF7]/85">Phòng trực ban cán bộ</div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 text-xs text-[#FDFBF7]">
            {[
              { id: 'Tổng quan', icon: LayoutDashboard },
              { id: 'Duyệt hồ sơ', icon: UserPlus },
              { id: 'Sự cố bảo trì', icon: Wrench },
              { id: 'Trưng cứu Sinh viên', icon: Users },
              { id: 'Trưng cứu Phòng', icon: Building },
              { id: 'Khởi tạo hóa đơn', icon: Receipt }
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

        {/* Bottom logout profile widget */}
        <div className="p-4 border-t border-white/10">
          <div className="p-3 bg-white/15 rounded-2xl flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#CB997E] text-white font-extrabold flex items-center justify-center border border-white/10 font-mono text-sm leading-none">
              CB
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs truncate text-white">{staffUser.name}</div>
              <div className="text-[10px] text-[#FDFBF7]/80 font-mono">Cán bộ trực ban</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Thoát cán bộ</span>
          </button>
        </div>
      </aside>

      {/* Main workspace frame */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#FDFBF7]">
        
        {/* Top Header details */}
        <header className="bg-white border-b border-[#EAE7E1] px-8 py-4.5 flex justify-between items-center shrink-0">
          <div className="text-[#4A4A4A]">
            <span className="text-xs text-[#8B8B8B] font-light">BẢNG VẬN HÀNH KTX ĐẠI NAM</span>
            <h2 className="font-serif font-light text-[#4A4A4A] text-lg leading-none mt-1">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              Phiên trực: Đang mở ⚡
            </div>
          </div>
        </header>

        {/* Tab content space */}
        <div className="p-8 flex-1 space-y-6">
          
          {/* TAB 1: Tổng quan (Dashboard) */}
          {activeTab === 'Tổng quan' && (
            <div className="space-y-6">
              
              {/* Critical Urgency Alarms Banner Alert */}
              {urgentIssues.length > 0 && (
                <div className="bg-[#CB997E]/10 border border-[#CB997E]/30 p-5 rounded-[24px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#CB997E]/20 text-[#CB997E] flex items-center justify-center shrink-0 mt-1">
                      <ShieldAlert className="w-6 h-6 animate-bounce" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] bg-[#CB997E] text-white font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">CẢNH BÁO SỰ CỐ KHẨN</span>
                      <h4 className="font-serif font-light text-[#4A4A4A] text-base mt-2">{urgentIssues[0].title}</h4>
                      <p className="text-xs text-[#8B8B8B] font-light leading-relaxed mt-1 max-w-xl">
                        Mô tả thực trạng: {urgentIssues[0].description} (Vị trí: {urgentIssues[0].roomNumber})
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      onUpdateMaintenanceStatus(urgentIssues[0].id, 'In Progress');
                      showToast('Đã trực tiếp chuyển giao việc sửa chữa khẩn cho đội ngũ kĩ sư hiện trường!', 'success');
                    }}
                    className="px-5 py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold text-xs rounded-full shadow-xs cursor-pointer grow-0 shrink-0 text-center"
                  >
                    Cử kỹ sư xử lý ngay
                  </button>
                </div>
              )}

              {/* KPI Summary widgets */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                <div className="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs">
                  <span className="text-[10px] text-[#8B8B8B] font-bold uppercase block mb-1">Đơn tuyển ký phòng cần duyệt</span>
                  <div className="text-xl font-bold text-[#4A4A4A] font-mono flex justify-between items-baseline mt-1.5">
                    <span>{pendingApps.length} đơn chờ</span>
                    {pendingApps.length > 0 && <span className="text-[#CB997E] text-[10px] font-sans font-normal uppercase">Kiểm duyệt &gt;</span>}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs">
                  <span className="text-[10px] text-[#8B8B8B] font-bold uppercase block mb-1">Phiếu trình sự cố sửa chữa</span>
                  <div className="text-xl font-bold text-[#CB997E] font-mono mt-1.5">{activeIssues.length} phiếu</div>
                </div>

                <div className="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs">
                  <span className="text-[10px] text-[#8B8B8B] font-bold uppercase block mb-1">Quỹ thu lệ phí điện nước</span>
                  <div className="text-xl font-bold text-emerald-800 font-mono mt-1.5">
                    {new Intl.NumberFormat('vi-VN').format(totalCompletedCollection)}đ
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs">
                  <span className="text-[10px] text-[#8B8B8B] font-bold uppercase block mb-1">Số lượng giường trống</span>
                  <div className="text-xl font-bold text-[#6B705C] font-mono mt-1.5">{totalVacantSlots} Giường</div>
                </div>
              </div>

              {/* Occupancy and Quick Action Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Occupancy Progress Circle */}
                <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs flex flex-col items-center justify-center text-center">
                  <h4 className="font-serif text-[#4A4A4A] text-sm mb-4">Tỷ suất lấp đầy chỗ ở KTX DNU</h4>
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#EAE7E1" strokeWidth="8" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="#CB997E" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (rooms.length - 3)) / rooms.length} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold font-mono text-[#4A4A4A]">{Math.round(((rooms.length - 3) / rooms.length) * 100)}%</span>
                      <span className="text-[9px] text-[#8B8B8B] uppercase font-semibold">Công suất</span>
                    </div>
                  </div>
                  <div className="text-xs text-[#8B8B8B] font-mono mt-4">Tổng số phòng: {rooms.length - 3} / Đã mở rộng: 3</div>
                </div>

                {/* Operations Checklist log */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs text-left">
                  <h4 className="font-serif text-[#4A4A4A] text-sm mb-3">Lịch nhắc cán bộ nghiệp vụ trực nhật</h4>
                  <p className="text-xs text-[#8B8B8B] font-light leading-relaxed mb-4">
                    Thường trực kiểm tra các bồn nước sinh hoạt bơm mái khu nhà A9 và lập phiếu phạt đối với các phòng nấu ăn dùng gas.
                  </p>
                  
                  <div className="space-y-3.5 text-xs text-[#4A4A4A]">
                    <div className="flex items-center gap-3 bg-[#FDFBF7] p-3 rounded-2xl border border-[#EAE7E1]">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Xét duyệt các trường hợp ưu tiên theo quyết định sinh viên vùng cao năm nhất</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#FDFBF7] p-3 rounded-2xl border border-[#EAE7E1]">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Tổng kết báo cáo điện năng rò rỉ hành lang khu nhà B, C</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Duyệt hồ sơ */}
          {activeTab === 'Duyệt hồ sơ' && (
            <div className="bg-white rounded-[1.5rem] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3.5">Hồ sơ đăng ký lưu trú cần xét duyệt</h3>

              {pendingApps.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FDFBF7] text-[#8B8B8B] border-b border-[#EAE7E1] uppercase font-bold text-[10px]">
                        <th className="p-4 rounded-l-xl">Thí sinh nộp đơn</th>
                        <th className="p-4">Hòm thư / Điện thoại</th>
                        <th className="p-4">Nguyện vọng xếp phòng</th>
                        <th className="p-4">Đính kèm CCCD</th>
                        <th className="p-4 rounded-r-xl text-center">Thao tác giải quyết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE7E1] text-xs text-[#4A4A4A]">
                      {pendingApps.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-950 font-bold">
                            <div>{app.fullName}</div>
                            <div className="text-[10px] text-[#8B8B8B] font-mono mt-1">MSSV: {app.studentId} • Lớp: {app.className}</div>
                          </td>
                          <td className="p-4 font-mono font-light text-[#8B8B8B]">
                            <div>{app.email}</div>
                            <div>SĐT: {app.phone}</div>
                          </td>
                          <td className="p-4 font-bold text-[#6B705C]">
                            Phòng {app.roomNumber} ({app.building})
                          </td>
                          <td className="p-4 font-mono text-[#CB997E] text-[10px] cursor-pointer hover:underline" onClick={() => showToast(`Xem trước tệp tin minh chứng: /proofs/${app.evidenceCCCD}`, 'info')}>
                            {app.evidenceCCCD}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => {
                                  onApproveApplication(app.id);
                                  showToast(`Đã duyệt thành công hồ sơ của học sinh ${app.fullName}!`, 'success');
                                }}
                                className="px-3.5 py-1.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold text-[10px] uppercase rounded-full shadow-xs cursor-pointer"
                              >
                                Duyệt
                              </button>
                              <button 
                                onClick={() => {
                                  onRejectApplication(app.id);
                                  showToast('Đã xóa bỏ đơn đăng ký lỗi này khỏi danh mục chờ!', 'info');
                                }}
                                className="px-3.5 py-1.5 bg-[#CB997E] hover:bg-[#a67b64] text-white font-bold text-[10px] uppercase rounded-full shadow-xs cursor-pointer"
                              >
                                Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-[#8B8B8B] italic text-xs font-mono">Không còn hồ sơ tồn đọng nào chờ giải quyết.</div>
              )}
            </div>
          )}

          {/* TAB 3: Sự cố sửa chữa */}
          {activeTab === 'Sự cố sửa chữa' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3.5">Phiếu bảo trì trang thiết bị sửa chữa</h3>

              {activeIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeIssues.map((issue) => (
                    <div key={issue.id} className="p-5 border border-[#EAE7E1] rounded-2xl bg-[#FDFBF7]/40 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                            issue.priority === 'Critical' ? 'bg-[#CB997E]/25 text-[#CB997E]' : 'bg-[#6B705C]/15 text-[#6B705C]'
                          }`}>
                            {issue.priority === 'Critical' ? 'Khẩn cấp cần gấp' : 'Bình thường'}
                          </span>
                          <span className="text-[10px] text-[#8B8B8B] font-mono">{issue.createdAt}</span>
                        </div>
                        <h4 className="font-serif text-[#4A4A4A] text-base">Phòng {issue.roomNumber} - {issue.title}</h4>
                        <p className="text-xs text-[#8B8B8B] font-light leading-relaxed mt-1">
                          Trạng thái hư hại: {issue.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#EAE7E1] flex gap-2">
                        {issue.status === 'Pending' ? (
                          <button 
                            onClick={() => {
                              onUpdateMaintenanceStatus(issue.id, 'In Progress');
                              showToast('Đã ghi nhận sang trạng thái đang sửa chữa!', 'success');
                            }}
                            className="w-1/2 py-2 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold text-xs rounded-full cursor-pointer text-center"
                          >
                            Xử lý ngay
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              onUpdateMaintenanceStatus(issue.id, 'Resolved');
                              showToast('Yêu cầu báo hỏng đã khắc phục khép lại thành công!', 'success');
                            }}
                            className="w-1/2 py-2 bg-[#CB997E] hover:bg-[#bc8970] text-white font-bold text-xs rounded-full cursor-pointer text-center"
                          >
                            Hoàn tất bàn giao
                          </button>
                        )}
                        <span className="text-xs text-[#8B8B8B] italic flex items-center justify-center font-mono w-1/2 bg-[#FDFBF7] border border-[#EAE7E1] rounded-full">
                          Tiến độ: {issue.status === 'Pending' ? 'Đang chờ' : (issue.status === 'In Progress' ? 'Đang làm' : 'Đã xong')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#8B8B8B] italic text-xs">Phòng ốc vận hành an toàn không có sự cố báo cáo hư hỏng.</div>
              )}
            </div>
          )}

          {/* TAB 4: Trưng cứu Sinh viên */}
          {activeTab === 'Trưng cứu Sinh viên' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
              <div className="border-b border-[#EAE7E1] pb-3.5 flex flex-col md:flex-row justify-between items-start md:items-baseline gap-4">
                <h3 className="font-serif text-[#4A4A4A] text-lg">Danh bạ tra cứu cư dân nội trú</h3>
                
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B8B] w-4 h-4" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên học sinh, MSSV..."
                    className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] pl-9 pr-4 py-2 text-xs rounded-full outline-none transition-all"
                  />
                </div>
              </div>

              {/* Resident spreadsheet */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FDFBF7] font-bold border-b border-[#EAE7E1] text-[10px] text-[#8B8B8B] uppercase">
                      <th className="p-4 rounded-l-xl">Họ tên sinh viên / MSSV</th>
                      <th className="p-4">Lớp chính quy</th>
                      <th className="p-4">Giới tính</th>
                      <th className="p-4">Sơ đồ điện thoại</th>
                      <th className="p-4 rounded-r-xl">Hợp đồng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE7E1] text-[#4A4A4A]">
                    {[
                      { id: '1771020536', name: 'Nguyễn Hữu Hưng', class: 'K15-CNTT1', gender: 'Nam', tel: '0978.112.551', status: 'Nội trú hoạt động' },
                      { id: 'DNU204563', name: 'Lê Văn Hoàng', class: 'K16-QTKD', gender: 'Nam', tel: '0912.888.777', status: 'Nội trú hoạt động' },
                      { id: 'DNU205111', name: 'Vy Thị Thảo', class: 'K15-Luật', gender: 'Nữ', tel: '0987.555.444', status: 'Nội trú hoạt động' },
                    ].filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toLowerCase().includes(searchQuery.toLowerCase())).map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-[#4A4A4A]">
                          <div>{st.name}</div>
                          <div className="text-[10px] text-[#8B8B8B] font-mono mt-0.5">MS: {st.id}</div>
                        </td>
                        <td className="p-4 font-mono">{st.class}</td>
                        <td className="p-4">{st.gender}</td>
                        <td className="p-4 font-mono text-[#8B8B8B]">{st.tel}</td>
                        <td className="p-4 font-bold text-emerald-700">{st.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Trưng cứu Phòng */}
          {activeTab === 'Trưng cứu Phòng' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3">Phân chia phòng KTX Trường</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div key={room.id} className="p-5 border border-[#EAE7E1] bg-[#FDFBF7]/40 rounded-2xl space-y-3 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#4A4A4A] text-base">Phòng {room.roomNumber} - {room.building}</span>
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${room.available > 0 ? 'bg-[#6B705C]/15 text-[#6B705C]' : 'bg-[#CB997E]/15 text-[#CB997E]'}`}>
                        {room.available > 0 ? `${room.available} giường trống` : 'Hết chỗ'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-[#8B8B8B]">
                      <div>Đơn giá thuê: <strong className="text-[#CB997E]">{new Intl.NumberFormat('vi-VN').format(room.price)}đ</strong> / tháng</div>
                      <div>Mặt bằng diện tích: <strong>{room.size}m²</strong> • Sức chứa giường: {room.capacity}</div>
                      <div>Dành cho đối tượng: <strong>{room.gender}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Khởi tạo hóa đơn */}
          {activeTab === 'Khởi tạo hóa đơn' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg mb-2">Đăng kí ghi điện nước & Phát hành hóa đơn phí</h3>
              <p className="text-xs text-[#8B8B8B] font-light mb-6">
                Lập biên lai thu tiền năng lượng điện, nước rác thải hàng tháng dành cho phòng ở nội trú. Dữ liệu sẽ tự động đồng bộ lên cổng sinh viên phòng này.
              </p>

              <form onSubmit={handleCreateBill} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Chọn phòng phát hành hóa đơn <span className="text-[#CB997E]">*</span></label>
                    <select 
                      value={billRoom}
                      onChange={(e) => setBillRoom(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs font-mono font-bold outline-none"
                    >
                      <option value="101-Tòa B">Phòng 101-Tòa B</option>
                      <option value="A102 - Tòa A">Phòng A102-Tòa A</option>
                      <option value="B103 - Tòa B">Phòng B103-Tòa B</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Tháng lập biên lai <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="text" 
                      value={billMonth}
                      onChange={(e) => setBillMonth(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs font-semibold outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Chọn mục thu phí</label>
                    <select 
                      value={billType}
                      onChange={(e) => setBillType(e.target.value as any)}
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs outline-none transition-all"
                    >
                      <option value="Điện nước">Chỉ số điện nước tiêu dùng</option>
                      <option value="Phí dịch vụ">Gói vệ sinh & dọn rác chung</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Mức tiền thu (VNĐ) <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="number" 
                      required
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      placeholder="Ví dụ: 185000"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs font-mono font-bold outline-none transition-all" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="px-6 py-3 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Phát hành hóa đơn trực tuyến</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
