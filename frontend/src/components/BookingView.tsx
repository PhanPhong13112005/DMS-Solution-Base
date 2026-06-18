import React, { useState } from 'react';
import { Search, MapPin, Users, Heart, ClipboardCheck, ArrowRight, ShieldAlert, Upload, HelpCircle, CheckCircle2, UserCheck, CreditCard, Landmark, Coins, AlertCircle } from 'lucide-react';
import { Room, BookingApplication } from '../types';

interface BookingViewProps {
  rooms: Room[];
  onAddApplication: (app: BookingApplication) => void;
  onUpdateRoomVacancy: (roomId: string, decrement: boolean) => void;
  initialSelectedRoomNumber?: string;
}

export default function BookingView({ rooms, onAddApplication, onUpdateRoomVacancy, initialSelectedRoomNumber }: BookingViewProps) {
  const [filter, setFilter] = useState<string>('Tất cả');
  const [searchBldg, setSearchBldg] = useState<string>('Tất cả');
  const [searchType, setSearchType] = useState<string>('Tất cả');
  const [searchPrice, setSearchPrice] = useState<string>('Tất cả');

  // Booking Modal States
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(
    initialSelectedRoomNumber ? (rooms.find(r => r.roomNumber === initialSelectedRoomNumber) || null) : null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(initialSelectedRoomNumber ? true : false);
  const [step, setStep] = useState<number>(1); // 1 = Entry Form, 2 = Proof Upload, 3 = Payment Choice, 4 = Consent / Submit, 5 = Successful completion
  const [localError, setLocalError] = useState<string | null>(null);

  // Form Inputs
  const [fullName, setFullName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'e-wallet' | 'direct'>('bank');
  const [cccdUploaded, setCccdUploaded] = useState<boolean>(false);
  const [studentCardUploaded, setStudentCardUploaded] = useState<boolean>(false);
  const [agreeRules, setAgreeRules] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter computation
  const filteredRooms = rooms.filter(room => {
    // Top drop-downs
    const matchBldg = searchBldg === 'Tất cả' || room.building === searchBldg;
    
    let matchType = true;
    if (searchType !== 'Tất cả') {
      const cap = parseInt(searchType);
      matchType = room.capacity === cap;
    }

    let matchPrice = true;
    if (searchPrice !== 'Tất cả') {
      if (searchPrice === 'Dưới 600k') matchPrice = room.price < 600000;
      else if (searchPrice === '600k - 1tr') matchPrice = room.price >= 600000 && room.price <= 1000000;
      else if (searchPrice === 'Trên 1tr') matchPrice = room.price > 1000000;
    }

    // Filter Tag Buttons
    let matchTag = true;
    if (filter !== 'Tất cả') {
      if (filter === '2 người') matchTag = room.capacity === 2;
      else if (filter === '4 người') matchTag = room.capacity === 4;
      else if (filter === '6 người') matchTag = room.capacity === 6;
      else if (filter === 'WC riêng') matchTag = room.amenities.includes('WC riêng');
      else if (filter === 'Máy lạnh') matchTag = room.amenities.includes('Máy lạnh');
    }

    return matchBldg && matchType && matchPrice && matchTag;
  });

  const handleOpenBooking = (room: Room) => {
    if (room.available === 0) return;
    setSelectedRoom(room);
    setStep(1);
    setLocalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    resetForm();
  };

  const resetForm = () => {
    setFullName('');
    setStudentId('');
    setClassName('');
    setPhone('');
    setEmail('');
    setPaymentMethod('bank');
    setCccdUploaded(false);
    setStudentCardUploaded(false);
    setAgreeRules(false);
    setStep(1);
    setLocalError(null);
  };

  const handleNextStep = () => {
    setLocalError(null);
    if (step === 1) {
      if (!fullName || !studentId || !className || !phone || !email) {
        setLocalError('Vui lòng điền đầy đủ các thông tin liên hệ bắt buộc!');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!cccdUploaded || !studentCardUploaded) {
        setLocalError('Vui lòng hoàn tất tải lên cả 2 tài liệu minh chứng!');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const submitBooking = () => {
    setLocalError(null);
    if (!agreeRules) {
      setLocalError('Bạn phải tích chọn đồng ý cam kết với nội quy KTX mới có thể tiếp tục!');
      return;
    }
    if (!selectedRoom) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newApp: BookingApplication = {
        id: 'app-' + Math.random().toString(36).substr(2, 9),
        fullName,
        studentId,
        className,
        phone,
        email,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        building: selectedRoom.building,
        paymentMethod,
        status: 'Pending',
        createdAt: new Date().toISOString().replace('T', ' ').substr(0, 16),
        evidenceCCCD: 'cccd_front_' + studentId + '.jpg',
        evidenceStudentCard: 'student_card_' + studentId + '.jpg'
      };

      onAddApplication(newApp);
      onUpdateRoomVacancy(selectedRoom.id, true); // occupied, slots reduce
      setIsSubmitting(false);
      setStep(5);
    }, 1000);
  };

  return (
    <div className="w-full text-left bg-[#FDFBF7] text-[#4A4A4A]">
      {/* Search Header Banner */}
      <section className="bg-[#A5A58D] text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)", backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-light text-white mb-6 tracking-tight leading-none">
            Tìm phòng <span className="italic font-normal text-[#CB997E]">phù hợp nhất</span>
          </h1>
          
          {/* Dropdown Filters Bento Container */}
          <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-5 md:p-6 shadow-md max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end text-[#4A4A4A]">
            <div className="w-full md:w-1/3 text-left">
              <label className="block text-xs font-semibold text-[#8B8B8B] mb-1.5">Tòa nhà</label>
              <select 
                value={searchBldg}
                onChange={(e) => setSearchBldg(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-3 text-sm focus:border-[#6B705C] outline-none transition-all"
              >
                <option value="Tất cả">Tất cả tòa</option>
                <option value="Tòa A">Tòa A</option>
                <option value="Tòa B">Tòa B</option>
                <option value="Tòa C">Tòa C</option>
              </select>
            </div>
            
            <div className="w-full md:w-1/3 text-left">
              <label className="block text-xs font-semibold text-[#8B8B8B] mb-1.5">Loại phòng</label>
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-3 text-sm focus:border-[#6B705C] outline-none transition-all"
              >
                <option value="Tất cả">Tất cả sức chứa</option>
                <option value="2">Phòng 2 người</option>
                <option value="4">Phòng 4 người</option>
                <option value="6">Phòng 6 người</option>
              </select>
            </div>

            <div className="w-full md:w-1/3 text-left">
              <label className="block text-xs font-semibold text-[#8B8B8B] mb-1.5">Mức giá</label>
              <select 
                value={searchPrice}
                onChange={(e) => setSearchPrice(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-3 text-sm focus:border-[#6B705C] outline-none transition-all"
              >
                <option value="Tất cả">Tất cả khoảng giá</option>
                <option value="Dưới 600k">Dưới 600.000đ/tháng</option>
                <option value="600k - 1tr">600.000đ - 1.000.000đ</option>
                <option value="Trên 1tr">Trên 1.000.000đ/tháng</option>
              </select>
            </div>

            <button 
              onClick={() => { setSearchBldg('Tất cả'); setSearchType('Tất cả'); setSearchPrice('Tất cả'); setFilter('Tất cả'); }}
              className="w-full md:w-auto bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light px-8 py-3.5 rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer grow-0 shrink-0"
            >
              <span>Thiết lập lại</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Filter Tags and Room Listing */}
      <section className="py-12 max-w-7xl mx-auto px-6">
        {/* Toggle Tags List */}
        <div className="flex flex-wrap gap-2.5 mb-10 overflow-x-auto pb-2">
          {['Tất cả', '2 người', '4 người', '6 người', 'WC riêng', 'Máy lạnh'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border-2 transition-all cursor-pointer ${
                filter === tag 
                  ? 'bg-[#6B705C] border-[#6B705C] text-white shadow-xs' 
                  : 'bg-white border-[#EAE7E1] text-[#4A4A4A] hover:border-[#6B705C]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Room cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <div 
              key={room.id}
              className={`bg-white rounded-[32px] border transition-all duration-300 flex flex-col h-full overflow-hidden ${
                room.available > 0 
                  ? 'border-[#EAE7E1] shadow-xs hover:shadow-md hover:border-[#6B705C] group' 
                  : 'border-[#EAE7E1] opacity-75'
              }`}
            >
              {/* Photo Area */}
              <div className="relative h-44 bg-[#FDFBF7] overflow-hidden shrink-0">
                <img 
                  src={
                    room.capacity === 2 
                      ? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80" 
                      : (room.capacity === 4 
                         ? "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80"
                         : "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80")
                  } 
                  referrerPolicy="no-referrer"
                  alt={`Room ${room.roomNumber}`}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                
                {/* Vacancy Badge */}
                {room.available > 0 ? (
                  <span className="absolute top-3 right-3 bg-[#8B9178] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                    {room.available} Chỗ trống
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 bg-[#CB997E] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                    Đã đầy
                  </span>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#6B705C]/80 to-transparent flex items-end p-4">
                  <h3 className="font-serif font-light text-white text-lg tracking-tight">Phòng {room.roomNumber} - {room.building}</h3>
                </div>
              </div>

              {/* Specs Area */}
              <div className="p-5 flex flex-col flex-1 text-[#4A4A4A]">
                <div className="flex justify-between items-center text-xs text-[#8B8B8B] mb-4 bg-[#FDFBF7] p-2.5 rounded-2xl border border-[#EAE7E1]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#8B8B8B]" />
                    <strong>{room.capacity} Người</strong>
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8B8B8B]" />
                    Mặt bằng: <strong>{room.size}m²</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {room.amenities.length > 0 ? (
                    room.amenities.map(amen => (
                      <span 
                        key={amen}
                        className="bg-[#CB997E]/10 border border-[#CB997E]/20 text-[#CB997E] text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-lg"
                      >
                        {amen}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#8B8B8B] italic">Tiện ích cơ bản</span>
                  )}
                </div>

                {/* Pricing Footer */}
                <div className="mt-auto border-t border-[#EAE7E1] pt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#8B8B8B] font-light">Giá lưu trú:</span>
                    <span className="text-lg font-bold text-[#CB997E] tracking-tight">
                      {new Intl.NumberFormat('vi-VN').format(room.price)}đ
                      <span className="text-xs text-[#8B8B8B] font-normal"> /tháng</span>
                    </span>
                  </div>

                  <button
                    disabled={room.available === 0}
                    onClick={() => handleOpenBooking(room)}
                    className={`w-full py-3 font-semibold text-xs md:text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      room.available > 0 
                        ? 'bg-[#6B705C] hover:bg-[#8B9178] text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{room.available > 0 ? 'Đăng ký lưu trú' : 'Hết chỗ'}</span>
                    {room.available > 0 && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredRooms.length === 0 && (
            <div className="col-span-full bg-white border border-[#EAE7E1] rounded-[32px] p-12 text-center text-[#8B8B8B] font-light max-w-xl mx-auto w-full">
              <ShieldAlert className="w-12 h-12 text-[#CB997E] mx-auto mb-3 opacity-80" />
              <span>Không tìm thấy phòng ở phù hợp với các tiêu chí tìm kiếm. Hãy tối giản bộ lọc và tìm lại.</span>
            </div>
          )}
        </div>
      </section>

      {/* Booking Form Overlay Modal Wizard */}
      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-[#4A4A4A]/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 text-left">
          <div className="bg-white rounded-[32px] border border-[#EAE7E1] shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#6B705C] text-white p-6 relative">
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/75 hover:text-white text-xl p-1 cursor-pointer"
              >
                ✕
              </button>
              <h3 className="text-lg font-serif font-light tracking-tight mb-1 text-white">Đăng ký lưu trú Ký túc xá</h3>
              <p className="text-xs text-[#FDFBF7]/95">
                Đang tuyển ký: <strong className="text-[#CB997E]">Phòng {selectedRoom.roomNumber} ({selectedRoom.building})</strong>
              </p>

              {/* Progress Wizard Indicator Bar */}
              {step <= 4 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-4 text-[10px] uppercase font-bold tracking-wider text-[#FDFBF7]/70">
                  <span className={`${step >= 1 ? 'text-[#CB997E]' : ''}`}>1. Điền đơn</span>
                  <span>&gt;</span>
                  <span className={`${step >= 2 ? 'text-[#CB997E]' : ''}`}>2. Minh chứng</span>
                  <span>&gt;</span>
                  <span className={`${step >= 3 ? 'text-[#CB997E]' : ''}`}>3. Thanh toán</span>
                  <span>&gt;</span>
                  <span className={`${step >= 4 ? 'text-[#CB997E]' : ''}`}>4. Cam kết</span>
                </div>
              )}
            </div>

            {/* Modal Body Scroll Container */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* Dynamic Step Errors */}
              {localError && (
                <div className="bg-[#CB997E]/10 border border-[#CB997E]/30 p-4 rounded-2xl text-xs text-[#CB997E] flex items-start gap-2.5 font-light">
                  <AlertCircle className="w-5 h-5 shrink-0 text-[#CB997E]" />
                  <span>{localError}</span>
                </div>
              )}

              {/* STEP 1: Application Form */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="bg-[#FDFBF7] p-4 border border-[#EAE7E1] rounded-2xl flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-[#CB997E] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#8B8B8B] leading-relaxed font-light">
                      Vui lòng khai báo đầy đủ họ tên, thông tin mã sinh viên và lớp học để ban quản lý KTX Đại học Đại Nam nhanh chóng đối chiếu phê duyệt.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Họ và tên thí sinh <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#4A4A4A]">Mã sinh viên <span className="text-[#CB997E]">*</span></label>
                      <input 
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="1771020536"
                        className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#4A4A4A]">Lớp sinh hoạt <span className="text-[#CB997E]">*</span></label>
                      <input 
                        type="text"
                        required
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="CNTT1708"
                        className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Số điện thoại liên hệ <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Địa chỉ Email học tập <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="viana@dainam.edu.vn"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Document Proof upload */}
              {step === 2 && (
                <div className="space-y-5">
                  <h4 className="font-serif text-[#4A4A4A] text-sm">Tải lên hồ sơ minh chứng</h4>
                  <p className="text-xs text-[#8B8B8B] font-light leading-relaxed">
                    Đính kèm hình ảnh / tài liệu quét chụp rõ nét để hỗ trợ lọc và ưu tiên sắp xếp giữ chỗ nhanh chóng.
                  </p>

                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-[#EAE7E1] hover:border-[#6B705C] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#FDFBF7]" onClick={() => setCccdUploaded(true)}>
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${cccdUploaded ? 'text-[#6B705C]' : 'text-[#8B8B8B]'}`} />
                      <div className="text-xs font-bold text-[#4A4A4A]">Căn cước công dân (Mặt trước) <span className="text-[#CB997E]">*</span></div>
                      <p className="text-[10px] text-[#8B8B8B] mt-1">Nhấp đúp chuột để giả định tải tệp lên (.JPG, .PNG)</p>
                      {cccdUploaded && <span className="text-[#6B705C] text-xs font-semibold block mt-1.5">✓ Mặt trước CCCD đính kèm thành công!</span>}
                    </div>

                    <div className="border-2 border-dashed border-[#EAE7E1] hover:border-[#6B705C] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#FDFBF7]" onClick={() => setStudentCardUploaded(true)}>
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${studentCardUploaded ? 'text-[#6B705C]' : 'text-[#8B8B8B]'}`} />
                      <div className="text-xs font-bold text-[#4A4A4A]">Thẻ sinh viên / Giấy báo nhập học <span className="text-[#CB997E]">*</span></div>
                      <p className="text-[10px] text-[#8B8B8B] mt-1">Nhấp đúp chuột để giả định tải tệp lên (.PDF, .PNG)</p>
                      {studentCardUploaded && <span className="text-[#6B705C] text-xs font-semibold block mt-1.5">✓ Thẻ sinh viên đính kèm thành công!</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment Choice */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="font-serif text-[#4A4A4A] text-sm">Phương thức đóng lệ phí KTX</h4>
                  <p className="text-xs text-[#8B8B8B] leading-relaxed font-light">
                    Ký túc xá Đại học Đại Nam hỗ trợ nhiều cổng giao dịch đóng tiền linh động.
                  </p>

                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:border-[#CB997E] transition-all ${paymentMethod === 'bank' ? 'border-[#CB997E] bg-[#CB997E]/10' : 'border-[#EAE7E1]'}`}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="bank" 
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="text-[#6B705C] focus:ring-[#6B705C] w-4.5 h-4.5" 
                      />
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#6B705C] shrink-0">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#4A4A4A]">Chuyển khoản Ngân hàng (Khuyên dùng)</div>
                        <div className="text-xs text-[#8B8B8B]">Nhận mã QR định danh sau khi Ban quản lý duyệt đơn</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:border-[#CB997E] transition-all ${paymentMethod === 'e-wallet' ? 'border-[#CB997E] bg-[#CB997E]/10' : 'border-[#EAE7E1]'}`}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="e-wallet" 
                        checked={paymentMethod === 'e-wallet'}
                        onChange={() => setPaymentMethod('e-wallet')}
                        className="text-[#6B705C] focus:ring-[#6B705C] w-4.5 h-4.5" 
                      />
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#4A4A4A]">Ví điện tử MoMo / ShopeePay</div>
                        <div className="text-xs text-[#8B8B8B]">Hỗ trợ quét thanh toán liên thông điện tử nhanh nhất</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:border-[#CB997E] transition-all ${paymentMethod === 'direct' ? 'border-[#CB997E] bg-[#CB997E]/10' : 'border-[#EAE7E1]'}`}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="direct" 
                        checked={paymentMethod === 'direct'}
                        onChange={() => setPaymentMethod('direct')}
                        className="text-[#6B705C] focus:ring-[#6B705C] w-4.5 h-4.5" 
                      />
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#4A4A4A]">Thanh toán tiền mặt trực tiếp</div>
                        <div className="text-xs text-[#8B8B8B]">Đến nộp tại văn phòng ban quản lý tầng 1 Tòa nhà B9 khi nhận phòng</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: Rules Consent */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="font-serif text-[#4A4A4A] text-sm">Xác nhận thỏa thuận nội quy nội trú</h4>
                  <div className="bg-[#CB997E]/10 border border-[#CB997E]/30 p-4 rounded-2xl text-xs text-[#4A4A4A] leading-relaxed font-light">
                    Môi trường tự quản Ký túc xá yêu cầu sinh viên sinh hoạt nếp sống văn minh, tự chủ, tuân thủ chặt chẽ giờ đóng mở cửa giới nghiêm (22:30), nghiêm cấm đun nấu bằng chất sinh lửa ngoài khu vực bếp chung.
                  </div>

                  <label className="flex items-start gap-3 p-3 border border-[#EAE7E1] rounded-2xl cursor-pointer hover:bg-[#FDFBF7] select-none">
                    <input 
                      type="checkbox"
                      checked={agreeRules}
                      onChange={(e) => setAgreeRules(e.target.checked)}
                      className="rounded border-[#EAE7E1] text-[#6B705C] focus:ring-[#6B705C]/35 w-5 h-5 mt-0.5"
                    />
                    <div className="text-xs text-[#8B8B8B] leading-relaxed">
                      Tôi xác nhận đã đọc và am hiểu kỹ lưỡng <strong className="text-[#4A4A4A]">Cam kết thỏa thuận nội trú</strong> trường ĐH Đại Nam và hứa tuân thủ chấp hành nghiêm chỉnh nội quy KTX Đại học Đại Nam.
                    </div>
                  </label>
                </div>
              )}

              {/* STEP 5: Successful completion summary message */}
              {step === 5 && (
                <div className="text-center py-6 space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-[#FDFBF7] text-[#6B705C] rounded-full flex items-center justify-center mx-auto border border-[#EAE7E1]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-serif text-[#4A4A4A]">Đăng ký phòng thành công!</h3>
                  <p className="text-sm text-[#8B8B8B] leading-relaxed font-light px-4">
                    Ban quản lý đã ghi nhận dữ liệu đề xuất từ học sinh <strong className="text-[#4A4A4A]">{fullName}</strong> ({studentId}). 
                    Chúng tôi sẽ đối chiếu tài liệu đính kèm và gửi email xác duyệt chính thức chi tiết sớm nhất. Cảm ơn bạn!
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            {step < 5 ? (
              <div className="bg-[#FDFBF7] px-6 py-4 border-t border-[#EAE7E1] flex items-center justify-between">
                <button 
                  onClick={() => {
                    if (step === 1) handleCloseModal();
                    else setStep(prev => prev - 1);
                  }}
                  className="px-5 py-2.5 bg-white border border-[#EAE7E1] text-[#4A4A4A] text-xs font-bold rounded-2xl hover:bg-[#FDFBF7] cursor-pointer"
                >
                  {step === 1 ? 'Hủy bỏ' : 'Quay lại'}
                </button>

                {step === 4 ? (
                  <button 
                    onClick={submitBooking}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? 'Đăng đơn...' : 'Xác nhận Hồ sơ'}
                    {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ) : (
                  <button 
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-[#4A4A4A] hover:bg-[#6B6B6B] text-white text-xs font-bold rounded-full flex items-center gap-2 cursor-pointer"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#FDFBF7] px-6 py-4 border-t border-[#EAE7E1]">
                <button 
                  onClick={handleCloseModal}
                  className="w-full py-3 bg-[#6B705C] text-white font-bold rounded-full hover:bg-[#8B9178] transition-all text-center text-xs cursor-pointer"
                >
                  Xác nhận và kết thúc
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
