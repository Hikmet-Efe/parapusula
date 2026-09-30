import React from 'react';
import { 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Settings as SettingsIcon, 
  BellRing,
  RotateCcw
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function Header({ onOpenSettings, onOpenBudgetSetup }) {
  const {
    selectedYear,
    selectedMonth,
    prevMonth,
    nextMonth,
    resetToCurrentMonth,
    settings,
    permissionState,
    enableNotifications
  } = useBudget();

  const now = new Date();
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === (now.getMonth() + 1);

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-3 sm:px-4 py-2 sm:py-3">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Top Row on Mobile: Brand on Left, Actions on Right */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white flex-shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base sm:text-xl tracking-tight text-white flex items-center gap-1">
                  ParaPusula
                </h1>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden xs:block">
                Günlük Bütçe & Tasarruf
              </p>
            </div>
          </div>

          {/* Action Buttons (Visible on Mobile right side) */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={onOpenBudgetSetup}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition"
              title="Bütçe Yapılandırması"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={onOpenSettings}
              className="relative p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
              title="Ayarlar & Bildirimler"
            >
              <SettingsIcon className="w-4 h-4" />
              {settings.notificationEnabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Month Selector (Full width on mobile, auto width on desktop) */}
        <div className="flex items-center justify-between sm:justify-center bg-slate-950/70 sm:bg-slate-800/80 border border-slate-800 sm:border-slate-700/60 rounded-xl p-1 shadow-inner w-full sm:w-auto">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 sm:hover:bg-slate-700 transition"
            title="Önceki Ay"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-3 text-center flex items-center justify-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-slate-100">
              {MONTH_NAMES_TR[selectedMonth - 1]}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {selectedYear}
            </span>

            {!isCurrentMonth && (
              <button
                onClick={resetToCurrentMonth}
                className="ml-1 p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10 transition"
                title="Bu Aya Dön"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 sm:hover:bg-slate-700 transition"
            title="Sonraki Ay"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls for Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenBudgetSetup}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700/50 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Bütçe Yapılandırması"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Bütçeyi Düzenle</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition cursor-pointer"
            title="Ayarlar & Bildirimler"
          >
            <SettingsIcon className="w-4 h-4" />
            {settings.notificationEnabled && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Notification Permission Banner if not enabled */}
      {permissionState !== 'granted' && (
        <div className="max-w-4xl mx-auto mt-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2 px-3 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <BellRing className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
            <span className="truncate text-[11px] sm:text-xs">
              Gece {settings.notificationTime || '23:00'} harcama hatırlatıcınız için izin verin.
            </span>
          </div>
          <button
            onClick={enableNotifications}
            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition flex-shrink-0 text-[11px] cursor-pointer"
          >
            Aç
          </button>
        </div>
      )}
    </header>
  );
}
