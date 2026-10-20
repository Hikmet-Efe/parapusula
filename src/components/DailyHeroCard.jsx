// ======================================================================================
// 💳 DAILY HERO CARD - ANA SAYFADAKİ DEV BAKİYE KARTIM, DEVİR GÖSTERGESİ & ALT REHBER
// ======================================================================================
// BURADA NE YAPMAYA ÇALIŞTIM?
// 1. Üstte eski alıştığım düzende "Bugünkü Kullanılabilir Bakiye" alanını koydum;
//    dünden devreden bakiye artıysa (+), eksiyse (-) olarak net biçimde yazıyor.
// 2. Hemen altında "Günlük Taban Hak", "Dünden Devreden (+ / -)" ve "Bugün Harcananlar"
//    kutularını ve hızlı harcama butonlarını yerleştirdim.
// 3. En alt kısma ise "Bugün bu kadar harcarsan ay sonuna paran yeter" rehber arayüzünü
//    ve "Bunu Alırsam Ne Olur?" simülatörünü koydum.
// ======================================================================================

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  AlertTriangle, 
  Flame,
  RotateCcw,
  Trash2,
  Calculator,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldCheck
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, parseCleanNumber } from '../utils/calculations';
import { triggerHaptic } from '../utils/notifications';

// Artıysa +XXX ₺, eksiyse -XXX ₺ formatında açıkça yazdıran yardımcı fonksiyonum
function formatSignedCurrency(val) {
  const rounded = Math.round(val || 0);
  if (rounded > 0) return `+${formatCurrency(Math.abs(rounded))}`;
  if (rounded < 0) return `-${formatCurrency(Math.abs(rounded))}`;
  return formatCurrency(0);
}

export default function DailyHeroCard({ onOpenQuickExpense }) {
  // Context havuzumdan bugünün hesaplanmış bütçesini ve harcama fonksiyonlarımı çekiyorum
  const { budget, addExpense, removeExpenseEntry } = useBudget();
  const { todayData, remainingDays, remainingMonthBudget, streakDays } = budget;

  // "Bunu Alırsam Ne Olur?" simülatör durumu
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [simPrice, setSimPrice] = useState('');

  // 1. Kartta gösterdiğim 4 temel değer:
  const remaining = todayData.remainingBalance;                     // Bugün harcayabileceğim net para (Kalanım)
  const spent = todayData.spent;                                   // Bugün şu ana kadar harcadığım
  const base = todayData.baseAllowance;                            // Günlük standart taban harçlığım
  const rolloverFromYesterday = todayData.startingBalance - base;  // Önceki günden devreden para (+ veya -)
  const todayEntries = todayData.entries || [];                    // Bugün girdiğim tekil harcamalar
  const roundedRollover = Math.round(rolloverFromYesterday);

  // 2. 🎨 DİNAMİK RENK VE TEMA MANTIĞIM:
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

  // 3. ⚡ TEK DOKUNUŞLA HIZLI HARCAMA ÇİPİ
  const handleChipClick = (amount) => {
    triggerHaptic('light');
    addExpense(amount);
  };

  const quickChips = [20, 50, 100, 200];

  // 4. 🎯 AY SONUNA KADAR GÜNLÜK İDEAL LİMİT & SİMÜLATÖR HESAPLAMASI
  const simAmount = parseCleanNumber(simPrice);
  const daysLeftIncludingToday = Math.max(1, remainingDays + 1);
  const currentDynamicDaily = Math.max(0, remainingMonthBudget / daysLeftIncludingToday);
  const newRemainingMonthBudget = remainingMonthBudget - simAmount;
  const newDynamicDaily = Math.max(0, newRemainingMonthBudget / daysLeftIncludingToday);
  const isSavingsStillSafe = newRemainingMonthBudget >= 0;

  const handleApplySimPurchase = () => {
    if (simAmount > 0) {
      addExpense(simAmount);
      setSimPrice('');
      setIsSimOpen(false);
    }
  };

  return (
    <div className={`w-full rounded-3xl p-5 sm:p-8 border transition-all duration-300 relative overflow-hidden shadow-2xl ${glowClass}`}>
      {/* Arka plan modern neon ışık efektlerim */}
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* ================================================================================== */}
      {/* 1. ÜST BÖLÜM: BUGÜN KULLANILABİLİR BAKİYE SEKMESİ & ÖNCEKİ GÜNDEN DEVİR (+ / -)   */}
      {/* ================================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            Bugün Kullanılabilir Bakiye
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {streakDays >= 1 && (
            <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{streakDays} Gün Seri</span>
            </div>
          )}
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${badgeColor}`}>
            {remaining < 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{badgeText}</span>
          </div>
        </div>
      </div>

      {/* 🚀 DEV BAKİYE RAKAMI VE ÖNCEKİ GÜNDEN DEVREDEN (+ / -) ÖZETİ */}
      <div className="my-2 flex flex-wrap items-baseline justify-between gap-3">
        <div className={`text-4xl sm:text-6xl font-black tracking-tight ${balanceTextColor}`}>
          {Math.round(remaining) > 0 ? `+${formatCurrency(remaining)}` : formatCurrency(remaining)}
        </div>

        {/* Önceki Günden Devreden Rozeti: Artıysa +, Eksiyse - */}
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
          roundedRollover >= 0
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          {roundedRollover >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>
            Önceki Günden Devreden: <strong>{formatSignedCurrency(rolloverFromYesterday)}</strong>
          </span>
        </div>
      </div>

      {/* ================================================================================== */}
      {/* 2. ALT TARAF: GÜNLÜK TABAN HAK, DEVREDEN (+ / -) VE BUGÜN HARCANANLAR SEKMELERİ   */}
      {/* ================================================================================== */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 pt-4 border-t border-slate-800/80">
        
        {/* 1. Günlük Taban Hak */}
        <div className="bg-slate-950/60 rounded-2xl p-2.5 sm:p-4 border border-slate-800/70 text-center sm:text-left min-w-0">
          <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium truncate">Günlük Taban Hak</span>
          <span className="text-xs sm:text-base font-extrabold text-slate-100 mt-1 block whitespace-nowrap">
            +{formatCurrency(base)}
          </span>
        </div>

        {/* 2. Önceki Günden Devreden (+ / -) */}
        <div className="bg-slate-950/60 rounded-2xl p-2.5 sm:p-4 border border-slate-800/70 text-center sm:text-left min-w-0">
          <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium truncate">Devreden Bakiye</span>
          <span className={`text-xs sm:text-base font-extrabold mt-1 block whitespace-nowrap ${roundedRollover >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatSignedCurrency(rolloverFromYesterday)}
          </span>
        </div>

        {/* 3. Bugün Harcananlar */}
        <div className="bg-slate-950/60 rounded-2xl p-2.5 sm:p-4 border border-slate-800/70 text-center sm:text-left min-w-0">
          <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium truncate">Bugün Harcanan</span>
          <span className={`text-xs sm:text-base font-extrabold mt-1 block whitespace-nowrap ${spent > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {spent > 0 ? `-${formatCurrency(spent)}` : formatCurrency(0)}
          </span>
        </div>
      </div>

      {/* 🛒 HIZLI HARCAMA BUTONUM VE ÇİPLERİM */}
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
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

        {/* Hızlı Ekleme Çipleri: +₺20, +₺50, +₺100, +₺200 */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          {quickChips.map((amount) => (
            <button
              key={amount}
              onClick={() => handleChipClick(amount)}
              className="flex-1 sm:flex-none py-3 px-3.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-200 font-bold text-xs border border-slate-700/60 transition active:scale-95 shadow-sm cursor-pointer"
              title={`Tek dokunuşla +₺${amount} ekle`}
            >
              +₺{amount}
            </button>
          ))}
        </div>
      </div>

      {/* 🧾 BUGÜNKÜ HARCAMA KAYITLARIM & TEK TIKLA GERİ AL (Sadece bugün harcama varsa görünür) */}
      {todayEntries.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              Bugün Harcananlar Listesi ({todayEntries.length})
            </span>
            <span className="text-[10px] text-slate-500">Silmek için çöp kutusuna dokun</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayEntries.map((entry) => (
              <div
                key={entry.id}
                className="inline-flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs"
              >
                <span className="text-slate-500 font-medium text-[11px]">{entry.time || 'Bugün'}</span>
                <span className="font-extrabold text-slate-200">-{formatCurrency(entry.amount)}</span>
                <button
                  type="button"
                  onClick={() => removeExpenseEntry(todayData.dateKey, entry.id)}
                  className="text-slate-500 hover:text-rose-400 active:scale-90 transition p-0.5 cursor-pointer"
                  title="Bu harcamayı geri al / sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================================== */}
      {/* 3. EN ALT BÖLÜM: "BUGÜN BU KADAR HARCARSAN AY SONUNA PARAN YETER" ARAYÜZÜ          */}
      {/* ================================================================================== */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/75 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                Ay Sonuna Paran Yetsin Rehberi ({daysLeftIncludingToday} Gün Kaldı)
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                {remaining >= 0
                  ? `Bugün ${formatCurrency(remaining)} tutarına kadar harcarsan (veya kalan günlerde günde ortalama ${formatCurrency(currentDynamicDaily)} harcarsan) ay sonuna paran tam yeter.`
                  : `Limit aşıldı; ancak kalan ${daysLeftIncludingToday} gün boyunca günde ortalama en fazla ${formatCurrency(currentDynamicDaily)} harcarsan ay sonuna paran yine tam yeter!`}
              </p>
            </div>
          </div>

          <div className="sm:text-right flex sm:block items-center justify-between border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0 flex-shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Kalan Günlük Limit
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {formatCurrency(currentDynamicDaily)} <span className="text-[11px] font-normal text-slate-400">/ gün</span>
            </span>
          </div>
        </div>

        {/* 🤔 "BUNU ALIRSAM NE OLUR?" SİMÜLATÖR ÇEKMECESİ */}
        <div className="px-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsSimOpen(!isSimOpen);
            }}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-emerald-400 transition cursor-pointer py-1"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Bunu Alırsam Ay Sonuna Param Yeter mi? (Test Et)</span>
            </span>
            {isSimOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isSimOpen && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-emerald-400">₺</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={simPrice}
                    onChange={(e) => setSimPrice(e.target.value)}
                    placeholder="Almak istediğin ürün fiyatı (Örn: 500)"
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-extrabold text-white outline-none focus:border-emerald-500"
                  />
                </div>
                {simAmount > 0 && (
                  <button
                    type="button"
                    onClick={handleApplySimPurchase}
                    className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 transition active:scale-95 cursor-pointer flex-shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Aldım İşle</span>
                  </button>
                )}
              </div>

              {simAmount > 0 ? (
                <div className="text-xs space-y-1.5 pt-1">
                  {isSavingsStillSafe ? (
                    <p className="text-slate-300 leading-relaxed">
                      ✅ Bunu alırsan <strong>ay sonuna paran yeter!</strong> Kalan <strong>{daysLeftIncludingToday} gün</strong> boyunca günlük ortalama harcama hakkın{' '}
                      <span className="text-slate-400 line-through">{formatCurrency(currentDynamicDaily)}</span> yerine{' '}
                      <strong className="text-emerald-400">{formatCurrency(newDynamicDaily)}</strong> olur.
                    </p>
                  ) : (
                    <p className="text-rose-300 leading-relaxed">
                      ⚠️ Bu harcama bu ayki kalan serbest bütçeni <strong>{formatCurrency(Math.abs(newRemainingMonthBudget))}</strong> aşar!
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Bir fiyat yaz, satın almadan önce kalan günlerindeki harçlığına etkisini anında gör.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
