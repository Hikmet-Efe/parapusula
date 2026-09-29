import React from 'react';
import { PiggyBank, Calendar, TrendingUp, TrendingDown, Target, ShieldCheck, Clock } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/calculations';

export default function MonthOverview() {
  const { budget } = useBudget();
  const {
    totalDays,
    currentDayNumber,
    remainingDays,
    freeBudget,
    targetSavings,
    spentSoFar,
    remainingMonthBudget,
    netSurplusSoFar,
    dynamicRemainingDaily
  } = budget;

  // Month Progress %
  const monthProgressPct = Math.min(100, Math.round((currentDayNumber / totalDays) * 100));

  // Budget spent %
  const spentPct = freeBudget > 0 ? Math.min(100, Math.round((spentSoFar / freeBudget) * 100)) : 0;

  // Is target savings safe?
  const isSavingsSafe = remainingMonthBudget >= 0;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Aylık Genel Durum & Birikim Güvencesi</span>
        </h3>
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{currentDayNumber}. Gün / {totalDays} Gün</span>
        </span>
      </div>

      {/* Target Savings Guardian Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 mb-5 ${
        isSavingsSafe 
          ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' 
          : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isSavingsSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hedef Birikim</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                Dokunulmaz
              </span>
            </div>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {formatCurrency(targetSavings)}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Birikim Durumu</span>
          <span className={`text-xs font-bold flex items-center justify-end gap-1 ${isSavingsSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {isSavingsSafe ? 'Tamamen Güvende' : 'Risk Altında'}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Ay İçi Harcanan */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5">
          <span className="text-[11px] text-slate-400 font-medium block">Şu Ana Kadar Harcanan</span>
          <span className="text-base font-bold text-slate-200 mt-1 block">
            {formatCurrency(spentSoFar)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Bütçenin %{spentPct}'i
          </span>
        </div>

        {/* Ay Sonu Kalan Serbest Bütçe */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5">
          <span className="text-[11px] text-slate-400 font-medium block">Kalan Serbest Bütçe</span>
          <span className={`text-base font-bold mt-1 block ${remainingMonthBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(remainingMonthBudget)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Ay sonuna kadar
          </span>
        </div>

        {/* Kümülatif Tasarruf / Aşım */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5">
          <span className="text-[11px] text-slate-400 font-medium block">Net Plan Farkı</span>
          <div className="flex items-center gap-1 mt-1">
            {netSurplusSoFar >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span className={`text-base font-bold ${netSurplusSoFar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netSurplusSoFar >= 0 ? '+' : ''}{formatCurrency(netSurplusSoFar)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {netSurplusSoFar >= 0 ? 'Plana göre artıdasınız' : 'Kotanın üzerindesiniz'}
          </span>
        </div>

        {/* Kalan Günler & Ortalama Hak */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5">
          <span className="text-[11px] text-slate-400 font-medium block flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            Kalan {remainingDays} Gün
          </span>
          <span className="text-base font-bold text-blue-400 mt-1 block">
            {formatCurrency(dynamicRemainingDaily)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Gün başına düşen ortalama
          </span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Ay İlerlemesi ({monthProgressPct}%)</span>
          <span>Bütçe Tüketimi ({spentPct}%)</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${spentPct > monthProgressPct ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
