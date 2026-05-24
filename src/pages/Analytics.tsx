import { motion } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useStore } from "../store/useStore";
import { Info, Download, ArrowUp, Zap, Building, Smartphone, Map } from "lucide-react";
import { cn } from "@/src/lib/utils";

const vsIndexData = [
  { day: 0, portfolio: 60, index: 75 },
  { day: 20, portfolio: 45, index: 65 },
  { day: 40, portfolio: 55, index: 70 },
  { day: 60, portfolio: 35, index: 55 },
  { day: 80, portfolio: 65, index: 45 },
  { day: 100, portfolio: 20, index: 40 },
];

export default function Analytics() {
  const { allocation, stocks, transactions } = useStore();

  const stockValue = stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  const totalValue = allocation.cash + stockValue + allocation.savings + allocation.gold + allocation.usd;
  
  // Health score logic (simplified)
  // Low debt, good savings rate, diversified assets = high score
  const cashInflow = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const cashOutflow = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = cashInflow > 0 ? ((cashInflow - cashOutflow) / cashInflow) * 100 : 0;
  
  const healthScore = Math.min(Math.max(60 + (savingsRate * 0.5), 0), 98).toFixed(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <h2 className="text-4xl font-bold tracking-tight text-on-surface">Phân Tích Tài Chính</h2>
           <p className="text-on-surface-variant text-lg">Phân tích hiệu suất đa chiều nâng cao.</p>
        </div>
        <div className="flex bg-surface-container-high rounded-lg p-1 border border-white/5">
           {['Hàng Tháng', 'Hàng Năm', 'Toàn Bộ'].map(t => (
             <button key={t} className={cn(
               "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
               t === 'Hàng Tháng' ? "bg-surface-bright text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
             )}>{t}</button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Health Score */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel col-span-1 lg:col-span-4 rounded-xl p-8 flex flex-col items-center"
        >
           <div className="flex w-full justify-between items-center mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Điểm sức khỏe tài chính</h3>
              <Info size={16} className="text-on-surface-variant" />
           </div>
           
           <div className="relative h-56 w-56 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
                <motion.circle 
                   initial={{ strokeDashoffset: 263.8 }}
                   animate={{ strokeDashoffset: 263.8 * (1 - Number(healthScore)/100) }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   cx="50" cy="50" r="42" fill="transparent" stroke="var(--color-primary)" strokeWidth={8} strokeDasharray={263.8} strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                 <span className="text-6xl font-black tracking-tighter">{healthScore}</span>
                 <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">Xuất Sắc</span>
              </div>
           </div>

           <div className="w-full space-y-3 mt-8">
              {[
                { label: "Tỷ lệ thanh khoản", value: "2.4x" },
                { label: "Nợ trên tài sản", value: "18%" },
                { label: "Tỷ lệ tiết kiệm", value: "+3.2% ↑", color: "text-primary" },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5">
                   <span className="text-xs font-bold text-on-surface-variant">{stat.label}</span>
                   <span className={cn("text-xs font-black", stat.color || "text-on-surface")}>{stat.value}</span>
                </div>
              ))}
           </div>
        </motion.div>

        {/* Portfolio vs Index */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="glass-panel col-span-1 lg:col-span-8 rounded-xl p-8 flex flex-col"
        >
           <div className="flex justify-between items-start mb-8">
              <div>
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Danh mục vs VN-Index</h3>
                 <p className="text-2xl font-black mt-1">+14.2% <span className="text-xs text-primary ml-2">Alpha YTD: 2.1%</span></p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-primary" />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Danh Mục</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-surface-variant" />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">VN-Index</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 w-full bg-surface-container-low/50 rounded-lg border border-white/5 relative overflow-hidden h-[300px]">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #80808012 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={vsIndexData}>
                    <XAxis dataKey="day" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: 'none' }} />
                    <Area type="monotone" dataKey="portfolio" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.1} strokeWidth={3} />
                    <Area type="monotone" dataKey="index" stroke="var(--color-surface-variant)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </motion.div>
      </div>

      {/* Expense Allocation */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="glass-panel rounded-xl p-8"
      >
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div>
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant uppercase">Phân bổ đầu tư cổ phiếu</h3>
               <p className="text-2xl font-black mt-1">{stockValue.toLocaleString("vi-VN")} ₫ <span className="text-xs font-bold text-emerald-400 ml-2 uppercase">Cổ phiếu VN50</span></p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-black text-white shadow-xl shadow-primary/20 hover:brightness-110 transition-all uppercase">
               <Download size={16} /> Xuất Báo Cáo
            </button>
         </div>

         <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {stocks.filter(s => s.quantity > 0).map((item, i) => {
              const weight = stockValue > 0 ? (item.quantity * item.currentPrice / stockValue) * 100 : 0;
              return (
                <div key={i} className="space-y-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <Zap size={16} className="text-on-surface-variant" />
                         <span className="text-xs font-bold">{item.ticker}</span>
                      </div>
                      <span className="text-xs font-black text-on-surface-variant uppercase">{weight.toFixed(0)}%</span>
                   </div>
                   <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${weight}%` }}
                         transition={{ duration: 1, delay: i * 0.1 }}
                         className="h-full rounded-full bg-primary" 
                      />
                   </div>
                   <p className="text-right text-[10px] font-black font-mono text-on-surface">{(item.quantity * item.currentPrice).toLocaleString("vi-VN")} ₫</p>
                </div>
              );
            })}
         </div>
      </motion.div>
    </div>
  );
}
