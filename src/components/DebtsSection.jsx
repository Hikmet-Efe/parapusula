import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/calculations';

export default function DebtsSection() {
  const { 
    debts, 
    debtStats, 
    addDebt, 
    deleteDebt, 
    toggleDebtPaid,
    config,
    updateConfig
  } = useBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingMonths, setRemainingMonths] = useState('6');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [dueDay, setDueDay] = useState('15');
  const [note, setNote] = useState('');

  // Auto-calculate monthly payment suggestion when total or months change
  const handleTotalChange = (val) => {
    setTotalAmount(val);
    const tot = parseFloat(val) || 0;
    const months = parseInt(remainingMonths, 10) || 1;
    if (tot > 0 && months > 0) {
      setMonthlyPayment(String(Math.round(tot / months)));
    }
  };

  const handleMonthsChange = (val) => {
    setRemainingMonths(val);
    const tot = parseFloat(totalAmount) || 0;
    const months = parseInt(val, 10) || 1;
    if (tot > 0 && months > 0) {
      setMonthlyPayment(String(Math.round(tot / months)));
    }
  };

  const handleAddSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim() || !totalAmount) return;

    addDebt({
      title,
      totalAmount,
      monthlyPayment: monthlyPayment || (parseFloat(totalAmount) / (parseInt(remainingMonths, 10) || 1)),
      remainingMonths,
      dueDay,
      note
    });

    setTitle('');
    setTotalAmount('');
    setMonthlyPayment('');
    setNote('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header & Overview Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/20 rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Borç & Taksit Takibi
              </h2>
              <p className="text-xs text-slate-400">
                Kredi kartı taksitleri, krediler ve elden borçlar
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yeni Ekle</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-2">
          {/* Toplam Kalan Borç */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 block font-medium">Toplam Kalan Borç</span>
            <span className="text-sm sm:text-lg font-extrabold text-white mt-1 block">
              {formatCurrency(debtStats.totalDebt)}
            </span>
          </div>

          {/* Bu Ay Ödenecek */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 block font-medium">Bu Ayki Taksitler</span>
            <span className="text-sm sm:text-lg font-extrabold text-amber-400 mt-1 block">
              {formatCurrency(debtStats.monthlyCommitment)}
            </span>
          </div>

          {/* Bu Ay Kalan Ödeme */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 block font-medium">Kalan Ödeme</span>
            <span className={`text-sm sm:text-lg font-extrabold mt-1 block ${
              debtStats.pendingThisMonth === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {debtStats.pendingThisMonth === 0 ? 'Ödendi ✓' : formatCurrency(debtStats.pendingThisMonth)}
            </span>
          </div>
        </div>

        {/* Budget sync toggle bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] sm:text-xs">Aylık taksit tutarlarını bütçenin zorunlu giderlerine otomatik bağla</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
            <input 
              type="checkbox" 
              checked={config.includeDebtsInFixedExpenses ?? true}
              onChange={(e) => updateConfig({ ...config, includeDebtsInFixedExpenses: e.target.checked })}
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
          </label>
        </div>
      </div>

      {/* Debt Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Kayıtlı Borçlar ({debts.length})
          </h3>
          {debtStats.allPaid && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Bu ayki tüm taksitler tamamlandı!
            </span>
          )}
        </div>

        {debts.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-8 text-center">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Henüz kayıtlı borç veya taksit yok</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Kredi kartı taksiti veya kredilerinizi ekleyerek aylık bütçenizi çok daha sağlıklı planlayabilirsiniz.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
            >
              + İlk Taksiti Ekle
            </button>
          </div>
        ) : (
          debts.map((debt) => (
            <div 
              key={debt.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                debt.isPaidThisMonth
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                  : 'bg-slate-900/80 border-slate-700/60 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Title & Notes */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-base font-bold tracking-tight ${debt.isPaidThisMonth ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {debt.title}
                    </h4>
                    {debt.dueDay && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Her ayın {debt.dueDay}'i
                      </span>
                    )}
                  </div>
                  {debt.note && (
                    <p className="text-xs text-slate-500 mt-0.5">{debt.note}</p>
                  )}
                </div>

                {/* Monthly Payment Amount */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-medium block">Aylık Taksit</span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-400 block">
                    {formatCurrency(debt.monthlyPayment)}
                  </span>
                </div>
              </div>

              {/* Progress and Action Bar */}
              <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Toplam: <strong className="text-slate-200">{formatCurrency(debt.totalAmount)}</strong></span>
                  <span>&bull;</span>
                  <span>Kalan: <strong className="text-indigo-400">{debt.remainingMonths} Ay</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mark as Paid Toggle */}
                  <button
                    onClick={() => toggleDebtPaid(debt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                      debt.isPaidThisMonth
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {debt.isPaidThisMonth ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Bu Ay Ödendi</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-slate-500" />
                        <span>Ödendi İşaretle</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteDebt(debt.id)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Yeni Borç / Taksit</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Taksit Planı Ekle
            </h3>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Borç / Taksit Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Telefon Taksiti, İhtiyaç Kredisi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Toplam Kalan Tutar
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₺</span>
                    <input
                      type="number"
                      required
                      placeholder="12000"
                      value={totalAmount}
                      onChange={(e) => handleTotalChange(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kalan Taksit (Ay)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="6"
                    value={remainingMonths}
                    onChange={(e) => handleMonthsChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aylık Taksit Tutarı
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₺</span>
                    <input
                      type="number"
                      placeholder="2000"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Son Ödeme Günü
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="15"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Not (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Garanti Bankası Kartı"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Taksiti Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
