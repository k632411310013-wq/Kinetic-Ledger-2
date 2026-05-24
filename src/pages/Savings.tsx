import { motion } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Plus, PiggyBank, Target, Home, Car, HeartPulse, ArrowUp, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useStore } from "../store/useStore";

const iconMap: Record<string, any> = {
  HeartPulse,
  Car,
  Home,
  Target
};

const savingsProgressData = [
  { month: "Thg 1", progress: 10 },
  { month: "Thg 2", progress: 15 },
  { month: "Thg 3", progress: 30 },
  { month: "Thg 4", progress: 35 },
  { month: "Thg 5", progress: 50 },
  { month: "Thg 6", progress: 60 },
  { month: "Thg 7", progress: 75 },
  { month: "Thg 8", progress: 85 },
];

export default function Savings() {
  const { goals, transactions } = useStore();
  
  // Calculate total savings contribution this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlySavings = transactions
    .filter(t => t.type === 'expense' && t.category === 'Tiết kiệm' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Mục Tiêu Tiết Kiệm</h2>
          <p className="text-on-surface-variant mt-1">Theo dõi các cột mốc tài chính và phân bổ thanh khoản.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-black uppercase text-white shadow-xl shadow-primary/30 hover:brightness-110 active:translate-y-0.5 transition-all">
          <Plus size={16} /> Mục tiêu mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Goal Cards Row */}
        <div className="col-span-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {goals.map((goal, i) => {
            const Icon = iconMap[goal.icon] || Target;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-xl p-6 transition-all hover:bg-surface-container-high group"
              >
                {goal.glow && <div className="absolute -right-24 -top-24 h-48 w-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10" />}
                
                <div className="relative z-10 flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container border border-white/5">
                        <Icon size={20} className="text-on-surface" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{goal.label}</span>
                   </div>
                   <span className={cn(
                     "px-2 py-1 text-[10px] font-bold rounded border",
                     goal.status === 'Đúng lộ trình' ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : 
                     goal.status === 'Tăng tốc' ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-on-surface-variant border-white/10"
                   )}>{goal.status}</span>
                </div>

                <div className="relative z-10">
                   <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black tracking-tight">{goal.current.toLocaleString("vi-VN")} ₫</span>
                      <span className="text-[10px] font-bold text-on-surface-variant">/ {goal.target.toLocaleString("vi-VN")} ₫</span>
                   </div>
                </div>

                <div className="relative z-10 space-y-2 mt-4 pt-4 border-t border-white/5">
                   <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                      <span>{goal.progress}% Hoàn thành</span>
                      <span>Mục tiêu: {goal.deadline}</span>
                   </div>
                   <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={cn(
                          "h-full rounded-full transition-all relative",
                          goal.color === 'primary' ? "bg-primary shadow-[0_0_10px_rgba(255,77,77,0.5)]" : "bg-secondary opacity-60"
                        )}
                      />
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Analytics Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel col-span-12 lg:col-span-8 rounded-xl p-8 flex flex-col min-h-[400px]"
        >
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-lg font-bold">Tiến độ hoàn thành mục tiêu</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tổng tiến độ theo thời gian</p>
             </div>
             <div className="flex gap-1 rounded-lg bg-surface-container-highest p-1 border border-white/5">
                {['1T', '3T', 'Năm nay', 'Tất cả'].map(t => (
                  <button key={t} className={cn(
                    "px-3 py-1 text-xs font-bold rounded transition-all",
                    t === 'Năm nay' ? "bg-surface border border-white/10 text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  )}>{t}</button>
                ))}
             </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={savingsProgressData}>
                  <defs>
                    <linearGradient id="saveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: 'none' }}
                    formatter={(value: any) => [`${value}% hoàn thành`, 'Tiến độ']}
                  />
                  <Area type="monotone" dataKey="progress" stroke="var(--color-primary)" fill="url(#saveGrad)" strokeWidth={2} />
               </AreaChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-bold text-on-surface-variant/50 pt-4 border-t border-white/5">
               {savingsProgressData.map(d => <span key={d.month}>{d.month}</span>)}
            </div>
          </div>
        </motion.div>

        {/* Monthly Allocation */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel col-span-12 lg:col-span-4 rounded-xl p-8 flex flex-col"
        >
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
             <div>
                <h3 className="text-xl font-bold">Phân bổ hàng tháng</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tháng 8 2024</p>
             </div>
             <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-primary">
                <Calendar size={18} />
             </div>
          </div>
          
          <div className="mb-8">
             <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Tổng tiền gửi trong tháng</p>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{monthlySavings.toLocaleString("vi-VN")} ₫</span>
                <span className="flex items-center gap-1 rounded bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  <ArrowUp size={10} /> {(monthlySavings / 100000000 * 10).toFixed(0)}%
                </span>
             </div>
          </div>

          <div className="flex-1 space-y-6">
             {[
               { label: "Quỹ khẩn cấp", amount: "15,000,000 ₫", weight: 50, color: "bg-primary" },
               { label: "Đặt cọc mua nhà", amount: "25,000,000 ₫", weight: 25, color: "bg-primary" },
               { label: "Mua xe mới", amount: "5,000,000 ₫", weight: 20, color: "bg-secondary" },
               { label: "Tiết kiệm chung", amount: "5,000,000 ₫", weight: 5, color: "bg-on-surface-variant" },
             ].map((item, i) => (
               <div key={i} className="group">
                  <div className="flex justify-between items-center mb-2">
                     <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", item.color)} />
                        <span className="text-sm font-medium">{item.label}</span>
                     </div>
                     <span className="text-sm font-black text-on-surface">{item.amount}</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.weight}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={cn("h-full rounded-full transition-opacity opacity-80 group-hover:opacity-100", item.color)} 
                      />
                  </div>
               </div>
             ))}
          </div>

          <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-primary py-3 text-xs font-black uppercase text-primary transition-all hover:bg-primary/5">
             <Sparkles size={16} /> Tối ưu hóa phân bổ
          </button>
        </motion.div>
      </div>
    </div>
  );
}
