import { Search, Bell, UserCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

export function TopBar() {
  const navigate = useNavigate();
  const { transactions, allocation, stocks, monthlyAllocation } = useStore();

  const cashInflow = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const cashOutflow = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netCashFlow = cashInflow - cashOutflow;

  const stockValue = stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  const totalAssetsValue = allocation.cash + stockValue + allocation.savings + allocation.gold + allocation.usd;

  return (
    <>
      <header className="fixed top-0 right-0 hidden h-20 w-[calc(100%-16rem)] items-center justify-between border-b border-white/10 bg-surface-dim/70 px-8 backdrop-blur-lg md:flex z-40">
        <div className="relative flex-1 max-w-[180px] lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài sản, dự liệu..."
            className="w-full rounded-lg border border-[#2d333b] bg-[#05070a] py-2 pl-10 pr-4 text-xs text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => navigate("/add-transaction")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[10px] font-black uppercase text-white shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={14} /> Thêm Giao Dịch
          </button>
          
          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Dòng tiền ròng</p>
            <p className={`text-sm lg:text-base font-black tracking-tight ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-vibrant-red'}`}>
              {netCashFlow >= 0 ? "+" : ""}{netCashFlow.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Thanh khoản ròng</p>
            <p className="text-sm lg:text-base font-black tracking-tight text-primary">
              {allocation.cash.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Tổng tài sản ròng</p>
            <p className="text-sm lg:text-base font-black tracking-tight text-[#38bdf8]">
              {totalAssetsValue.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container-highest/50 hover:text-on-surface relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border border-surface-dim bg-vibrant-red shadow-lg shadow-vibrant-red/50" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container-highest/50 hover:text-on-surface">
              <UserCircle size={24} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
