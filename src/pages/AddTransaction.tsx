import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, Plus, Calendar, CreditCard, Tag, 
  FileText, ChevronDown, Check, CircleDollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";

const categories = {
  income: ["Lương", "Freelance", "Thưởng", "Đầu tư", "Khác"],
  expense: ["Ăn uống", "Di chuyển", "Học tập", "Mua sắm", "Giải trí", "Tiết kiệm", "Đầu tư", "Khác"],
};

const paymentMethods = ["Tiền mặt", "Ngân hàng", "Ví điện tử"];

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, allocation } = useStore();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Ngân hàng");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    const txAmount = parseFloat(amount.replace(/\./g, ""));
    if (type === "expense" && txAmount > allocation.cash) {
      setErrorMsg(`Không đủ số dư Tiền mặt khả dụng! (Số dư hiện tại: ${allocation.cash.toLocaleString("vi-VN")} ₫, Số tiền giao dịch: ${txAmount.toLocaleString("vi-VN")} ₫)`);
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
    
    setIsSuccess(true);
    setTimeout(() => {
      navigate("/cash-flow");
    }, 1500);
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
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="h-12 w-12 flex items-center justify-center rounded-xl bg-surface-container border border-white/5 text-on-surface-variant hover:text-on-surface transition-all active:scale-90"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-on-surface">Thêm Giao Dịch</h2>
          <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mt-1">Ghi chép biến động dòng tiền</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl overflow-hidden relative"
      >
        {isSuccess && (
          <div className="absolute inset-0 z-50 bg-surface-container/90 backdrop-blur-md flex flex-col items-center justify-center text-primary">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-4"
             >
                <Check size={40} />
             </motion.div>
             <h3 className="text-2xl font-black">Thêm thành công!</h3>
             <p className="text-on-surface-variant mt-2">Đang chuyển về trang Dòng Tiền...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Type Selector */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Loại giao dịch</label>
             <div className="flex bg-[#05070a] border border-[#2d333b] rounded-2xl p-1.5 h-16">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 rounded-xl text-sm font-black transition-all",
                    type === "income" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <CircleDollarSign size={20} />
                  Thu nhập
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 rounded-xl text-sm font-black transition-all",
                    type === "expense" ? "bg-vibrant-red/20 text-vibrant-red border border-vibrant-red/30" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <ArrowLeft size={20} className="rotate-225" />
                  Chi tiêu
                </button>
             </div>
          </div>

          {/* Amount */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Số tiền (VNĐ)</label>
             <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0 VNĐ"
                className="w-full rounded-2xl bg-[#05070a] border border-[#2d333b] p-6 text-5xl font-black text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center tracking-tighter"
                required
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Category */}
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Danh mục</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-2xl bg-[#05070a] border border-[#2d333b] py-4 pl-12 pr-4 text-sm font-bold focus:border-primary focus:outline-none"
                    required
                  >
                    <option value="" disabled>Chọn danh mục</option>
                    {categories[type].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                </div>
             </div>

             {/* Date */}
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Ngày tháng</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl bg-[#05070a] border border-[#2d333b] py-4 pl-12 pr-4 text-sm font-bold focus:border-primary focus:outline-none"
                    required
                  />
                </div>
             </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Ghi chú</label>
             <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập nội dung giao dịch..."
                  className="w-full rounded-2xl bg-[#05070a] border border-[#2d333b] py-4 pl-12 pr-4 text-sm font-bold focus:border-primary focus:outline-none"
                  required
                />
             </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Phương thức thanh toán</label>
             <div className="grid grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                      paymentMethod === method 
                        ? "bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10 scale-[1.02]" 
                        : "bg-[#05070a] border-[#2d333b] text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    {method}
                  </button>
                ))}
             </div>
          </div>

          {/* Submit */}
          <div className="pt-6 space-y-4">
             {errorMsg && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="p-4 rounded-2xl border border-vibrant-red/20 bg-vibrant-red/10 text-vibrant-red text-xs font-bold flex items-center gap-3"
               >
                 <span className="text-sm">⚠️</span>
                 <span>{errorMsg}</span>
               </motion.div>
             )}
             <button
                type="submit"
                className="w-full h-20 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-lg shadow-3xl shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-4"
              >
                <Plus size={24} />
                Lưu giao dịch
              </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
