import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Sliders, PiggyBank, Receipt, DollarSign, Sparkles } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, calculateTotalFixed, parseCleanNumber } from '../utils/calculations';
import { triggerHaptic } from '../utils/notifications';
import { BUDGET_TEMPLATES } from '../db/storage';

export default function BudgetSetupModal({ isOpen, onClose }) {
  const { config, updateConfig, budget } = useBudget();

  const [income, setIncome] = useState(config.monthlyIncome || '');
  const [fixedExpenses, setFixedExpenses] = useState(config.fixedExpenses || []);
  const [targetSavings, setTargetSavings] = useState(config.targetSavings || '');

  // New fixed expense form inputs
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl) => {
    triggerHaptic('medium');
    setIncome(String(tpl.monthlyIncome));
    setTargetSavings(String(tpl.targetSavings));
    setFixedExpenses(tpl.fixedExpenses.map((item, idx) => ({
      ...item,
      id: `${Date.now()}-${idx}`
    })));
  };

  const numIncome = parseCleanNumber(income);
  const numSavings = parseCleanNumber(targetSavings);
  const totalFixed = calculateTotalFixed(fixedExpenses);
  const freeBudget = Math.max(0, numIncome - totalFixed - numSavings);
  const dailyBase = budget.totalDays > 0 ? freeBudget / budget.totalDays : 0;
  const savingsRate = numIncome > 0 ? Math.round((numSavings / numIncome) * 100) : 0;

  const handleAddFixedItem = (e) => {
    e?.preventDefault();
    const val = parseCleanNumber(newAmount);
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

  const handleRemoveFixedItem = (id) => {
    triggerHaptic('light');
    setFixedExpenses(fixedExpenses.filter(item => item.id !== id));
  };

  const handleSaveAll = () => {
    triggerHaptic('medium');
    const today = new Date();
    updateConfig({
      ...config,
      startDay: config.startDay || today.getDate(),
      startMonth: config.startMonth || (today.getMonth() + 1),
      startYear: config.startYear || today.getFullYear(),
      monthlyIncome: numIncome,
      fixedExpenses,
      targetSavings: numSavings
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 overflow-hidden overscroll-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SABİT ÜST BAŞLIK */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3.5 bg-slate-900 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Sliders className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Bütçe Yapılandırması</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              Aylık Bütçe Planını Ayarla
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KAYDIRILABİLİR ORTA GÖVDE */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-3.5 sm:p-5 space-y-3.5">
          {/* Canlı Hesaplama Özeti */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-emerald-400 block font-medium">Serbest Bütçe</span>
                <span className="text-base sm:text-lg font-extrabold text-white mt-0.5 block whitespace-nowrap">
                  {formatCurrency(freeBudget)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-400 block font-medium">Günlük Taban Hak</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-400 mt-0.5 block whitespace-nowrap">
                  {formatCurrency(dailyBase)} <span className="text-[11px] text-slate-400 font-normal">/ gün</span>
                </span>
              </div>
            </div>
          </div>

          {/* ⚡ 4 ADET HAZIR BÜTÇE ŞABLONU */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Hazır Bütçe Şablonları (Tek Tıkla Doldur)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {BUDGET_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-left p-2 rounded-xl bg-slate-950 hover:bg-emerald-500/15 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer group"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 block truncate">
                    {tpl.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {tpl.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gelir & Birikim Yan Yana Kompakt Giriş */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Toplam Aylık Gelir</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm font-bold text-emerald-400">₺</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="Örn: 35000"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <PiggyBank className="w-3.5 h-3.5 text-blue-400" />
                  <span>Hedef Birikim</span>
                </label>
                {savingsRate > 0 && (
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded-full">
                    %{savingsRate}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm font-bold text-blue-400">₺</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetSavings}
                  onChange={(e) => setTargetSavings(e.target.value)}
                  placeholder="Örn: 9000"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sabit Giderler */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                <span>Zorunlu Sabit Giderler</span>
              </label>
              <span className="text-xs font-extrabold text-amber-400">
                Toplam: {formatCurrency(totalFixed)}
              </span>
            </div>

            {fixedExpenses.length > 0 && (
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 mb-2">
                {fixedExpenses.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs"
                  >
                    <span className="text-slate-200 font-semibold truncate">{item.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-extrabold text-amber-400 whitespace-nowrap">{formatCurrency(item.amount)}</span>
                      <button
                        onClick={() => handleRemoveFixedItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Kalem (Örn: Kira)"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none"
                />
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-amber-400">₺</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Tutar (1500)"
                    className="w-full pl-6 pr-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-extrabold text-white outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddFixedItem}
                disabled={!newTitle.trim() || !newAmount}
                className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                  newTitle.trim() && newAmount
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Sabit Gider Ekle</span>
              </button>
            </div>
          </div>
        </div>

        {/* SABİT ALT KAYDET BUTONU */}
        <div className="flex-shrink-0 p-3.5 bg-slate-900 border-t border-slate-800">
          <button
            onClick={handleSaveAll}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Bütçe Planını Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
