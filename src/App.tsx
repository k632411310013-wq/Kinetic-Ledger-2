/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CashFlow from "./pages/CashFlow";
import Stocks from "./pages/Stocks";
import Simulation from "./pages/Simulation";
import Savings from "./pages/Savings";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import PortfolioDetails from "./pages/PortfolioDetails";
import AddTransaction from "./pages/AddTransaction";

import { useEffect } from "react";
import { useStore } from "./store/useStore";

export default function App() {
  const { stocks, resetStore } = useStore();

  useEffect(() => {
    // If quantities are larger than 2000 CP or are non-integers (fractions), 
    // reset the store immediately to obtain clean, realistic, integer-only investor data.
    const hasUnrealisticStocks = stocks.some(
      (s) => (s.quantity > 0 && s.quantity % 1 !== 0) || s.quantity > 2000
    );
    if (hasUnrealisticStocks) {
      console.log("Stale or unrealistic stock storage detected. Correcting...");
      resetStore();
    }
  }, [stocks, resetStore]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cash-flow" element={<CashFlow />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/portfolio" element={<PortfolioDetails />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}




