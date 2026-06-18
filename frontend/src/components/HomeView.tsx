import React, { useState } from 'react';
import { Compass, BookOpen, ShieldCheck, HelpCircle, ArrowRight, Home, Users, Flame, Wind, Star, ChevronRight, MessageCircle } from 'lucide-react';
import { AppScreen } from '../types';

interface HomeViewProps {
  onNavigate: (screen: AppScreen) => void;
  onSetSelectedBookingRoom?: (roomNumber: string) => void;
}

export default function HomeView({ onNavigate, onSetSelectedBookingRoom }: HomeViewProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      title: "TÌM PHÒNG PHÙ HỢP",
      subtitle: "Hệ thống tìm kiếm phòng thông minh, giúp bạn chọn được nơi ở ưng ý",
      accent: "ĐĂNG KÝ PHÒNG"
    },
    {
      title: "MÔI TRƯỜNG ĐẲNG CẤP",
      subtitle: "Trang bị đầy đủ tiện nghi, wifi tốc độ cao, điều hòa mát rượi",
      accent: "ĐĂNG KÝ PHÒNG"
    }
  ];

  return (
    <div className="w-full bg-[#FDFBF7] text-[#4A4A4A]">
      {/* Interactive Hero Banner */}
      <section className="relative h-[480px] bg-[#A5A58D] rounded-[32px] md:rounded-[40px] overflow-hidden flex items-center px-8 md:px-16 shadow-xl my-6 mx-auto max-w-7xl">
        {/* Dynamic backdrop image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-700"
          style={{ 
            backgroundImage: activeSlide === 0 
              ? "url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80')" 
              : "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-[#6B705C]/20 to-transparent z-10" />
        
        {/* Decorative natural shape */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[#B7B7A4] flex items-center justify-center opacity-35 z-0 pointer-events-none">
          <div className="w-80 h-80 rounded-full border-[30px] border-[#FDFBF7]/20"></div>
        </div>

        <div className="relative z-10 max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 text-[#FDFBF7] px-4.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/20 backdrop-blur-xs">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="font-bold tracking-widest text-[#FDFBF7]">HỆ THỐNG NỘI TRÚ ĐẠI HỌC ĐẠI NAM</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-4 tracking-tight drop-shadow-sm">
            {activeSlide === 0 ? "Không gian sống" : "Môi trường học tập"}<br />
            <span className="italic font-normal text-[#CB997E]">{activeSlide === 0 ? "Tiện nghi & Hiện đại" : "Năng động & Gắn kết"}</span>
          </h1>
          <p className="text-sm md:text-base text-white/90 max-w-xl mb-8 leading-relaxed font-light">
            {heroSlides[activeSlide].subtitle}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate(AppScreen.Booking)}
              className="px-8 py-3.5 bg-[#CB997E] hover:bg-[#A47148] text-white font-bold rounded-full shadow-lg shadow-[#CB997E]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 group cursor-pointer"
            >
              <span>{heroSlides[activeSlide].accent}</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate(AppScreen.About)}
              className="px-8 py-3.5 bg-white/10 backdrop-blur-xs text-white font-semibold rounded-full hover:bg-white/20 border border-white/25 transition-all flex items-center gap-2"
            >
              <span>Tìm hiểu thêm</span>
              <InfoIcon className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Carousel buttons */}
        <div className="absolute bottom-6 right-12 flex items-center gap-3 z-20">
          <button 
            onClick={() => setActiveSlide(prev => (prev === 0 ? 1 : 0))}
            className="w-9 h-9 rounded-full border border-white/30 hover:border-white/80 bg-slate-950/20 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer hover:bg-[#6B705C]"
          >
            ←
          </button>
          <button 
            onClick={() => setActiveSlide(prev => (prev === 0 ? 1 : 0))}
            className="w-9 h-9 rounded-full border border-white/30 hover:border-white/80 bg-slate-950/20 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer hover:bg-[#6B705C]"
          >
            →
          </button>
          <span className="text-xs font-mono text-white/80 ml-3">0{activeSlide + 1} / 02</span>
        </div>
      </section>

      {/* Main Category Cards */}
      <section className="py-12 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => onNavigate(AppScreen.Rules)}
            className="group cursor-pointer bg-white p-6 rounded-[32px] border border-[#EAE7E1] shadow-xs hover:border-[#6B705C] hover:shadow-md transition-all text-left flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] group-hover:bg-[#6B705C] group-hover:text-white transition-all duration-300">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#4A4A4A] group-hover:text-[#6B705C] transition-colors mb-2">Thủ tục đăng ký</h3>
              <p className="text-sm text-[#8B8B8B] leading-relaxed font-light">Hướng dẫn chi tiết các bước làm thủ tục nhập học và nhận phòng.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate(AppScreen.About)}
            className="group cursor-pointer bg-white p-6 rounded-[32px] border border-[#EAE7E1] shadow-xs hover:border-[#6B705C] hover:shadow-md transition-all text-left flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] group-hover:bg-[#6B705C] group-hover:text-white transition-all duration-300">
              <Home className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#4A4A4A] group-hover:text-[#6B705C] transition-colors mb-2">Mức phí & Thanh toán</h3>
              <p className="text-sm text-[#8B8B8B] leading-relaxed font-light">Thông tin minh bạch về các khoản phí và hướng dẫn thanh toán trực tuyến.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate(AppScreen.Rules)}
            className="group cursor-pointer bg-white p-6 rounded-[32px] border border-[#EAE7E1] shadow-xs hover:border-[#6B705C] hover:shadow-md transition-all text-left flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] group-hover:bg-[#6B705C] group-hover:text-white transition-all duration-300">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#4A4A4A] group-hover:text-[#6B705C] transition-colors mb-2">Nội quy & Quy định</h3>
              <p className="text-sm text-[#8B8B8B] leading-relaxed font-light">Quy định sinh hoạt tại KTX đảm bảo an ninh trật tự và nếp sống văn minh.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate(AppScreen.Contact)}
            className="group cursor-pointer bg-white p-6 rounded-[32px] border border-[#EAE7E1] shadow-xs hover:border-[#6B705C] hover:shadow-md transition-all text-left flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] group-hover:bg-[#6B705C] group-hover:text-white transition-all duration-300">
              <HelpCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#4A4A4A] group-hover:text-[#6B705C] transition-colors mb-2">Hỗ trợ sinh viên</h3>
              <p className="text-sm text-[#8B8B8B] leading-relaxed font-light">Kênh liên hệ trực tiếp với Ban quản lý giải quyết các vấn đề phát sinh.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Steps Navigation */}
      <section className="py-16 bg-[#FDFBF7] border-y border-[#EAE7E1]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif font-light text-[#4A4A4A] tracking-tight mb-3">Quy trình đăng ký <span className="italic font-normal text-[#CB997E]">dễ dàng</span></h2>
          <p className="text-[#8B8B8B] max-w-2xl mx-auto mb-12 font-light text-sm">
            Chỉ với 4 bước đơn giản, sinh viên có thể hoàn tất thủ tục đăng ký phòng ở một cách nhanh chóng và thuận tiện.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#EAE7E1] -translate-y-1/2 hidden lg:block z-0" />
            
            <div className="relative z-10 flex flex-col items-center bg-[#FDFBF7] p-4 rounded-2xl border border-transparent hover:border-[#EAE7E1] transition-all">
              <div className="w-14 h-14 rounded-full bg-white border border-[#EAE7E1] text-[#6B705C] flex items-center justify-center mb-4 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <span className="bg-[#CB997E]/10 text-[#CB997E] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">Bước 1</span>
              <h4 className="font-bold text-[#4A4A4A]">Đăng nhập hệ thống</h4>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-[#FDFBF7] p-4 rounded-2xl border border-transparent hover:border-[#EAE7E1] transition-all">
              <div className="w-14 h-14 rounded-full bg-white border border-[#EAE7E1] text-[#6B705C] flex items-center justify-center mb-4 shadow-sm">
                <Home className="w-6 h-6" />
              </div>
              <span className="bg-[#CB997E]/10 text-[#CB997E] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">Bước 2</span>
              <h4 className="font-bold text-[#4A4A4A]">Chọn phòng Ký túc xá</h4>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-[#FDFBF7] p-4 rounded-2xl border border-transparent hover:border-[#EAE7E1] transition-all">
              <div className="w-14 h-14 rounded-full bg-white border border-[#EAE7E1] text-[#6B705C] flex items-center justify-center mb-4 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="bg-[#CB997E]/10 text-[#CB997E] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">Bước 3</span>
              <h4 className="font-bold text-[#4A4A4A]">Nộp đơn nộp hồ sơ</h4>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-[#FDFBF7] p-4 rounded-2xl border border-transparent hover:border-[#EAE7E1] transition-all">
              <div className="w-14 h-14 rounded-full bg-[#6B705C] text-white flex items-center justify-center mb-4 shadow-md shadow-[#6B705C]/20 animate-pulse">
                <Star className="w-6 h-6" />
              </div>
              <span className="bg-[#6B705C] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">Bước 4</span>
              <h4 className="font-bold text-[#4A4A4A]">Xác duyệt nhận phòng</h4>
            </div>
          </div>

          <button 
            onClick={() => onNavigate(AppScreen.Booking)}
            className="mt-12 px-8 py-3.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold rounded-full shadow-md hover:shadow-lg hover:shadow-[#6B705C]/15 transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <span>BẮT ĐẦU ĐĂNG KÝ NGAY</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Facilities and Amenities Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 bg-[#FDFBF7]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-light text-[#4A4A4A] tracking-tight">Tiện ích & <span className="italic font-normal text-[#CB997E]">Dịch vụ nội trú</span></h2>
          <p className="text-[#8B8B8B] max-w-xl mx-auto mt-3 leading-relaxed font-light text-sm">
            Trải nghiệm không gian sống tiện nghi, an toàn và hỗ trợ tối đa cho việc học tập và sinh hoạt của sinh viên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative h-72 rounded-[32px] overflow-hidden group shadow-md text-left">
            <img 
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80" 
              alt="Premium Living" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-5 left-5 bg-[#6B705C] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">Tiêu chuẩn</div>
            <div className="absolute bottom-5 left-5 text-white pr-5">
              <h3 className="font-bold text-lg mb-1 font-serif">Phòng đầy đủ tiện nghi</h3>
              <p className="text-xs text-white/80 font-light">Giường tầng gỗ, tủ đồ cá nhân bằng gỗ tự nhiên, bàn học trang nhã</p>
            </div>
          </div>

          <div className="relative h-72 rounded-[32px] overflow-hidden group shadow-md text-left">
            <img 
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80" 
              alt="Study rooms" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-5 left-5 bg-[#CB997E] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full font-sans">Tri thức</div>
            <div className="absolute bottom-5 left-5 text-white pr-5">
              <h3 className="font-bold text-lg mb-1 font-serif">Khu tự học chung</h3>
              <p className="text-xs text-white/80 font-light">Không gian học yên tĩnh, được trang trí bằng cây xanh và đèn ấm áp</p>
            </div>
          </div>

          <div className="relative h-72 rounded-[32px] overflow-hidden group shadow-md text-left">
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" 
              alt="Fitness" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-5 left-5 bg-[#6B705C] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">Sức khỏe</div>
            <div className="absolute bottom-5 left-5 text-white pr-5">
              <h3 className="font-bold text-lg mb-1 font-serif">Khu thể hình đa năng</h3>
              <p className="text-xs text-white/80 font-light">Máy móc hiện đại đáp ứng đầy đủ nhu cầu rèn luyện sức khỏe hàng ngày</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
          <div className="bg-white rounded-[24px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-[#6B705C] shrink-0">
              <Flame className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#CB997E] tracking-wider block mb-1 uppercase">Ẩm thực lành mạnh</span>
              <h4 className="font-bold text-[#4A4A4A] text-base mb-1">Căng tin & Siêu thị</h4>
              <p className="text-xs text-[#8B8B8B] font-light leading-relaxed">Cung cấp suất ăn đầy đủ dinh dưỡng, thực phẩm hữu cơ, tươi mới và đồ uống sạch.</p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-[#6B705C] shrink-0">
              <Wind className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#CB997E] tracking-wider block mb-1 uppercase">Vệ sinh sạch sẽ</span>
              <h4 className="font-bold text-[#4A4A4A] text-base mb-1">Giặt sấy tự động</h4>
              <p className="text-xs text-[#8B8B8B] font-light leading-relaxed">Hệ thống máy rửa, sấy hiện đại tiết kiệm nước, bảo vệ sợi vải tối đa.</p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-[#6B705C] shrink-0">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6B705C] tracking-wider block mb-1 uppercase">An tâm tuyệt đối</span>
              <h4 className="font-bold text-[#4A4A4A] text-base mb-1">An ninh đa lớp</h4>
              <p className="text-xs text-[#8B8B8B] font-light leading-relaxed">Hệ thống camera AI giám sát thông minh góc rộng, tuần tra trực đêm phối hợp.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
