import { useState } from "react";
import { motion } from "motion/react";
import { User, Bell, Shield, SlidersHorizontal, Camera, ChevronRight, Globe, Moon, Sun, Smartphone, RotateCcw } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useStore } from "../store/useStore";

export default function Settings() {
  const { resetStore } = useStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetStore();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      <header className="mb-12">
        <h2 className="text-4xl font-bold tracking-tight text-on-surface">Cài Đặt Tài Khoản</h2>
        <p className="text-on-surface-variant text-lg mt-2">Quản lý thông tin cá nhân, tùy chọn bảo mật và cấu hình ứng dụng.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
         {/* Navigation */}
         <nav className="hidden lg:block lg:col-span-3 space-y-2">
            {[
              { label: "Hồ sơ", icon: User, active: true },
              { label: "Tùy chỉnh", icon: SlidersHorizontal },
              { label: "Thông báo", icon: Bell },
              { label: "Bảo mật", icon: Shield },
            ].map((item, i) => (
              <button key={i} className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                item.active ? "bg-surface-container-high text-primary border-l-4 border-primary" : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              )}>
                 <item.icon size={18} /> {item.label}
              </button>
            ))}
         </nav>

         {/* Content */}
         <div className="lg:col-span-9 space-y-8">
            {/* Profile Section */}
            <motion.section 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-panel rounded-2xl p-8"
            >
               <h3 className="text-2xl font-black mb-8 border-b border-white/5 pb-4 flex items-center gap-3">
                  <User className="text-primary" /> Thông Tin Hồ Sơ
               </h3>
               
               <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="flex flex-col items-center gap-4 shrink-0">
                     <div className="relative group cursor-pointer h-28 w-28">
                        <img 
                           src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFf0lsfm3zwagx1-UWYXwGzvZ0BsYHoEfPym1zL-D6g4EdCEaSdO9vm32IafzSzmD_ZrE4UaJEQK35-K-Tds_7I1QtAlzpg9kqAE_zJ85J8bQaMfMf92pjApGUUSgEbD-Viu9Jll5uKLwiDt8AI961PXVv9pEeZvzx3b-auSiuSAEmcTra84208VDY-09gipTq2dSKYQ2a691iNBBh0KHULijF_jOvzUY_1RdooRDRKqbsl3ytLGtPsORwGuR-RNDwTN5qQTPthA3e" 
                           className="h-full w-full rounded-2xl object-cover border-2 border-white/10 group-hover:border-primary transition-all duration-300 shadow-2xl" 
                           alt="Profile"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center">
                           <Camera className="text-white" />
                        </div>
                     </div>
                     <button className="text-xs font-black uppercase text-primary hover:text-primary-container transition-colors tracking-widest">Đổi Ảnh</button>
                  </div>

                  <div className="flex-1 w-full space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Họ và tên</label>
                           <input type="text" defaultValue="Alex Mercer" className="w-full rounded-xl bg-[#05070a] border border-[#2d333b] p-4 text-sm font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Địa chỉ Email</label>
                           <input type="email" defaultValue="alex.mercer@ftu.com" className="w-full rounded-xl bg-[#05070a] border border-[#2d333b] p-4 text-sm font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tiểu sử / Chức vụ</label>
                           <input type="text" defaultValue="Chuyên viên Phân tích Định lượng Cấp cao" className="w-full rounded-xl bg-[#05070a] border border-[#2d333b] p-4 text-sm font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" />
                        </div>
                     </div>
                     <div className="flex justify-end pt-4">
                        <button className="bg-primary-container text-white px-8 py-3 rounded-xl text-sm font-black uppercase shadow-2xl shadow-primary-container/30 hover:brightness-110 active:scale-95 transition-all">
                           Lưu hồ sơ
                        </button>
                     </div>
                  </div>
               </div>
            </motion.section>

            {/* Customization Section */}
            <motion.section 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="glass-panel rounded-2xl p-8"
            >
               <h3 className="text-2xl font-black mb-8 border-b border-white/5 pb-4 flex items-center gap-3">
                  <SlidersHorizontal className="text-primary" /> Tùy Chỉnh Ứng Dụng
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <div>
                        <h4 className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
                          <Globe size={16} /> Tiền tệ cơ bản
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-1">Chọn loại tiền tệ chính cho tổng quan danh mục.</p>
                     </div>
                     <div className="relative">
                        <select className="w-full appearance-none rounded-xl bg-[#05070a] border border-[#2d333b] p-4 pr-10 text-sm font-bold focus:border-primary focus:outline-none">
                           <option value="VND" selected>VNĐ - Đồng Việt Nam</option>
                           <option value="USD">USD - Đô la Mỹ</option>
                           <option value="EUR">EUR - Euro</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-on-surface-variant pointer-events-none" size={18} />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <h4 className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
                           <Moon size={16} /> Giao diện hệ thống
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-1">Tùy chỉnh giao diện trực quan của ứng dụng.</p>
                     </div>
                     <div className="flex bg-[#05070a] border border-[#2d333b] rounded-xl p-1">
                        {[
                          { label: "Sáng", icon: Sun },
                          { label: "Tối", icon: Moon, active: true },
                          { label: "Tự động", icon: Smartphone },
                        ].map((mode, idx) => (
                          <button key={idx} className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all",
                            mode.active ? "bg-surface-variant text-on-surface shadow-xl border border-white/5" : "text-on-surface-variant hover:text-on-surface"
                          )}>
                             <mode.icon size={14} /> {mode.label}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
               
               <div className="flex justify-end mt-12 pt-8 border-t border-white/5">
                  <button className="bg-primary-container text-white px-8 py-3 rounded-xl text-sm font-black uppercase shadow-2xl shadow-primary-container/30 hover:brightness-110 active:scale-95 transition-all">
                     Lưu Tùy Chỉnh
                  </button>
               </div>
            </motion.section>

            {/* Data Settings Section */}
            <motion.section 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="glass-panel rounded-2xl p-8 border border-vibrant-red/10 mt-8"
            >
               <h3 className="text-2xl font-black mb-4 flex items-center gap-3 text-on-surface">
                  <RotateCcw className="text-vibrant-red" /> Quản Lý Dữ Liệu Demo
               </h3>
               <p className="text-sm text-on-surface-variant mb-6">
                  Vui lòng sử dụng tính năng này để cài lại toàn bộ dữ liệu tài sản, giao dịch về mức mặc định chuẩn <strong>(từ chục triệu đến trăm triệu VNĐ)</strong> nếu số liệu tài sản hiện tại trên trình duyệt quá cao hoặc bị xung đột.
               </p>

               <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 mb-8">
                  <h4 className="text-xs font-black uppercase text-vibrant-red mb-2">Cảnh báo hành động</h4>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                     Hành động này sẽ xóa sạch nhật ký giao dịch hiển thị, đặt lại điểm danh mục cổ phiếu về mức thực tế ban đầu và khôi phục quỹ dự phòng. Thao tác này KHÔNG THỂ hoàn tác một khi đã áp dụng.
                  </p>
               </div>

               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
                  <div className="text-left w-full sm:w-auto flex items-center">
                     {resetSuccess ? (
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/10">
                           ✓ Cài lại số liệu thành công
                        </span>
                     ) : (
                        <span className="text-xs text-on-surface-variant font-bold">Trạng thái: Hoạt động bình thường</span>
                     )}
                  </div>
                  <button 
                     onClick={handleReset}
                     className="w-full sm:w-auto bg-vibrant-red/10 hover:bg-vibrant-red text-vibrant-red hover:text-white border border-vibrant-red/30 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                     Cài lại số liệu mặc định
                  </button>
               </div>
            </motion.section>
         </div>
      </div>
    </div>
  );
}
