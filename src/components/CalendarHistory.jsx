import React, { useState } from 'react';
import { Calendar as CalendarIcon, Edit3, Check, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/calculations';

export default function CalendarHistory() {
  const { budget, setDaySpending } = useBudget();
  const { days, currentDayNumber } = budget;

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
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <span>Günlük Devirli Bakiye & Harcama Geçmişi</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Geçmiş günlerin harcamasını düzenlemek için güne dokunun veya kalem ikonuna tıklayın.
          </p>
        </div>
      </div>

      {/* Days Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="py-2.5 px-3">Gün</th>
              <th className="py-2.5 px-3">Devirli Başlangıç</th>
              <th className="py-2.5 px-3">Harcanan</th>
              <th className="py-2.5 px-3">Kalan Bakiye</th>
              <th className="py-2.5 px-3 text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {days.map((day) => {
              const isEditing = editingDay === day.dateKey;
              const isToday = day.isToday;
              const isPast = day.isPast;
              const isFuture = day.isFuture;

              return (
                <tr 
                  key={day.dateKey}
                  className={`transition-colors ${
                    isToday 
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/15 font-medium' 
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Day Column */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isToday 
                          ? 'bg-emerald-500 text-slate-950 font-extrabold' 
                          : isPast 
                            ? 'bg-slate-800 text-slate-300' 
                            : 'bg-slate-900 text-slate-600'
                      }`}>
                        {day.dayNumber}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Bugün
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Starting Balance (Rollover) */}
                  <td className="py-3 px-3 font-semibold text-slate-300">
                    {formatCurrency(day.startingBalance)}
                  </td>

                  {/* Spent Column (Editable) */}
                  <td className="py-3 px-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-24">
                          <span className="absolute left-2 top-1.5 text-xs text-slate-400">₺</span>
                          <input
                            type="number"
                            autoFocus
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(day.dateKey);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="w-full pl-5 pr-1.5 py-1 bg-slate-950 border border-emerald-500 rounded-lg text-xs text-white outline-none"
                            placeholder="0"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveEdit(day.dateKey)}
                          className="p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleStartEdit(day)}
                        className="inline-flex items-center gap-1 cursor-pointer group hover:text-emerald-400"
                        title="Tıklayıp harcamayı düzenleyin"
                      >
                        <span className={day.spent > 0 ? 'text-slate-100 font-bold' : 'text-slate-500'}>
                          {formatCurrency(day.spent)}
                        </span>
                        <Edit3 className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition" />
                      </div>
                    )}
                  </td>

                  {/* Remaining Balance */}
                  <td className="py-3 px-3">
                    <span className={`font-bold ${day.remainingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(day.remainingBalance)}
                    </span>
                  </td>

                  {/* Status / Devir Impact */}
                  <td className="py-3 px-3 text-right">
                    {day.spent > 0 || isPast || isToday ? (
                      day.dailyDiff >= 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ArrowUpRight className="w-3 h-3" />
                          +₺{Math.round(day.dailyDiff)} Devir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <ArrowDownRight className="w-3 h-3" />
                          -₺{Math.round(Math.abs(day.dailyDiff))} Aşım
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-600">Planlandı</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
