// ======================================================================================
// 💳 DAILY HERO CARD - ANA SAYFADAKİ DEV BAKİYE KARTIM, HIZLI HARCAMA & SİMÜLATÖR
// ======================================================================================
// BURADA NE YAPMAYA ÇALIŞTIM?
// Uygulamayı her açtığımda tek bir soruya net cevap görmek istedim:
// "Bugün cebimde harcayabileceğim tam olarak kaç liram var?"
// Bu kart o cevabı devasa puntolarla önüme koyuyor. Ayrıca:
// - Tek dokunuşla (+₺20, +₺50 vb.) harcama ekleyebiliyorum,
// - Yanlışlıkla bastığım bir harcamayı "Bugünkü İşlemlerim" listesinden tek tıkla geri alabiliyorum,
// - "Bunu Alırsam Ne Olur?" simülatörüyle bir şey satın almadan önce kalan günlerime etkisini görüyorum.
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
  Check
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, parseCleanNumber } from '../utils/calculations';
import { triggerHaptic } from '../utils/notifications';

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
  const rolloverFromYesterday = todayData.startingBalance - base;  // Dünden bana devreden para (+ veya -)
  const todayEntries = todayData.entries || [];                    // Bugün girdiğim tekil harcamalar

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

  // 3. ⚡ TEK DOKUNUŞLA HIZLI HARCAMA ÇİPİ (Hiçbir mikro ayar olmadan anında ekler)
  const handleChipClick = (amount) => {
    triggerHaptic('light');
    addExpense(amount);
  };

  const quickChips = [20, 50, 100, 200];

  // 4. 🤔 SİMÜLATÖR HESAPLAMASI ("Bunu Alırsam Ne Olur?")
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

      {/* Üst Başlık & Sağ Üstteki Durum + Seri Rozetim */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            Bugünkü Kullanılabilir Bakiye
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {streakDays >= 1 && (
            <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm" title="Bütçeyi aşmadan tamamladığın gün serisi">
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

      {/* 🚀 DEV BAKİYE SAYISI (Günün ana odak noktası) */}
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

      {/* 📊 3'LÜ MİNİ GÖSTERGE PANELİM (Taban Hak, Dünden Devir, Bugün Harcanan) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 pt-5 border-t border-slate-800/80">
        
        {/* 1. Günlük Taban Hakkım */}
        <div className="bg-slate-950/50 rounded-2xl p-3 sm:p-4 border border-slate-800/60 text-center sm:text-left">
          <span className="text-[11px] text-slate-400 block font-medium">Günlük Taban Hak</span>
          <span className="text-sm sm:text-base font-bold text-slate-200 mt-1 block">
            {formatCurrency(base)}
          </span>
        </div>

        {/* 2. Dünden Bana Devreden Para */}
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

        {/* 3. Bugün Harcadığım Tutar */}
        <div className="bg-slate-950/50 rounded-2xl p-3 sm:p-4 border border-slate-800/60 text-center sm:text-left">
          <span className="text-[11px] text-slate-400 block font-medium">Bugün Harcanan</span>
          <span className="text-sm sm:text-base font-bold text-slate-200 mt-1 block">
            {formatCurrency(spent)}
          </span>
        </div>
      </div>

      {/* 🛒 HIZLI HARCAMA BUTONUM VE ÇİPLERİM */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
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
        <div className="mt-5 pt-4 border-t border-slate-800/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              Bugün Eklenenler ({todayEntries.length})
            </span>
            <span className="text-[10px] text-slate-500">Yanlış girişi silmek için dokunun</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayEntries.map((entry) => (
              <div
                key={entry.id}
                className="inline-flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs"
              >
                <span className="text-slate-500 font-medium text-[11px]">{entry.time || 'Bugün'}</span>
                <span className="font-extrabold text-slate-200">{formatCurrency(entry.amount)}</span>
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

      {/* 🤔 "BUNU ALIRSAM NE OLUR?" MİNİ HARCAMA SİMÜLATÖRÜ */}
      <div className="mt-5 pt-4 border-t border-slate-800/70">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsSimOpen(!isSimOpen);
          }}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-emerald-400 transition cursor-pointer py-1"
        >
          <span className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Bunu Alırsam Ne Olur? (Harcama Simülatörü)</span>
          </span>
          {isSimOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isSimOpen && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-emerald-400">₺</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={simPrice}
                  onChange={(e) => setSimPrice(e.target.value)}
                  placeholder="Almak istediğin ürün fiyatı (Örn: 1500)"
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
                    ✅ Bunu bugün alırsan <strong>dokunulmaz birikim hedefin bozulmaz!</strong> Ay sonuna kadar kalan <strong>{daysLeftIncludingToday} gün</strong> boyunca günlük ortalama harçlığın{' '}
                    <span className="text-slate-400 line-through">{formatCurrency(currentDynamicDaily)}</span> yerine{' '}
                    <strong className="text-emerald-400">{formatCurrency(newDynamicDaily)}</strong> olur.
                  </p>
                ) : (
                  <p className="text-rose-300 leading-relaxed">
                    ⚠️ Bu harcama bu ayki kalan serbest bütçeni <strong>{formatCurrency(Math.abs(newRemainingMonthBudget))}</strong> aşar ve dokunulmaz birikim hedefinden yemeye başlar!
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
  );
}
