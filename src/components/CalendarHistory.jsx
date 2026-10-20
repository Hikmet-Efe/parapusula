import React, { useState } from 'react';
import { Calendar as CalendarIcon, Edit3, Check, X } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/calculations';

export default function CalendarHistory() {
  const { budget, setDaySpending } = useBudget();
  const { days } = budget;

  // Editing day state
  const [editingDay, setEditingDay] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  const handleStartEdit = (day) => {
    setEditingDay(day.dateKey);
    setEditAmount(day.spent > 0 ? String(day.spent) : '');
  };

  const handleSaveEdit = (dateKey) => {
    setDaySpending(dateKey, editAmount);
    setEditingDay(null);
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
  };

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-3xl p-3.5 sm:p-6 overflow-hidden">
      <div className="mb-3 px-1">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Günlük Devirli Bakiye & Harcama Geçmişi</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Harcamayı düzenlemek için günün harcanan tutarına dokunun.
        </p>
      </div>

      {/* Sağa-sola kaydırma gerektirmeyen, %100 telefon ekranına sığan 4 sütunlu tablo başlığı */}
      <div className="grid grid-cols-12 items-center border-b border-slate-800 pb-2 px-1.5 text-[11px] font-bold text-slate-400">
        <div className="col-span-2">Gün</div>
        <div className="col-span-3">Başlangıç</div>
        <div className="col-span-4">Harcanan</div>
        <div className="col-span-3 text-right">Kalan Bakiye</div>
      </div>

      {/* Günler Listesi (Sıfır yatay kaydırma) */}
      <div className="divide-y divide-slate-800/60">
        {days.map((day) => {
          const isEditing = editingDay === day.dateKey;
          const isToday = day.isToday;
          const isPast = day.isPast;

          return (
            <div
              key={day.dateKey}
              className={`grid grid-cols-12 items-center py-2.5 px-1.5 text-xs transition-colors ${
                isToday
                  ? 'bg-emerald-500/10 rounded-xl font-medium'
                  : 'hover:bg-slate-800/40'
              }`}
            >
              {/* 1. Gün Sütunu */}
              <div className="col-span-2 flex items-center gap-1 min-w-0">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  isToday
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : isPast
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-900 text-slate-500'
                }`}>
                  {day.dayNumber}
                </span>
                {isToday && (
                  <span className="text-[9px] font-extrabold uppercase text-emerald-400 hidden xs:inline">
                    Bugün
                  </span>
                )}
              </div>

              {/* 2. Devirli Başlangıç Sütunu */}
              <div className="col-span-3 font-semibold text-slate-300 whitespace-nowrap pr-1">
                {day.isBeforeStart ? '-' : formatCurrency(day.startingBalance)}
              </div>

              {/* 3. Harcanan Sütunu (Tıklayıp Düzenlenebilir) */}
              <div className="col-span-4 min-w-0 pr-1">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoFocus
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(day.dateKey);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="w-16 px-1.5 py-1 bg-slate-950 border border-emerald-500 rounded-lg text-xs text-white font-bold outline-none"
                      placeholder="0"
                    />
                    <button
                      onClick={() => handleSaveEdit(day.dateKey)}
                      className="p-1 bg-emerald-500 text-slate-950 rounded-md flex-shrink-0 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 bg-slate-800 text-slate-300 rounded-md flex-shrink-0 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(day)}
                    className="inline-flex items-center gap-1 cursor-pointer group hover:text-emerald-400 whitespace-nowrap"
                  >
                    <span className={day.spent > 0 ? 'text-white font-bold' : 'text-slate-500'}>
                      {formatCurrency(day.spent)}
                    </span>
                    <Edit3 className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 flex-shrink-0" />
                  </button>
                )}
              </div>

              {/* 4. Kalan Bakiye & Günlük Fark Sütunu */}
              <div className="col-span-3 text-right whitespace-nowrap">
                {day.isBeforeStart ? (
                  <span className="text-[10px] text-slate-600 italic">Öncesi</span>
                ) : (
                  <div>
                    <span className={`font-extrabold block ${day.remainingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {day.remainingBalance > 0 ? `+${formatCurrency(day.remainingBalance)}` : formatCurrency(day.remainingBalance)}
                    </span>
                    {(day.spent > 0 || isPast || isToday) && (
                      <span className={`text-[9px] font-semibold block ${day.dailyDiff >= 0 ? 'text-emerald-500/80' : 'text-rose-400/80'}`}>
                        {day.dailyDiff >= 0 ? `+${Math.round(day.dailyDiff)} ₺` : `-${Math.round(Math.abs(day.dailyDiff))} ₺`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
