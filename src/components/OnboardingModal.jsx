import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  DollarSign, 
  Receipt, 
  PiggyBank, 
  Bell, 
  Sparkles, 
  TrendingUp,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, calculateTotalFixed } from '../utils/calculations';
import { triggerHaptic } from '../utils/notifications';

export default function OnboardingModal({ isOpen, onComplete }) {
  const { config, updateConfig, settings, updateSettings, enableNotifications, budget } = useBudget();

  const [step, setStep] = useState(1);
  const [income, setIncome] = useState(config.monthlyIncome || '');
  const [targetSavings, setTargetSavings] = useState(config.targetSavings || '');
  const [notificationTime, setNotificationTime] = useState(settings.notificationTime || '23:00');
  const [fixedExpenses, setFixedExpenses] = useState(config.fixedExpenses || [
    { id: '1', title: 'Ev Kirası / Aidat', amount: 15000 },
    { id: '2', title: 'Faturalar & Abonelikler', amount: 3000 }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');

  if (!isOpen) return null;

  const numIncome = parseFloat(income) || 0;
  const numSavings = parseFloat(targetSavings) || 0;
  const totalFixed = calculateTotalFixed(fixedExpenses);
  const freeBudget = Math.max(0, numIncome - totalFixed - numSavings);
  const daysInMonth = budget.totalDays || 30;
  const dailyBase = daysInMonth > 0 ? freeBudget / daysInMonth : 0;

  const handleAddFixed = () => {
    const val = parseFloat(newAmount) || 0;
    if (newTitle.trim() && val > 0) {
      triggerHaptic('light');
      setFixedExpenses([
        ...fixedExpenses,
        { id: Date.now().toString(), title: newTitle.trim(), amount: val }
      ]);
      setNewTitle('');
      setNewAmount('');
    }
  };

  const handleRemoveFixed = (id) => {
    triggerHaptic('light');
    setFixedExpenses(fixedExpenses.filter(f => f.id !== id));
  };

  const handleNext = () => {
    triggerHaptic('light');
    setStep(s => s + 1);
  };

  const handleBack = () => {
    triggerHaptic('light');
    setStep(s => s - 1);
  };

  const handleFinish = async () => {
    triggerHaptic('medium');
    
    // Save budget configuration
    updateConfig({
      ...config,
      monthlyIncome: numIncome,
      fixedExpenses,
      targetSavings: numSavings
    });

    // Save notification time
    updateSettings({
      ...settings,
      notificationTime,
      notificationEnabled: true
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Complete onboarding
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative my-auto max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Başlangıç Rehberi
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Adım {step} / 4
          </span>
        </div>

        {/* Step 1: Gelir */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Hoş Geldin! 👋
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ParaPusula ile bütçeni kontrol altına almaya 1 dakikada başlayalım. Aylık net toplam gelirini girer misin?
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Aylık Net Toplam Gelir</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-lg font-extrabold text-emerald-400">₺</span>
                <input
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="35000"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xl font-black text-white outline-none focus:border-emerald-500 transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Maaş, ek gelirler veya ortalama aylık bütçeniz.
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={numIncome <= 0}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                numIncome > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Devam Et</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Step 2: Zorunlu Giderler */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <span>Zorunlu Sabit Giderlerin</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kira, fatura, aidat gibi her ay mutlaka ödemen gereken giderleri belirle.
              </p>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {fixedExpenses.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  <span className="text-slate-300 font-semibold">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-400">{formatCurrency(item.amount)}</span>
                    <button onClick={() => handleRemoveFixed(item.id)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline add */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">+ Yeni Kalem Ekle</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Kalem Adı"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Tutar (₺)"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={handleAddFixed}
                disabled={!newTitle.trim() || !newAmount}
                className={`w-full py-1.5 rounded-xl text-xs font-bold transition ${
                  newTitle.trim() && newAmount ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-600'
                }`}
              >
                + Kalemi Ekle
              </button>
            </div>

            <div className="flex justify-between items-center px-1 text-xs">
              <span className="text-slate-400">Sabit Gider Toplamı:</span>
              <span className="font-extrabold text-amber-400">{formatCurrency(totalFixed)}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={handleBack} className="py-3 px-4 bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNext} className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
                <span>Devam Et</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Hedef Birikim & Bildirim */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-blue-400" />
                <span>Aylık Hedef Birikim & Bildirim</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ay sonunda kenara atmak istediğin dokunulmaz birikim tutarını ve gece harcama bildirim saatini seç.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-blue-400" />
                <span>Aylık Hedef Birikim Tutarı</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-base font-extrabold text-blue-400">₺</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={targetSavings}
                  onChange={(e) => setTargetSavings(e.target.value)}
                  placeholder="9000"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base font-extrabold text-white outline-none focus:border-blue-400 transition"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Gece Bildirim Saati</span>
                </span>
                <span className="text-[11px] text-slate-500">Her gece harcamalarını hatırlatır.</span>
              </div>
              <input
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={handleBack} className="py-3 px-4 bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNext} className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
                <span>Bütçemi Hesapla</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Sonuç & Pusulayı Başlat */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Pusulanız Hazır!
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Tüm hesaplamalar yapıldı. İşte aylık harcama pusulanız:
              </p>
            </div>

            {/* Calculated Plan Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">Net Serbest Bütçe:</span>
                <span className="text-base font-black text-white">{formatCurrency(freeBudget)}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">Hedef Birikim:</span>
                <span className="text-base font-extrabold text-blue-400">{formatCurrency(numSavings)}</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-xs font-bold text-emerald-400 block">Günlük Taban Harçlığın:</span>
                  <span className="text-[10px] text-slate-500">Kalan günlere devirli</span>
                </div>
                <span className="text-xl font-black text-emerald-400">
                  {formatCurrency(dailyBase)} <span className="text-xs text-slate-400 font-normal">/ gün</span>
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed">
              💡 <strong>Devir Kuralı:</strong> Bugün bu tutardan daha az harcarsan, kalan paran yarınki bakiyene eklenir! Böylece birikim hedefin asla bozulmaz.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={handleBack} className="py-3 px-4 bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 active:scale-95 transition cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Pusulayı Başlat 🚀</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
