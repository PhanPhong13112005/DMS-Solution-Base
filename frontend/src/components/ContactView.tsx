import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle, Check, AlertCircle } from 'lucide-react';

export default function ContactView() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      setStatusType('error');
      setStatusMessage('Vui lòng điền đầy đủ họ tên, thư điện tử email và nội dung góp ý!');
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setStudentId('');
      setEmail('');
      setMsg('');
      setSubmitted(false);
      setStatusType('success');
      setStatusMessage('Đã gửi phản hồi góp ý của bạn thành công tới Ban quản lý KTX Đại học Đại Nam!');
      setTimeout(() => setStatusMessage(null), 5000);
    }, 1200);
  };

  return (
    <div className="w-full text-left bg-[#FDFBF7] text-[#4A4A4A] relative">
      {/* Toast Alert System */}
      {statusMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 border animate-fade-in transition-all ${
          statusType === 'success' 
            ? 'bg-[#6B705C] text-[#FDFBF7] border-white/10' 
            : 'bg-amber-550 text-white border-amber-500'
        }`}>
          {statusType === 'success' ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-200" />
          )}
          <span className="text-xs font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Hero Banner Header */}
      <section className="bg-[#A5A58D] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: '16px 16px' }} />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col justify-center">
          <div className="text-white/80 text-xs mb-3 font-mono">
            <span>Trang chủ</span> &gt; <span className="text-white font-semibold">Liên hệ</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-light uppercase mb-3 text-white tracking-tight leading-none">
            Liên hệ & <span className="italic font-normal text-[#CB997E]">Phản hồi</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 font-light max-w-2xl">
            Gửi yêu cầu giải quyết, đóng góp ý kiến hoặc phản ánh chất lượng đời sống nội dung trong KTX.
          </p>
        </div>
      </section>

      {/* Main contents grids */}
      <section className="py-16 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Information cards sidebar list */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs text-left hover:border-[#6B705C] transition-all duration-300">
              <div className="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] shrink-0">
                <MapPin className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A4A4A] text-sm mb-1">Địa chỉ Ký túc xá</h4>
                <p className="text-xs text-[#8B8B8B] font-light leading-relaxed">
                  Phú Lãm, Hà Đông, Hà Nội (Nằm trong khuôn viên chính Đại học Đại Nam).
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs text-left hover:border-[#6B705C] transition-all duration-300">
              <div className="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] shrink-0">
                <Phone className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A4A4A] text-sm mb-1">Hotline giải đáp</h4>
                <p className="text-xs text-[#8B8B8B] font-light font-mono leading-relaxed">
                  0243.859.1484 (Phục vụ giờ hành chính đợt cao điểm đăng ký)
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs text-left hover:border-[#6B705C] transition-all duration-300">
              <div className="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] shrink-0">
                <Mail className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="font-bold text-[#4A4A4A] text-sm mb-1">Hòm thư trực tuyến</h4>
                <p className="text-xs text-[#8B8B8B] font-light font-mono leading-relaxed">
                  ktx@dainam.edu.vn
                </p>
              </div>
            </div>

            {/* Custom high-contrast static route map */}
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] overflow-hidden shadow-xs aspect-video relative">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80" 
                alt="Map representation" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#6B705C]/80 to-transparent flex items-end p-4 text-white">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#CB997E]">Vị trí thực tế</span>
                  <div className="font-serif text-sm">KTX Đại học Đại Nam</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form block on left */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-xs">
              <h2 className="text-2xl font-serif font-light text-[#4A4A4A] mb-6 border-b border-[#EAE7E1] pb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#6B705C] rounded-full" />
                GỬI Ý KIẾN PHẢN HỒI GÓP Ý
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Họ và tên <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4A4A4A]">Mã sinh viên (MSSV)</label>
                    <input 
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="1771020536 (Nếu có)"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A4A4A]">Thư điện tử Email <span className="text-[#CB997E]">*</span></label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@dainam.edu.vn"
                    className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A4A4A]">Nội dung câu hỏi / Góp ý <span className="text-[#CB997E]">*</span></label>
                  <textarea 
                    required
                    rows={5}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Điền thắc mắc hoặc góp ý chi tiết về dịch vụ phòng, điện nước hoặc xử lý thủ tục..."
                    className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-3 text-sm outline-none resize-none transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitted}
                  className="w-full md:w-auto px-8 py-3.5 bg-[#6B705C] hover:bg-[#8B9178] disabled:bg-slate-300 text-white font-bold text-xs md:text-sm rounded-full shadow-md shadow-[#6B705C]/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{submitted ? 'Đang gửi phản hồi...' : 'Gửi phản hồi của bạn'}</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
