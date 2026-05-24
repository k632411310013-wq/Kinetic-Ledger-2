export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  description: string;
  paymentMethod: string;
}

export interface StockHolding {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  expectedGrowth: number;
}

export interface PortfolioAllocation {
  stocks: number;
  savings: number;
  cash: number;
  gold: number;
  usd: number;
}

export interface SavingGoal {
  id: string;
  label: string;
  current: number;
  target: number;
  progress: number;
  status: string;
  deadline: string;
  icon: string;
  color: string;
  glow?: boolean;
}

export interface NavItem {
  label: string;
  icon: any;
  path: string;
}

export interface User {
  name: string;
  role: string;
  avatar: string;
}
