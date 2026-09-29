import React from 'react';
import { 
  PlusCircle, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/calculations';
import { triggerHaptic } from '../utils/notifications';

export default function DailyHeroCard({ onOpenQuickExpense }) {
  const { budget, addExpense } = useBudget();
  const { todayData, baseDailyAllowance } = budget;

  const remaining = todayData.remainingBalance;
  const spent = todayData.spent;
  const base = todayData.baseAllowance;
  const rolloverFromYesterday = todayData.startingBalance - base;

  // Visual color scheme
  let glowClass = 'glow-emerald border-emerald-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-emerald-950/20';
  let badgeText = 'Bütçe Harika';
  let badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let balanceTextColor = 'text-emerald-400';

  if (remaining < 0) {
    glowClass = 'glow-rose border-rose-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-rose-950/20';
    badgeText = 'Bütçe Aşıldı';
    badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    balanceTextColor = 'text-rose-400';
  } else if (remaining < base * 0.4) {
    glowClass = 'glow-amber border-amber-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-amber-950/20';
    badgeText = 'Limit Azalıyor';
    badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    balanceTextColor = 'text-amber-400';
  }

  const handleChipClick = (amount) => {
    triggerHaptic('light');
    addExpense(amount, 'Hızlı Ekleme');
  };

  const quickChips = [20, 50, 100, 200];

  return (
    <div className={`w-full rounded-3xl p-6 sm:p-8 border transition-all duration-300 relative overflow-hidden shadow-2xl ${glowClass}`}>
      {/* Subtle Background Glows */}
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Top Header & Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            Bugünkü Kullanılabilir Bakiye
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${badgeColor}`}>
          {remaining < 0 ? (
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Hero Balance Number */}
      <div className="my-3">
        <div className={`text-4xl sm:text-6xl font-black tracking-tight ${balanceTextColor} flex items-baseline gap-1.5`}>
          <span>{formatCurrency(remaining)}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-lg">
          {remaining >= 0 
            ? 'Bugün bu tutara kadar harcarsanız aylık birikim hedefiniz ve borç planınız %100 korunur.' 
            : 'Bugün harcama limitinizi aştınız. Kalan tutar yarınki harçlığınızdan dengelenecek.'}
        </p>
      </div>

      {/* 3 Metric Cards with comfortable padding */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-7 pt-5 border-t border-slate-800/80">
        {/* Taban Günlük Hak */}
        <div className="bg-slate-950/50 rounded-2xl p-3 sm:p-4 border border-slate-800/60 text-center sm:text-left">
          <span className="text-[11px] text-slate-400 block font-medium">Günlük Taban Hak</span>
          <span className="text-sm sm:text-base font-bold text-slate-200 mt-1 block">
            {formatCurrency(base)}
          </span>
        </div>

        {/* Dünden Devreden */}
        <div className="bg-slate-950/50 rounded-2xl p-3 sm:p-4 border border-slate-800/60 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1">
            <span className="text-[11px] text-slate-400 font-medium">Dünden Devir</span>
            {rolloverFromYesterday >= 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-400" />
            )}
          </div>
          <span className={`text-sm sm:text-base font-bold mt-1 block ${rolloverFromYesterday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {rolloverFromYesterday >= 0 ? '+' : ''}{formatCurrency(rolloverFromYesterday)}
          </span>
        </div>

        {/* Bugün Harcanan */}
        <div className="bg-slate-950/50 rounded-2xl p-3 sm:p-4 border border-slate-800/60 text-center sm:text-left">
          <span className="text-[11px] text-slate-400 block font-medium">Bugün Harcanan</span>
          <span className="text-sm sm:text-base font-bold text-slate-200 mt-1 block">
            {formatCurrency(spent)}
          </span>
        </div>
      </div>

      {/* Quick Add Expense Action & Quick Chips */}
      <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenQuickExpense();
          }}
          className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] text-slate-950 font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          <span>Hızlı Harcama Gir</span>
        </button>

        {/* 1-Tap Quick Increment Chips */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          {quickChips.map((amount) => (
            <button
              key={amount}
              onClick={() => handleChipClick(amount)}
              className="flex-1 sm:flex-none py-3 px-3.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-200 font-bold text-xs border border-slate-700/60 transition active:scale-95 shadow-sm"
              title={`Tek dokunuşla +₺${amount} ekle`}
            >
              +₺{amount}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
