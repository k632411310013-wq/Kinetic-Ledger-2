import { motion } from "motion/react";
import { Bell, Info, TriangleAlert, TrendingUp, Lightbulb, Filter, CheckCheck } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function Notifications() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Trung Tâm Thông Báo</h2>
          <p className="text-on-surface-variant text-lg mt-1">4 cảnh báo ưu tiên mới cần bạn chú ý.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-white/5">
             Đánh Dấu Đã Đọc Tất Cả
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-white/5">
             <Filter size={14} /> Lọc
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {/* Critical Warning */}
        <motion.article 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel relative overflow-hidden rounded-xl border-l-4 border-l-error border-y-white/10 border-r-white/10 bg-error-container/5 p-8 transition-all hover:bg-error-container/10 group"
        >
          <div className="absolute -right-24 -top-24 h-48 w-48 bg-error/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-6">
             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error/10 border border-error/20 text-error">
                <TriangleAlert size={24} fill="currentColor" fillOpacity={0.2} />
             </div>
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <span className="rounded bg-error/20 px-2 py-0.5 text-[10px] font-black uppercase text-error tracking-tighter">Cảnh Báo Quan Trọng</span>
                   <span className="text-[10px] font-bold text-on-surface-variant">10 phút trước</span>
                </div>
                <h3 className="text-xl font-black mb-2">Cảnh báo chi tiêu vượt mức</h3>
                <p className="text-on-surface-variant max-w-2xl leading-relaxed">
                   Chi tiêu tùy ý của bạn trong danh mục 'Du lịch & Giải trí' đã vượt quá mức cơ sở hàng tháng dự kiến 32%. Có thể cần cân bằng lại tài sản thanh khoản nếu xu hướng này tiếp tục.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-6">
                   <button className="rounded-lg bg-primary-container px-6 py-2.5 text-xs font-black text-white shadow-xl shadow-primary-container/20 hover:brightness-110 transition-all uppercase">
                      Xem ngân sách
                   </button>
                   <button className="rounded-lg border border-primary-container px-6 py-2 text-xs font-black text-primary-container hover:bg-primary-container/10 transition-all uppercase">
                      Bỏ qua
                   </button>
                </div>
             </div>
          </div>
        </motion.article>

        {/* Regular Alerts */}
        {[
          { 
            icon: Info, 
            type: "Rủi Ro Thanh Khoản", 
            time: "2 giờ trước", 
            title: "Cảnh báo tiết kiệm thấp", 
            desc: "Quỹ tiền mặt dự phòng của bạn đã giảm xuống dưới ngưỡng mục tiêu $50,000 sau thương vụ mua bất động sản gần đây. Cân nhắc bắt đầu chuyển khoản từ các tài khoản giữ không chiến lược.",
            action: "Bắt đầu chuyển khoản",
            color: "text-primary"
          },
          { 
            icon: TrendingUp, 
            type: "Cơ Hội Thị Trường", 
            time: "Hôm qua", 
            title: "Gợi ý đầu tư: Kim loại quý", 
            desc: "Vàng hiện đang bị định giá thấp. Phân tích thuật toán chỉ ra xác suất 94% giá sẽ điều chỉnh tăng trong thời gian tới dựa trên các chỉ số kinh tế vĩ mô hiện tại.",
            action: "Xem phân tích",
            color: "text-primary",
            subpanel: "Vàng hiện đang bị định giá thấp"
          },
          { 
            icon: Lightbulb, 
            type: "Hiểu Biết Hành Vi", 
            time: "Hôm qua", 
            title: "Phát hiện bất thường trong chi tiêu", 
            desc: "Bạn đã chi tiêu nhiều hơn 20% cho các quán cà phê trong tuần này so với mức trung bình 6 tháng qua của mình. Mặc dù nhỏ về giá trị tuyệt đối, các chi phí nhỏ cộng dồn có thể tạo ra lực cản.",
            action: "Xem phân tích",
            color: "text-primary"
          },
        ].map((alert, i) => (
          <motion.article 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-xl p-8 transition-all hover:bg-surface-container-high group"
          >
            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-highest border border-white/5 text-primary group-hover:border-primary/30 transition-colors">
                  <alert.icon size={24} />
               </div>
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="rounded bg-surface-variant px-2 py-0.5 text-[10px] font-black uppercase text-on-surface-variant tracking-tighter">{alert.type}</span>
                     <span className="text-[10px] font-bold text-on-surface-variant">{alert.time}</span>
                  </div>
                  <h3 className="text-xl font-black mb-2">{alert.title}</h3>
                  
                  {alert.subpanel && (
                    <div className="bg-surface-container-lowest border border-white/5 rounded-lg p-5 mb-4 mt-4 max-w-2xl flex items-center gap-4">
                       <div className="h-10 w-1 bg-primary rounded-full shadow-lg shadow-primary/20" />
                       <div>
                          <p className="text-sm font-bold mb-1">{alert.subpanel}</p>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{alert.desc}</p>
                       </div>
                    </div>
                  )}
                  
                  {!alert.subpanel && (
                    <p className="text-on-surface-variant max-w-2xl leading-relaxed mb-6">{alert.desc}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                     <button className="rounded-lg border border-primary px-6 py-2 text-xs font-black text-primary hover:bg-primary/10 transition-all uppercase">
                        {alert.action}
                     </button>
                     {i === 1 && (
                       <button className="text-[10px] font-black uppercase text-on-surface-variant hover:text-on-surface transition-colors">
                          Bỏ qua
                       </button>
                     )}
                  </div>
               </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
