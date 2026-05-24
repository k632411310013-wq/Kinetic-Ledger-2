import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Calendar, CreditCard, Tag, FileText, ChevronDown, Check } from "lucide-react";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = {
  income: ["Lương", "Freelance", "Thưởng", "Đầu tư", "Khác"],
  expense: ["Ăn uống", "Di chuyển", "Học tập", "Mua sắm", "Giải trí", "Tiết kiệm", "Đầu tư", "Khác"],
};

const paymentMethods = ["Tiền mặt", "Ngân hàng", "Ví điện tử"];

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { addTransaction, allocation } = useStore();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Ngân hàng");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    const txAmount = parseFloat(amount.replace(/\./g, ""));
    if (type === "expense" && txAmount > allocation.cash) {
      setErrorMsg(`Không đủ số dư Tiền mặt khả dụng! (Số dư: ${allocation.cash.toLocaleString("vi-VN")} ₫, Cần: ${txAmount.toLocaleString("vi-VN")} ₫)`);
      return;
    }

    setErrorMsg(null);
    addTransaction({
      type,
      amount: txAmount,
      category,
      date,
      description,
      paymentMethod,
    });
    
    // Reset and close
    setAmount("");
    setCategory("");
    setDescription("");
    setErrorMsg(null);
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value === "") {
      setAmount("");
      return;
    }
    const formatted = parseInt(value, 10).toLocaleString("vi-VN");
    setAmount(formatted);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-panel relative w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-6 bg-surface-container-high/50">
              <h2 className="text-xl font-bold tracking-tight">Thêm Giao Dịch</h2>
              <button 
                onClick={onClose}
                className="rounded-full p-2 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Type Selector */}
              <div className="flex bg-[#05070a] border border-[#2d333b] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all",
                    type === "income" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  Thu nhập
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all",
                    type === "expense" ? "bg-vibrant-red/20 text-vibrant-red border border-vibrant-red/30 shadow-lg" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  Chi tiêu
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Số tiền (VNĐ)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0 VNĐ"
                    className="w-full rounded-xl bg-[#05070a] border border-[#2d333b] p-4 text-2xl font-black text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-center"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Danh mục</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-[#05070a] border border-[#2d333b] p-3 text-sm font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                      required
                    >
                      <option value="" disabled>Chọn danh mục</option>
                      {categories[type].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Ngày giao dịch</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl bg-[#05070a] border border-[#2d333b] p-3 text-sm font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Mô tả</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ví dụ: Ăn tối, Lương tháng 5..."
                    className="w-full rounded-xl bg-[#05070a] border border-[#2d333b] py-3 pl-10 pr-4 text-sm font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Phương thức thanh toán</label>
                <div className="flex gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all",
                        paymentMethod === method 
                          ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10" 
                          : "bg-[#05070a] border-[#2d333b] text-on-surface-variant hover:text-on-surface"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="space-y-4 pt-2">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl border border-vibrant-red/20 bg-vibrant-red/10 text-vibrant-red text-[11px] font-bold flex items-center gap-2"
                  >
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
                <button
                  type="submit"
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-container p-4 font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3">
                    <Plus size={20} />
                    Xác nhận giao dịch
                  </div>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
