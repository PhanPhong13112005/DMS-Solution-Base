import React, { useState, useEffect } from 'react';
import { Home, ClipboardList, BedDouble, CalendarHeart, Receipt, Wrench, BellRing, LogOut, Settings2, Sparkles, Send, CheckCircle2, ShieldAlert, Landmark, UserMinus, Plus, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Room, MaintenanceRequest, Invoice, TransferRequest } from '../types';

interface StudentPortalProps {
  studentUser: any;
  rooms: Room[];
  onLogout: () => void;
  maintenanceRequests: MaintenanceRequest[];
  onAddMaintenance: (req: MaintenanceRequest) => void;
  onUpdateMaintenanceStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => void;
  invoices: Invoice[];
  onPayInvoice: (invoiceId: string) => void;
  transferRequests: TransferRequest[];
  onAddTransfer: (req: TransferRequest) => void;
}

export default function StudentPortal({
  studentUser,
  rooms,
  onLogout,
  maintenanceRequests,
  onAddMaintenance,
  onUpdateMaintenanceStatus,
  invoices,
  onPayInvoice,
  transferRequests,
  onAddTransfer
}: StudentPortalProps) {
  const [activeTab, setActiveTab] = useState<string>('Trang chủ');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // New repair request values
  const [maintTitle, setMaintTitle] = useState('');
  const [maintCategory, setMaintCategory] = useState('Điện');
  const [maintPriority, setMaintPriority] = useState<'Critical' | 'Normal'>('Normal');
  const [maintDesc, setMaintDesc] = useState('');

  // New transfer request values
  const [requestedRoomCode, setRequestedRoomCode] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Invoice paying modal
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payCodeSent, setPayCodeSent] = useState(false);

  // Student specific data filter
  const myRoom = rooms.find(r => r.occupants.includes(studentUser.id)) 
              || rooms.find(r => r.roomNumber === '101') // Fallback default to 101 Tòa B
              || null;

  const myRoommates = myRoom 
    ? ['Nguyễn Văn Long (CNTT-K15)', 'Trần Hải Đăng (Luật K16)', 'Lê Quốc Anh (QTKD K15)'] 
    : [];

  const myMaintenance = maintenanceRequests.filter(m => m.roomNumber === (myRoom ? myRoom.roomNumber + '-' + myRoom.building : '101-Tòa B'));
  const myInvoices = invoices.filter(inv => inv.studentId === studentUser.id || inv.roomNumber === (myRoom ? myRoom.roomNumber + '-' + myRoom.building : '101-Tòa B'));
  const myTransfers = transferRequests.filter(t => t.studentId === studentUser.id);

  // Profile Edit fields
  const [phone, setPhone] = useState(studentUser.phone || '0978.112.551');
  const [email, setEmail] = useState(studentUser.email || 'hungnguyen@dainam.edu.vn');
  const [className, setClassName] = useState(studentUser.className || 'CNTT-K15');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintTitle || !maintDesc) {
      showToast('Vui lòng điền đủ tiêu đề và nội dung mô tả lỗi báo hỏng!', 'error');
      return;
    }

    const nextId = 'maint-' + Math.random().toString(36).substr(2, 9);
    const newRequest: MaintenanceRequest = {
      id: nextId,
      roomNumber: myRoom ? `${myRoom.roomNumber}-${myRoom.building}` : '101-Tòa B',
      title: maintTitle,
      description: maintDesc,
      category: maintCategory,
      priority: maintPriority,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddMaintenance(newRequest);
    showToast('Đã gửi phiếu báo hỏng kỹ thuật thành công tới ban kỹ sư KTX!', 'success');
    setMaintTitle('');
    setMaintDesc('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedRoomCode || !transferReason) {
      showToast('Vui lòng chọn phòng mong muốn và ghi đầy đủ lý do nguyện vọng chuyển phòng!', 'error');
      return;
    }

    const newTransfer: TransferRequest = {
      id: 'tf-' + Math.random().toString(36).substr(2, 9),
      studentId: studentUser.id,
      fullName: studentUser.name,
      currentRoom: myRoom ? `${myRoom.roomNumber}-${myRoom.building}` : '101-Tòa B',
      requestedRoom: requestedRoomCode,
      reason: transferReason,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddTransfer(newTransfer);
    showToast('Đơn đề xuất xin di chuyển phòng ở đã gửi thành công!', 'success');
    setRequestedRoomCode('');
    setTransferReason('');
  };

  const startInvoicePayment = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPayCodeSent(false);
    setIsPayModalOpen(true);
  };

  const completeInvoicePayment = () => {
    if (!payingInvoice) return;
    onPayInvoice(payingInvoice.id);
    setIsPayModalOpen(false);
    setPayingInvoice(null);
    showToast('Giao dịch thanh toán hóa đơn đã được ghi nhận thành công!', 'success');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Cập nhật thông tin trích lý lịch cá nhân thành công!', 'success');
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

      {/* Sidebar navigation */}
      <aside className="w-64 bg-[#6B705C] text-slate-100 shrink-0 select-none flex flex-col justify-between border-r border-[#EAE7E1] p-0">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#CB997E] flex items-center justify-center text-white font-serif font-extrabold text-sm">D</span>
            <div>
              <div className="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
              <div className="text-[10px] text-[#FDFBF7]/85">Sinh viên nội trú</div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 text-xs">
            {[
              { id: 'Trang chủ', icon: Home },
              { id: 'Phòng của tôi', icon: BedDouble },
              { id: 'Chuyển phòng', icon: UserMinus },
              { id: 'Hợp đồng', icon: ClipboardList },
              { id: 'Thanh toán', icon: Receipt },
              { id: 'Yêu cầu sửa chữa', icon: Wrench },
              { id: 'Thông báo', icon: BellRing },
              { id: 'Hồ sơ cá nhân', icon: Settings2 },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold cursor-pointer transition-all text-left ${
                    activeTab === tab.id 
                      ? 'bg-[#CB997E] text-white shadow-xs' 
                      : 'hover:bg-white/10 text-[#FDFBF7]/90 hover:text-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{tab.id}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom logout box */}
        <div className="p-4 border-t border-white/10">
          <div className="p-3 bg-white/10 rounded-2xl flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#CB997E] text-white font-extrabold flex items-center justify-center border border-white/10 font-mono text-sm leading-none">
              SV
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs truncate text-white">{studentUser.name}</div>
              <div className="text-[10px] text-[#FDFBF7]/80 font-mono">MSSV: {studentUser.id}</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Thoát cổng sinh viên</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Board */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#FDFBF7]">
        
        {/* Top Header details breadcrumbs */}
        <header className="bg-white border-b border-[#EAE7E1] px-8 py-4.5 flex justify-between items-center shrink-0">
          <div className="text-[#4A4A4A]">
            <span className="text-xs text-[#8B8B8B] font-light">CỔNG THÀNH VIÊN NỘI TRÚ</span>
            <h2 className="font-serif font-light text-[#4A4A4A] text-lg leading-none mt-1">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#FDFBF7] border border-[#EAE7E1] rounded-full px-4 py-1.5 text-xs text-[#6B705C] font-bold uppercase tracking-wider">
              {studentUser.className || 'CNTT-K15'}
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6B705C] text-white border border-[#EAE7E1] flex items-center justify-center font-extrabold font-mono shadow-xs text-sm">
              SV
            </div>
          </div>
        </header>

        {/* Tab View Contents Panel */}
        <div className="p-8 flex-1">
          
          {/* TAB 1: Trang chủ / Student Overview Dashboard */}
          {activeTab === 'Trang chủ' && (
            <div className="space-y-6">
              {/* Welcome ribbon card */}
              <div className="bg-[#CB997E] text-white p-6 rounded-[32px] relative overflow-hidden shadow-sm">
                <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none translate-x-3 translate-y-3">
                  <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10 text-left">
                  <h3 className="text-xl md:text-2xl font-serif font-light mb-1.5 flex items-center gap-2 text-white">
                    Chào ngày mới, {studentUser.name}! 👋
                  </h3>
                  <p className="text-xs md:text-sm text-white/95 font-light max-w-2xl leading-relaxed">
                    Chào mừng bạn đến với văn phòng số hóa Ký túc xá Đại học Đại Nam. Theo dõi lịch hoạt động, thanh toán các khoản phí lưu trú trực tuyến chính xác và báo lỗi cơ sở vật chất đơn giản nhất.
                  </p>
                </div>
              </div>

              {/* Status indicator widgets metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#6B705C]/15 text-[#6B705C] flex items-center justify-center shrink-0">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8B8B8B] font-bold uppercase">Phòng nội trú</div>
                    <div className="text-base font-bold text-[#4A4A4A] font-mono mt-0.5">{myRoom ? `${myRoom.roomNumber} (${myRoom.building})` : 'Chưa xếp'}</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#CB997E]/15 text-[#CB997E] flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8B8B8B] font-bold uppercase">Hợp đồng thuê</div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5 uppercase tracking-wider">Có hiệu lực</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#CB997E]/10 text-[#CB997E] flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8B8B8B] font-bold uppercase">Hóa đơn chưa nộp</div>
                    <div className="text-base font-bold text-[#4A4A4A] mt-0.5">
                      {myInvoices.filter(i => i.status === 'Unpaid').length > 0 ? (
                        <span className="text-[#CB997E] font-mono font-bold">{myInvoices.filter(i => i.status === 'Unpaid').length} hóa đơn</span>
                      ) : (
                        <span className="text-emerald-700 text-xs font-bold uppercase">Đầy đủ</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#6B705C]/10 text-[#6B705C] flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8B8B8B] font-bold uppercase">Lịch sử báo hỏng</div>
                    <div className="text-base font-bold text-[#4A4A4A] mt-0.5 font-mono">
                      {myMaintenance.filter(m => m.status === 'Pending').length} phiếu đợi
                    </div>
                  </div>
                </div>
              </div>

              {/* Roommate details & system message updates */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Roommate list */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs">
                  <h4 className="font-serif text-[#4A4A4A] text-sm mb-4">Bạn cùng phòng khóa {myRoom ? myRoom.roomNumber : '101'}</h4>
                  {myRoommates.length > 0 ? (
                    <div className="divide-y divide-[#EAE7E1]">
                      {myRoommates.map((mate, i) => (
                        <div key={mate} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#FDFBF7] text-[#6B705C] font-bold text-xs flex items-center justify-center font-mono border border-[#EAE7E1]">
                              0{i + 1}
                            </div>
                            <span className="text-sm font-semibold text-[#4A4A4A]">{mate}</span>
                          </div>
                          <span className="bg-[#6B705C]/10 border border-[#6B705C]/20 text-[#6B705C] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg">
                            Đang ở
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic py-6">Không tìm thấy danh sách hoặc bạn đang ở phòng đơn.</div>
                  )}
                </div>

                {/* Direct notifications alerts */}
                <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs space-y-4">
                  <h4 className="font-serif text-[#4A4A4A] text-sm">Điểm tin nhanh bql</h4>
                  <div className="p-4 bg-[#6B705C]/10 border border-[#6B705C]/20 rounded-2xl">
                    <div className="text-[11px] font-bold text-[#6B705C] mb-1 flex items-center gap-1.5 uppercase">
                      <BellRing className="w-3.5 h-3.5 text-[#CB997E]" />
                      PHUN KHỬ TRÙNG TOÀN KHU B
                    </div>
                    <p className="text-[11px] text-[#4A4A4A]/90 leading-relaxed font-light">
                      Ban quản lý dự kiến phối hợp y tế địa phương phun khử muỗi và dịch tễ từ 14h chiều Chủ nhật tuần này. Vui lòng đóng kỹ cửa sổ và thu dọn áo quần treo ban công.
                    </p>
                  </div>

                  <div className="p-4 bg-[#CB997E]/10 border border-[#CB997E]/20 rounded-2xl">
                    <div className="text-[11px] font-bold text-[#CB997E] mb-1 flex items-center gap-1.5 uppercase">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#CB997E]" />
                      XỬ LÝ SỔ KHAI BÁO THÁNG
                    </div>
                    <p className="text-[11px] text-[#4A4A4A]/90 leading-relaxed font-light">
                      Kêu gọi hoàn tất đóng nộp quyển tự đánh giá xếp hạng phòng văn minh trước ngày 25/06/2026 về VP tầng 1 nhà B9.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Phòng của tôi */}
          {activeTab === 'Phòng của tôi' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6">
              <div className="border-b border-[#EAE7E1] pb-4 flex justify-between items-baseline">
                <h3 className="font-serif text-[#4A4A4A] text-lg">Hồ sơ chi tiết phòng ở sinh viên</h3>
                <span className="text-xs text-[#8B8B8B] font-mono">ID: {myRoom ? myRoom.id : 'N/A'}</span>
              </div>

              {myRoom ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAE7E1]">
                        <span className="text-[10px] text-[#8B8B8B] uppercase font-bold">Số phòng ngủ</span>
                        <div className="text-lg font-bold text-[#4A4A4A] font-mono mt-1">Phòng {myRoom.roomNumber}</div>
                      </div>
                      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAE7E1]">
                        <span className="text-[10px] text-[#8B8B8B] uppercase font-bold">Thuộc phân khu</span>
                        <div className="text-lg font-bold text-[#4A4A4A] mt-1">{myRoom.building}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAE7E1]">
                        <span className="text-[10px] text-[#8B8B8B] uppercase font-bold">Sức chứa phòng bộ</span>
                        <div className="text-sm font-bold text-[#4A4A4A] mt-1">{myRoom.capacity} Người/phòng</div>
                      </div>
                      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAE7E1]">
                        <span className="text-[10px] text-[#8B8B8B] uppercase font-bold">Diện tích phòng</span>
                        <div className="text-sm font-bold text-[#4A4A4A] mt-1">{myRoom.size} m²</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-[#4A4A4A] text-xs uppercase tracking-wider">Trang thiết bị nội trú đã kí nhận bàn giao:</h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {myRoom.amenities.map(amen => (
                          <span key={amen} className="bg-[#CB997E]/10 border border-[#CB997E]/30 text-[#CB997E] text-[10px] font-bold uppercase px-3 py-1 rounded-md">
                            {amen}
                          </span>
                        ))}
                        <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">Giường tầng gỗ tiêu chuẩn</span>
                        <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">Tủ gỗ cá nhân khóa chìa</span>
                        <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">Mạng Internet LAN tốc độ cao</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-serif text-[#4A4A4A] text-sm">Ảnh phòng mẫu đại diện</h4>
                    <div className="rounded-[24px] overflow-hidden shadow-xs border border-[#EAE7E1] aspect-video">
                      <img 
                        src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80" 
                        referrerPolicy="no-referrer"
                        alt="My Room View" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-[#EAE7E1] text-xs text-[#8B8B8B] font-light leading-relaxed">
                      * Nhắc nhở văn minh: Sinh viên nghiêm túc thực hiện giữ vệ sinh chung, không dán poster đè sơn tường và không tự ý thay thế móc gài rèm vải được ban phát ban đầu.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-[#8B8B8B] italic">Bạn chưa được sắp phòng chính thức từ văn phòng KTX.</div>
              )}
            </div>
          )}

          {/* TAB 3: Chuyển phòng */}
          {activeTab === 'Chuyển phòng' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form request on left */}
              <div className="lg:col-span-2 bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
                <h3 className="font-serif text-[#4A4A4A] text-lg mb-2">Gửi phiếu nguyện vọng xin chuyển đổi phòng ở</h3>
                <p className="text-xs text-[#8B8B8B] leading-relaxed font-light mb-6">
                  Chúng tôi hỗ trợ chuyển đổi giường tầng vì những lí do chính đáng: đổi sang khu phòng có gắn điều hòa nhiệt độ, đổi phân khu yên tĩnh hơn do lớp lịch học học kì tối, hoặc đổi nhóm phòng.
                </p>

                <form onSubmit={handleTransferSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Phòng ở hiện thời của bạn</label>
                    <input 
                      type="text"
                      disabled
                      value={myRoom ? `Phòng ${myRoom.roomNumber} - Phân tòa ${myRoom.building}` : '101 - Tòa B'}
                      className="w-full bg-[#FDFBF7] text-slate-500 border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Chọn mã tòa & mã phòng muốn định chuyển đến <span className="text-[#CB997E]">*</span></label>
                    <select 
                      required
                      value={requestedRoomCode}
                      onChange={(e) => setRequestedRoomCode(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C] transition-all"
                    >
                      <option value="">-- Click để chọn phòng tương thích --</option>
                      <option value="A102 - Tòa A">Room A102 - Tòa A (Phòng 2 nam, máy lạnh)</option>
                      <option value="B103 - Tòa B">Room B103 - Tòa B (Phòng 2 nam, WC riêng)</option>
                      <option value="A106 - Tòa A">Room A106 - Tòa A (Phòng 2 nam, tiêu chuẩn)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Trình bày đầy đủ lý do cụ thể gửi BQL xét duyệt <span className="text-[#CB997E]">*</span></label>
                    <textarea 
                      required
                      rows={4}
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      placeholder="Nêu rõ lý do, ví dụ: Em học ngành CNTT thường xuyên làm đồ án đêm khuya muốn xin chuyển qua phòng B103 có các bạn cùng nhóm thuận tiện trao đổi, không ảnh hưởng giấc ngủ phòng cũ..."
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#6B705C] resize-none transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Trình đơn xin chuyển</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* History log on right */}
              <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-sm">
                <h4 className="font-serif text-[#4A4A4A] text-sm mb-4">Các đề xuất chuyển phòng đã gửi</h4>
                
                {myTransfers.length > 0 ? (
                  <div className="space-y-3">
                    {myTransfers.map((tf) => (
                      <div key={tf.id} className="p-3.5 border border-[#EAE7E1] rounded-2xl space-y-2 text-xs bg-[#FDFBF7]">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-[#4A4A4A]">Phòng yêu cầu: {tf.requestedRoom}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                            tf.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            tf.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-[#CB997E]/10 text-[#CB997E]'
                          }`}>{tf.status === 'Pending' ? 'Đợi duyệt' : tf.status}</span>
                        </div>
                        <p className="text-[#8B8B8B] font-light leading-relaxed truncate">{tf.reason}</p>
                        <div className="text-[10px] text-[#8B8B8B]/70 font-mono">{tf.createdAt}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#8B8B8B] text-xs italic font-light">Bạn chưa tạo phiếu đề xuất nào.</div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: Hợp đồng */}
          {activeTab === 'Hợp đồng' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-[#4A4A4A]">
              <div className="border-b border-[#EAE7E1] pb-4 flex justify-between items-baseline">
                <h3 className="font-serif text-[#4A4A4A] text-lg">Mẫu hợp đồng thuê chỗ nội trú chính thức</h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg">Đang có hiệu lực</span>
              </div>

              <div className="space-y-4 text-xs md:text-sm leading-relaxed overflow-y-auto max-h-[400px] p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE7E1] font-light">
                <h4 className="font-bold text-[#4A4A4A] text-center uppercase text-base font-serif">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                <p className="text-center font-semibold">Độc lập - Tự do - Hạnh phúc</p>
                <hr className="my-3 border-[#EAE7E1]" />
                <h5 className="font-bold text-[#4A4A4A] text-center uppercase font-serif">HỢP ĐỒNG CHO THUÊ CHỖ Ở NỘI TRÚ KÝ TÚC XÁ</h5>
                
                <p><strong>BÊN CHO THUÊ (BÊN A):</strong> Ban Quản lý Ký túc xá Trường Đại học Đại Nam.</p>
                <p><strong>BÊN THUÊ CHỖ Ở (BÊN B):</strong></p>
                <div className="pl-4 space-y-1">
                  <p>Họ tên: <strong>{studentUser.name}</strong></p>
                  <p>Mã số sinh viên: <strong>{studentUser.id}</strong></p>
                  <p>Lớp sinh hoạt đào tạo: <strong>{studentUser.className || 'CNTT-K15'}</strong></p>
                  <p>Đặc danh số điện thoại liên lạc: {phone}</p>
                </div>

                <p><strong>ĐIỀU 1: PHẠM VI CHO THUÊ VÀ NỘI DUNG</strong></p>
                <p>Bên A cung cấp cho bên B quyền thuê sử dụng hạ tầng giường tầng chung tại Phòng số <strong>{myRoom ? myRoom.roomNumber : '101'}</strong>, tòa nhà {myRoom ? myRoom.building : 'Tòa B'} Trường Đại học Đại Nam.</p>

                <p><strong>ĐIỀU 2: LỆ PHÍ VÀ THỜI HẠN</strong></p>
                <p>• Giá phòng tạm tính: 1.200.000đ/tháng chưa gồm năng lượng tháng.</p>
                <p>• Thời điểm hợp đồng: Gắn liền theo học phần đào tạo của sinh viên niên khóa: <strong>2026 - 2027</strong>.</p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#EAE7E1]">
                <div className="text-left">
                  <div className="text-xs text-[#8B8B8B]">Chữ ký điện tử sinh viên:</div>
                  <div className="mt-1 pb-1 border-b border-dashed border-[#8B8B8B] font-serif font-light text-[#CB997E] text-lg">
                    {studentUser.name}
                  </div>
                  <div className="text-[10px] text-[#6B705C] font-mono mt-1">✓ Logged & Auth Verified - {new Date().toLocaleDateString('vi-VN')}</div>
                </div>

                <button 
                  onClick={() => showToast('Bản in PDF đang được khởi tạo tự động ở thiết bị!', 'info')}
                  className="px-6 py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Landmark className="w-4 h-4" />
                  <span>XUẤT BẢN IN PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Thanh toán */}
          {activeTab === 'Thanh toán' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
                <h3 className="font-serif text-[#4A4A4A] text-lg mb-4">Các khoản phí tích lũy cần thanh toán</h3>
                <p className="text-xs text-[#8B8B8B] font-light mb-6">
                  Chọn các danh mục hóa đơn tháng dịch vụ phòng hoặc điện nước bổ sung dưới đây để quét mã giao dịch QR nhanh nhất.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myInvoices.map((inv) => (
                    <div 
                      key={inv.id} 
                      className={`p-5 rounded-[24px] border flex flex-col justify-between transition-all ${
                        inv.status === 'Paid' 
                          ? 'border-[#EAE7E1] bg-[#FDFBF7]/60' 
                          : 'border-[#CB997E]/30 bg-[#CB997E]/5'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${
                            inv.type === 'Tiền phòng' ? 'bg-[#6B705C]/10 text-[#6B705C]' : 'bg-[#CB997E]/20 text-[#CB997E]'
                          }`}>
                            {inv.type}
                          </span>
                          <span className={`text-[10px] font-bold ${inv.status === 'Paid' ? 'text-emerald-700' : 'text-[#CB997E]'}`}>
                            {inv.status === 'Paid' ? '✓ ĐÃ HOÀN TẤT' : '● CHƯA ĐÓNG PHÍ'}
                          </span>
                        </div>
                        <h4 className="font-serif font-light text-[#4A4A4A] text-base">{inv.month}</h4>
                        <div className="text-xl font-bold text-[#CB997E] font-mono mt-1">
                          {new Intl.NumberFormat('vi-VN').format(inv.amount)}đ
                        </div>
                        <div className="text-[10px] text-[#8B8B8B] mt-2 font-mono">Hao hiệu phòng: {inv.roomNumber} • Kỳ tạo hóa đơn: {inv.createdAt}</div>
                      </div>

                      {inv.status === 'Unpaid' && (
                        <button 
                          onClick={() => startInvoicePayment(inv)}
                          className="mt-4 w-full py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold text-xs rounded-full shadow-xs cursor-pointer text-center"
                        >
                          Tải QR thanh toán ngay
                        </button>
                      )}
                    </div>
                  ))}

                  {myInvoices.length === 0 && (
                    <div className="col-span-full py-12 text-center text-[#8B8B8B] italic text-xs">Phòng ngủ và tài khoản của bạn hiện tại không phát sinh công nợ tháng dôi dư.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Yêu cầu sửa chữa */}
          {activeTab === 'Yêu cầu sửa chữa' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form submit repair left */}
              <div className="lg:col-span-2 bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm">
                <h3 className="font-serif text-[#4A4A4A] text-lg mb-2">Báo cáo sự cố cơ sở vật chất & Điện Nước</h3>
                <p className="text-xs text-[#8B8B8B] leading-relaxed font-light mb-6">
                  Khi gặp các hư hại phát sinh như mất điện, tắc bình nóng lạnh, rộp gioăng nước toilet, vỡ bản lề tủ, gãy thang giường, vui lòng mô tả chi tiết trạng thái bị lỗi của phòng ngủ dưới đây.
                </p>

                <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#4A4A4A]">Phát hiện lỗi gì? <span className="text-[#CB997E]">*</span></label>
                      <input 
                        type="text"
                        required
                        value={maintTitle}
                        onChange={(e) => setMaintTitle(e.target.value)}
                        placeholder="Rò nước vòi sen, nứt lavabo"
                        className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#4A4A4A]">Phân loại lỗi <span className="text-[#CB997E]">*</span></label>
                        <select 
                          value={maintCategory}
                          onChange={(e) => setMaintCategory(e.target.value)}
                          className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-2 py-2.5 text-xs outline-none focus:border-[#6B705C] transition-all"
                        >
                          <option value="Điện">Điện sinh hoạt</option>
                          <option value="Nước">Đường ống nước</option>
                          <option value="Thiết bị">Đồ gỗ, nội thất</option>
                          <option value="Khác">Phát sinh khác</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#4A4A4A]">Mức yêu cầu gấp <span className="text-[#CB997E]">*</span></label>
                        <select 
                          value={maintPriority}
                          onChange={(e) => setMaintPriority(e.target.value as any)}
                          className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-2 py-2.5 text-xs outline-none focus:border-[#6B705C] transition-all"
                        >
                          <option value="Normal">Thông thường</option>
                          <option value="Critical">Khẩn cấp (Cần xử lý gấp)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Mô tả cụ thể vị trí và tình hình thực trạng <span className="text-[#CB997E]">*</span></label>
                    <textarea 
                      required
                      rows={4}
                      value={maintDesc}
                      onChange={(e) => setMaintDesc(e.target.value)}
                      placeholder="Mô tả cụ thể ví dụ: Vòi xịt bồn vệ sinh toilet phòng 101 bị nứt vòng cao su nối chân tường nên phun tràn nước liên tục khi bật bơm, mong kỹ sư qua cuốn lại keo lụa..."
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#6B705C] resize-none transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Gửi báo kỹ thuật KTX</span>
                    <Wrench className="w-4.5 h-4.5" />
                  </button>
                </form>
              </div>

              {/* History list on right */}
              <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-sm">
                <h4 className="font-serif text-[#4A4A4A] text-sm mb-4">Các phiếu báo kỹ thuật đã gửi</h4>
                
                {myMaintenance.length > 0 ? (
                  <div className="space-y-3.5">
                    {myMaintenance.map((m) => (
                      <div key={m.id} className="p-3.5 border border-[#EAE7E1] rounded-2xl space-y-2 text-xs bg-[#FDFBF7]">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-[#4A4A4A] truncate max-w-[120px]">{m.title}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                            m.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                            m.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                            'bg-[#CB997E]/10 text-[#CB997E]'
                          }`}>{m.status === 'Pending' ? 'Đang chờ' : (m.status === 'In Progress' ? 'Đang sửa' : 'Đã xong')}</span>
                        </div>
                        <p className="text-[#8B8B8B] font-light leading-relaxed truncate">{m.description}</p>
                        <div className="text-[10px] text-[#8B8B8B] font-mono">Gửi: {m.createdAt} | Phân loại: {m.category}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#8B8B8B] text-xs italic font-light">Chưa gửi báo hỏng nào.</div>
                )}
              </div>

            </div>
          )}

          {/* TAB 7: Thông báo */}
          {activeTab === 'Thông báo' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left space-y-6">
              <h3 className="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3">Hộp thư lưu truyền tuyển sinh KTX</h3>

              <div className="divide-y divide-[#EAE7E1] space-y-4 text-xs md:text-sm">
                <div className="pt-2">
                  <div className="flex items-center gap-3.5 text-xs font-bold text-[#CB997E] mb-1.5 uppercase">
                    <span>ĐIỀU ĐỘNG CHU CHUYỂN PHÒNG CHÁY CHỮA CHÁY AN TOÀN ĐIỆN</span>
                    <span className="text-[#EAE7E1]">|</span>
                    <span className="text-[#8B8B8B] font-normal font-mono">18/06/2026</span>
                  </div>
                  <h4 className="font-serif font-light text-base text-[#4A4A4A]">Tuyệt đối không lưu trữ, đun nấu bằng bếp ga mini, bếp cồn tại khu nội trú giường ngủ</h4>
                  <p className="text-[#8B8B8B] text-xs md:text-sm leading-relaxed mt-2 font-light">
                    VP Ban quản lý yêu cầu mọi sinh viên nghiêm chỉnh chấp hành phòng cháy dập cháy. Không tích trữ đun nấu lẩu, tàng trữ bình gas trong gầm giường. BQL rà soát tuần tra sẽ tịch thu kỷ luật nặng nề nếu bắt gặp.
                  </p>
                </div>

                <div className="pt-4 animate-fade-in">
                  <div className="flex items-center gap-3.5 text-xs font-bold text-[#6B705C] mb-1.5 uppercase">
                    <span>HOẠT ĐỘNG THỂ CHẤT RÈN LUYỆN</span>
                    <span className="text-[#EAE7E1]">|</span>
                    <span className="text-[#8B8B8B] font-normal font-mono">10/06/2026</span>
                  </div>
                  <h4 className="font-serif font-light text-base text-[#4A4A4A]">Ngày hội đi bộ rèn sức khỏe DNU KTX Summer 2026</h4>
                  <p className="text-[#8B8B8B] text-xs md:text-sm leading-relaxed mt-2 font-light">
                    Kính mời sinh viên tham gia hội chạy việt dã dã ngoại 5KM lúc 05:45 sáng chủ nhật tới vòng quanh hồ sinh thái trường. Tham dự để tích điểm cộng xếp thứ hạng ưu tiên được gia hạn đăng ký phòng nội trú học kỳ sau.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Hồ sơ cá nhân */}
          {activeTab === 'Hồ sơ cá nhân' && (
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg mb-6 border-b border-[#EAE7E1] pb-2">Lý lịch cá nhân sinh vật nội trú</h3>

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Mã sinh viên (Hạ tầng lưu khóa)</label>
                    <input 
                      type="text" 
                      disabled 
                      value={studentUser.id} 
                      className="w-full bg-[#FDFBF7] text-slate-400 border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs font-mono font-bold cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Họ tên sinh viên</label>
                    <input 
                      type="text" 
                      disabled 
                      value={studentUser.name} 
                      className="w-full bg-[#FDFBF7] text-slate-400 border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs font-bold cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Mã lớp sinh hoạt đào tạo</label>
                    <input 
                      type="text" 
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Điện thoại cá nhân liên lạc</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A4A4A]">Địa chỉ liên kết hòm thư (Email DNU)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs outline-none transition-all" 
                  />
                </div>

                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full shadow-xs transition-all cursor-pointer"
                >
                  Ghi lại lý lịch cá nhân
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Invoice Paying Overlay QR Code Modal */}
      {isPayModalOpen && payingInvoice && (
        <div className="fixed inset-0 bg-[#4A4A4A]/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 text-left">
          <div className="bg-white rounded-[32px] border border-[#EAE7E1] shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="font-serif text-[#4A4A4A] text-base leading-none">Cổng thanh toán điện tử QR</h3>
            <p className="text-xs text-[#8B8B8B] font-light leading-relaxed">
              Mở camera app ngân hàng di động bất kỳ quét mã QR định danh nội trú bên dưới để nộp phí KTX.
            </p>

            <div className="bg-[#FDFBF7] p-4 rounded-3xl flex flex-col items-center justify-center border border-[#EAE7E1] aspect-square w-48 mx-auto relative shadow-xs">
              <div className="bg-white p-2.5 rounded-2xl hover:scale-103 transition-transform duration-300 border border-[#EAE7E1]">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DNU_Dorm_Fee_Payment_Code_2026" 
                  alt="QR Code Payment" 
                  className="w-36 h-36 object-contain"
                />
              </div>
            </div>

            <div className="text-left bg-[#FDFBF7] border border-[#EAE7E1] p-4 rounded-2xl space-y-1.5 text-xs text-[#4A4A4A]">
              <div>Nhập số tiền nộp: <strong className="text-[#CB997E]">{new Intl.NumberFormat('vi-VN').format(payingInvoice.amount)} VNĐ</strong></div>
              <div>Cú pháp nội dung: <strong className="font-mono text-[#6B705C]">{payingInvoice.roomNumber} - {payingInvoice.type}</strong></div>
              <div>Rà soát đối chiếu: <strong className="text-[#8B8B8B]">Trong 15 phút sau giao dịch</strong></div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => setIsPayModalOpen(false)}
                className="w-1/2 py-2.5 border border-[#EAE7E1] text-[#8B8B8B] rounded-full text-xs font-bold hover:bg-slate-50 cursor-pointer text-center"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={completeInvoicePayment}
                className="w-1/2 py-2.5 bg-[#6B705C] text-white rounded-full text-xs font-bold hover:bg-[#8B9178] shadow-xs cursor-pointer text-center"
              >
                Tôi đã đóng xong
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
