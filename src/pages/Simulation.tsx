import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, Wallet, Landmark, Coins, DollarSign, Info, 
  Lightbulb, Sparkles, Percent, HelpCircle, Activity,
  ChevronRight, Calendar, ArrowUpRight, ShieldCheck, RefreshCw, AlertCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, Legend 
} from "recharts";
import { useStore } from "../store/useStore";

export default function Simulation() {
  const { allocation, stocks, transactions } = useStore();

  // 1. Core calculation of actual asset values directly from useStore
  const stockValue = stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  const cashValue = allocation.cash;
  const savingsValue = allocation.savings;
  const goldValue = allocation.gold;
  const usdValue = allocation.usd;

  const netWorth = cashValue + stockValue + savingsValue + goldValue + usdValue;
  const activeInvestments = stockValue + savingsValue + goldValue + usdValue;
  const liquidity = cashValue; // ONLY cash constitutes liquid funds as per requested rules

  // 2. Core calculation of actual current monthly saving rate (PMT)
  const cashInflow = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const investmentCategories = ["Đầu tư", "Tiết kiệm", "Vàng miếng", "Ngoại tệ USD", "Vàng", "USD", "Ngoại tệ"];

  const actualLivingExpenses = transactions
    .filter((t) => t.type === "expense" && !investmentCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const capitalAllocations = transactions
    .filter((t) => t.type === "expense" && investmentCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = cashInflow - actualLivingExpenses - capitalAllocations;
  const defaultPMT = Math.max(0, netCashFlow);

  // Unrealized profit on FPT / stocks as temporary return tracker
  const stockProfit = stocks.reduce((sum, s) => sum + s.quantity * (s.currentPrice - s.avgPrice), 0);

  // 3. Setup Custom PMT with state, synced to actual cash surplus initially but fully slider-adjustable
  const [customPMT, setCustomPMT] = useState<number | null>(null);
  const [forecastYears, setForecastYears] = useState<number>(10);
  
  const monthlyPMT = customPMT ?? defaultPMT;
  const isPMTCustomized = customPMT !== null;

  // 4. Portfolio return weighted rates definitions (Cổ phiếu 12%, Tiết kiệm 5%, Vàng 7%, USD 3%, Tiền mặt 0%)
  const rStock = 0.12;      // 12%
  const rSavings = 0.05;    // 5%
  const rGold = 0.07;       // 7%
  const rUsd = 0.03;        // 3%
  const rCash = 0.00;       // 0%

  // Weights configuration
  const wStock = netWorth > 0 ? stockValue / netWorth : 0;
  const wSavings = netWorth > 0 ? savingsValue / netWorth : 0;
  const wGold = netWorth > 0 ? goldValue / netWorth : 0;
  const wUsd = netWorth > 0 ? usdValue / netWorth : 0;
  const wCash = netWorth > 0 ? cashValue / netWorth : 0;

  // Expected weighted portfolio return rate
  const portfolioReturn = netWorth > 0
    ? (wStock * rStock) + (wSavings * rSavings) + (wGold * rGold) + (wUsd * rUsd) + (wCash * rCash)
    : 0.07; // 7% fallback if no asset is configured yet

  // 5. Forecast Data Generation using FV = PV(1+r)^n + PMT * (((1+r)^n - 1)/r)
  const generateForecastingData = () => {
    const data = [];
    const r = portfolioReturn;
    const PV = netWorth;
    const annualPMT = monthlyPMT * 12;

    for (let yr = 0; yr <= forecastYears; yr++) {
      let compoundedValue = 0;
      let pureContributions = PV + (annualPMT * yr);

      if (yr === 0) {
        compoundedValue = PV;
      } else {
        if (r === 0) {
          compoundedValue = PV + annualPMT * yr;
        } else {
          compoundedValue = PV * Math.pow(1 + r, yr) + annualPMT * ((Math.pow(1 + r, yr) - 1) / r);
        }
      }

      data.push({
        yearLabel: `Năm ${yr}`,
        yearNum: yr,
        value: Math.round(compoundedValue),
        contributions: Math.round(pureContributions),
        interestGained: Math.round(Math.max(0, compoundedValue - pureContributions)),
      });
    }
    return data;
  };

  const forecastPoints = generateForecastingData();
  const finalCompoundValue = forecastPoints[forecastPoints.length - 1].value;
  const finalPureVốn = forecastPoints[forecastPoints.length - 1].contributions;
  const finalAccumulatedProfit = Math.max(0, finalCompoundValue - finalPureVốn);

  // Quick milestone calculators for display
  const calculateMilestone = (yr: number) => {
    const r = portfolioReturn;
    const PV = netWorth;
    const annualPMT = monthlyPMT * 12;
    if (yr === 0) return { total: PV, interest: 0, contributions: PV };

    let total = 0;
    if (r === 0) {
      total = PV + annualPMT * yr;
    } else {
      total = PV * Math.pow(1 + r, yr) + annualPMT * ((Math.pow(1 + r, yr) - 1) / r);
    }
    const contributions = PV + (annualPMT * yr);
    return {
      total: Math.round(total),
      contributions: Math.round(contributions),
      interest: Math.round(Math.max(0, total - contributions))
    };
  };

  const milestone1 = calculateMilestone(1);
  const milestone3 = calculateMilestone(3);
  const milestone5 = calculateMilestone(5);
  const milestone10 = calculateMilestone(10);

  // Donut chart representation structure
  const donationParts = [
    { name: "Cổ phiếu", value: stockValue, pct: wStock * 100, color: "#ec4899", rateLabel: "12% / năm", count: stocks.filter(s => s.quantity > 0).length + " mã" },
    { name: "Tiền mặt", value: cashValue, pct: wCash * 100, color: "#10b981", rateLabel: "0% / năm", count: "Khả dụng" },
    { name: "Tiết kiệm", value: savingsValue, pct: wSavings * 100, color: "#38bdf8", rateLabel: "5% / năm", count: "Gửi ngân hàng" },
    { name: "Vàng", value: goldValue, pct: wGold * 100, color: "#eab308", rateLabel: "7% / năm", count: "Tích trữ" },
    { name: "USD dự trữ", value: usdValue, pct: wUsd * 100, color: "#a855f7", rateLabel: "3% / năm", count: "Ngoại tệ" }
  ];

  // AI Rule-based Insight Engine
  const generateDynamicInsights = () => {
    const insights = [];

    // Rule 1: Stocks risk & aggression profile
    if (wStock > 0.45) {
      insights.push({
        title: "Tỷ trọng Cổ phiếu cao",
        type: "danger",
        desc: `Danh mục mang phong cách tấn công rất mạnh mẽ khi vị thế Cổ phiếu chiếm ${(wStock * 100).toFixed(1)}%. Mặc dù tối đa hóa được mức sinh lời dài hạn (kỳ vọng 12%/năm), hãy chuẩn bị phòng vệ trước biến động ngắn hạn bằng cách phân bổ bớt lợi nhuận cổ phiếu thu hoạch vào kênh tích lũy bền vững.`,
        icon: TrendingUp,
        colorHex: "#ec4899"
      });
    } else if (wStock > 0.15) {
      insights.push({
        title: "Cơ cấu Cổ phiếu cân đối",
        type: "success",
        desc: `Cổ phiếu duy trì ở mức ${(wStock * 100).toFixed(1)}%. Đây là rổ xúc tác tuyệt vời giúp định hình sức tăng trưởng kép cho tổng thể tài sản ròng mà không đặt toàn bộ vốn vào mức rủi ro biến động thái quá.`,
        icon: ShieldCheck,
        colorHex: "#10b981"
      });
    } else {
      insights.push({
        title: "Thiếu động lực Cổ phiếu",
        type: "warning",
        desc: `Tỷ trọng cổ phiếu quá mỏng (${(wStock * 100).toFixed(1)}%). Với mức lợi suất trung bình danh mục hiện tại là ${(portfolioReturn * 100).toFixed(2)}%, tài sản gia tăng chậm hơn. Tích sản đều đặn các nhóm cổ phiếu VN50 đầu ngành sẽ cải thiện đáng kể tăng trưởng kép.`,
        icon: Lightbulb,
        colorHex: "#38bdf8"
      });
    }

    // Rule 2: Clean Liquidity check (Pure Cash Only)
    if (wCash > 0.25) {
      insights.push({
        title: "Thanh khoản dư thừa dồi dào",
        type: "success",
        desc: `Tiền mặt hiện dụng chiếm ${(wCash * 100).toFixed(1)}% rổ tài sản. Bạn hoàn toàn chủ động trước mọi sự cố bất định trong cuộc sống và trực tiếp nắm thế thượng phong khi thị trường cổ phiếu chiết khấu sâu để săn tích sản giá hời.`,
        icon: Wallet,
        colorHex: "#10b981"
      });
    } else if (wCash < 0.05) {
      insights.push({
        title: "Cảnh báo Thanh khoản mỏng",
        type: "danger",
        desc: `Tiền mặt sẵn có hiện chỉ chiếm ${(wCash * 100).toFixed(1)}% danh mục của bạn. Việc chuyển đổi gần như toàn bộ nguồn lực sang tài sản phi tiền mặt có thể ép bạn phải thanh lý gấp vàng, tiết kiệm hoặc cổ phiếu chịu lỗ khi phát sinh nhu cầu khẩn cấp bất ngờ.`,
        icon: AlertCircle,
        colorHex: "#ef4444"
      });
    } else {
      insights.push({
        title: "Mức thanh khoản tối ưu",
        type: "success",
        desc: `Quỹ tiền mặt ổn định chiếm ${(wCash * 100).toFixed(1)}% tài sản ròng. Cho thấy kỹ năng bao quát tài chính rất kỷ luật, vừa đủ chống đỡ các chi tiêu biến động cấp bách vừa không bị chôn chân quá nhiều vốn chết lãng phí.`,
        icon: ShieldCheck,
        colorHex: "#10b981"
      });
    }

    // Rule 3: Emergency golden shield against system-inflation
    const goldUsdWeight = wGold + wUsd;
    if (goldUsdWeight < 0.08) {
      insights.push({
        title: "Hàng rào lạm phát mỏng",
        type: "warning",
        desc: `Tỷ lệ Vàng & USD dự trữ chỉ chiếm ${(goldUsdWeight * 100).toFixed(1)}%. Để hạn chế rủi ro trượt giá bản tệ trong bối cảnh vĩ mô tương lai đầy biến động, tăng dần rổ vàng lên mốc 8% - 10% sẽ là tấm khiên phòng ngự đáng giá.`,
        icon: Coins,
        colorHex: "#eab308"
      });
    } else {
      insights.push({
        title: "Tấm khiên lạm phát vững chắc",
        type: "success",
        desc: `Tích lũy phòng thủ bằng Vàng & USD đạt ${(goldUsdWeight * 100).toFixed(1)}%. Cấu trúc này neo giữ giá trị vốn gốc rất tốt khi có áp lực trượt giá tiền tệ tăng cao hoặc địa chính trị vĩ mô thế giới biến động bất thường.`,
        icon: Landmark,
        colorHex: "#a855f7"
      });
    }

    // Rule 4: Active Savings compounding speed
    if (monthlyPMT === 0) {
      insights.push({
        title: "Sức mạnh tích sản bị đình trệ",
        type: "danger",
        desc: "Hiện chưa ghi nhận dòng chảy tích lũy hàng tháng ổn định nào. Hãy tối ưu hóa lại các rổ chi tiêu sinh hoạt không thiết yếu để nhanh chóng mở lại dòng vốn thặng dư đầu tư - nòng cốt kích hoạt lãi kép.",
        icon: Activity,
        colorHex: "#ef4444"
      });
    } else if (monthlyPMT > 15000000) {
      insights.push({
        title: "Đà đẩy tích lũy tốc độ cao",
        type: "primary",
        desc: `Dòng phân bổ đều đặn chạm ${(monthlyPMT / 1e6).toFixed(1)}M/tháng là con số cực kỳ lý tưởng để tạo nên sự bứt tốc ngoạn mục cho tổng tài sản ròng, rút ngắn ước tính trên 30% chặng đường đến tự do tài chính.`,
        icon: Sparkles,
        colorHex: "#38bdf8"
      });
    } else {
      insights.push({
        title: "Kỷ luật tích lũy đều đặn",
        type: "success",
        desc: `Dòng vốn tích lũy ${(monthlyPMT / 1e6).toFixed(1)}M/tháng liên tục chảy vào tài sản ròng. Việc kiên trì bơm vốn hàng tháng bảo đảm lãi kép sẽ phát huy sức mạnh cấp số lũy thừa rõ rệt từ năm thứ 5 trở đi.`,
        icon: ArrowUpRight,
        colorHex: "#10b981"
      });
    }

    return insights;
  };

  const activeInsights = generateDynamicInsights();

  return (
    <div className="space-y-8 pb-24 text-on-surface" id="asset-growth-analyzer">
      {/* Dynamic Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit mb-3">
            <Sparkles size={12} className="animate-pulse" /> Dự báo tài sản AI Fintech
          </div>
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Dự Báo & Phân Tích Tăng Trưởng
          </h2>
          <p className="mt-2 text-on-surface-variant max-w-3xl leading-relaxed text-sm">
            Công cụ phân tích độc quyền dự đoán sự gia tăng tài chính cá nhân trong tương lai dựa hoàn toàn vào 
            cấu trúc nguồn lực thực tế bạn đang nắm giữ. Trực quan sinh động cơ cấu danh mục, 
            weighted return kỳ vọng và giả lập kỷ luật lãi kép tích sản hàng tháng.
          </p>
        </div>
      </div>

      {/* KHỐI 1 — TỔNG QUAN TÀI SẢN HIỆN TẠI */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#94a3b8]">KHỐI 1 — Tổng quan tài sản thực tế</h3>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">Cập nhật tức thời (Realtime)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Card 1: Tổng tài sản ròng */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-[#09111c]/60 border border-emerald-500/15 backdrop-blur-md shadow-lg shadow-emerald-500/2"
            id="nv-card-networth"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest">Tổng tài sản ròng</span>
              <Wallet size={16} />
            </div>
            <p className="text-2xl font-black font-mono tracking-tight text-white mb-1">
              {netWorth.toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-[10px] text-emerald-400/80 font-bold">
              NetWorth = Vốn gốc + Danh mục
            </p>
          </motion.div>

          {/* Card 2: Thanh khoản ròng */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-[#070e17]/60 border border-sky-500/15 backdrop-blur-md shadow-lg shadow-sky-500/2"
            id="nv-card-liquidity"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-sky-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between text-[#38bdf8] mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest">Thanh khoản ròng</span>
              <Activity size={16} />
            </div>
            <p className="text-2xl font-black font-mono tracking-tight text-white mb-1">
              {liquidity.toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-[10px] text-sky-400/80 font-bold">
              Chỉ tính rổ Tiền mặt khả dụng
            </p>
          </motion.div>

          {/* Card 3: Tổng đầu tư hoạt động */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-[#0e0a17]/60 border border-pink-500/15 backdrop-blur-md shadow-lg shadow-pink-500/2"
            id="nv-card-investments"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-pink-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between text-pink-400 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest">Đầu tư đang hoạt động</span>
              <Landmark size={16} />
            </div>
            <p className="text-2xl font-black font-mono tracking-tight text-white mb-1">
              {activeInvestments.toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-[10px] text-pink-400/80 font-bold">
              Cổ phiếu, Vàng, Tiết kiệm, USD
            </p>
          </motion.div>

          {/* Card 4: Dòng tiền tích lũy thực tế tháng này */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-[#0d0d0f]/60 border border-amber-500/15 backdrop-blur-md shadow-lg shadow-amber-500/2"
            id="nv-card-pmt"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between text-amber-500 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest">Tích lũy tháng này (PMT)</span>
              <ArrowUpRight size={16} />
            </div>
            <p className="text-2xl font-black font-mono tracking-tight text-white mb-1">
              {monthlyPMT.toLocaleString("vi-VN")} ₫
            </p>
            <p className={cn(
              "text-[10px] font-bold",
              isPMTCustomized ? "text-amber-400" : "text-[#94a3b8]"
            )}>
              {isPMTCustomized ? "Đang chạy mô phỏng tinh chỉnh" : "Đồng bộ thặng dư thu - chi sống"}
            </p>
          </motion.div>

          {/* Card 5: Lợi suất trung bình danh mục */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-[#0c0a17]/60 border border-purple-500/15 backdrop-blur-md shadow-lg shadow-purple-500/2"
            id="nv-card-return"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest">weighted return thực</span>
              <Percent size={16} />
            </div>
            <p className="text-2xl font-black font-mono tracking-tight text-white mb-1">
              {(portfolioReturn * 100).toFixed(2)}% <span className="text-[10px] font-medium text-purple-300">/ năm</span>
            </p>
            <p className="text-[10px] text-purple-400/80 font-bold">
              Bình quân gia quyền rổ tài sản
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Analysis Section: Two columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column (KHỐI 2 - Donut Chart & Breakdown) */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel col-span-1 xl:col-span-5 rounded-3xl p-6 bg-surface-container/20 border border-white/5 flex flex-col space-y-6"
          id="nv-khoi2-structure"
        >
          <div>
            <h3 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              KHỐI 2 — Cấu trúc tài sản thực tế
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Phân tách chi tiết dòng vốn dựa trên số liệu thực tế sở hữu của bạn.
            </p>
          </div>

          {/* Pie Chart Representation */}
          <div className="h-64 flex items-center justify-center relative">
            {netWorth > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donationParts.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {donationParts.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgb(12 18 30 / 90%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                      formatter={(value: any) => [`${value.toLocaleString()} ₫`, 'Số dư']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Embedded Center Text */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#64748b]">Tài sản ròng</span>
                  <span className="text-lg font-black font-mono tracking-tight text-white mt-0.5">
                    {(netWorth / 1e6).toFixed(1)}M
                  </span>
                  <span className="text-[10px] text-emerald-400 font-extrabold mt-0.5">
                    {(portfolioReturn * 100).toFixed(1)}% r
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-8 space-y-3">
                <AlertCircle className="mx-auto text-amber-500" size={32} />
                <p className="text-xs font-bold text-[#94a3b8]">Chưa phát hiện tài sản tích lũy trong tài khoản.</p>
                <p className="text-[10px] text-on-surface-variant max-w-xs leading-relaxed">
                  Vui lòng thêm giao dịch thu nhập mới và ghi nhận phân bổ tài sản tại Bảng điều khiển để kích hoạt biểu đồ cơ cấu thực.
                </p>
              </div>
            )}
          </div>

          {/* Allocation Details Checklist */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            {donationParts.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{item.name}</span>
                      <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-on-surface-variant font-bold">{item.count}</span>
                    </div>
                    <span className="text-[10px] text-[#64748b] font-semibold">Tỷ suất kỳ vọng mặc định: {item.rateLabel}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs font-black font-mono text-white">
                    {item.value.toLocaleString("vi-VN")} ₫
                  </p>
                  <p className="text-[10px] font-bold text-[#64748b]">
                    {item.pct.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column (KHỐI 3 - Line/Area Chart & Projection Milestones) */}
        <div className="col-span-1 xl:col-span-7 space-y-8" id="nv-khoi3-projection">
          
          {/* Main Chart Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-6 bg-surface-container/20 border border-white/5 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="text-primary" size={18} />
                  KHỐI 3 — Dự báo tăng trưởng tài sản
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Đường biểu diễn tích lũy tích gộp gộp vốn gốc cộng lãi kép bình quân {(portfolioReturn * 100).toFixed(1)}%/năm.
                </p>
              </div>

              {/* Years Selector tabs */}
              <div className="flex bg-[#070a0f] rounded-xl p-1 border border-white/5 w-fit">
                {[5, 10, 15, 20, 30].map(y => (
                  <button 
                    key={y} 
                    onClick={() => setForecastYears(y)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      forecastYears === y 
                        ? "bg-primary text-white shadow-md shadow-primary/10" 
                        : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    {y} Năm
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated PMT Control Slider inside the chart section */}
            <div className="p-4 rounded-2xl bg-[#060a10] border border-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Giả lập lượng tích lũy hàng tháng (PMT):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-black font-mono">
                      {monthlyPMT.toLocaleString("vi-VN")} ₫ / tháng
                    </span>
                    {isPMTCustomized && (
                      <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase">
                        Tùy chỉnh
                      </span>
                    )}
                  </div>
                </div>

                {isPMTCustomized && (
                  <button 
                    onClick={() => setCustomPMT(null)}
                    className="text-[9px] font-black uppercase text-primary hover:text-white transition-colors flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-1 rounded"
                  >
                    <RefreshCw size={10} /> Đặt lại theo dòng tiền ròng thực ({defaultPMT.toLocaleString("vi-VN")} ₫)
                  </button>
                )}
              </div>

              <input 
                type="range" 
                min="0" 
                max={Math.max(50000000, defaultPMT * 3)}
                step="500000"
                value={monthlyPMT}
                onChange={(e) => setCustomPMT(Number(e.target.value))}
                className="w-full accent-primary bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[#64748b] font-bold">
                <span>0 ₫</span>
                <span>Dòng tiền ròng thực tế: {defaultPMT.toLocaleString("vi-VN")} ₫</span>
                <span>{(Math.max(50000000, defaultPMT * 3) / 1e6).toFixed(0)} Triệu ₫</span>
              </div>
            </div>

            {/* Core Projection AreaChart */}
            <div className="h-72 w-full relative">
              {netWorth > 0 || monthlyPMT > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastPoints} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="vonGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="yearLabel" stroke="#475569" fontSize={9} tickLine={false} />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `${(v/1e6).toFixed(0)}M`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgb(9 15 25 / 95%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}
                      formatter={(value: any, name: any) => {
                        const formatted = `${value.toLocaleString()} ₫`;
                        const labelName = name === "value" ? "Lũy kế tài sản (Lãi kép)" : "Tổng vốn thực tế tích lũy";
                        return [formatted, labelName];
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconSize={10} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} 
                    />
                    <Area 
                      name="value"
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--color-primary)" 
                      fill="url(#compGrad)" 
                      strokeWidth={3} 
                    />
                    <Area 
                      name="contributions"
                      type="monotone" 
                      dataKey="contributions" 
                      stroke="#10b981" 
                      fill="url(#vonGrad)" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <div className="space-y-2">
                    <AlertCircle className="mx-auto text-[#64748b]" size={24} />
                    <p className="text-xs text-on-surface-variant font-bold">Hãy bổ sung tài sản hiện tại hoặc dòng tiền tích lũy để sinh biểu đồ dự báo.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick calculations parameters notes */}
            <div className="bg-[#05080e] rounded-xl p-4 border border-white/5 space-y-2 text-xs">
              <span className="font-extrabold text-[#e2e8f0] uppercase tracking-wider text-[9px] flex items-center gap-1.5 text-primary">
                <Info size={11} /> Công thức toán học dự báo tăng trưởng:
              </span>
              <p className="text-[10px] text-[#64748b] leading-relaxed font-mono">
                FV = PV × (1+r)ⁿ + PMT_năm × [((1+r)ⁿ - 1) / r]
              </p>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                Với Vốn gốc ban đầu PV (Tổng tài sản ròng thực tế) = <span className="font-mono font-bold text-white">{netWorth.toLocaleString()} ₫</span>, PMT lũy kế hàng năm = <span className="font-mono font-bold text-white">{(monthlyPMT*12).toLocaleString()} ₫</span>, hệ số lãi suất kép bình quân gia quyền tự tính r = <span className="font-mono font-extrabold text-primary">{(portfolioReturn * 100).toFixed(2)}% / năm</span>.
              </p>
            </div>
          </motion.div>

          {/* Forecast Target Milestone Badges */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#94a3b8]">Các cột mốc tích sản quan trọng (Dự kiến)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Milestone Year 1 */}
              <div className="p-4 bg-surface-container/20 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#94a3b8] tracking-widest mb-1.5">
                    <Calendar size={12} className="text-primary" /> Sau 1 năm
                  </div>
                  <p className="text-sm font-black font-mono text-white mb-1">
                    {milestone1.total.toLocaleString()} ₫
                  </p>
                </div>
                <div className="text-[9px] text-[#64748b] leading-tight mt-2 border-t border-white/5 pt-1.5">
                  <span className="block font-medium">Vốn: {milestone1.contributions.toLocaleString()}</span>
                  <span className="block font-black text-primary mt-0.5">Lãi: +{milestone1.interest.toLocaleString()}</span>
                </div>
              </div>

              {/* Milestone Year 3 */}
              <div className="p-4 bg-surface-container/20 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#94a3b8] tracking-widest mb-1.5">
                    <Calendar size={12} className="text-primary" /> Sau 3 năm
                  </div>
                  <p className="text-sm font-black font-mono text-white mb-1">
                    {milestone3.total.toLocaleString()} ₫
                  </p>
                </div>
                <div className="text-[9px] text-[#64748b] leading-tight mt-2 border-t border-white/5 pt-1.5">
                  <span className="block font-medium">Vốn: {milestone3.contributions.toLocaleString()}</span>
                  <span className="block font-black text-primary mt-0.5">Lãi: +{milestone3.interest.toLocaleString()}</span>
                </div>
              </div>

              {/* Milestone Year 5 */}
              <div className="p-4 bg-surface-container/20 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#94a3b8] tracking-widest mb-1.5">
                    <Calendar size={12} className="text-primary" /> Sau 5 năm
                  </div>
                  <p className="text-sm font-black font-mono text-white mb-1">
                    {milestone5.total.toLocaleString()} ₫
                  </p>
                </div>
                <div className="text-[9px] text-[#64748b] leading-tight mt-2 border-t border-white/5 pt-1.5">
                  <span className="block font-medium">Vốn: {milestone5.contributions.toLocaleString()}</span>
                  <span className="block font-black text-emerald-400 mt-0.5">Lãi: +{milestone5.interest.toLocaleString()}</span>
                </div>
              </div>

              {/* Milestone Year 10 */}
              <div className="p-4 bg-[#09101a] border border-primary/20 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors shadow-lg shadow-primary/2">
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-primary tracking-widest mb-1.5">
                    <Sparkles size={12} /> Sau 10 năm
                  </div>
                  <p className="text-sm font-black font-mono text-white mb-1">
                    {milestone10.total.toLocaleString()} ₫
                  </p>
                </div>
                <div className="text-[9px] text-primary-light leading-tight mt-2 border-t border-white/5 pt-1.5">
                  <span className="block font-medium">Vốn: {milestone10.contributions.toLocaleString()}</span>
                  <span className="block font-black text-emerald-400 mt-0.5">Lãi kép: +{milestone10.interest.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* KHỐI 4 — PHÂN TÍCH AI (Dynamic Rule-Based Insight Cards) */}
      <div className="space-y-4 pt-4 border-t border-white/5" id="nv-khoi4-ai-insights">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#94a3b8]">KHỐI 4 — Hệ thống nhận xét tài sản thông minh AI</h3>
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-extrabold uppercase">AI Portfolio System</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeInsights.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className={cn(
                "p-6 rounded-2xl border bg-surface-container/15 backdrop-blur-sm shadow-sm relative overflow-hidden flex flex-col gap-3 transition-colors",
                ins.type === "danger" && "border-red-500/10 hover:border-red-500/20 shadow-red-500/1",
                ins.type === "warning" && "border-yellow-500/10 hover:border-yellow-500/20 shadow-yellow-500/1",
                ins.type === "success" && "border-emerald-500/10 hover:border-emerald-500/20 shadow-emerald-500/1",
                ins.type === "primary" && "border-primary/10 hover:border-primary/20 shadow-primary/1"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 flex-shrink-0" style={{ color: ins.colorHex }}>
                  <ins.icon size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{ins.title}</h4>
                  <span className="text-[9px] uppercase font-black text-[#64748b] tracking-wider">Danh mục chuyên sâu</span>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                {ins.desc}
              </p>

              {/* Dynamic bottom indicator */}
              <div className="flex items-center gap-1.5 text-[9px] text-[#64748b] font-bold mt-2 pt-2 border-t border-white/5">
                <ShieldCheck size={12} className="text-primary/70" /> Khuyến nghị cố vấn phân bổ tự động
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
