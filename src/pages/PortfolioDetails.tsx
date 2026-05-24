import React from "react";
import { motion } from "motion/react";
import { 
  Building, Wallet, PiggyBank, Coins, DollarSign, TrendingUp, 
  ArrowUpRight, ArrowDownRight, PieChart as PieIcon, ShieldCheck, 
  Zap, ArrowRight, Download, Filter, Activity
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

const targetAllocationData = [
  { name: "Cổ phiếu", value: 50, color: "var(--color-primary)", description: "Danh mục 5 mã cổ phiếu VN50 cân bằng." },
  { name: "Tiền mặt", value: 20, color: "var(--color-secondary)", description: "Thanh khoản sẵn sàng cho cơ hội mới." },
  { name: "Tiết kiệm", value: 10, color: "var(--color-tertiary)", description: "Gửi tiết kiệm ngân hàng lãi suất cố định." },
  { name: "Vàng", value: 10, color: "#d4af37", description: "Vàng miếng SJC bảo an tài sản." },
  { name: "Dự trữ USD", value: 10, color: "#22c55e", description: "Dự trữ ngoại tệ phòng ngừa tỷ giá." },
];

const stockBreakdown = [
  { id: "FPT", name: "FPT Corp", weight: 10 },
  { id: "MWG", name: "Thế Giới Di Động", weight: 10 },
  { id: "VCB", name: "Vietcombank", weight: 10 },
  { id: "HPG", name: "Hòa Phát", weight: 10 },
  { id: "VNM", name: "Vinamilk", weight: 10 },
];

export default function PortfolioDetails() {
  const navigate = useNavigate();
  const { allocation, stocks } = useStore();

  const stockValue = stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  const totalValue = allocation.cash + stockValue + allocation.savings + allocation.gold + allocation.usd;

  const dynamicHistory = [
    { month: "T1", value: 91000000 },
    { month: "T2", value: 92500000 },
    { month: "T3", value: 93800000 },
    { month: "T4", value: 96200000 },
    { month: "T5", value: totalValue },
  ];

  const pcStock = parseFloat(((stockValue / totalValue) * 100).toFixed(1));
  const pcCash = parseFloat(((allocation.cash / totalValue) * 100).toFixed(1));
  const pcSavings = parseFloat(((allocation.savings / totalValue) * 100).toFixed(1));
  const pcGold = parseFloat(((allocation.gold / totalValue) * 100).toFixed(1));
  const pcUsd = parseFloat(((allocation.usd / totalValue) * 100).toFixed(1));

  const displayAllocationData = [
    { name: "Cổ phiếu", value: pcStock, color: "var(--color-primary)", description: "Danh mục 5 mã cổ phiếu VN50 cân bằng." },
    { name: "Tiền mặt", value: pcCash, color: "var(--color-secondary)", description: "Thanh khoản sẵn sàng cho cơ hội mới." },
    { name: "Tiết kiệm", value: pcSavings, color: "var(--color-tertiary)", description: "Gửi tiết kiệm ngân hàng lãi suất cố định." },
    { name: "Vàng", value: pcGold, color: "#d4af37", description: "Vàng miếng SJC bảo an tài sản." },
    { name: "Dự trữ USD", value: pcUsd, color: "#22c55e", description: "Dự trữ ngoại tệ phòng ngừa tỷ giá." },
  ];

  // Automated recommendations based on comparison of actual vs target values
  const recommendations = [];
  if (pcStock < 50) {
    recommendations.push("Khuyến nghị tăng đầu tư cổ phiếu trong tháng tới nhằm bám sát mục tiêu 50% cổ phiếu dài hạn.");
  } else if (pcStock > 55) {
    recommendations.push("Tỷ trọng cổ phiếu hiện vượt mức mục tiêu 50%. Quý khách có thể tái cấu trúc chốt lời sang các lớp tài sản ít biến động hơn.");
  }

  if (pcCash < 20) {
    recommendations.push("Khuyến nghị tích trữ thêm quỹ tiền mặt thanh khoản nhằm đảm bảo sức mua dự bị cho mùa cơ hội mới.");
  } else if (pcCash > 25) {
    recommendations.push("Tỷ số thanh khoản nhàn rỗi đang cao hơn khuyến nghị (20%). Hãy giải ngân thêm vào các tài sản sinh lời để tránh lạm phát bào mòn.");
  }

  if (pcSavings < 10) {
    recommendations.push("Khuyến nghị trích khoản thu nhập tháng tới bổ sung rổ tiết kiệm ngân hàng cố định để củng cố tấm khiên phòng thủ.");
  }

  if (pcGold < 10) {
    recommendations.push("Khuyến nghị tích lũy thêm Vàng miếng SJC để đạt mục tiêu an toàn tài sản 10% phòng vệ biến động tài khóa.");
  }

  if (pcUsd < 10) {
    recommendations.push("Khuyến nghị phân phối thu nhập tiếp theo mua thêm dự trữ ngoại tế USD giảm thiểu rủi ro tỷ giá tiền tệ nội địa.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Chúc mừng! Danh mục của bạn hoàn hảo trùng khớp với tỷ lệ định hướng mục tiêu đề ra.");
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-on-surface">Chi Tiết Danh Mục</h2>
          <p className="text-on-surface-variant text-base">Phân tích toàn diện và quản trị so sánh giữa tỷ lệ mục tiêu tài khóa dài hạn và tình trạng hiện kim thực tế.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-white/5 bg-surface-container px-6 py-3 text-xs font-black uppercase tracking-widest text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface">
            <Filter size={16} /> Lọc dữ liệu
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95">
            <Download size={16} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* SECTION 1: PHÂN BỔ KỲ VỌNG */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-2xl font-black text-on-surface flex items-center gap-2">
              <span className="text-primary font-black">◆</span> Phân Bổ Kỳ Vọng (Target Allocation)
            </h3>
            <p className="text-xs text-on-surface-variant font-semibold mt-0.5">Chiến lược tích lũy dài hạn và mô hình tỷ lệ định hướng đề xuất</p>
          </div>
          <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded self-start sm:self-auto">Chiến lược đầu tư</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 animate-fade-in">
          {/* Chart Card */}
          <div className="glass-panel col-span-1 lg:col-span-5 rounded-3xl p-8 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PieIcon size={20} />
               </div>
               <h4 className="text-lg font-black tracking-tight">Cơ cấu chiến lược</h4>
            </div>
            
            <div className="flex-1 min-h-[280px] relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={targetAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {targetAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: 'none', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--color-on-surface)' }}
                      formatter={(value: any) => [`${value}%`, 'Tỷ trọng kỳ vọng']}
                    />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                  <span className="text-3xl font-black tracking-tighter text-on-surface">100%</span>
                  <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest">Kỳ Vọng</span>
               </div>
            </div>
          </div>

          {/* Table Card (ONLY asset names and target percentages) */}
          <div className="glass-panel col-span-1 lg:col-span-7 rounded-3xl p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" /> Bảng Tỷ Lệ Phân Bổ Kỳ Vọng (Mục Tiêu)
              </h4>
              <p className="text-xs text-on-surface-variant font-semibold">Tỷ lệ phân phối chuẩn tối ưu hướng tới kế hoạch tích lũy dài hạn. Không bao gồm giá trị tài sản thực tế.</p>
              
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#05070a] mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container/30 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">
                      <th className="p-4">Lớp tài sản (Asset)</th>
                      <th className="p-4 text-right">Tỷ lệ mục tiêu (Target Allocation)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-bold text-on-surface">
                    {targetAllocationData.map((asset) => (
                      <tr key={asset.name} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-2.5">
                          <div className="h-3 w-3 rounded-full border border-white/10" style={{ backgroundColor: asset.color }} />
                          <span className="font-extrabold text-[#e2e8f0]">{asset.name === "Dự trữ USD" ? "USD Reserve" : asset.name}</span>
                        </td>
                        <td className="p-4 text-right font-black font-mono text-primary text-sm">
                          {asset.value}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-on-surface-variant font-medium leading-relaxed italic">
              * Tỷ lệ kỳ vọng phản ánh chiến lược phân phối tài nguyên định hướng để đạt được sự tối ưu hóa danh mục, hoàn toàn độc lập với sự chuyển động tài sản hiện hữu.
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: PHÂN BỔ THỰC TẾ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 pt-8 border-t border-white/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-2xl font-black text-on-surface flex items-center gap-2">
              <span className="text-secondary font-black">◆</span> Phân Bổ Thực Tế
            </h3>
            <p className="text-xs text-on-surface-variant font-semibold mt-0.5">Quản lý dòng vốn và tính tỉ trọng dựa trên giá trị tài sản ròng thực tế</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded self-start sm:self-auto">Thời gian thực</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Chart Card */}
          <div className="glass-panel col-span-1 lg:col-span-5 rounded-3xl p-8 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <PieIcon size={20} />
               </div>
               <h4 className="text-lg font-black tracking-tight">Tỉ trọng thực tế</h4>
            </div>
            
            <div className="flex-1 min-h-[320px] relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={125}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                      onClick={(data) => {
                        if (data.name === "Cổ phiếu") navigate("/stocks");
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {displayAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: 'none', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--color-on-surface)' }}
                      formatter={(value: any) => [`${value}%`, 'Thực tế']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] font-black uppercase text-on-surface-variant">{value}</span>}
                    />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                  <span className="text-3xl font-black tracking-tighter">100%</span>
                  <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest">Hiện Kim</span>
               </div>
            </div>
          </div>

          {/* Cards Column */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {displayAllocationData.map((asset, i) => (
                 <div 
                   key={i}
                   className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:bg-surface-container-high transition-all group"
                 >
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface-container-highest border border-white/5">
                             {asset.name === "Cổ phiếu" && <Building size={20} className="text-primary" />}
                             {asset.name === "Tiền mặt" && <Wallet size={20} className="text-secondary" />}
                             {asset.name === "Tiết kiệm" && <PiggyBank size={20} className="text-tertiary" />}
                             {asset.name === "Vàng" && <Coins size={20} className="text-yellow-500" />}
                             {asset.name === "Dự trữ USD" && <DollarSign size={20} className="text-emerald-500" />}
                          </div>
                          <div>
                             <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{asset.name}</h5>
                             <p className="text-lg font-black tracking-tight">{asset.value}% Thực tế</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/5">
                       <p className="text-[10px] text-on-surface-variant font-bold leading-relaxed mb-4">
                          {asset.description}
                       </p>
                       <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tổng số dư thời điểm</span>
                          <span className="text-xs font-black font-mono">
                            {asset.name === "Cổ phiếu" ? stockValue.toLocaleString("vi-VN") : 
                             asset.name === "Tiền mặt" ? allocation.cash.toLocaleString("vi-VN") :
                             asset.name === "Tiết kiệm" ? allocation.savings.toLocaleString("vi-VN") :
                             asset.name === "Vàng" ? allocation.gold.toLocaleString("vi-VN") :
                             allocation.usd.toLocaleString("vi-VN")} ₫
                          </span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Diversification Insight */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-emerald-500 bg-emerald-500/5">
               <div className="flex items-start gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                     <ShieldCheck size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black mb-1">Đa dạng hóa rổ tài sản thực</h3>
                     <p className="text-sm text-on-surface-variant leading-relaxed font-semibold">
                        Hệ thống đang hiển thị phân bổ thực tế tự động dựa trên tổng số dư số tài khoản, các quyết quyết định đầu tư tháng cũng như chuyển ví định kỳ từ công cụ phân bổ thu nhập.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 3: COMPARISON TABLE AND AUTOMATIC RECOMMENDATION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 space-y-8"
      >
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <span className="text-primary font-black">◆</span> Bảng So Khớp Phân Bổ & Khuyến Nghị
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-1">So sánh khách quan nhằm tái cân bằng các rổ tích lũy thông minh</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Table */}
           <div className="lg:col-span-7 overflow-x-auto rounded-2xl border border-white/5 bg-[#05070a]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container/30 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">
                    <th className="p-4 text-left">Lớp tài sản (Asset)</th>
                    <th className="p-4 text-center">Tỷ lệ mục tiêu</th>
                    <th className="p-4 text-center">Tỷ lệ thực tế</th>
                    <th className="p-4 text-right">Chênh lệch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-bold text-on-surface">
                  {[
                    { name: "Cổ phiếu", target: 50, actual: pcStock, color: "var(--color-primary)" },
                    { name: "Tiền mặt", target: 20, actual: pcCash, color: "var(--color-secondary)" },
                    { name: "Tiết kiệm", target: 10, actual: pcSavings, color: "var(--color-tertiary)" },
                    { name: "Vàng", target: 10, actual: pcGold, color: "#d4af37" },
                    { name: "Dự trữ USD", target: 10, actual: pcUsd, color: "#22c55e" },
                  ].map((item) => {
                    const diff = item.actual - item.target;
                    return (
                      <tr key={item.name} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-on-surface">{item.name}</span>
                        </td>
                        <td className="p-4 text-center text-[#94a3b8] font-semibold">{item.target}%</td>
                        <td className="p-4 text-center text-on-surface font-extrabold">{item.actual.toFixed(1)}%</td>
                        <td className={cn(
                          "p-4 text-right font-black font-mono",
                          Math.abs(diff) < 0.1 ? "text-[#94a3b8]" : diff > 0 ? "text-emerald-400" : "text-vibrant-red"
                        )}>
                          {diff >= 0 ? "+" : ""}{diff.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>

           {/* Recommendations System */}
           <div className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#9ca3af]">Lời khuyên hành động tự động</h4>
              <div className="space-y-3">
                 {recommendations.map((rec, i) => (
                   <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/15 relative overflow-hidden flex gap-3 items-start">
                     <span className="text-primary font-black mt-0.5">•</span>
                     <p className="text-xs text-[#cbd5e1] font-semibold leading-relaxed">{rec}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </motion.div>

      {/* Performance History Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8"
      >
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
               <Activity className="text-primary" /> Hiệu suất Portfolio (6 tháng)
            </h3>
            <div className="flex gap-4">
               <div className="text-right">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Lợi nhuận ròng</p>
                  <p className="text-lg font-black text-emerald-400">+12.9%</p>
               </div>
            </div>
         </div>
         <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={dynamicHistory}>
                  <defs>
                     <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontWeight: 700 }} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: 'none', borderRadius: '12px' }}
                     formatter={(value: any) => [`${value.toLocaleString("vi-VN")} ₫`, 'Giá trị']}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fill="url(#colorPerf)" strokeWidth={3} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </motion.div>

      {/* Stock Sub-allocation Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl overflow-hidden"
      >
         <div className="p-8 border-b border-white/5 bg-surface-container-high/30 flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Zap className="text-primary" size={24} /> Phân bộ chi tiết Cổ phiếu
               </h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-1">Định dạng Equal-weight | 10% mỗi mã</p>
            </div>
            <button className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:underline">
               Xem bảng giá <ArrowRight size={16} />
            </button>
         </div>
         
         <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            {stockBreakdown.map((stock, idx) => (
              <div key={stock.id} className="space-y-4">
                 <div className="flex justify-between items-end">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
                       {stock.id.slice(0, 2)}
                    </div>
                    <span className="text-2xl font-black text-on-surface">10%</span>
                 </div>
                 <div>
                    <h4 className="text-sm font-black">{stock.id}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{stock.name}</p>
                 </div>
                 <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '100%' }} />
                 </div>
                 <div className="flex items-center gap-2">
                    <ArrowUpRight size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase">Tăng trưởng ổn định</span>
                 </div>
              </div>
            ))}
         </div>
      </motion.div>
    </div>
  );
}
