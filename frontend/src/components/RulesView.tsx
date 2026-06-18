import React, { useState } from 'react';
import { ShieldAlert, Download, FileText, ChevronDown, ChevronUp, Lock, EyeOff, Ban, AlertOctagon, Check } from 'lucide-react';

export default function RulesView() {
  const [openAccordion, setOpenAccordion] = useState<number>(0);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const triggerDownload = (fileName: string) => {
    setDownloadMsg(`Đang khởi tạo tải xuống file: ${fileName}`);
    setTimeout(() => {
      setDownloadMsg(null);
    }, 4000);
  };

  const accordions = [
    {
      title: "1. Giờ giấc sinh hoạt & Giới nghiêm",
      content: "• Giờ mở cửa Ký túc xá: 05:30 hàng ngày.\n• Giờ đóng cửa giới nghiêm bảo vệ: 22:30 hàng ngày. Sinh viên ra vào sau giờ đóng cửa phải có giấy tờ phê duyệt hoặc lý do khẩn cấp chính đáng.\n• Giờ tắt điện chính/yêu cầu im lặng giữ trật tự: 23:00 đến 05:30 hôm sau."
    },
    {
      title: "2. An ninh trật tự & Tiếp đón bạn bè",
      content: "• Khách đến thăm phải đăng ký với phòng bảo vệ trực ban tại cổng chính, tuyệt đối không được tự ý dẫn vào phòng ở.\n• Không cho người lạ hoặc bạn bè ngủ qua đêm trái phép. Vi phạm sẽ bị xử lý kỷ luật cảnh cáo buộc rời KTX.\n• Giữ gìn và tự chịu trách nhiệm bảo quản tài sản điện thoại, ví cá nhân."
    },
    {
      title: "3. Vệ sinh chung & Rác thải sinh hoạt",
      content: "• Sinh viên có trách nhiệm vệ sinh sạch sẽ trong phòng ở hàng ngày, thu gom rác thải đúng nơi quy định tại hành lang.\n• Định kỳ thứ 7 hàng tuần tiến hành tổng vệ sinh toàn nhà.\n• Không đổ chất thải, thức ăn thừa vào bồn rửa chén gây nghẹt cống dẫn nước."
    },
    {
      title: "4. Sử dụng năng lượng điện nước tiết kiệm",
      content: "• Tắt hết tất cả thiết bị sạc điện, bóng đèn, quạt máy, điều hòa khi di chuyển ra khỏi phòng ở.\n• Sử dụng nước sinh hoạt đúng mục đích, khóa chặt vòi nước sau khi dùng.\n• Mọi sự cố tắc rò rỉ điện nước cần gửi thông báo khẩn cấp cho ban kỹ thuật qua ứng dụng để xử lý bảo dưỡng kịp thời."
    }
  ];

  return (
    <div className="w-full text-left bg-[#FDFBF7] text-[#4A4A4A] relative">
      {/* Toast Alert */}
      {downloadMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#6B705C] text-[#FDFBF7] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-fade-in transition-all">
          <Check className="w-4.5 h-4.5 text-emerald-400" />
          <span className="text-xs font-semibold">{downloadMsg}</span>
        </div>
      )}

      {/* Banner Area */}
      <section className="bg-[#A5A58D] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: '16px 16px' }} />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col justify-center">
          <div className="text-white/80 text-xs mb-3 font-mono">
            <span>Trang chủ</span> &gt; <span className="text-white font-semibold">Nội quy lưu trú</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-light uppercase mb-3 text-white tracking-tight leading-none">
            Nội quy <span className="italic font-normal text-[#CB997E]">Ký túc xá</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 font-light max-w-2xl">
            Sổ tay hướng dẫn nếp sống nội trú văn minh, kỷ cương và tuyệt đối đảm bảo an toàn phòng chống cháy nổ.
          </p>
        </div>
      </section>

      {/* Accordions and Side list */}
      <section className="py-16 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Accordion block on left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-xs">
              <h2 className="text-2.5xl font-serif font-light text-[#4A4A4A] mb-6 border-b border-[#EAE7E1] pb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#6B705C] rounded-full" />
                ĐIỀU KHOẢN QUY ĐỊNH NỘI TRÚ
              </h2>

              <div className="space-y-3">
                {accordions.map((acc, index) => (
                  <div 
                    key={index}
                    className="border border-[#EAE7E1] rounded-2xl overflow-hidden transition-all"
                  >
                    <button 
                      onClick={() => setOpenAccordion(openAccordion === index ? -1 : index)}
                      className={`w-full flex items-center justify-between px-6 py-4 text-left transition-all font-bold text-sm cursor-pointer ${
                        openAccordion === index 
                          ? 'bg-[#6B705C] text-white' 
                          : 'bg-white text-[#4A4A4A] hover:bg-[#FDFBF7]'
                      }`}
                    >
                      <span>{acc.title}</span>
                      {openAccordion === index ? <ChevronUp className="w-4.5 h-4.5 text-white" /> : <ChevronDown className="w-4.5 h-4.5 text-[#8B8B8B]" />}
                    </button>
                    {openAccordion === index && (
                      <div className="p-6 bg-white text-xs md:text-sm text-[#8B8B8B] leading-relaxed whitespace-pre-line font-light">
                        {acc.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strict warnings and forbidden items */}
            <div className="bg-[#CB997E]/10 border border-[#CB997E]/30 rounded-[32px] p-8 shadow-xs text-left">
              <h3 className="font-serif font-light text-red-900 text-lg flex items-center gap-2.5 mb-4">
                <AlertOctagon className="w-5.5 h-5.5 text-[#CB997E] shrink-0" />
                CÁC CẤM CHỈ HOÀN TOÀN TRONG KÝ TÚC XÁ
              </h3>
              
              <ul className="space-y-3.5 text-xs md:text-sm text-[#4A4A4A] leading-relaxed font-light">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#CB997E] shrink-0 mt-2" />
                  <span><strong>Sử dụng thiết bị đun nấu sinh nhiệt trái phép:</strong> Cấm sử dụng bếp ga, bếp cồn, lò sấy nướng, nồi chiên dầu quá tải phòng ở.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#CB997E] shrink-0 mt-2" />
                  <span><strong>Tàng trữ rượu bia, bài bạc:</strong> Tuyệt đối cấm các hành vi rượu bia say xỉn la hét, tàng trữ cờ bạc ăn tiền dưới mọi chiêu trò.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#CB997E] shrink-0 mt-2" />
                  <span><strong>Dẫn người lạ vào qua đêm không đăng ký:</strong> Cho người ngoại qua đêm bừa bãi sẽ bị xem xét đuổi khỏi ký túc xá lập tức.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#CB997E] shrink-0 mt-2" />
                  <span><strong>Tự ý dán vẽ thay đổi cấu tạo phòng ở:</strong> Không tự tiện đóng đinh, khoan đục vách tường hay câu móc dán ổ điện bất hợp pháp.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right sidebar files and downloads list */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs text-left">
              <h3 className="font-serif text-[#4A4A4A] text-lg mb-2">Tài liệu tải xuống</h3>
              <p className="text-xs text-[#8B8B8B] font-light mb-5">
                Các quy chế, văn bản pháp lí mẫu được đính kèm định dại PDF chuẩn hóa.
              </p>

              <div className="space-y-3">
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); triggerDownload('Noi_quy_DNU_KTX_2026.pdf'); }}
                  className="flex items-center gap-3.5 p-3.5 border border-[#EAE7E1] hover:border-[#6B705C] hover:bg-[#FDFBF7] rounded-2xl transition-all font-bold text-xs md:text-sm text-[#4A4A4A]"
                >
                  <FileText className="w-9 h-9 text-[#CB997E] shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-[#4A4A4A] leading-tight">Nội quy Ký túc xá ĐH Đại Nam</div>
                    <div className="text-[10px] text-[#8B8B8B] font-mono mt-0.5">PDF • 1.5 MB</div>
                  </div>
                </a>

                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); triggerDownload('Quy_trinh_ky_luat_DNU.pdf'); }}
                  className="flex items-center gap-3.5 p-3.5 border border-[#EAE7E1] hover:border-[#6B705C] hover:bg-[#FDFBF7] rounded-2xl transition-all font-bold text-xs md:text-sm text-[#4A4A4A]"
                >
                  <FileText className="w-9 h-9 text-[#CB997E] shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-[#4A4A4A] leading-tight">Quy trình xử lý kỷ luật sinh viên</div>
                    <div className="text-[10px] text-[#8B8B8B] font-mono mt-0.5">PDF • 850 KB</div>
                  </div>
                </a>

                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); triggerDownload('So_do_PCCC_Thoat_hiem.pdf'); }}
                  className="flex items-center gap-3.5 p-3.5 border border-[#EAE7E1] hover:border-[#6B705C] hover:bg-[#FDFBF7] rounded-2xl transition-all font-bold text-xs md:text-sm text-[#4A4A4A]"
                >
                  <FileText className="w-9 h-9 text-red-500 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-[#4A4A4A] leading-tight">Sơ đồ lối thoát hiểm & PCCC</div>
                    <div className="text-[10px] text-[#8B8B8B] font-mono mt-0.5">PDF • 3.2 MB</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Extra visual note info */}
            <div className="bg-[#8B9178] text-white rounded-[32px] p-6 relative overflow-hidden shadow-xs">
              <h4 className="font-serif font-light mb-2 text-md flex items-center gap-1.5 text-white">
                <Lock className="w-4.5 h-4.5 text-[#CB997E]" />
                Lưu ý quan trọng
              </h4>
              <p className="text-xs text-white/95 font-light leading-relaxed">
                Vi phạm nội quy quá 3 lần trong một học kỳ sẽ bị gửi hồ sơ kỷ luật chấm dứt quyền tạm trú ngay lập tức phục vụ an ninh nề nếp chung.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
