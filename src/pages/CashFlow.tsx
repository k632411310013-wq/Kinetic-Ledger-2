import { motion } from "motion/react";
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { TrendingUp, TrendingDown, ArrowRight, Search, Activity, MoreHorizontal } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useStore } from "../store/useStore";
import { useState } from "react";

export default function CashFlow() {
  const { transactions } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const cashInflow = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const investmentCategories = ["Đầu tư", "Tiết kiệm", "Vàng miếng", "Ngoại tệ USD", "Vàng", "USD", "Ngoại tệ"];
    
  const actualLivingExpenses = transactions
    .filter((t) => t.type === "expense" && !investmentCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const cashOutflow = actualLivingExpenses;
    
  const netCashFlow = cashInflow - cashOutflow;

  const expenses = transactions.filter(t => t.type === 'expense');
  const catMap = new Map();
  expenses.forEach(t => {
    catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
  });
  
  const categoryBreakdown = Array.from(catMap.entries()).map(([name, value]) => ({
    name,
    value,
    color: 'var(--color-primary)',
    percentage: (value / cashOutflow) * 100 || 0
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Tất cả", ...new Set(transactions.map(t => t.category))];
  
  // Calculate flow for chart - grouping by date (last 7 days or weeks)
  const last4Transactions = transactions.slice(0, 4).reverse().map((t, i) => ({
    week: `Giao dịch ${i+1}`,
    value: t.amount / 1000000 // In millions for better scale
  }));

  return (
    <div className="space-y-8">
       {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Quản Lý Dòng Tiền</h1>
          <p className="mt-1 text-on-surface-variant">Theo dõi và phân tích thanh khoản hàng tháng của bạn.</p>
        </div>
        
        <div className="flex items-center gap-1 rounded-lg border border-[#2d333b] bg-[#05070a] p-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
            <input 
              type="text"
              placeholder="Tìm giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs font-bold pl-9 pr-4 py-1.5 focus:outline-none w-40"
            />
          </div>
          <div className="h-4 w-px bg-white/10 mx-2" />
          {['Tháng 10', 'Tháng 11', 'Tháng 12'].map(m => (
            <button key={m} className={cn(
              "px-4 py-1.5 text-xs font-bold rounded transition-all",
              m === 'Tháng 11' ? "bg-surface-container-highest text-on-surface shadow-sm border border-white/5" : "text-on-surface-variant hover:text-on-surface"
            )}>{m}</button>
          ))}
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel col-span-1 md:col-span-12 lg:col-span-5 rounded-xl p-8 overflow-hidden relative group"
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex justify-between items-center">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Dòng Tiền Ròng (Tháng 11)</h2>
            <span className="px-2 py-1 bg-surface-bright/50 border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest">Thời gian thực</span>
          </div>
          <div className="mt-4 text-4xl font-bold tracking-tight">
            {netCashFlow >= 0 ? "+" : ""}{netCashFlow.toLocaleString("vi-VN")} VNĐ
          </div>
          <div className="mt-2 flex items-center gap-2 text-primary text-xs font-bold">
            <TrendingUp size={16} /> 12.4% <span className="text-on-surface-variant">so với tháng trước</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel col-span-1 md:col-span-12 lg:col-span-7 rounded-xl p-8 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tổng quan thu chi</h2>
            <div className="flex rounded-full border border-[#2d333b] bg-[#05070a] p-1">
              <div className="px-4 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mr-1">Thu: {cashInflow.toLocaleString("vi-VN")} ₫</div>
              <div className="px-4 py-1 rounded-full text-[10px] font-black uppercase bg-vibrant-red/10 text-vibrant-red border border-vibrant-red/20">Chi: {cashOutflow.toLocaleString("vi-VN")} ₫</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Lọc theo danh mục</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button 
                  key={c} 
                  onClick={() => setSelectedCategory(c)}
                  className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                  selectedCategory === c ? "bg-primary/20 border border-primary/50 text-primary" : "bg-surface-container-highest/50 border border-white/5 text-on-surface-variant hover:text-on-surface"
                )}>{c}</button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel col-span-1 lg:col-span-8 rounded-xl p-8 flex flex-col h-[400px]"
        >
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tốc độ & Xu hướng</h2>
             <MoreHorizontal className="text-on-surface-variant cursor-pointer" />
          </div>
          <div className="flex-1 min-h-0 bg-[#05070a]/50 rounded-lg border border-white/5 p-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last4Transactions}>
                <defs>
                   <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" hide />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--color-surface-container)', borderColor: 'var(--color-white/10)', borderRadius: '8px' }}
                   formatter={(val: any) => [`${val.toLocaleString()} Tr ₫`, 'Số tiền']}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fill="url(#flowGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="absolute bottom-2 left-0 w-full flex justify-around text-[10px] font-bold text-on-surface-variant/50">
               <span>Tuần 1</span><span>Tuần 2</span><span>Tuần 3</span><span>Tuần 4</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.1 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel col-span-1 lg:col-span-4 rounded-xl p-8 flex flex-col h-[400px]"
        >
           <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">Top Dòng Tiền Ra</h2>
           <div className="space-y-6 flex-1 overflow-y-auto pr-2">
             {categoryBreakdown.map((item) => (
               <div key={item.name} className="space-y-2">
                 <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                     <span className="font-medium">{item.name}</span>
                   </div>
                   <span className="font-bold">{item.value.toLocaleString()} VNĐ</span>
                 </div>
                 <div className="h-1.5 w-full bg-[#05070a] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                 </div>
               </div>
             ))}
           </div>
        </motion.div>
      </div>

      {/* Recent Transactions Table */}
       <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl p-6 overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Giao dịch gần đây</h2>
            <button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Ngày', 'Mô tả', 'Danh mục', 'Trạng thái', 'Số tiền'].map(h => (
                      <th key={h} className={cn(
                        "p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant",
                        h === 'Số tiền' && "text-right"
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-xs text-on-surface-variant font-mono">{tx.date}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 flex items-center justify-center rounded bg-surface-container-highest border border-white/5 text-primary">
                             {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                           </div>
                           <span className="text-sm font-bold">{tx.description}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-on-surface-variant">{tx.category}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-primary/10 text-primary border-primary/20 uppercase tracking-widest">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className={cn(
                        "p-4 text-right text-sm font-bold font-mono",
                        tx.type === 'income' ? "text-emerald-400" : "text-vibrant-red"
                      )}>
                        {tx.type === 'income' ? "+" : "-"}{tx.amount.toLocaleString("vi-VN")} ₫
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-on-surface-variant">
                        Không tìm thấy giao dịch nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </motion.div>
    </div>
  );
}
