import { LayoutDashboard, Wallet, TrendingUp, Search, Bell, User as UserIcon, Activity, Settings, Shield, PiggyBank, BrainCircuit, Waves, Zap, BarChart3, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const navItems = [
  { label: "Bảng Điều Khiển", icon: LayoutDashboard, path: "/" },
  { label: "Dòng Tiền", icon: Activity, path: "/cash-flow" },
  { label: "Thêm Giao Dịch", icon: Plus, path: "/add-transaction" },
  { label: "Chi Tiết Danh Mục", icon: Wallet, path: "/portfolio" },
  { label: "Cổ Phiếu VN50", icon: TrendingUp, path: "/stocks" },
  { label: "Dự Báo Tài Sản", icon: BrainCircuit, path: "/simulation" },
  { label: "Mục Tiêu Tiết Kiệm", icon: PiggyBank, path: "/savings" },
  { label: "Phân Tích Chuyên Sâu", icon: Waves, path: "/analytics" },
  { label: "Thông Báo", icon: Bell, path: "/notifications" },
  { label: "Cài Đặt Hệ Thống", icon: Settings, path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-white/10 bg-surface-container/70 py-8 backdrop-blur-xl md:flex z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container shadow-lg">
          <Shield className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Kinetic Ledger</h1>
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Premium Fintech</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 hover:bg-white/5",
                isActive 
                  ? "bg-primary/10 text-primary border-r-4 border-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <item.icon size={20} fill={isActive ? "currentColor" : "none"} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/5 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-surface-variant/50">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFf0lsfm3zwagx1-UWYXwGzvZ0BsYHoEfPym1zL-D6g4EdCEaSdO9vm32IafzSzmD_ZrE4UaJEQK35-K-Tds_7I1QtAlzpg9kqAE_zJ85J8bQaMfMf92pjApGUUSgEbD-Viu9Jll5uKLwiDt8AI961PXVv9pEeZvzx3b-auSiuSAEmcTra84208VDY-09gipTq2dSKYQ2a691iNBBh0KHULijF_jOvzUY_1RdooRDRKqbsl3ytLGtPsORwGuR-RNDwTN5qQTPthA3e" 
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Alex Mercer</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Pro Trader</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
