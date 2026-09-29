import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Sliders, ShieldCheck, PiggyBank, Receipt, DollarSign } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, calculateTotalFixed } from '../utils/calculations';

export default function BudgetSetupModal({ isOpen, onClose }) {
  const { config, updateConfig, budget } = useBudget();

  const [income, setIncome] = useState(config.monthlyIncome || '');
  const [fixedExpenses, setFixedExpenses] = useState(config.fixedExpenses || []);
  const [targetSavings, setTargetSavings] = useState(config.targetSavings || '');

  // New fixed expense form inputs
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');

  if (!isOpen) return null;

  const numIncome = parseFloat(income) || 0;
  const numSavings = parseFloat(targetSavings) || 0;
  const totalFixed = calculateTotalFixed(fixedExpenses);
  const freeBudget = Math.max(0, numIncome - totalFixed - numSavings);
  const dailyBase = budget.totalDays > 0 ? freeBudget / budget.totalDays : 0;
  const savingsRate = numIncome > 0 ? Math.round((numSavings / numIncome) * 100) : 0;

  const handleAddFixedItem = (e) => {
    e?.preventDefault();
    const val = parseFloat(newAmount) || 0;
    if (newTitle.trim() && val > 0) {
      setFixedExpenses([
        ...fixedExpenses,
        { id: Date.now().toString(), title: newTitle.trim(), amount: val }
      ]);
      setNewTitle('');
      setNewAmount('');
    }
  };

  const handleRemoveFixedItem = (id) => {
    setFixedExpenses(fixedExpenses.filter(item => item.id !== id));
  };

  const handleSaveAll = () => {
    updateConfig({
      ...config,
      monthlyIncome: numIncome,
      fixedExpenses,
      targetSavings: numSavings
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Sliders className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Bütçe Yapılandırması</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Aylık Bütçe Planını Ayarla
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Gelir, zorunlu gider ve hedeflediğiniz birikimi belirleyin; ParaPusula günlük serbest bakiyenizi hesaplasın.
        </p>

        {/* Live Calculation Preview Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-emerald-400 block font-medium">Kullanılabilir Serbest Bütçe</span>
              <span className="text-lg font-extrabold text-white mt-0.5 block">
                {formatCurrency(freeBudget)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 block font-medium">Günlük Taban Harçlık</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-0.5 block">
                {formatCurrency(dailyBase)} <span className="text-xs text-slate-400 font-normal">/ gün</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Income Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Toplam Aylık Gelir</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-slate-400">₺</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Örn: 35000"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              />
            </div>
          </div>

          {/* Target Savings Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-blue-400" />
                <span>Aylık Hedef Birikim (Dokunulmayacak Tutar)</span>
              </label>
              {savingsRate > 0 && (
                <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  Gelirin %{savingsRate}'si
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-slate-400">₺</span>
              <input
                type="number"
                value={targetSavings}
                onChange={(e) => setTargetSavings(e.target.value)}
                placeholder="Örn: 9000"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
            </div>
          </div>

          {/* Fixed Expenses Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Zorunlu Sabit Giderler (Kira, Fatura vb.)</span>
              </label>
              <span className="text-xs font-bold text-amber-400">
                Toplam: {formatCurrency(totalFixed)}
              </span>
            </div>

            {/* List of current fixed expenses */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {fixedExpenses.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                >
                  <span className="text-slate-300 font-medium">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{formatCurrency(item.amount)}</span>
                    <button
                      onClick={() => handleRemoveFixedItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new fixed expense inline */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Kalem Adı (örn: Aidat)"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-slate-600"
              />
              <div className="relative w-28">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₺</span>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Tutar"
                  className="w-full pl-6 pr-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-slate-600"
                />
              </div>
              <button
                type="button"
                onClick={handleAddFixedItem}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition text-xs font-bold"
                title="Kalem Ekle"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveAll}
          className="w-full mt-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
        >
          <Check className="w-5 h-5" />
          <span>Bütçe Planını Kaydet</span>
        </button>
      </div>
    </div>
  );
}
