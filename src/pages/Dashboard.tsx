import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { ArrowUp, ArrowDown, TrendingUp, Activity, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions, allocation, stocks, allocateIncomeSimulated, allocateCashToAsset, monthlyAllocation, resetStore } = useStore();
  
  // Auto-reset if custom persistent storage still holds older data configured with billions
  useEffect(() => {
    const stockValue = stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
    const totalAssets = Object.values(allocation).reduce((a, b) => a + b, 0) - allocation.stocks + stockValue;
    if (totalAssets > 2000000000) { // Limit over 2 Billion VNĐ -> auto reset to tens/hundreds of millions
      resetStore();
    }
  }, [allocation, stocks, resetStore]);

  // Calculations derived directly from active ledger
  const investmentCategories = ["Đầu tư", "Tiết kiệm", "Vàng miếng", "Ngoại tệ USD", "Vàng", "USD", "Ngoại tệ"];

  const cashInflow = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  // Chi tiêu thực tế không gồm các ví tích lũy
  const actualLivingExpenses = transactions
    .filter((t) => t.type === "expense" && !investmentCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  // Tổng số tiền đã phân bổ tích lũy/đầu tư trong tháng hiện tại
  const capitalAllocations = transactions
    .filter((t) => t.type === "expense" && investmentCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const cashOutflow = actualLivingExpenses + capitalAllocations;
    
  const netCashFlow = cashInflow - actualLivingExpenses;

  // Thặng dư dòng tiền từ hoạt động sống trước khi đi phân phối đầu tư
  const livingSurplus = Math.max(0, cashInflow - actualLivingExpenses);

  // Tính trực tiếp lượng phân bổ thực tế hàng tháng từ lịch sử giao dịch để luôn đồng bộ chính xác và khớp số liệu
  const actualMonthlyStocks = transactions
    .filter((t) => t.type === "expense" && t.category === "Đầu tư")
    .reduce((sum, t) => sum + t.amount, 0);

  const actualMonthlySavings = transactions
    .filter((t) => t.type === "expense" && t.category === "Tiết kiệm")
    .reduce((sum, t) => sum + t.amount, 0);

  const actualMonthlyGold = transactions
    .filter((t) => t.type === "expense" && (t.category === "Vàng miếng" || t.category === "Vàng"))
    .reduce((sum, t) => sum + t.amount, 0);

  const actualMonthlyUsd = transactions
    .filter((t) => t.type === "expense" && (t.category === "Ngoại tệ USD" || t.category === "USD" || t.category === "Ngoại tệ"))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthlyAllocation = {
    stocks: actualMonthlyStocks,
    savings: actualMonthlySavings,
    cash: Math.max(0, netCashFlow - capitalAllocations), // Phần tiền mặt thực tế dôi dư còn lại sau phân bổ
    gold: actualMonthlyGold,
    usd: actualMonthlyUsd,
  };

  const initialIncome = currentMonthlyAllocation.stocks + currentMonthlyAllocation.savings + currentMonthlyAllocation.gold + currentMonthlyAllocation.usd + currentMonthlyAllocation.cash;

  const [simulatedIncome, setSimulatedIncome] = useState<number>(initialIncome > 0 ? initialIncome : 15000000);
  const [splitStock, setSplitStock] = useState<number>(currentMonthlyAllocation.stocks > 0 ? currentMonthlyAllocation.stocks : 7500000);
  const [splitSavings, setSplitSavings] = useState<number>(currentMonthlyAllocation.savings || 0);
  const [splitGold, setSplitGold] = useState<number>(currentMonthlyAllocation.gold || 0);
  const [splitUsd, setSplitUsd] = useState<number>(currentMonthlyAllocation.usd || 0);
  const [successMsg, setSuccessMsg] = useState(false);
  const [incomeErrorMsg, setIncomeErrorMsg] = useState<string | null>(null);
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  // Synchronize with actual chart on load & ledger updates, unless the user manually starts adjusting inputs
  useEffect(() => {
    if (!isUserInteracted) {
      const realStocks = currentMonthlyAllocation.stocks;
      const realSavings = currentMonthlyAllocation.savings;
      const realGold = currentMonthlyAllocation.gold;
      const realUsd = currentMonthlyAllocation.usd;
      const realCash = currentMonthlyAllocation.cash;
      
      const totalInChart = realStocks + realSavings + realGold + realUsd + realCash;
      if (totalInChart > 0) {
        setSimulatedIncome(totalInChart);
        setSplitStock(realStocks);
        setSplitSavings(realSavings);
        setSplitGold(realGold);
        setSplitUsd(realUsd);
      }
    }
  }, [
    currentMonthlyAllocation.stocks,
    currentMonthlyAllocation.savings,
    currentMonthlyAllocation.gold,
    currentMonthlyAllocation.usd,
    currentMonthlyAllocation.cash,
    isUserInteracted
  ]);

  // Derived leftover cash: Total income minus all allocations
  const splitCash = Math.max(0, simulatedIncome - (splitStock + splitSavings + splitGold + splitUsd));

  // State setters that clamp individual asset categories to available income
  const handleSetSplitStock = (val: number) => {
    const rawVal = Math.max(0, val);
    const others = splitSavings + splitGold + splitUsd;
    const maxVal = Math.max(0, simulatedIncome - others);
    setSplitStock(Math.min(rawVal, maxVal));
    setIsUserInteracted(true);
  };

  const handleSetSplitSavings = (val: number) => {
    const rawVal = Math.max(0, val);
    const others = splitStock + splitGold + splitUsd;
    const maxVal = Math.max(0, simulatedIncome - others);
    setSplitSavings(Math.min(rawVal, maxVal));
    setIsUserInteracted(true);
  };

  const handleSetSplitGold = (val: number) => {
    const rawVal = Math.max(0, val);
    const others = splitStock + splitSavings + splitUsd;
    const maxVal = Math.max(0, simulatedIncome - others);
    setSplitGold(Math.min(rawVal, maxVal));
    setIsUserInteracted(true);
  };

  const handleSetSplitUsd = (val: number) => {
    const rawVal = Math.max(0, val);
    const others = splitStock + splitSavings + splitGold;
    const maxVal = Math.max(0, simulatedIncome - others);
    setSplitUsd(Math.min(rawVal, maxVal));
    setIsUserInteracted(true);
  };

  // New States for Manual Cash Allocation Tabs
  const [activeSubTab, setActiveSubTab] = useState<"income" | "cash">("income");
  const [manualAsset, setManualAsset] = useState<"stocks" | "savings" | "gold" | "usd">("stocks");
  const [manualAmount, setManualAmount] = useState<number>(5000000);
  const [manualSuccessMsg, setManualSuccessMsg] = useState(false);
  const [manualErrorMsg, setManualErrorMsg] = useState<string | null>(null);

  const resetToTarget = (income: number) => {
    setSplitStock(Math.round(income * 0.50));
    setSplitSavings(Math.round(income * 0.10));
    setSplitGold(Math.round(income * 0.10));
    setSplitUsd(Math.round(income * 0.10));
    setIsUserInteracted(true);
  };

  const handleIncomeChange = (val: number) => {
    const cleanVal = Math.max(0, val);
    setSimulatedIncome(cleanVal);
    setIsUserInteracted(true);
    // Keep standard allocations preserved, allowing splitCash to absorb changes dynamically!
  };

  const allocatedTotal = splitStock + splitCash + splitSavings + splitGold + splitUsd;
  const isMatch = Math.abs(allocatedTotal - simulatedIncome) < 5; // allow small rounding diff
  const differenceToAllocate = simulatedIncome - allocatedTotal;

  const handleApplyAllocation = () => {
    // Total cash being transferred OUT of Cash Balance to Savings, Gold, and USD:
    const neededTransferAmount = splitSavings + splitGold + splitUsd;
    if (allocation.cash < neededTransferAmount) {
      setIncomeErrorMsg(
        `Số dư Tiền mặt không đủ để chuyển vào Tiết kiệm, Vàng và USD! (Hiện có: ${allocation.cash.toLocaleString("vi-VN")} ₫, Cần chuyển: ${neededTransferAmount.toLocaleString("vi-VN")} ₫)`
      );
      return;
    }
    
    setIncomeErrorMsg(null);
    allocateIncomeSimulated(
      simulatedIncome,
      splitStock,
      splitSavings,
      splitGold,
      splitUsd,
      splitCash
    );
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  const handleApplyManualAllocation = () => {
    if (manualAmount <= 0) {
      setManualErrorMsg("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
      return;
    }
    if (allocation.cash < manualAmount) {
      setManualErrorMsg(`Không đủ tiền mặt khả dụng (Hiện có: ${allocation.cash.toLocaleString("vi-VN")} ₫)`);
      return;
    }
    
    setManualErrorMsg(null);
    allocateCashToAsset(manualAsset, manualAmount);
    setManualSuccessMsg(true);
    setTimeout(() => setManualSuccessMsg(false), 4000);
  };
  
  const recentTransactions = transactions.slice(0, 5);
  
  const stockValue = stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  const totalAccumulatedValue = allocation.cash + stockValue + allocation.savings + allocation.gold + allocation.usd;
  
  // Dynamic allocation data for display - Derived dynamically from actual holdings!
  const displayAllocationData = [
    { name: "Cổ phiếu", value: stockValue, color: "var(--color-primary)" },
    { name: "Tiền mặt", value: allocation.cash, color: "var(--color-secondary)" },
    { name: "Tiết kiệm", value: allocation.savings, color: "var(--color-tertiary)" },
    { name: "Vàng", value: allocation.gold, color: "#d4af37" },
    { name: "Dự trữ USD", value: allocation.usd, color: "#22c55e" },
  ];
  
  const totalDisplayValue = displayAllocationData.reduce((sum, item) => sum + item.value, 0);
  const savingsRate = cashInflow > 0 ? ((cashInflow - actualLivingExpenses) / cashInflow) * 100 : 0;

  // Comparison data comparing standard target % vs ACTUAL holdings values
  const comparisonData = [
    { name: "Cổ phiếu", target: 50, key: "stocks", value: stockValue, color: "var(--color-primary)" },
    { name: "Tiền mặt", target: 20, key: "cash", value: allocation.cash, color: "var(--color-secondary)" },
    { name: "Tiết kiệm", target: 10, key: "savings", value: allocation.savings, color: "var(--color-tertiary)" },
    { name: "Vàng", target: 10, key: "gold", value: allocation.gold, color: "#d4af37" },
    { name: "Dự trữ USD", target: 10, key: "usd", value: allocation.usd, color: "#22c55e" },
  ];

  // Calculate status badge based on allocation deviation
  const getDeviationBadge = () => {
    let maxDiff = 0;
    comparisonData.forEach(item => {
      const actualPerc = totalDisplayValue > 0 ? (item.value / totalDisplayValue) * 100 : 0;
      const diff = Math.abs(actualPerc - item.target);
      if (diff > maxDiff) maxDiff = diff;
    });

    if (maxDiff <= 12) {
      return {
        text: "Ổn định",
        class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      };
    } else if (maxDiff <= 25) {
      return {
        text: "Tăng trưởng",
        class: "bg-primary/10 text-[#60a5fa] border-[#60a5fa]/20"
      };
    } else {
      return {
        text: "Mất cân bằng",
        class: "bg-vibrant-red/10 text-vibrant-red border-vibrant-red/20"
      };
    }
  };
  const realtimeDeviationBadge = getDeviationBadge();

  let recommendationBadge = "";
  let recommandationText = "";
  if (savingsRate < 20 || netCashFlow < 15000000) {
    recommendationBadge = "⚠️ Cảnh Báo Phòng Thủ";
    recommandationText = `Tỷ lệ tiết kiệm hiện tại chỉ đạt ${savingsRate.toFixed(1)}% (thấp hơn mục tiêu 30%) hoặc dòng tiền thâm hụt. Hệ thống khuyến nghị dồn 100% thu nhập thặng dư mới vào Tiền mặt hoặc Tiết kiệm dài hạn để thiết lập quỹ khẩn cấp tối thiểu 3-6 tháng sinh hoạt phí trước khi gia tăng tỉ trọng đầu tư mạo hiểm cổ phiếu.`;
  } else if (cashInflow > 100000000 || netCashFlow >= 30000000) {
    recommendationBadge = "🚀 Tối Ưu Hóa Đầu Tư";
    recommandationText = `Chúc mừng! Tỷ lệ tiết kiệm dồi dào đạt ${savingsRate.toFixed(1)}% và dòng tiền ròng của bạn vô cùng khoẻ mạnh (${netCashFlow.toLocaleString("vi-VN")} ₫). Bạn có thể phân bổ thêm 50% vào rổ Cổ phiếu VN50 để đón đầu lãi suất kép hoặc chuyển hướng sang tích lũy Vàng SJC để gia cố phòng thủ dài hạn chống lạm phát.`;
  } else {
    recommendationBadge = "⚖️ Cân Bằng Toàn Diện";
    recommandationText = "Dòng tiền của bạn đang ở mức ổn định lành mạnh. Hãy tiếp tục duy trì kỷ luật tái đầu tư đều đặn hàng tháng bằng cách phân phối thu nhập theo tỷ lệ chuẩn 50% Cổ phiếu, 20% Tiền mặt, 10% Tiết kiệm, 10% Vàng, 10% USD để bảo vệ rủi ro biến động.";
  }
  
  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Bảng Điều Khiển</h2>
          <p className="mt-1 text-on-surface-variant">Tổng quan tài chính cá nhân và hiệu suất danh mục đầu tư.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => navigate("/add-transaction")}
             className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
           >
             <Plus size={18} /> Giao dịch mới
           </button>
           <div className="hidden md:block text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tổng Tài Sản Ròng</p>
              <p className="text-2xl font-black tracking-tight text-primary">{totalAccumulatedValue.toLocaleString("vi-VN")} ₫</p>
           </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Thu nhập ròng", value: cashInflow, color: "text-emerald-400", sub: "Thu nhập thực nhận tháng này" },
          { label: "Chi tiêu sinh hoạt", value: actualLivingExpenses, color: "text-amber-500", sub: "Ăn uống, thuê nhà, hoá đơn..." },
          { label: "Lượng tích lũy đầu tư", value: cashInflow - actualLivingExpenses, color: "text-[#38bdf8]", sub: "Thu nhập trừ Chi tiêu sinh hoạt" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl border border-white/5"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{stat.label}</p>
            <p className={cn("text-xl font-black mb-1", stat.color)}>
              {typeof stat.value === "number" ? stat.value.toLocaleString("vi-VN") + " ₫" : stat.value}
            </p>
            <p className="text-[10px] text-on-surface-variant font-bold">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Dual Stacked Allocation Graphs (Left Column) */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          
          {/* Section 1: Phân Bổ Kỳ Vọng */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-xl font-bold flex items-center gap-3">
                     <span className="text-primary font-black">◆</span> Phân Bổ Kỳ Vọng (Target Allocation)
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">Chiến lược tích lũy dài hạn định hướng đề xuất.</p>
               </div>
               <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Chiến lược</span>
            </div>
            
            <div className="flex h-44 items-end gap-3 px-4">
              {[
                { name: "Cổ phiếu", value: 50, color: "var(--color-primary)" },
                { name: "Tiền mặt", value: 20, color: "var(--color-secondary)" },
                { name: "Tiết kiệm", value: 10, color: "var(--color-tertiary)" },
                { name: "Vàng", value: 10, color: "#d4af37" },
                { name: "Dự trữ USD", value: 10, color: "#22c55e" },
              ].map((item) => {
                return (
                  <div key={item.name} className="group relative flex h-full flex-1 flex-col justify-end">
                    <div className="absolute -top-6 w-full text-center text-[10px] font-black tracking-widest text-[#9ca3af] opacity-0 transition-opacity group-hover:opacity-100">
                      {item.value}%
                    </div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${item.value}%` }}
                      transition={{ duration: 1 }}
                      style={{ backgroundColor: item.color }}
                      className="w-full rounded-t-xl opacity-40 transition-all group-hover:opacity-80 border border-white/10"
                    />
                    <div className="mt-3 text-center text-[10px] font-black text-[#cbd5e1] uppercase tracking-tighter truncate">
                       {item.name} ({item.value}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Section 2: Phân Bổ Thực Tế */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-3">
                   <span className="text-secondary font-black">◆</span> Phân Bổ Thực Tế (Actual Allocation)
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 font-semibold">
                   Danh mục hiện tại dựa trên dòng tiền thực tế.
                </p>
              </div>
              <span className={cn(
                "border px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest self-start sm:self-auto",
                realtimeDeviationBadge.class
              )}>
                 Danh mục {realtimeDeviationBadge.text}
              </span>
            </div>

            <div className="flex h-44 items-end gap-3 px-4">
              {displayAllocationData.map((item) => {
                const percentage = totalDisplayValue > 0 ? (item.value / totalDisplayValue) * 100 : 0;
                return (
                  <div key={item.name} className="group relative flex h-full flex-1 flex-col justify-end font-sans">
                    <div className="absolute -top-6 w-full text-center text-[10px] font-black tracking-widest text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                      {percentage.toFixed(1)}% ({item.value.toLocaleString("vi-VN")} ₫)
                    </div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${percentage}%` }}
                      transition={{ duration: 1 }}
                      style={{ backgroundColor: item.color }}
                      className="w-full rounded-t-xl opacity-40 transition-all group-hover:opacity-80 border border-white/10"
                    />
                    <div className="mt-3 text-center text-[10px] font-black text-on-surface uppercase tracking-tighter truncate">
                       {item.name}
                    </div>
                    <div className="text-center text-[9px] font-bold text-on-surface-variant mt-0.5 font-mono">
                      {item.value.toLocaleString("vi-VN")} ₫
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
          
        </div>

        {/* Recent Transactions List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel col-span-1 rounded-2xl p-6 lg:col-span-4 flex flex-col"
        >
          <h3 className="text-lg font-bold mb-6">Biến Động Gần Đây</h3>
          <div className="flex-1 space-y-4">
             {recentTransactions.map((tx) => (
               <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                     <div className={cn(
                       "h-10 w-10 rounded-xl flex items-center justify-center text-xs",
                       tx.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-vibrant-red/10 text-vibrant-red"
                     )}>
                       {tx.type === 'income' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{tx.description}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">{tx.date} | {tx.category}</p>
                     </div>
                  </div>
                  <p className={cn("text-sm font-black font-mono", tx.type === 'income' ? "text-emerald-400" : "text-on-surface")}>
                     {tx.type === 'income' ? "+" : "-"}{tx.amount.toLocaleString("vi-VN")} ₫
                  </p>
               </div>
             ))}
             {transactions.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-50 space-y-2">
                 <Activity size={40} />
                 <p className="text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu</p>
               </div>
             )}
          </div>
          <button 
            onClick={() => navigate("/cash-flow")}
            className="mt-6 w-full py-3 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            Xem tất cả lịch sử
          </button>
        </motion.div>
      </div>

      {/* SECTION: PHÂN BỔ THEO THU NHẬP THÁNG */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl border border-white/5 p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span className="text-primary font-black">◆</span> Phân Bổ Theo Thu Nhập Tháng
            </h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              Mô phỏng hoặc thực thi phân phối thu nhập thực tế vào các rổ đầu tư để so khớp tỷ lệ phân bổ tiêu chuẩn.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest self-start md:self-auto">
             Mô hình phân tách Độc lập
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: COMPARISON TABLE & RECOMMENDATIONS */}
          <div className="lg:col-span-6 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#9ca3af] mb-4">So Sánh Danh Mục Mục Tiêu & Thực Tế</h4>
            
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#07090e]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container/30 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">
                    <th className="p-4 text-left">Tài sản (Asset)</th>
                    <th className="p-4 text-center">Mục tiêu %</th>
                    <th className="p-4 text-center">Thực tế %</th>
                    <th className="p-4 text-right">Chênh lệch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-semibold">
                  {comparisonData.map((item) => {
                    const actualPerc = totalDisplayValue > 0 ? (item.value / totalDisplayValue) * 100 : 0;
                    const diff = actualPerc - item.target;
                    return (
                      <tr key={item.key} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-on-surface">{item.name}</span>
                        </td>
                        <td className="p-4 text-center text-on-surface-variant">{item.target}%</td>
                        <td className="p-4 text-center font-bold text-on-surface">{actualPerc.toFixed(1)}%</td>
                        <td className={cn(
                          "p-4 text-right font-black font-mono",
                          Math.abs(diff) < 1 ? "text-on-surface-variant" : diff > 0 ? "text-emerald-400" : "text-vibrant-red"
                        )}>
                          {diff >= 0 ? "+" : ""}{diff.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Recommendation Card */}
            <div className="p-6 rounded-xl border border-white/5 bg-[#0a0d14] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Lời Khuyên Đầu Tư Sức Khỏe Tài Chính</p>
               <h5 className="text-sm font-bold text-on-surface mb-2">{recommendationBadge}</h5>
               <p className="text-xs text-[#94a3b8] leading-relaxed font-semibold">
                 {recommandationText}
               </p>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE SIMULATOR */}
          <div className="lg:col-span-6 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#9ca3af]">Bộ Phân Bổ Mô Phỏng Thu Nhập</h4>
            
            <div className="p-6 rounded-xl border border-white/5 bg-[#07090e] space-y-6">
              
              {/* Simulated Income input */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider">Tổng thu nhập tháng muốn cơ cấu:</label>
                  <div className="relative flex items-center gap-2">
                    <input 
                      type="text"
                      value={simulatedIncome.toLocaleString("vi-VN")}
                      onChange={(e) => {
                        const raw = Number(e.target.value.replace(/[^0-9]/g, ""));
                        handleIncomeChange(raw);
                      }}
                      className="bg-[#0f1420] border border-white/10 rounded-lg px-3 py-1.5 w-48 text-right font-black font-mono text-sm text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* State descriptor and restore button instead of bug-prone static presets */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[#64748b] font-medium">
                    {isUserInteracted ? (
                      <span className="text-amber-500/80 font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse" /> Đang tùy chỉnh mô phỏng
                      </span>
                    ) : (
                      <span className="text-emerald-400/80 font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" /> Đang đồng bộ số liệu thực tế
                      </span>
                    )}
                  </span>

                  {isUserInteracted && (
                    <button
                      onClick={() => {
                        setIsUserInteracted(false);
                      }}
                      className="text-[10px] font-black uppercase text-primary hover:text-primary-focus transition-colors flex items-center gap-1 bg-primary/10 border border-primary/20 hover:bg-primary/20 px-2 py-1 rounded"
                    >
                       Khôi phục số liệu thực tế
                    </button>
                  )}
                </div>
              </div>

              {/* Slider / Split inputs */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#f8fafc] uppercase tracking-wider">Cơ cấu rổ đựng tài sản:</span>
                  <button 
                    onClick={() => resetToTarget(simulatedIncome)}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                  >
                    Mục tiêu chuẩn (50/20/10/10/10)
                  </button>
                </div>

                {/* Grid of Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Cổ phiếu (Target 50%)", key: "stocks", value: splitStock, setter: handleSetSplitStock, color: "border-primary" },
                    { label: "Tiền mặt (Target 20%)", key: "cash", value: splitCash, setter: null, color: "border-[#10b981]" },
                    { label: "Tiết kiệm (Target 10%)", key: "savings", value: splitSavings, setter: handleSetSplitSavings, color: "border-[#0ea5e9]" },
                    { label: "Vàng miếng (Target 10%)", key: "gold", value: splitGold, setter: handleSetSplitGold, color: "border-[#eab308]" },
                    { label: "Ngoại tệ USD (Target 10%)", key: "usd", value: splitUsd, setter: handleSetSplitUsd, color: "border-[#22c55e]" }
                  ].map((asset) => {
                    const weight = simulatedIncome > 0 ? (asset.value / simulatedIncome) * 100 : 0;
                    const isCash = asset.key === "cash";
                    return (
                      <div 
                        key={asset.key} 
                        className={cn(
                          "p-3.5 rounded-lg border space-y-2 transition-all duration-300",
                          isCash 
                            ? "bg-emerald-500/5 border-emerald-500/15 shadow-inner" 
                            : "bg-[#0c101a] border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                          <span className={cn(isCash && "text-emerald-400 font-extrabold flex items-center gap-1.5")}>
                            {asset.label} {isCash && <span className="text-[8px] bg-emerald-500/15 py-0.5 px-1.5 rounded text-emerald-400 font-black animate-pulse">Tự động tính</span>}
                          </span>
                          <span className={cn("font-mono font-black text-xs", isCash ? "text-emerald-400" : "text-primary")}>
                            {weight.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-3 min-w-0">
                            <label className="block text-[8px] text-on-surface-variant uppercase font-bold mb-0.5">
                              {isCash ? "Số dư tự động tính (VND)" : "Số tiền (VND)"}
                            </label>
                            <div className="relative">
                              <input 
                                type="text"
                                disabled={isCash}
                                value={asset.value.toLocaleString("vi-VN")}
                                onChange={(e) => {
                                  if (isCash || !asset.setter) return;
                                  const rawVal = Number(e.target.value.replace(/[^0-9]/g, ""));
                                  asset.setter(rawVal);
                                }}
                                className={cn(
                                  "w-full border rounded px-1.5 py-1 text-right font-bold font-mono text-[11px] focus:outline-none pr-3.5 transition-all",
                                  isCash 
                                    ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 cursor-not-allowed opacity-80" 
                                    : "bg-[#070a0f] border-white/10 text-on-surface focus:border-primary"
                                )}
                              />
                              <span className={cn(
                                "absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold font-sans",
                                isCash ? "text-emerald-500/60" : "text-on-surface-variant"
                              )}>₫</span>
                            </div>
                          </div>
                          <div className="col-span-2 flex-shrink-0">
                            <label className="block text-[8px] text-[#38bdf8] uppercase font-bold mb-0.5">Tỷ lệ (%)</label>
                            <div className="relative">
                              <input 
                                type="text"
                                disabled={isCash}
                                value={weight === 0 ? "0" : Number(weight.toFixed(1))}
                                onChange={(e) => {
                                  if (isCash || !asset.setter) return;
                                  let pct = parseFloat(e.target.value.replace(",", "."));
                                  if (isNaN(pct)) pct = 0;
                                  pct = Math.min(100, Math.max(0, pct));
                                  const calculatedAmt = Math.round(simulatedIncome * (pct / 100));
                                  asset.setter(calculatedAmt);
                                }}
                                className={cn(
                                  "w-full border rounded px-1.5 py-1 text-right font-bold font-mono text-[11px] focus:outline-none pr-3.5 transition-all",
                                  isCash 
                                    ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 cursor-not-allowed opacity-80" 
                                    : "bg-[#070a0f] border-[#38bdf8]/20 text-[#38bdf8] focus:border-[#38bdf8]"
                                )}
                              />
                              <span className={cn(
                                "absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold font-sans",
                                isCash ? "text-emerald-500/60" : "text-[#38bdf8]"
                              )}>%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reconciliation Table - Bảng đối ứng số liệu để so sánh đối chiếu */}
                <div className="p-4 bg-[#0a0d14] rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">Bảng Kiểm Đối Ứng Số Liệu</span>
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-emerald-400 font-extrabold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" /> Khớp Tuyệt Đối 100%
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-[#070a0f] rounded-lg border border-white/5 flex flex-col justify-center">
                      <span className="text-[8px] uppercase tracking-wide text-[#94a3b8] font-bold">1. Tổng Tiền Ban Đầu (A)</span>
                      <span className="text-xs font-black font-mono text-[#38bdf8] mt-1">
                        {simulatedIncome.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="p-2 bg-[#070a0f] rounded-lg border border-white/5 flex flex-col justify-center">
                      <span className="text-[8px] uppercase tracking-wide text-[#94a3b8] font-bold">2. Đã Phân Bổ Ra Rổ (B)</span>
                      <span className="text-xs font-black font-mono text-amber-500 mt-1">
                        {(splitStock + splitSavings + splitGold + splitUsd).toLocaleString("vi-VN")} ₫
                      </span>
                      <span className="text-[8px] text-[#64748b] font-medium mt-0.5">Cổ phiếu, tiết kiệm, vàng, USD</span>
                    </div>
                    <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/15 flex flex-col justify-center">
                      <span className="text-[8px] uppercase tracking-wide text-emerald-400 font-extrabold">3. Tiền Mặt Khả Dụng (C = A - B)</span>
                      <span className="text-xs font-black font-mono text-emerald-400 mt-1">
                        {splitCash.toLocaleString("vi-VN")} ₫
                      </span>
                      <span className="text-[8px] text-emerald-500/60 font-semibold mt-0.5">Hệ thống tự trừ dần</span>
                    </div>
                  </div>

                  {/* Cột đối ứng so sánh tổng tài sản phân tách */}
                  <div className="p-3 bg-[#070a0f] rounded-xl border border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-[#e2e8f0]">Tổng số tiền thực phân bổ (Tổng 5 danh mục = B + C)</span>
                      <p className="text-[10px] text-[#64748b] font-bold mt-0.5">Bao gồm cả Tiền mặt lỏng và các mảng tích sản</p>
                    </div>
                    <span className="font-mono font-black text-emerald-450 text-base bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded">
                      {(splitStock + splitSavings + splitGold + splitUsd + splitCash).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>

                  <div className="pt-1 text-[9px] text-[#64748b] leading-relaxed text-center font-semibold">
                    Giải bài toán phân tách dòng tiền: <span className="font-mono text-primary font-bold">Tổng 5 ví của bạn</span> (Cổ phiếu {((splitStock / simulatedIncome) * 100 || 0).toFixed(1)}% + Tiết kiệm {((splitSavings / simulatedIncome) * 100 || 0).toFixed(1)}% + Vàng {((splitGold / simulatedIncome) * 100 || 0).toFixed(1)}% + USD {((splitUsd / simulatedIncome) * 100 || 0).toFixed(1)}% + Tiền mặt {((splitCash / simulatedIncome) * 100 || 0).toFixed(1)}%) = <span className="font-mono font-black text-on-surface">{(splitStock + splitCash + splitSavings + splitGold + splitUsd).toLocaleString("vi-VN")} ₫</span> (Chiếm trọn vẹn 100% dòng tài sản)
                  </div>
                </div>

                {/* Total Checks */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#94a3b8]">Trạng thái phân bổ</p>
                    <p className={cn(
                      "text-sm font-black font-mono mt-0.5",
                      isMatch ? "text-emerald-400" : "text-vibrant-red"
                    )}>
                      {allocatedTotal.toLocaleString("vi-VN")} ₫ / {simulatedIncome.toLocaleString("vi-VN")} ₫
                    </p>
                    {differenceToAllocate !== 0 && (
                      <p className="text-[10px] text-vibrant-red font-medium mt-1">
                        {differenceToAllocate > 0 
                          ? `Còn thiếu ${differenceToAllocate.toLocaleString("vi-VN")} ₫ chưa bỏ vào rổ`
                          : `Sử dụng dư ${Math.abs(differenceToAllocate).toLocaleString("vi-VN")} ₫ so với thu nhập`}
                      </p>
                    )}
                  </div>

                  <button
                    disabled={!isMatch}
                    onClick={handleApplyAllocation}
                    className={cn(
                      "w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-xl",
                      isMatch 
                        ? "bg-primary shadow-primary/20 hover:brightness-110 cursor-pointer" 
                        : "bg-white/5 text-on-surface-variant border border-white/10 cursor-not-allowed"
                    )}
                  >
                    Xác nhận phân bổ thực tế
                  </button>
                </div>

                {/* Suggestion Rule base on Income */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-xs text-[#94a3b8] mt-2 leading-relaxed">
                  <span className="font-bold text-primary block mb-1">💡 Hướng dẫn kịch bản phân rã:</span>
                  {simulatedIncome >= 100000000 ? (
                    <span>Thu nhập lớn (≥100M VND) khuyên bạn phân bổ tối ưu 50% vào Cổ phiếu VN50 và 10% gửi Vàng miếng SJC để nhân rộng tài sản.</span>
                  ) : simulatedIncome <= 15000000 ? (
                    <span>Thu nhập hạn chế (≤15M VND) khuyên dồn tất cả gửi thẳng tiết kiệm cố định lấy lãi suất an tâm, tránh rủi ro rổ đầu tư.</span>
                  ) : (
                    <span>Thu nhập trung bình cân bằng ổn định. Hãy duy trì giải bài toán 50/20/10/10/10 của các chuyên gia tư vấn.</span>
                  )}
                </div>

                {incomeErrorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-vibrant-red/10 text-vibrant-red border border-vibrant-red/20 rounded-lg text-xs text-center font-bold"
                  >
                    ⚠ {incomeErrorMsg}
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs text-center font-bold"
                  >
                    ✓ Phân bổ thành công! Tài khóa đã được gia tăng trực tiếp vào ví đầu tư của bạn. Toàn bộ hiệu suất danh mục đã được cập nhật rộng rãi.
                  </motion.div>
                )}

              </div>

            </div>
          </div>

        </div>
      </motion.div>

      {/* Asset Breakdown Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden rounded-2xl border border-white/5"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h3 className="text-xl font-bold">Cấu Trúc Tài Sản</h3>
           <TrendingUp className="text-primary" size={20} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container/30">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Loại tài sản</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Giá trị thị trường</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-center">Tỷ trọng</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayAllocationData.map((item, i) => {
                const percentage = (item.value / totalDisplayValue) * 100;
                return (
                  <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-bold text-on-surface">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-black text-right font-mono">{item.value.toLocaleString("vi-VN")} ₫</td>
                    <td className="p-4">
                       <div className="flex items-center justify-center gap-3">
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                             <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                          </div>
                          <span className="text-xs font-bold text-on-surface-variant">{percentage.toFixed(1)}%</span>
                       </div>
                    </td>
                    <td className="p-4 text-right">
                       <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                          Tăng trưởng
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
