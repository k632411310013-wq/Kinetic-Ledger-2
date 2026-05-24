import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <TopBar />
        <main className="p-4 pt-24 md:p-8 md:pt-28">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Nav Placeholder */}
      <div className="fixed bottom-0 left-0 flex h-16 w-full items-center justify-around border-t border-white/5 bg-surface-container-high/90 backdrop-blur-xl md:hidden z-50">
        <button className="text-primary font-bold">BĐK</button>
        <button className="text-on-surface-variant">Dòng Tiền</button>
        <button className="text-on-surface-variant">Phân Tích</button>
        <button className="text-on-surface-variant">Cài Đặt</button>
      </div>
    </div>
  );
}
