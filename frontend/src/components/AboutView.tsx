import React from 'react';
import { Phone, Mail, CheckCircle, ShieldCheck, Award, Heart } from 'lucide-react';
import { AppScreen } from '../types';

interface AboutViewProps {
  onNavigate: (screen: AppScreen) => void;
}

export default function AboutView({ onNavigate }: AboutViewProps) {
  return (
    <div className="w-full text-left bg-[#FDFBF7] text-[#4A4A4A]">
      {/* Hero Banner Section */}
      <section className="bg-[#A5A58D] text-white py-12 px-6 relative overflow-hidden">
        {/* Vector Background Graphics */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: '16px 16px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-white/80 text-xs mb-3 font-mono">
            <span>Trang chủ</span> &gt; <span className="text-white font-semibold">Giới thiệu</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-light uppercase mb-3 text-white tracking-tight leading-none">
            Giới thiệu <span className="italic font-normal text-[#CB997E]">Ký túc xá</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 font-light max-w-2xl">
            Môi trường sống hiện đại, an toàn và chuyên nghiệp dành cho sinh viên nội trú Đại học Đại Nam.
          </p>
        </div>
      </section>

      {/* Main Content Info */}
      <section className="py-16 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Main Content */}
          <div className="lg:col-span-2 bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-xs">
            <h2 className="text-2xl font-serif font-light text-[#4A4A4A] mb-6 border-b border-[#EAE7E1] pb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#6B705C] rounded-full" />
              TỔNG QUAN VỀ KÝ TÚC XÁ DNU
            </h2>
            
            <div className="space-y-4 text-[#8B8B8B] text-sm leading-relaxed mb-8 font-light">
              <p>
                Ký túc xá Đại học Đại Nam (DNU) được xây dựng với mục tiêu mang đến một môi trường sống tiện nghi, an toàn và thân thiện cho sinh viên. Tọa lạc ngay trong khuôn viên trường, KTX giúp sinh viên tiết kiệm thời gian di chuyển, tạo điều kiện thuận lợi nhất cho việc học tập và tham gia các hoạt động ngoại khóa.
              </p>
              <p>
                Các phòng ở được thiết kế hiện đại, thông thoáng, trang bị đầy đủ tiện ích như giường tầng cao cấp, tủ quần áo cá nhân, bàn học, điều hòa, bình nóng lạnh và hệ thống Wi-Fi tốc độ cao. Đặc biệt, công tác an ninh luôn được đặt lên hàng đầu với hệ thống camera giám sát 24/7 và đội ngũ bảo vệ chuyên nghiệp.
              </p>
            </div>

            {/* Simulated Grid Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="h-52 rounded-[24px] overflow-hidden shadow-xs relative">
                <img 
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80" 
                  alt="DNU Dormitory Outer" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
              <div className="h-52 rounded-[24px] overflow-hidden shadow-xs relative">
                <img 
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80" 
                  alt="DNU Dormitory Interior Rooms" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </div>

            {/* Target and Vision */}
            <h3 className="text-xl font-serif text-[#4A4A4A] mb-4 flex items-center gap-2">
              Mục tiêu & Tầm nhìn
            </h3>
            <ul className="space-y-4 text-sm text-[#4A4A4A]">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#CB997E] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#4A4A4A] block font-semibold">Đảm bảo an toàn tuyệt đối</strong>
                  <span className="text-[#8B8B8B] font-light">Duy trì trật tự và hệ thống giám sát cổng ra vào thông minh liên tục 24/24 giờ để tạo môi trường an tâm tuyệt đối cho phụ huynh và học sinh.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#CB997E] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#4A4A4A] block font-semibold">Tối ưu hóa môi trường tự học</strong>
                  <span className="text-[#8B8B8B] font-light">Cung cấp máy móc, phòng đọc, wifi ổn định hỗ trợ chuẩn mực tinh thần học tập nhóm và tự nghiên cứu của sinh viên.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#CB997E] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#4A4A4A] block font-semibold">Phương châm phục vụ chuyên nghiệp</strong>
                  <span className="text-[#8B8B8B] font-light">Luôn tiếp thu phản hồi, phản ứng lập tức với hư hỏng điện nước và bảo đảm nếp sống vệ sinh văn hóa.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Right contacts sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] overflow-hidden shadow-xs">
              <div className="bg-[#6B705C] text-white p-6">
                <h3 className="font-serif font-light text-lg">BAN QUẢN LÝ KTX</h3>
                <p className="text-xs text-[#FDFBF7]/80 mt-1">Hỗ trợ trực tiếp các nhu cầu phát sinh</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDFBF7] border border-[#EAE7E1] flex items-center justify-center text-[#6B705C] shrink-0">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#8B8B8B]">Hotline hỗ trợ</div>
                    <div className="text-sm text-[#4A4A4A] font-semibold font-mono">0243.859.1484</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDFBF7] border border-[#EAE7E1] flex items-center justify-center text-[#6B705C] shrink-0">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#8B8B8B]">Email liên hệ</div>
                    <div className="text-sm text-[#4A4A4A] font-semibold font-mono">ktx@dainam.edu.vn</div>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate(AppScreen.Contact)}
                  className="w-full py-3.5 bg-[#CB997E] hover:bg-[#A47148] text-white font-bold rounded-full shadow-sm shadow-[#CB997E]/10 transition-all cursor-pointer"
                >
                  Liên hệ trực tiếp
                </button>
              </div>
            </div>

            {/* Extra Quality Accents */}
            <div className="bg-[#8B9178] text-white rounded-[32px] p-6 relative overflow-hidden shadow-xs">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-3 translate-y-3">
                <ShieldCheck className="w-40 h-40" />
              </div>
              <h3 className="font-serif font-light text-lg mb-2 flex items-center gap-2 text-[#FDFBF7]">
                <ShieldCheck className="w-5 h-5 text-[#CB997E]" />
                Cam kết 100%
              </h3>
              <p className="text-xs text-white/95 font-light leading-relaxed mb-4">
                Sinh viên nội trú ĐH Đại Nam luôn được trải nghiệm các dịch vụ vệ sinh và an ninh an toàn tiêu chuẩn cao nhất.
              </p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-[#CB997E]" />
                  <span className="text-xs font-semibold">Chuẩn quốc tế</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-rose-300" />
                  <span className="text-xs font-semibold">Tận tâm</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
