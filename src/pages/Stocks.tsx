import { motion } from "motion/react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { 
  Search, ArrowDown, ArrowUp, Filter, Download, MoreVertical, 
  Star, Wallet, HelpCircle, TrendingUp, X, Sparkles, Check, ChevronRight, Bookmark
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useStore } from "../store/useStore";
import { useState, useEffect, useMemo } from "react";

// Deterministic historical point generator to simulate real historical charts
const generateHistoricalData = (ticker: string, currentPrice: number, period: string) => {
  let seed = ticker.charCodeAt(0) + (ticker.charCodeAt(1) || 0) + (ticker.charCodeAt(2) || 0);
  
  let dataPointsCount = 20;
  let priceMultiplier = 1;
  let timeFormat = (index: number) => `T${index + 1}`;
  
  if (period === '1N') { // 1 Day
    dataPointsCount = 24;
    timeFormat = (index: number) => {
      const hour = 9 + Math.floor(index / 4);
      const min = (index % 4) * 15;
      return `${hour}:${min === 0 ? "00" : min}`;
    };
    priceMultiplier = 1.002;
  } else if (period === '1T') { // 1 Week
    dataPointsCount = 7;
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    timeFormat = (index: number) => days[index] || "T";
    priceMultiplier = 1.015;
  } else if (period === '1Th') { // 1 Month
    dataPointsCount = 15;
    timeFormat = (index: number) => `Ngày ${index * 2 + 1}`;
    priceMultiplier = 1.05;
  } else if (period === 'YTD') { // Year to Date
    dataPointsCount = 12;
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    timeFormat = (index: number) => months[index] || "Th";
    priceMultiplier = 1.12;
  } else if (period === '1Năm') { // 1 Year
    dataPointsCount = 12;
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    timeFormat = (index: number) => months[index] || "Th";
    priceMultiplier = 1.25;
  }

  const data = [];
  // Calculate a baseline price using sine waves
  let basePrice = currentPrice / (1 + (Math.sin(seed) * 0.05));
  
  for (let i = 0; i < dataPointsCount; i++) {
    // Elegant smooth wave pattern with subtle random-looking noise
    const wave = Math.sin((i / dataPointsCount) * Math.PI * 1.5 + seed) * (basePrice * (priceMultiplier - 1) * 0.3);
    const noise = (Math.sin(i * 17 + seed) * 0.5 + 0.5) * (basePrice * 0.003);
    const trend = (i / dataPointsCount) * (basePrice * (priceMultiplier - 1) * 0.5);
    
    const pointPrice = Math.round(basePrice + wave + noise + trend);
    data.push({
      time: timeFormat(i),
      price: pointPrice,
      vol: Math.round(50000 + Math.abs(Math.sin(i + seed)) * 150000)
    });
  }
  
  // Set final point to currentPrice precisely
  if (data.length > 0) {
    data[data.length - 1].price = currentPrice;
  }
  
  return data;
};

export default function Stocks() {
  const { 
    stocks, 
    watchlist: watchlistStore, 
    toggleWatchlist, 
    buySpecificStock, 
    sellSpecificStock, 
    updateAllPricesLive, 
    allocation 
  } = useStore();

  const watchlist = watchlistStore || [];

  // Active state handlers
  const [selectedTicker, setSelectedTicker] = useState("FPT");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'owned'>('all');
  const [period, setPeriod] = useState<string>('1T');

  // Buy/Sell Modal status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'buy' | 'sell'>('buy');
  const [tradeQuantity, setTradeQuantity] = useState<number>(10);
  const [tradeError, setTradeError] = useState("");
  const [tradeSuccess, setTradeSuccess] = useState("");

  // Periodically tick stock prices simulating live HOSE transaction matching
  useEffect(() => {
    const timer = setInterval(() => {
      updateAllPricesLive();
    }, 4000);
    return () => clearInterval(timer);
  }, [updateAllPricesLive]);

  // Live selected stock lookup
  const selectedStock = useMemo(() => {
    return stocks.find(s => s.ticker === selectedTicker) || stocks[0];
  }, [stocks, selectedTicker]);

  // Handle auto stock value calculations
  const totalStockValue = useMemo(() => {
    return stocks.reduce((sum, s) => sum + s.quantity * s.currentPrice, 0);
  }, [stocks]);

  const totalCostBasis = useMemo(() => {
    return stocks.reduce((sum, s) => sum + s.quantity * s.avgPrice, 0);
  }, [stocks]);

  const totalPnL = totalStockValue - totalCostBasis;
  const totalPnLPerc = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;

  // Filtered stocks shown in Watchlist Sidebar based on tab + search
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      // 1. Filter by Tab
      if (activeTab === 'favorites' && !watchlist.includes(stock.ticker)) {
        return false;
      }
      if (activeTab === 'owned' && stock.quantity <= 0) {
        return false;
      }
      // 2. Filter by Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        return stock.ticker.toLowerCase().includes(q) || stock.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [stocks, activeTab, watchlist, searchQuery]);

  // List of only held stocks for "Chi Tiết Sở Hữu"
  const ownedHoldings = useMemo(() => {
    return stocks.filter(s => s.quantity > 0);
  }, [stocks]);

  // Generate historical data points for selected stock dynamically
  const chartData = useMemo(() => {
    return generateHistoricalData(selectedStock.ticker, selectedStock.currentPrice, period);
  }, [selectedStock.ticker, selectedStock.currentPrice, period]);

  // Determine whether chart reflects positive or negative price trend
  const isChartUp = useMemo(() => {
    if (chartData.length < 2) return true;
    return chartData[chartData.length - 1].price >= chartData[0].price;
  }, [chartData]);

  // Handle open modal
  const openTradeModal = (type: 'buy' | 'sell') => {
    setModalType(type);
    setTradeQuantity(10);
    setTradeError("");
    setTradeSuccess("");
    setIsModalOpen(true);
  };

  // Perform virtual transactions
  const handleConfirmTrade = () => {
    setTradeError("");
    setTradeSuccess("");
    if (tradeQuantity <= 0) {
      setTradeError("Số lượng giao dịch phải lớn hơn 0");
      return;
    }

    if (modalType === 'buy') {
      const success = buySpecificStock(
        selectedStock.ticker, 
        selectedStock.name, 
        tradeQuantity, 
        selectedStock.currentPrice
      );
      if (success) {
        setTradeSuccess(`Chúc mừng! Giao dịch thành công. Đã mua ${tradeQuantity} cổ phiếu ${selectedStock.ticker}`);
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setTradeError("Giao dịch thất bại! Bạn không đủ số dư tiền mặt khả dụng.");
      }
    } else {
      const success = sellSpecificStock(
        selectedStock.ticker, 
        tradeQuantity, 
        selectedStock.currentPrice
      );
      if (success) {
        setTradeSuccess(`Chúc mừng! Giao dịch thành công. Đã bán ${tradeQuantity} cổ phiếu ${selectedStock.ticker}`);
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setTradeError(`Giao dịch thất bại! Bạn không có đủ số lượng cổ phiếu khả dụng (Đang nắm giữ: ${selectedStock.quantity} CP).`);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Quick HUD with Realistic Scale */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 rounded-xl flex items-center justify-between border border-white/5 bg-[#0b0f19]"
        >
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Tiền mặt khả dụng</p>
            <p className="text-xl font-black text-emerald-400 mt-1 font-mono">{(allocation.cash).toLocaleString("vi-VN")} ₫</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Wallet size={18} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-4 rounded-xl flex items-center justify-between border border-white/5 bg-[#0b0f19]"
        >
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Sổ cổ phiếu VN50</p>
            <p className="text-xl font-black text-primary mt-1 font-mono">{totalStockValue.toLocaleString("vi-VN")} ₫</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <TrendingUp size={18} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4 rounded-xl flex items-center justify-between border border-white/5 bg-[#0b0f19]"
        >
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Lãi/Lỗ tạm tính</p>
            <p className={cn(
              "text-xl font-black mt-1 font-mono",
              totalPnL >= 0 ? "text-emerald-400" : "text-vibrant-red"
            )}>
              {totalPnL >= 0 ? "+" : ""}{totalPnL.toLocaleString("vi-VN")} ₫
            </p>
          </div>
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center border",
            totalPnL >= 0 ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" : "bg-red-500/5 text-vibrant-red border-red-500/10"
          )}>
            {totalPnL >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-4 rounded-xl flex items-center justify-between border border-white/5 bg-[#0b0f19]"
        >
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Tỷ suất sinh lời</p>
            <p className={cn(
              "text-xl font-black mt-1 font-mono",
              totalPnL >= 0 ? "text-emerald-400" : "text-vibrant-red"
            )}>
              {totalPnL >= 0 ? "+" : ""}{totalPnLPerc.toFixed(2)}%
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-on-surface border border-white/10">
            <Sparkles size={18} className="text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Main Stock Interface */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 h-auto xl:h-[620px]">
        
        {/* Trading Terminal Area Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel col-span-1 xl:col-span-8 rounded-xl p-6 flex flex-col justify-between"
        >
          {/* Header Info */}
          <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tighter text-on-surface">{selectedStock.ticker}</h2>
                  <span className="text-sm font-semibold text-on-surface-variant truncate max-w-xs">{selectedStock.name}</span>
                  <button 
                    onClick={() => toggleWatchlist(selectedStock.ticker)}
                    className="p-1 hover:bg-white/10 rounded-lg text-yellow-400 hover:scale-105 transition-all text-xs flex items-center"
                    title={watchlist.includes(selectedStock.ticker) ? "Bỏ yêu thích" : "Yêu thích"}
                  >
                    <Star 
                      size={18} 
                      className={watchlist.includes(selectedStock.ticker) ? "fill-yellow-400 text-yellow-400" : "text-on-surface-variant"} 
                    />
                  </button>
                  <span className="px-1.5 py-0.5 bg-[#1e293b] border border-white/10 rounded text-[9px] font-bold text-on-surface-variant">HOSE</span>
                </div>
                
                <div className="mt-2.5 flex items-baseline gap-3">
                  <span className="text-3xl font-black tracking-tight text-on-surface">
                    {selectedStock.currentPrice.toLocaleString("vi-VN")} ₫
                  </span>
                  
                  {/* Performance compared to Average Buying price if owned, or general daily drift */}
                  {selectedStock.quantity > 0 ? (
                    <span className={cn(
                      "flex items-center gap-0.5 font-bold text-xs px-2 py-0.5 rounded-full bg-white/5",
                      selectedStock.currentPrice >= selectedStock.avgPrice ? "text-emerald-400" : "text-vibrant-red"
                    )}>
                      {selectedStock.currentPrice >= selectedStock.avgPrice ? <ArrowUp size={12} /> : <ArrowDown size={12} />} 
                      Lãi tính từ giá vốn: {(((selectedStock.currentPrice - selectedStock.avgPrice) / selectedStock.avgPrice) * 100).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 font-bold text-xs text-on-surface-variant">
                      Chưa sở hữu
                    </span>
                  )}
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-[#0c101a] p-1 rounded-lg border border-white/5">
                  {[
                    { key: "1N", d: "1 Ngày" },
                    { key: "1T", d: "1 Tuần" },
                    { key: "1Th", d: "1 Tháng" },
                    { key: "YTD", d: "Đầu năm" },
                    { key: "1Năm", d: "1 Năm" }
                  ].map(t => (
                    <button 
                      key={t.key} 
                      onClick={() => setPeriod(t.key)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all",
                        t.key === period 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "text-on-surface-variant hover:text-on-surface"
                      )}
                    >
                      {t.key}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-white/10 mx-1" />

                <div className="flex gap-1.5">
                  <button 
                    onClick={() => openTradeModal('buy')}
                    className="bg-primary/20 hover:bg-primary text-primary hover:text-white px-4 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-wider border border-primary/20 hover:border-transparent active:scale-95 transition-all flex items-center gap-1"
                  >
                    MUA THÊM
                  </button>
                  {selectedStock.quantity > 0 && (
                    <button 
                      onClick={() => openTradeModal('sell')}
                      className="bg-vibrant-red/10 hover:bg-vibrant-red text-vibrant-red hover:text-white px-4 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-wider border border-vibrant-red/20 hover:border-transparent active:scale-95 transition-all flex items-center gap-1"
                    >
                      BÁN BỚT
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Recharts visualizer inside custom frame */}
          <div className="flex-1 mt-6 min-h-[300px] bg-[#05070a]/40 rounded-xl border border-white/5 p-4 relative flex flex-col justify-end">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-on-surface-variant font-mono">Chỉ báo giá trị: {chartData.length} nốt ghi</span>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-on-surface-variant font-mono">Biên độ dao động: 2.5%</span>
            </div>
            
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPriceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isChartUp ? "#10b981" : "#ef4444"} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={isChartUp ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#475569" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={9} 
                    domain={['auto', 'auto']} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                    labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '9px' }}
                    itemStyle={{ color: '#ffffff', fontWeight: 'black', fontSize: '11px' }}
                    formatter={(val: any) => [`${Number(val).toLocaleString("vi-VN")} ₫`, "Giá trị"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isChartUp ? "#10b981" : "#ef4444"} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorPriceGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Dashed base line indicating average cost if owned */}
            {selectedStock.quantity > 0 && (
              <div className="absolute left-16 right-4 top-[150px] border-t border-dashed border-primary/30 pointer-events-none flex items-center justify-end">
                <span className="bg-[#0b0f19] px-2 py-0.5 rounded text-[8px] font-bold text-primary mr-2 transform -translate-y-1/2">
                  Giá mua TB: {selectedStock.avgPrice.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Dynamic Watchlist / Screener Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel col-span-1 xl:col-span-4 rounded-xl p-5 flex flex-col overflow-hidden bg-[#0a0e17]"
        >
          {/* Header Screener Controls */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-black uppercase text-on-surface tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" /> Bảng Giá & Sàng Lọc
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-400/5 rounded font-black uppercase shadow-sm">
                ● LIVE
              </span>
            </div>

            {/* Live Interactive Search bar */}
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant pointer-events-none">
                <Search size={14} />
              </span>
              <input 
                type="text"
                placeholder="Tìm mã cổ phiếu hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#05070a]/60 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs font-bold text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Interactive Filters Tab */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#05070a] rounded-lg border border-white/5 mb-4 text-center">
              <button 
                onClick={() => setActiveTab('all')}
                className={cn(
                  "py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all",
                  activeTab === 'all' ? "bg-white/5 text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                Tất cả VN50
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={cn(
                  "py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all",
                  activeTab === 'favorites' ? "bg-white/5 text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                Watchlist
              </button>
              <button 
                onClick={() => setActiveTab('owned')}
                className={cn(
                  "py-1.5 rounded text-[9px] font-black uppercase tracking-wider transition-all",
                  activeTab === 'owned' ? "bg-white/5 text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                Của Tôi
              </button>
            </div>
          </div>

          {/* List items with live updating rates */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => {
                const isSelected = stock.ticker === selectedStock.ticker;
                const isFavorite = watchlist.includes(stock.ticker);
                const drift = Math.sin(stock.ticker.charCodeAt(0)) * 0.5; // simple dynamic indicator
                
                return (
                  <div 
                    key={stock.ticker}
                    onClick={() => setSelectedTicker(stock.ticker)}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                      isSelected 
                        ? "bg-[#1e1b4b]/20 border-primary shadow-lg shadow-indigo-950/10" 
                        : "bg-[#0c101a] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(stock.ticker);
                        }}
                        className="text-on-surface-variant hover:text-yellow-400 p-0.5"
                      >
                        <Star 
                          size={13} 
                          className={isFavorite ? "fill-yellow-400 text-yellow-400" : "opacity-40 hover:opacity-100"} 
                        />
                      </button>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-on-surface font-mono">{stock.ticker}</p>
                          {stock.quantity > 0 && (
                            <span className="text-[7px] font-black uppercase px-1 py-0 bg-primary/20 text-primary border border-primary/20 rounded">
                              Học viên ({stock.quantity} CP)
                            </span>
                          )}
                        </div>
                        <p className="text-[8px] font-semibold text-on-surface-variant truncate max-w-[130px]">
                          {stock.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-on-surface">
                        {stock.currentPrice.toLocaleString("vi-VN")} ₫
                      </p>
                      <span className={cn(
                        "text-[9px] font-mono font-bold flex items-center justify-end gap-0.5",
                        drift >= 0 ? "text-emerald-400" : "text-vibrant-red"
                      )}>
                        {drift >= 0 ? "+" : ""}{(drift * 1.5).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center space-y-2">
                <HelpCircle size={32} className="mx-auto text-on-surface-variant opacity-40 animate-pulse" />
                <p className="text-xs text-on-surface-variant font-bold">Không tìm thấy mã phù hợp</p>
                <p className="text-[10px] text-on-surface-variant/70">Thử đổi bộ lọc hoặc từ khóa khác</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Owned Holdings Table Section with Dynamic calculations based strictly on real quantity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl overflow-hidden mt-8 border border-white/5"
      >
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0a0e17]">
          <div>
            <h3 className="text-lg font-black uppercase text-on-surface tracking-wider">Chi Tiết Cổ Phiếu Đang Sở Hữu</h3>
            <p className="text-[10px] text-on-surface-variant mt-1">
              Phân tích chi tiết giá vốn, giá hiện tại, lãi lỗ tạm tính, tỷ trọng và hiệu suất toàn bộ danh mục cổ phiếu VN50 của bạn.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-white/5 bg-[#05070a] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider hover:border-primary transition-all">
              <Filter size={12} /> Hạng mục
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-white/5 bg-[#05070a] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider hover:border-primary transition-all">
              <Download size={12} /> Tải báo cáo
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#05070a]/60 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                <th className="p-4">Chứng khoán</th>
                <th className="p-4 text-right">Số lượng nắm giữ</th>
                <th className="p-4 text-right">Giá vốn (Giá mua TB)</th>
                <th className="p-4 text-right">Giá trị khớp lệnh (Live)</th>
                <th className="p-4 text-right">Lãi / Lỗ tạm tính</th>
                <th className="p-4 text-right">Giá trị hiện tại</th>
                <th className="p-4 text-right">Tỷ trọng</th>
                <th className="p-4 text-center">Giao dịch nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ownedHoldings.length > 0 ? (
                ownedHoldings.map((item) => {
                  const currentTotalValue = item.quantity * item.currentPrice;
                  const itemCostBasis = item.quantity * item.avgPrice;
                  const pnl = currentTotalValue - itemCostBasis;
                  const pnlPerc = item.avgPrice > 0 ? (pnl / itemCostBasis) * 100 : 0;
                  const weight = totalStockValue > 0 ? (currentTotalValue / totalStockValue) * 100 : 0;
                  
                  return (
                    <tr 
                      key={item.ticker} 
                      className={cn(
                        "hover:bg-white/5 transition-colors group cursor-pointer",
                        item.ticker === selectedStock.ticker && "bg-white/5"
                      )} 
                      onClick={() => setSelectedTicker(item.ticker)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded bg-[#2563eb]/10 flex items-center justify-center font-bold text-[9px] text-[#2563eb] border border-[#2563eb]/20">
                            {item.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-black text-on-surface font-mono">{item.ticker}</p>
                              {watchlist.includes(item.ticker) && (
                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{item.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right text-xs font-black font-mono text-on-surface">
                        {item.quantity.toLocaleString("vi-VN")} CP
                      </td>
                      <td className="p-4 text-right text-xs text-on-surface-variant font-mono">
                        {item.avgPrice.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="p-4 text-right text-xs font-black font-mono text-on-surface">
                        {item.currentPrice.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="p-4 text-right">
                        <p className={cn("text-xs font-black font-mono", pnl >= 0 ? "text-emerald-400" : "text-vibrant-red")}>
                          {pnl >= 0 ? "+" : ""}{pnl.toLocaleString("vi-VN")} ₫
                        </p>
                        <p className={cn("text-[9px] font-mono font-extrabold", pnl >= 0 ? "text-emerald-400/80" : "text-vibrant-red/80")}>
                          {pnlPerc >= 0 ? "+" : ""}{pnlPerc.toFixed(2)}%
                        </p>
                      </td>
                      <td className="p-4 text-right text-xs font-black text-on-surface font-mono">
                        {currentTotalValue.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <span className="text-xs font-black font-mono text-on-surface">{weight.toFixed(1)}%</span>
                          <div className="w-10 h-1 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${weight}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => { setSelectedTicker(item.ticker); openTradeModal('buy'); }}
                            className="bg-primary/20 hover:bg-primary text-primary hover:text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all"
                          >
                            Mua
                          </button>
                          <button 
                            onClick={() => { setSelectedTicker(item.ticker); openTradeModal('sell'); }}
                            className="bg-vibrant-red/20 hover:bg-vibrant-red text-vibrant-red hover:text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all"
                          >
                            Bán
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <HelpCircle size={40} className="mx-auto text-on-surface-variant opacity-30 block mb-3 animate-bounce" />
                    <p className="text-xs text-on-surface-variant font-black uppercase tracking-wider">Danh mục trống hoặc không khả dụng</p>
                    <p className="text-[10px] text-on-surface-variant/80 mt-1 max-w-sm mx-auto">
                      Hãy chọn các mã HOT như <strong>FPT, MWG, VCB, HPG</strong> ở bảng trên và click <strong>MUA THÊM</strong> để bắt đầu xây dựng danh mục cổ phiếu của bạn.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Dynamic Buy/Sell Confirmation Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0b0f19] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-xl text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="space-y-1">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                modalType === 'buy' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-vibrant-red border-red-500/20"
              )}>
                {modalType === 'buy' ? "MUA CO PHIEU" : "BAN CO PHIEU"}
              </span>
              <h3 className="text-xl font-black text-on-surface mt-2">
                {selectedStock.ticker} - {selectedStock.name}
              </h3>
            </div>

            {/* Quick Pricing info */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#05070a] border border-white/5 text-xs font-semibold">
              <div className="space-y-1">
                <p className="text-on-surface-variant uppercase text-[8px] tracking-widest font-black">Giá Khớp LIVE</p>
                <p className="text-md font-black font-mono text-on-surface">{selectedStock.currentPrice.toLocaleString("vi-VN")} ₫</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-on-surface-variant uppercase text-[8px] tracking-widest font-black">Tiền mặt khả dụng</p>
                <p className="text-md font-black font-mono text-emerald-400">{(allocation.cash).toLocaleString("vi-VN")} ₫</p>
              </div>
            </div>

            {/* Quantity Input Form */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                Số Lượng Cổ Phiếu Giao Dịch
              </label>
              
              <div className="flex gap-2">
                <input 
                  type="number"
                  min="1"
                  step="1"
                  value={tradeQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setTradeQuantity(val);
                  }}
                  className="flex-1 bg-[#05070a] border border-white/10 rounded-xl px-4 py-3 text-sm font-black font-mono text-on-surface focus:outline-none focus:border-primary"
                />
                <span className="bg-white/5 border border-white/5 px-4 rounded-xl font-black text-[11px] flex items-center justify-center text-on-surface font-mono cursor-default">
                  CP
                </span>
              </div>

              {/* Presets */}
              <div className="flex gap-2.5 pt-1.5 flex-wrap">
                {[10, 50, 100, 500].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setTradeQuantity(amt)}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black font-mono text-on-surface-variant hover:text-on-surface transition-all"
                  >
                    +{amt}
                  </button>
                ))}
                
                {modalType === 'sell' && selectedStock.quantity > 0 && (
                  <button 
                    onClick={() => setTradeQuantity(selectedStock.quantity)}
                    className="bg-vibrant-red/10 hover:bg-vibrant-red/20 border border-vibrant-red/20 px-3 py-1.5 rounded-lg text-[10px] font-black text-vibrant-red transition-all ml-auto"
                  >
                    Bán hết ({selectedStock.quantity} CP)
                  </button>
                )}
              </div>
            </div>

            {/* Price Cost Breakdown */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#05070a]/60 space-y-2 text-xs font-bold leading-normal">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tổng giá trị giao dịch:</span>
                <span className="font-mono text-on-surface">{(tradeQuantity * selectedStock.currentPrice).toLocaleString("vi-VN")} ₫</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-[10px] uppercase font-black tracking-wider text-on-surface-variant">
                <span>Trạng thái sau giao dịch:</span>
                <span className={cn(
                  modalType === 'buy' 
                    ? (allocation.cash >= tradeQuantity * selectedStock.currentPrice ? "text-emerald-400" : "text-vibrant-red")
                    : (selectedStock.quantity >= tradeQuantity ? "text-emerald-400" : "text-vibrant-red")
                )}>
                  {modalType === 'buy' 
                    ? (allocation.cash >= tradeQuantity * selectedStock.currentPrice ? "Đủ số dư khả dụng" : "Không đủ tiền mặt")
                    : (selectedStock.quantity >= tradeQuantity ? "Đủ số lượng nắm giữ" : "Vượt quá CP sở hữu")}
                </span>
              </div>
            </div>

            {/* Error notifications */}
            {tradeError && (
              <div className="bg-red-500/5 text-vibrant-red text-[11px] font-black uppercase p-3 rounded-xl border border-red-500/15 flex items-center gap-2">
                <HelpCircle size={16} /> {tradeError}
              </div>
            )}

            {/* Success notifications */}
            {tradeSuccess && (
              <div className="bg-emerald-500/10 text-emerald-400 text-[11px] font-black uppercase p-3 rounded-xl border border-emerald-500/15 flex items-center gap-2">
                <Check size={16} /> {tradeSuccess}
              </div>
            )}

            {/* Active Action trigger buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface border border-white/5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all text-center"
              >
                HỦY
              </button>
              <button 
                onClick={handleConfirmTrade}
                disabled={!!tradeSuccess}
                className={cn(
                  "flex-1 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white active:scale-95 transition-all",
                  modalType === 'buy' ? "bg-primary" : "bg-vibrant-red",
                  tradeSuccess && "opacity-50 cursor-not-allowed"
                )}
              >
                {modalType === 'buy' ? "XÁC NHẬN MUA" : "XÁC NHẬN BÁN"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
