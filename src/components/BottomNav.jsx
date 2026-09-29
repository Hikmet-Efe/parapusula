import React from 'react';
import { Compass, CreditCard, PieChart, Calendar } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { triggerHaptic } from '../utils/notifications';

export default function BottomNav({ activeTab, onSelectTab }) {
  const { debtStats } = useBudget();

  const tabs = [
    {
      id: 'compass',
      label: 'Pusula',
      icon: Compass
    },
    {
      id: 'debts',
      label: 'Borçlar',
      icon: CreditCard,
      badge: debtStats.pendingCount > 0 ? debtStats.pendingCount : null
    },
    {
      id: 'budget',
      label: 'Bütçe',
      icon: PieChart
    },
    {
      id: 'history',
      label: 'Geçmiş',
      icon: Calendar
    }
  ];

  const handleTabClick = (tabId) => {
    triggerHaptic('light');
    onSelectTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-3 py-2 flex justify-around items-center sm:hidden safe-area-pb shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-all relative ${
              isActive 
                ? 'text-emerald-400 font-bold' 
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${
              isActive ? 'bg-emerald-500/15 scale-110 shadow-sm shadow-emerald-500/20' : ''
            }`}>
              <Icon className="w-5 h-5" />

              {/* Badge for pending debt counts */}
              {tab.badge && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
