import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction, StockHolding, PortfolioAllocation, SavingGoal } from "../types";

interface AppState {
  transactions: Transaction[];
  stocks: StockHolding[];
  allocation: PortfolioAllocation;
  goals: SavingGoal[];
  monthlyAllocation?: PortfolioAllocation;
  watchlist?: string[];
  
  // Actions
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateStock: (ticker: string, updates: Partial<StockHolding>) => void;
  updateAllocation: (updates: Partial<PortfolioAllocation>) => void;
  allocateCashToAsset: (asset: "stocks" | "savings" | "gold" | "usd", amount: number) => void;
  allocateIncomeSimulated: (incomeAmount: number, stockAmt: number, savingsAmt: number, goldAmt: number, usdAmt: number, cashAmt: number) => void;
  resetStore: () => void;
  buySpecificStock: (ticker: string, name: string, quantity: number, price: number) => boolean;
  sellSpecificStock: (ticker: string, quantity: number, price: number) => boolean;
  toggleWatchlist: (ticker: string) => void;
  updateAllPricesLive: () => void;
}

const initialTransactions: Transaction[] = [
  { id: "1", date: "2024-05-15", description: "Lương tháng 5", category: "Lương", type: "income", amount: 15000000, paymentMethod: "Ngân hàng" },
  { id: "2", date: "2024-05-14", description: "Thuê nhà Vinhomes", category: "Nhà ở", type: "expense", amount: 2500000, paymentMethod: "Ngân hàng" },
  { id: "3", date: "2024-05-12", description: "Ăn tối Haidilao", category: "Ăn uống", type: "expense", amount: 250000, paymentMethod: "Ví điện tử" },
  { id: "4", date: "2024-05-10", description: "Cổ tức FPT", category: "Đầu tư", type: "income", amount: 150000, paymentMethod: "Ngân hàng" },
  { id: "5", date: "2024-05-08", description: "Grab chuyển đồ", category: "Di chuyển", type: "expense", amount: 50000, paymentMethod: "Ví điện tử" },
];

const initialStocks: StockHolding[] = [
  { ticker: "FPT", name: "Công nghệ FPT", quantity: 120, avgPrice: 135000, currentPrice: 125500, expectedGrowth: 0.15 },
  { ticker: "MWG", name: "Thế Giới Di Động", quantity: 80, avgPrice: 60000, currentPrice: 62400, expectedGrowth: 0.12 },
  { ticker: "VCB", name: "Vietcombank", quantity: 50, avgPrice: 85200, currentPrice: 92400, expectedGrowth: 0.10 },
  { ticker: "HPG", name: "Hòa Phát", quantity: 300, avgPrice: 25500, currentPrice: 30200, expectedGrowth: 0.14 },
  { ticker: "VNM", name: "Vinamilk", quantity: 40, avgPrice: 70000, currentPrice: 68700, expectedGrowth: 0.08 },
  { ticker: "VIC", name: "Vingroup", quantity: 0, avgPrice: 0, currentPrice: 42100, expectedGrowth: 0.11 },
  { ticker: "VHM", name: "Vinhomes", quantity: 0, avgPrice: 0, currentPrice: 39800, expectedGrowth: 0.12 },
  { ticker: "TCB", name: "Techcombank", quantity: 0, avgPrice: 0, currentPrice: 47500, expectedGrowth: 0.13 },
  { ticker: "MSN", name: "Masan Group", quantity: 0, avgPrice: 0, currentPrice: 74200, expectedGrowth: 0.09 },
  { ticker: "ACB", name: "Ngân hàng ACB", quantity: 0, avgPrice: 0, currentPrice: 28400, expectedGrowth: 0.11 },
  { ticker: "STB", name: "Sacombank", quantity: 0, avgPrice: 0, currentPrice: 29150, expectedGrowth: 0.12 },
  { ticker: "SSI", name: "Chứng khoán SSI", quantity: 0, avgPrice: 0, currentPrice: 34500, expectedGrowth: 0.15 },
  { ticker: "VPB", name: "VPBank", quantity: 0, avgPrice: 0, currentPrice: 19200, expectedGrowth: 0.10 },
  { ticker: "MBB", name: "MB Bank", quantity: 0, avgPrice: 0, currentPrice: 22600, expectedGrowth: 0.14 },
  { ticker: "VRE", name: "Vincom Retail", quantity: 0, avgPrice: 0, currentPrice: 21300, expectedGrowth: 0.07 },
  { ticker: "REE", name: "Cơ Điện Lạnh REE", quantity: 0, avgPrice: 0, currentPrice: 61200, expectedGrowth: 0.10 },
  { ticker: "GAS", name: "PV GAS", quantity: 0, avgPrice: 0, currentPrice: 78400, expectedGrowth: 0.06 },
  { ticker: "BID", name: "Bảo hiểm BIDV", quantity: 0, avgPrice: 0, currentPrice: 46300, expectedGrowth: 0.09 },
  { ticker: "CTG", name: "VietinBank", quantity: 0, avgPrice: 0, currentPrice: 32150, expectedGrowth: 0.11 },
  { ticker: "PNJ", name: "Vàng bạc PNJ", quantity: 0, avgPrice: 0, currentPrice: 94800, expectedGrowth: 0.12 },
];

const initialGoals: SavingGoal[] = [
  { id: "1", label: "Quỹ khẩn cấp", current: 15000000, target: 30000000, progress: 50, status: "Đúng lộ trình", icon: "HeartPulse", deadline: "Thg 12 2024", color: "primary", glow: true },
  { id: "2", label: "Mua xe mới", current: 5000000, target: 25000000, progress: 20, status: "Tạm dừng", icon: "Car", deadline: "Thg 3 2025", color: "secondary" },
  { id: "3", label: "Đặt cọc mua nhà", current: 50000000, target: 300000000, progress: 16, status: "Tăng tốc", icon: "Home", deadline: "Thg 9 2025", color: "primary", glow: true },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: initialTransactions,
      stocks: initialStocks,
      allocation: {
        stocks: 36480000,
        savings: 15000000,
        cash: 50000000,
        gold: 5000000,
        usd: 5000000,
      },
      monthlyAllocation: {
        stocks: 0,
        savings: 0,
        cash: 12350000,
        gold: 0,
        usd: 0,
      },
      goals: initialGoals,
      watchlist: ["FPT", "MWG", "VCB", "HPG", "SSI"],
      
      addTransaction: (newTx) => set((state) => {
        const id = Math.random().toString(36).substr(2, 9);
        const addedTx = { ...newTx, id };
        
        const newAllocation = { ...state.allocation };
        const currentMonthlyAlloc = state.monthlyAllocation || {
          stocks: 0,
          savings: 0,
          cash: 12350000,
          gold: 0,
          usd: 0,
        };
        const updatedMonthlyAllocation = { ...currentMonthlyAlloc };
        
        if (addedTx.type === "income") {
          newAllocation.cash += addedTx.amount;
          updatedMonthlyAllocation.cash += addedTx.amount;
        } else {
          // expense
          newAllocation.cash -= addedTx.amount;
          updatedMonthlyAllocation.cash -= addedTx.amount;
          if (addedTx.category === "Tiết kiệm") {
            newAllocation.savings += addedTx.amount;
            updatedMonthlyAllocation.savings += addedTx.amount;
          } else if (addedTx.category === "Đầu tư") {
            newAllocation.stocks += addedTx.amount;
            updatedMonthlyAllocation.stocks += addedTx.amount;
          } else if (addedTx.category === "Vàng miếng" || addedTx.category === "Vàng") {
            newAllocation.gold += addedTx.amount;
            updatedMonthlyAllocation.gold += addedTx.amount;
          } else if (addedTx.category === "Ngoại tệ USD" || addedTx.category === "USD" || addedTx.category === "Ngoại tệ") {
            newAllocation.usd += addedTx.amount;
            updatedMonthlyAllocation.usd += addedTx.amount;
          }
        }
        
        return {
          transactions: [addedTx, ...state.transactions],
          allocation: newAllocation,
          monthlyAllocation: updatedMonthlyAllocation
        };
      }),
      
      deleteTransaction: (id) => set((state) => {
        const tx = state.transactions.find(t => t.id === id);
        if (!tx) return {};
        
        const newAllocation = { ...state.allocation };
        const currentMonthlyAlloc = state.monthlyAllocation || {
          stocks: 0,
          savings: 0,
          cash: 12350000,
          gold: 0,
          usd: 0,
        };
        const updatedMonthlyAllocation = { ...currentMonthlyAlloc };
        
        if (tx.type === "income") {
          newAllocation.cash -= tx.amount;
          updatedMonthlyAllocation.cash = Math.max(0, updatedMonthlyAllocation.cash - tx.amount);
        } else {
          // expense
          newAllocation.cash += tx.amount;
          updatedMonthlyAllocation.cash += tx.amount;
          if (tx.category === "Tiết kiệm") {
            newAllocation.savings = Math.max(0, newAllocation.savings - tx.amount);
            updatedMonthlyAllocation.savings = Math.max(0, updatedMonthlyAllocation.savings - tx.amount);
          } else if (tx.category === "Đầu tư") {
            newAllocation.stocks = Math.max(0, newAllocation.stocks - tx.amount);
            updatedMonthlyAllocation.stocks = Math.max(0, updatedMonthlyAllocation.stocks - tx.amount);
          } else if (tx.category === "Vàng miếng" || tx.category === "Vàng") {
            newAllocation.gold = Math.max(0, newAllocation.gold - tx.amount);
            updatedMonthlyAllocation.gold = Math.max(0, updatedMonthlyAllocation.gold - tx.amount);
          } else if (tx.category === "Ngoại tệ USD" || tx.category === "USD" || tx.category === "Ngoại tệ") {
            newAllocation.usd = Math.max(0, newAllocation.usd - tx.amount);
            updatedMonthlyAllocation.usd = Math.max(0, updatedMonthlyAllocation.usd - tx.amount);
          }
        }
        
        return {
          transactions: state.transactions.filter(t => t.id !== id),
          allocation: newAllocation,
          monthlyAllocation: updatedMonthlyAllocation
        };
      }),
      
      updateStock: (ticker, updates) => set((state) => ({
        stocks: state.stocks.map(s => s.ticker === ticker ? { ...s, ...updates } : s)
      })),
      
      updateAllocation: (updates) => set((state) => ({
        allocation: { ...state.allocation, ...updates }
      })),
 
      allocateCashToAsset: (asset, amount) => set((state) => {
        if (state.allocation.cash < amount) return {};
        
        const newAllocation = { ...state.allocation };
        newAllocation.cash -= amount;
        newAllocation[asset] += amount;
        
        const currentMonthlyAlloc = state.monthlyAllocation || {
          stocks: 0,
          savings: 0,
          cash: 12350000,
          gold: 0,
          usd: 0,
        };
        const updatedMonthlyAllocation = {
          ...currentMonthlyAlloc,
          cash: Math.max(0, currentMonthlyAlloc.cash - amount),
          [asset]: currentMonthlyAlloc[asset] + amount
        };

        const id = Math.random().toString(36).substr(2, 9);
        const categoryMap = {
          stocks: "Đầu tư",
          savings: "Tiết kiệm",
          gold: "Vàng miếng",
          usd: "Ngoại tệ USD"
        };
        const assetNameMap = {
          stocks: "Cổ phiếu VN50",
          savings: "Tiết kiệm ngân hàng",
          gold: "Tích lũy Vàng SJC",
          usd: "Dự trữ USD"
        };
        
        const allocationTx: Transaction = {
          id,
          date: new Date().toISOString().split("T")[0],
          description: `Phân bổ tiền mặt sang ${assetNameMap[asset]}`,
          category: categoryMap[asset],
          type: "expense",
          amount: amount,
          paymentMethod: "Ví điện tử"
        };
        
        return {
          allocation: newAllocation,
          monthlyAllocation: updatedMonthlyAllocation,
          transactions: [allocationTx, ...state.transactions]
        };
      }),
 
      allocateIncomeSimulated: (incomeAmount, stockAmt, savingsAmt, goldAmt, usdAmt, cashAmt) => set((state) => {
        const dateStr = new Date().toISOString().split("T")[0];
        
        // Tránh cộng dồn dư thừa khi nhấn "Phân bổ" nhiều lần:
        // Lọc sạch toàn bộ giao dịch Lương tháng, phân bổ, hay Nhận thu nhập cũ từ dòng giao dịch tháng hiện tại
        const cleanedTransactions = state.transactions.filter(t => {
          const isOldSalary = t.category === "Lương" || t.description.includes("Lương") || t.description.includes("thu nhập");
          const isAllocation = t.description.includes("Phân bổ") || t.description.includes("tích lũy") || t.description.includes("gửi Tiết kiệm");
          return !isOldSalary && !isAllocation;
        });

        // Tạo lại các dịch chuyển giao dịch mới sạch sẽ
        const newTxs: Transaction[] = [];
        
        // 1. Giao dịch nhận Lương thu nhập mới
        const incomeTxId = Math.random().toString(36).substr(2, 9);
        newTxs.push({
          id: incomeTxId,
          date: dateStr,
          description: `Nhận thu nhập hàng tháng`,
          category: "Lương",
          type: "income",
          amount: incomeAmount,
          paymentMethod: "Ngân hàng"
        });
        
        // 2. Giao dịch phân tách đổ tiền sang các ví tích lũy tài sản
        if (stockAmt > 0) {
          newTxs.push({
            id: Math.random().toString(36).substr(2, 9),
            date: dateStr,
            description: "Phân bổ Tiết kiệm tích lũy vào Cổ phiếu VN50",
            category: "Đầu tư",
            type: "expense",
            amount: stockAmt,
            paymentMethod: "Ví điện tử"
          });
        }
        if (savingsAmt > 0) {
          newTxs.push({
            id: Math.random().toString(36).substr(2, 9),
            date: dateStr,
            description: "Phân bổ gửi Tiết kiệm ngân hàng",
            category: "Tiết kiệm",
            type: "expense",
            amount: savingsAmt,
            paymentMethod: "Ví điện tử"
          });
        }
        if (goldAmt > 0) {
          newTxs.push({
            id: Math.random().toString(36).substr(2, 9),
            date: dateStr,
            description: "Phân bổ tích lũy Vàng miếng SJC",
            category: "Vàng miếng",
            type: "expense",
            amount: goldAmt,
            paymentMethod: "Ví điện tử"
          });
        }
        if (usdAmt > 0) {
          newTxs.push({
            id: Math.random().toString(36).substr(2, 9),
            date: dateStr,
            description: "Phân bổ tích lũy ngoại tệ USD",
            category: "Ngoại tệ USD",
            type: "expense",
            amount: usdAmt,
            paymentMethod: "Ví điện tử"
          });
        }

        // Hoàn trả lại danh mục tích lũy tổng tài sản của tháng cũ trước khi áp dụng tỷ lệ mới để tránh dồn chồng chất
        const newAllocation = { ...state.allocation };
        if (state.monthlyAllocation) {
          newAllocation.stocks = Math.max(0, newAllocation.stocks - state.monthlyAllocation.stocks);
          newAllocation.savings = Math.max(0, newAllocation.savings - state.monthlyAllocation.savings);
          newAllocation.gold = Math.max(0, newAllocation.gold - state.monthlyAllocation.gold);
          newAllocation.usd = Math.max(0, newAllocation.usd - state.monthlyAllocation.usd);
          newAllocation.cash = Math.max(0, newAllocation.cash - state.monthlyAllocation.cash);
        }
        
        // Áp dụng các tỷ lệ tích trữ của tháng này vào tổng tài sản ròng
        newAllocation.stocks += stockAmt;
        newAllocation.savings += savingsAmt;
        newAllocation.gold += goldAmt;
        newAllocation.usd += usdAmt;
        newAllocation.cash += cashAmt;
        
        if (newAllocation.cash < 0) {
          newAllocation.cash = 0;
        }

        return {
          allocation: newAllocation,
          transactions: [...newTxs, ...cleanedTransactions],
          monthlyAllocation: {
            stocks: stockAmt,
            savings: savingsAmt,
            cash: cashAmt,
            gold: goldAmt,
            usd: usdAmt,
          }
        };
      }),
      resetStore: () => set(() => ({
        transactions: initialTransactions,
        stocks: initialStocks,
        allocation: {
          stocks: 36480000,
          savings: 15000000,
          cash: 50000000,
          gold: 5000000,
          usd: 5000000,
        },
        monthlyAllocation: {
          stocks: 0,
          savings: 0,
          cash: 12350000,
          gold: 0,
          usd: 0,
        },
        goals: initialGoals,
        watchlist: ["FPT", "MWG", "VCB", "HPG", "SSI"]
      })),
      
      buySpecificStock: (ticker, name, quantity, price) => {
        let success = false;
        set((state) => {
          const qty = Math.round(quantity);
          if (qty <= 0) return {};
          
          const totalCost = Math.round(qty * price);
          if (state.allocation.cash < totalCost) {
            return {};
          }
          
          success = true;
          const updatedStocks = state.stocks.map((s) => {
            if (s.ticker === ticker) {
              const updatedQty = s.quantity + qty;
              const updatedAvg = s.quantity === 0 ? price : Math.round(((s.quantity * s.avgPrice) + totalCost) / updatedQty);
              return {
                ...s,
                quantity: updatedQty,
                avgPrice: updatedAvg,
                currentPrice: price
              };
            }
            return s;
          });
          
          const totalNewStockVal = updatedStocks.reduce((sum, s) => sum + s.quantity * s.currentPrice, 0);

          const newAllocation = {
            ...state.allocation,
            cash: state.allocation.cash - totalCost,
            stocks: Math.round(totalNewStockVal)
          };
          
          const currentMonthlyAlloc = state.monthlyAllocation || {
            stocks: 0,
            savings: 0,
            cash: 12350000,
            gold: 0,
            usd: 0,
          };
          const updatedMonthlyAllocation = {
            ...currentMonthlyAlloc,
            cash: Math.max(0, currentMonthlyAlloc.cash - totalCost),
            stocks: currentMonthlyAlloc.stocks + totalCost
          };
          
          const id = Math.random().toString(36).substr(2, 9);
          const newTx: Transaction = {
            id,
            date: new Date().toISOString().split("T")[0],
            description: `Mua cổ phiếu ${ticker} (${qty.toLocaleString("vi-VN")} CP)`,
            category: "Đầu tư",
            type: "expense",
            amount: totalCost,
            paymentMethod: "Ví đầu tư"
          };
          
          return {
            stocks: updatedStocks,
            allocation: newAllocation,
            monthlyAllocation: updatedMonthlyAllocation,
            transactions: [newTx, ...state.transactions]
          };
        });
        return success;
      },
      
      sellSpecificStock: (ticker, quantity, price) => {
        let success = false;
        set((state) => {
          const qty = Math.round(quantity);
          if (qty <= 0) return {};

          const existing = state.stocks.find(s => s.ticker === ticker);
          if (!existing || existing.quantity < qty) {
            return {};
          }
          
          success = true;
          const revenue = Math.round(qty * price);
          
          const updatedStocks = state.stocks.map((s) => {
            if (s.ticker === ticker) {
              const remainingQty = s.quantity - qty;
              return {
                ...s,
                quantity: remainingQty,
                avgPrice: remainingQty === 0 ? 0 : s.avgPrice,
                currentPrice: price
              };
            }
            return s;
          });
          
          const totalNewStockVal = updatedStocks.reduce((sum, s) => sum + s.quantity * s.currentPrice, 0);

          const newAllocation = {
            ...state.allocation,
            cash: state.allocation.cash + revenue,
            stocks: Math.round(totalNewStockVal)
          };
          
          const currentMonthlyAlloc = state.monthlyAllocation || {
            stocks: 0,
            savings: 0,
            cash: 12350000,
            gold: 0,
            usd: 0,
          };
          const updatedMonthlyAllocation = {
            ...currentMonthlyAlloc,
            cash: currentMonthlyAlloc.cash + revenue,
            stocks: Math.max(0, currentMonthlyAlloc.stocks - revenue)
          };
          
          const id = Math.random().toString(36).substr(2, 9);
          const newTx: Transaction = {
            id,
            date: new Date().toISOString().split("T")[0],
            description: `Bán cổ phiếu ${ticker} (${qty.toLocaleString("vi-VN")} CP)`,
            category: "Đầu tư",
            type: "income",
            amount: revenue,
            paymentMethod: "Ví đầu tư"
          };
          
          return {
            stocks: updatedStocks,
            allocation: newAllocation,
            monthlyAllocation: updatedMonthlyAllocation,
            transactions: [newTx, ...state.transactions]
          };
        });
        return success;
      },
      
      toggleWatchlist: (ticker) => set((state) => {
        const list = state.watchlist || ["FPT", "MWG", "VCB", "HPG", "SSI"];
        const updated = list.includes(ticker) 
          ? list.filter(t => t !== ticker) 
          : [...list, ticker];
        return { watchlist: updated };
      }),
      
      updateAllPricesLive: () => set((state) => {
        const updatedStocks = state.stocks.map((s) => {
          // Micro fluctuations of VN stocks: between -0.6% and +0.6%
          const pct = (Math.random() * 1.2 - 0.6) / 100;
          const newPrice = Math.max(1000, Math.round(s.currentPrice * (1 + pct)));
          return {
            ...s,
            currentPrice: newPrice
          };
        });
        
        // Sync allocation stocks total value
        const totalNewStockVal = updatedStocks.reduce((sum, s) => sum + s.quantity * s.currentPrice, 0);
        return {
          stocks: updatedStocks,
          allocation: {
            ...state.allocation,
            stocks: Math.round(totalNewStockVal)
          }
        };
      }),
    }),
    {
      name: "fintech-dashboard-storage",
    }
  )
);
