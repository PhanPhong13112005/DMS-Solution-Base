import React, { useState } from 'react';
import { LogIn, KeyRound, Eye, EyeOff, User, Fingerprint, Sparkles, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

interface AuthViewProps {
  onLoginSuccess: (role: UserRole, userPayload: any) => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Sign up inputs
  const [regName, setRegName] = useState<string>('');
  const [regId, setRegId] = useState<string>('');
  const [regClass, setRegClass] = useState<string>('');
  const [regPass, setRegPass] = useState<string>('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setSuccessMsg('');

    if (isLogin) {
      if (!username || !password) {
        setErrorMsg('Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
        return;
      }

      // Check simulated admin credentials
      if (username.trim() === 'admin' && password === '123456') {
        onLoginSuccess(UserRole.Admin, { name: 'Quản trị viên Trung cấp', id: 'admin-01' });
        return;
      }
      // Check simulated staff credentials
      if (username.trim() === 'nhanvien' && password === '123456') {
        onLoginSuccess(UserRole.Staff, { name: 'Nhân viên trực ban BQL', id: 'staff-01' });
        return;
      }
      // Check simulated student credentials
      if (username.trim() === '1771020536' && password === '123456') {
        onLoginSuccess(UserRole.Student, { 
          name: 'Nguyễn Hữu Hưng', 
          id: '1771020536',
          className: 'K15-CNTT1',
          gender: 'Nam',
          roomNumber: '101-Tòa B',
          bldg: 'Tòa B',
          phone: '0978.112.551',
          email: 'hungnguyen@dainam.edu.vn'
        });
        return;
      }

      // Custom student login check (if registered/signed up)
      const cachedUsers = localStorage.getItem('dnu_registered_students');
      if (cachedUsers) {
        const users = JSON.parse(cachedUsers);
        const match = users.find((u: any) => u.id === username.trim() && u.password === password);
        if (match) {
          onLoginSuccess(UserRole.Student, match);
          return;
        }
      }

      setErrorMsg('Tài khoản hoặc mật khẩu không chính xác! Vui lòng nhấp thử mã gợi ý nhanh ở bên trái.');
    } else {
      // Registrar sign up
      if (!regName || !regId || !regClass || !regPass) {
        setErrorMsg('Vui lòng khai báo đúng đủ tất cả các trường dữ liệu!');
        return;
      }

      const newUser = {
        name: regName,
        id: regId.trim(),
        className: regClass,
        gender: 'Nam',
        roomNumber: 'Chưa xếp phòng',
        phone: '0912.333.444',
        email: regId + '@dainam.edu.vn',
        password: regPass
      };

      const existing = localStorage.getItem('dnu_registered_students');
      const users = existing ? JSON.parse(existing) : [];
      users.push(newUser);
      localStorage.setItem('dnu_registered_students', JSON.stringify(users));

      setSuccessMsg(`Sinh viên ${regName} đăng ký tài khoản thành công! Nhập mật khẩu để đăng nhập ngay.`);
      setUsername(regId);
      setPassword(regPass);
      setIsLogin(true);
    }
  };

  const setCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setIsLogin(true);
    setErrorMsg('');
    setInfoMsg('');
    setSuccessMsg('');
  };

  const handleForgetPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setInfoMsg('Vui lòng liên hệ trực tiếp văn phòng Ban quản lý KTX tại tầng 1 Tòa B9 để được cấp đổi lại mật khẩu!');
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-12 bg-white rounded-[32px] border border-[#EAE7E1] shadow-xl overflow-hidden flex flex-col md:flex-row relative">
      
      {/* Left Column Sage Green Banner Branding */}
      <div className="md:w-5/12 bg-[#6B705C] text-white p-10 flex flex-col justify-between relative overflow-hidden text-left border-r border-[#EAE7E1]">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Fingerprint className="w-80 h-80" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#CB997E]/20 text-[#CB997E] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-[#CB997E]/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>CỔNG THÔNG TIN KÝ TÚC XÁ</span>
          </div>
          <h2 className="text-3xl font-serif font-light text-white leading-tight uppercase tracking-tight">
            DNU <span className="italic font-normal text-[#CB997E]">KTX</span>
          </h2>
          <p className="text-sm font-light text-[#FDFBF7]/90 leading-relaxed mt-3">
            Hệ thống quản lý thông tin nội trú, thanh toán lệ phí trực tuyến, báo cáo kỹ thuật và giữ chỗ phòng ở dành riêng cho cán bộ Ban quản lý và sinh viên Trường Đại học Đại Nam.
          </p>
        </div>

        {/* Quick Credentials shortcut helper */}
        <div className="relative z-10 mt-12 bg-[#5F6352] border border-[#8B9178]/40 p-4 rounded-2xl text-xs space-y-3 shrink-0">
          <div className="font-bold text-white uppercase tracking-widest text-[10px] pb-1 border-b border-white/10">THỬ ĐĂNG NHẬP NHANH</div>
          
          <div className="space-y-2 text-[11px] text-[#FDFBF7]">
            <button 
              onClick={() => setCredentials('1771020536', '123456')}
              className="w-full flex items-center justify-between p-2.5 bg-[#4B4E41]/35 hover:bg-[#4B4E41]/70 rounded-xl transition-all border border-white/5 text-left font-mono"
            >
              <span>Sinh viên: <strong className="text-[#CB997E]">1771020536</strong></span>
              <span className="text-[10px] text-[#FDFBF7]/70 font-sans">Chọn</span>
            </button>

            <button 
              onClick={() => setCredentials('nhanvien', '123456')}
              className="w-full flex items-center justify-between p-2.5 bg-[#4B4E41]/35 hover:bg-[#4B4E41]/70 rounded-xl transition-all border border-white/5 text-left font-mono"
            >
              <span>Nhân viên: <strong className="text-[#CB997E]">nhanvien</strong></span>
              <span className="text-[10px] text-[#FDFBF7]/70 font-sans">Chọn</span>
            </button>

            <button 
              onClick={() => setCredentials('admin', '123456')}
              className="w-full flex items-center justify-between p-2.5 bg-[#4B4E41]/35 hover:bg-[#4B4E41]/70 rounded-xl transition-all border border-white/5 text-left font-mono"
            >
              <span>Quản trị viên: <strong className="text-[#CB997E]">admin</strong></span>
              <span className="text-[10px] text-[#FDFBF7]/70 font-sans">Chọn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column Form block */}
      <div className="md:w-7/12 p-10 flex flex-col justify-center text-left bg-white">
        <div className="max-w-md w-full mx-auto space-y-6">
          
          <div className="flex justify-start border-b border-[#EAE7E1] pb-3 gap-6">
            <button 
              onClick={() => { setIsLogin(true); setErrorMsg(''); setInfoMsg(''); }}
              className={`pb-3 font-serif font-light text-lg transition-all relative cursor-pointer ${isLogin ? 'text-[#4A4A4A]' : 'text-slate-400'}`}
            >
              <span>ĐĂNG NHẬP</span>
              {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CB997E] rounded-full" />}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setErrorMsg(''); setInfoMsg(''); }}
              className={`pb-3 font-serif font-light text-lg transition-all relative cursor-pointer ${!isLogin ? 'text-[#4A4A4A]' : 'text-slate-400'}`}
            >
              <span>ĐĂNG KÝ MỚI</span>
              {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CB997E] rounded-full" />}
            </button>
          </div>

          {/* Error Feedbacks */}
          {errorMsg && (
            <div className="bg-[#CB997E]/15 border border-[#CB997E]/30 text-[#4A4A4A] p-4 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#CB997E] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Feedbacks */}
          {infoMsg && (
            <div className="bg-[#8B9178]/10 border border-[#8B9178]/30 text-[#4A4A4A] p-4 rounded-2xl text-xs flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-[#6B705C] shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Success Feedbacks */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isLogin ? (
              // LOGIN MODE
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A4A4A]">Tài khoản truy cập / Mã sinh viên <span className="text-[#CB997E]">*</span></label>
                  <div className="relative">
                    <User className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#8B8B8B] w-4.5 h-4.5" />
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Mã sinh viên hoặc 'admin' / 'nhanvien'"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl pl-12 pr-4 py-3 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-bold text-[#4A4A4A]">Mật khẩu bảo mật <span className="text-[#CB997E]">*</span></label>
                    <a href="#" onClick={handleForgetPassword} className="text-xs text-[#CB997E] hover:underline">Quên mật khẩu?</a>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#8B8B8B] w-4.5 h-4.5" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="**********"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl pl-12 pr-12 py-3 text-sm outline-none transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#4A4A4A] cursor-pointer text-xs"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-semibold rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
                >
                  <span>Xác minh tài khoản</span>
                  <LogIn className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              // SIGN UP MODE
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A4A4A]">Họ và tên tên sinh viên <span className="text-[#CB997E]">*</span></label>
                  <input 
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn B"
                    className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Mã sinh viên <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="text"
                      required
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                      placeholder="DNU201089"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#4A4A4A]">Lớp sinh hoạt <span className="text-[#CB997E]">*</span></label>
                    <input 
                      type="text"
                      required
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                      placeholder="K16-KT"
                      className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A4A4A]">Mật khẩu truy cập <span className="text-[#CB997E]">*</span></label>
                  <input 
                    type="password"
                    required
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Đặt ít nhất 6 ký tự"
                    className="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#CB997E] hover:bg-[#b07f66] text-white font-semibold rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
                >
                  <span>Đăng ký thành viên</span>
                </button>
              </div>
            )}
          </form>

        </div>
      </div>

    </div>
  );
}
