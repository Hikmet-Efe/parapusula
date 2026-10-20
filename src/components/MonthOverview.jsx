// ======================================================================================
// 📊 MONTH OVERVIEW - AYLIK GENEL DURUM, BİRİKİM GÜVENCESİ VE MAAŞ DAĞILIMI ANALİZİM
// ======================================================================================
// BURADA NE YAPMAYA ÇALIŞTIM?
// Ana sayfada aylık birikim hedefimin güvende olup olmadığını ve genel gidişatı özetliyorum.
// Kullanıcı alt menüden "Aylık Bütçe" sekmesine geçtiğinde ise (showDetails=true):
// 1. Maaş Dağılım Çubuğu (Gelirimin yüzde kaçı kiraya, borca, birikime ve harçlığa gidiyor),
// 2. Ay Sonu Tahmini Kumbara (Bu hızla gidersem hedef birikimimin üstüne ne kadar ekstra kalacak),
// 3. Tasarruf Serisi & Sıfır Harcama Günleri istatistikleri,
// 4. Zorunlu Sabit Giderlerimin tam dökümünü gösteriyorum.
// ======================================================================================

import React from 'react';
import { 
  PiggyBank, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldCheck, 
  Clock,
  Flame,
  Sparkles,
  PieChart,
  Receipt,
  Sliders,
  Award
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/calculations';

export default function MonthOverview({ showDetails = false, onOpenBudgetSetup }) {
  const { budget, config, debtStats } = useBudget();
  const {
    totalDays,
    currentDayNumber,
    remainingDays,
    income,
    totalFixed,
    freeBudget,
    targetSavings,
    spentSoFar,
    remainingMonthBudget,
    netSurplusSoFar,
    dynamicRemainingDaily,
    streakDays = 0,
    noSpendDaysCount = 0,
    projectedExtraSavings = 0,
    projectedTotalSavings = 0
  } = budget;

  // Ayın yüzde kaçı geride kaldı?
  const monthProgressPct = Math.min(100, Math.round((currentDayNumber / totalDays) * 100));

  // Serbest bütçemin yüzde kaçını harcadım?
  const spentPct = freeBudget > 0 ? Math.min(100, Math.round((spentSoFar / freeBudget) * 100)) : 0;

  // Hedef birikimim güvende mi?
  const isSavingsSafe = remainingMonthBudget >= 0;

  // Maaş Dağılım Yüzdeleri (Görsel Çubuk İçin)
  const safeIncome = income > 0 ? income : 1;
  const fixedPct = Math.min(100, Math.round((totalFixed / safeIncome) * 100));
  const savingsPct = Math.min(100 - fixedPct, Math.round((targetSavings / safeIncome) * 100));
  const freePct = Math.max(0, 100 - fixedPct - savingsPct);

  return (
    <div className="space-y-5">
      {/* ANA ÖZET KARTIM */}
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

        {/* 🛡️ Hedef Birikim Koruma Kalkanı */}
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

        {/* 4'lü Metrik Izgaram */}
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

        {/* İlerleme Çubuğu */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Ay İlerlemesi (%{monthProgressPct})</span>
            <span>Bütçe Tüketimi (%{spentPct})</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${spentPct > monthProgressPct ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================================================================================== */}
      {/* DETAYLI ANALİZ BÖLÜMÜ (Sadece "Aylık Bütçe" Sekmesinde Gösterilir)                 */}
      {/* ================================================================================== */}
      {showDetails && (
        <>
          {/* 🌟 AY SONU TAHMİNİ KUMBARA & MOTİVASYON KARTIM */}
          <div className="w-full bg-gradient-to-br from-emerald-950/30 via-slate-900 to-blue-950/20 border border-emerald-500/25 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ay Sonu Tahmini Kumbara</h4>
                  <p className="text-[11px] text-slate-400">Mevcut harcama disiplinine göre ay sonu projeksiyonu</p>
                </div>
              </div>
              {onOpenBudgetSetup && (
                <button
                  onClick={onOpenBudgetSetup}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Planı Düzenle</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Tahmini Toplam Birikim</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">
                  {formatCurrency(projectedTotalSavings)}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {projectedExtraSavings > 0
                    ? `Hedefin üstüne +${formatCurrency(projectedExtraSavings)} ekstra!`
                    : 'Dokunulmaz hedefin korunuyor'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Bütçe Koruma Serisi
                </span>
                <span className="text-xl font-black text-amber-400 mt-1 block">
                  {streakDays} Gün
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Üst üste limiti aşmadan geçen gün
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  Sıfır Harcama Günleri
                </span>
                <span className="text-xl font-black text-blue-400 mt-1 block">
                  {noSpendDaysCount} Gün
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Hiç para harcanmayan aktif gün sayısı
                </span>
              </div>
            </div>
          </div>

          {/* 📈 MAAŞ DAĞILIM ÇUBUĞU & SABİT GİDER DÖKÜMÜM */}
          <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <span>Aylık Gelir Dağılımı ({formatCurrency(income)})</span>
              </h4>
            </div>

            {/* Çok Renkli Maaş Dağılım Çubuğu */}
            <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 gap-0.5">
              {fixedPct > 0 && (
                <div
                  style={{ width: `${fixedPct}%` }}
                  className="h-full bg-amber-500 first:rounded-l-full last:rounded-r-full transition-all"
                  title={`Zorunlu Giderler: %${fixedPct}`}
                />
              )}
              {savingsPct > 0 && (
                <div
                  style={{ width: `${savingsPct}%` }}
                  className="h-full bg-blue-500 first:rounded-l-full last:rounded-r-full transition-all"
                  title={`Hedef Birikim: %${savingsPct}`}
                />
              )}
              {freePct > 0 && (
                <div
                  style={{ width: `${freePct}%` }}
                  className="h-full bg-emerald-500 first:rounded-l-full last:rounded-r-full transition-all"
                  title={`Serbest Bütçe: %${freePct}`}
                />
              )}
            </div>

            {/* Dağılım Açıklamaları */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Sabit Gider (%{fixedPct})</span>
                </div>
                <span className="text-slate-200 font-extrabold block mt-1">{formatCurrency(totalFixed)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  <span>Birikim (%{savingsPct})</span>
                </div>
                <span className="text-slate-200 font-extrabold block mt-1">{formatCurrency(targetSavings)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Serbest (%{freePct})</span>
                </div>
                <span className="text-slate-200 font-extrabold block mt-1">{formatCurrency(freeBudget)}</span>
              </div>
            </div>

            {/* Sabit Gider Kalemleri Listesi */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                Kayıtlı Zorunlu Sabit Giderler
              </span>
              <div className="space-y-1.5">
                {(config.fixedExpenses || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs">
                    <span className="text-slate-300 font-medium">{item.title}</span>
                    <span className="text-amber-400 font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {config.includeDebtsInFixedExpenses && debtStats.monthlyCommitment > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                    <span className="text-indigo-300 font-medium">💳 Borç & Taksit Ödemeleri (Otomatik Bağlı)</span>
                    <span className="text-indigo-400 font-bold">{formatCurrency(debtStats.monthlyCommitment)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
