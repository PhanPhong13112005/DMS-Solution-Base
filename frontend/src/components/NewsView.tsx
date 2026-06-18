import React, { useState } from 'react';
import { Calendar, ArrowRight, ChevronRight, Mail, Search, BookOpen, AlertCircle, CalendarRange, Undo2, Check } from 'lucide-react';
import { NewsArticle } from '../types';

interface NewsViewProps {
  articles: NewsArticle[];
}

export default function NewsView({ articles }: NewsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { name: 'Tất cả', count: articles.length },
    { name: 'Thông báo chung', count: articles.filter(a => a.category === 'THÔNG BÁO').length + 5 },
    { name: 'Tin tức sự kiện', count: articles.filter(a => a.category === 'SỰ KIỆN').length + 3 },
    { name: 'Hoạt động SV', count: articles.filter(a => a.category === 'HOẠT ĐỘNG SV').length + 4 },
    { name: 'Quy định - Thủ tục', count: articles.filter(a => a.category === 'Quy định - Thủ tục').length + 2 }
  ];

  // Article filtration
  const filteredArticles = articles.filter(art => {
    const matchCat = selectedCategory === 'Tất cả' || 
                    (selectedCategory === 'Thông báo chung' && art.category === 'THÔNG BÁO') ||
                    (selectedCategory === 'Tin tức sự kiện' && art.category === 'SỰ KIỆN') ||
                    (selectedCategory === 'Hoạt động SV' && art.category === 'HOẠT ĐỘNG SV') ||
                    (selectedCategory === 'Quy định - Thủ tục' && art.category === 'Quy định - Thủ tục');

    const matchSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        art.summary.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchSearch;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 4000);
      return;
    }
    setSubscribeStatus('success');
    setEmailInput('');
    setTimeout(() => setSubscribeStatus('idle'), 4000);
  };

  return (
    <div className="w-full text-left bg-[#FDFBF7] text-[#4A4A4A]">
      {/* Hero Header Banner */}
      <section className="bg-[#A5A58D] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-x-0 inset-y-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: '20px 20px' }} />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col justify-center">
          <div className="text-white/80 text-xs mb-3 font-mono">
            <span>Trang chủ</span> &gt; <span className="text-white font-semibold">Tin tức & Sự kiện</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-light uppercase mb-3 text-white tracking-tight leading-none">
            Tin tức & <span className="italic font-normal text-[#CB997E]">Sự kiện</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 font-light max-w-2xl">
            Cập nhật mọi thông báo chính thức, sự kiện ngoại khóa và tin tức đời sống Ký túc xá mới nhất.
          </p>
        </div>
      </section>

      {/* Main content grid split */}
      <section className="py-16 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main expanded column content */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedArticle ? (
              // DETAILED ARTICLE READING VIEW
              <div className="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-xs space-y-6">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#EAE7E1] text-[#6B705C] hover:text-[#4A4A4A] rounded-full hover:bg-[#FDFBF7] text-xs font-bold transition-all cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs font-bold text-[#CB997E] border-b border-[#EAE7E1] pb-3 uppercase tracking-wider">
                    <span>{selectedArticle.category}</span>
                    <span className="text-[#EAE7E1]">|</span>
                    <span className="flex items-center gap-1 font-light text-[#8B8B8B] font-mono">
                      <Calendar className="w-4 h-4" />
                      {selectedArticle.date}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-light text-[#4A4A4A] tracking-tight leading-snug">
                    {selectedArticle.title}
                  </h2>
                </div>

                <div className="aspect-video w-full rounded-[24px] overflow-hidden bg-slate-100 border border-[#EAE7E1]">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4 text-[#4A4A4A] text-base leading-relaxed font-light">
                  <p className="font-medium text-[#4A4A4A] italic border-l-4 border-[#CB997E] pl-4">{selectedArticle.summary}</p>
                  <div className="whitespace-pre-line pt-2 text-[#6B6B6B]">{selectedArticle.content}</div>
                </div>
              </div>
            ) : (
              // LIST VIEW OF ARTICLES
              <div className="space-y-6">
                {/* Search bar helper */}
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8B8B] w-5 h-5" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm tiêu đề hoặc nội dung bài viết..."
                    className="w-full bg-white border border-[#EAE7E1] rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-[#6B705C] transition-all"
                  />
                </div>

                {filteredArticles.map((article) => (
                  <article 
                    key={article.id}
                    className="flex flex-col md:flex-row bg-white rounded-[32px] border border-[#EAE7E1] overflow-hidden shadow-xs hover:shadow-md transition-all group"
                  >
                    <div className="md:w-1/3 h-48 md:h-auto overflow-hidden relative shrink-0">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between text-left">
                      <div>
                        <div className="flex items-center gap-3 text-xs mb-3 font-semibold text-[#CB997E] tracking-wider">
                          <span>{article.category}</span>
                          <span className="text-[#EAE7E1]">|</span>
                          <span className="flex items-center gap-1 font-light text-[#8B8B8B] font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            {article.date}
                          </span>
                        </div>
                        <h2 className="text-lg font-serif font-light text-[#4A4A4A] group-hover:text-[#6B705C] transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-xs text-[#8B8B8B] leading-relaxed font-light mt-2 line-clamp-2">
                          {article.summary}
                        </p>
                      </div>
                      <div className="pt-4">
                        <button 
                          onClick={() => setSelectedArticle(article)}
                          className="inline-flex items-center text-xs font-bold text-[#CB997E] hover:text-[#6B705C] transition-colors cursor-pointer group/btn"
                        >
                          <span>Đọc tiếp</span>
                          <ArrowRight className="w-4 h-4 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                {filteredArticles.length === 0 && (
                  <div className="bg-white border border-[#EAE7E1] rounded-[24px] p-12 text-center text-[#8B8B8B] font-light font-mono">
                    Chưa cập nhật thông tin tương ứng.
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredArticles.length > 0 && (
                  <div className="flex justify-center items-center gap-2 pt-6">
                    <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-[#EAE7E1] text-[#8B8B8B] hover:bg-[#FDFBF7] transition-colors cursor-pointer" disabled>
                      ←
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#6B705C] text-white text-xs font-bold shadow-xs">
                      1
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-[#EAE7E1] text-[#4A4A4A] hover:bg-[#FDFBF7] text-xs font-semibold cursor-pointer">
                      2
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-[#EAE7E1] text-[#4A4A4A] hover:bg-[#FDFBF7] text-xs font-semibold cursor-pointer">
                      3
                    </button>
                    <span className="text-[#8B8B8B] text-sm px-1">...</span>
                    <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-[#EAE7E1] text-[#4A4A4A] hover:bg-[#FDFBF7] text-xs font-semibold cursor-pointer">
                      5
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-[#EAE7E1] text-[#4A4A4A] hover:bg-[#FDFBF7] transition-colors cursor-pointer">
                      →
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Sidebar Area */}
          <aside className="space-y-6">
            {/* Category Card selection */}
            <div className="bg-white rounded-[32px] border border-[#EAE7E1] shadow-xs overflow-hidden text-left">
              <div className="p-5 border-b border-[#EAE7E1] bg-[#FDFBF7]">
                <h3 className="font-serif font-light text-[#4A4A4A] text-base">Danh mục bài đăng</h3>
              </div>
              <ul className="flex flex-col text-sm">
                {categories.map((cat) => (
                  <li key={cat.name} className="border-b last:border-none border-[#EAE7E1]">
                    <button
                      onClick={() => { setSelectedCategory(cat.name); setSelectedArticle(null); }}
                      className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#FDFBF7] transition-all cursor-pointer ${
                        selectedCategory === cat.name 
                          ? 'text-[#6B705C] font-bold bg-[#8B9178]/10' 
                          : 'text-[#4A4A4A] font-light'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-4 h-4 text-[#8B8B8B]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter form card */}
            <div className="bg-[#8B9178] rounded-[32px] p-6 text-white relative overflow-hidden shadow-xs">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-serif font-light text-lg leading-tight text-white">Đăng ký nhận tin KTX</h3>
                <p className="text-xs text-white/90 leading-relaxed font-light">
                  Nhận tin tức khẩn cấp, cập nhật lịch cắt điện nước định kỳ tự động và các hoạt động văn nghệ thể thao hấp dẫn.
                </p>
                
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input 
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Điền hòm thư của bạn..."
                    className="w-full bg-white text-[#4A4A4A] rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#CB997E]/45 placeholder:text-slate-400"
                  />
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-full border border-white text-white text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span>Linh hoạt Đăng ký</span>
                  </button>
                </form>

                {subscribeStatus === 'success' && (
                  <div className="bg-[#6B705C] text-white rounded-xl p-2.5 text-[11px] text-center font-bold flex items-center justify-center gap-1">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Chúng tôi đã lưu lại đăng ký của bạn!</span>
                  </div>
                )}
                {subscribeStatus === 'error' && (
                  <div className="bg-[#CB997E] text-white rounded-xl p-2.5 text-[11px] text-center font-bold flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-200" />
                    <span>Lỗi: Vui lòng điền đúng định dạng email!</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

        </div>
      </section>
    </div>
  );
}
