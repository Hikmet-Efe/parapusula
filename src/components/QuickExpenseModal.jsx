import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Zap, Sparkles } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/calculations';

export default function QuickExpenseModal({ isOpen, onClose }) {
  const { addExpense, budget } = useBudget();
  const [amount, setAmount] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRemaining = budget.todayData.remainingBalance;
  const numAmount = parseFloat(amount) || 0;
  const projectedRemaining = currentRemaining - numAmount;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (numAmount > 0) {
      addExpense(numAmount);
      onClose();
    }
  };

  const handleQuickAdd = (addVal) => {
    const cur = parseFloat(amount) || 0;
    setAmount(String(cur + addVal));
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Zap className="w-5 h-5 fill-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Hızlı Harcama</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Bugün ne kadar harcadın?
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Kategori gerekmez, yalnızca tutarı yazıp kaydedin.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-2xl font-bold text-slate-400">₺</span>
            <input
              ref={inputRef}
              type="number"
              step="any"
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-950/80 border-2 border-emerald-500/50 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl text-3xl font-extrabold text-white outline-none placeholder:text-slate-600 transition"
            />
          </div>

          {/* Quick Increment Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[20, 50, 100, 200].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAdd(val)}
                className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-200 border border-slate-700/60 transition"
              >
                +₺{val}
              </button>
            ))}
          </div>

          {/* Realtime Projected Balance Preview */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">İşlemden Sonraki Kalan:</span>
            <span className={`text-sm font-bold ${projectedRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(projectedRemaining)}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={numAmount <= 0}
            className={`w-full mt-4 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
              numAmount > 0
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>Harcamayı Kaydet</span>
          </button>
        </form>
      </div>
    </div>
  );
}
