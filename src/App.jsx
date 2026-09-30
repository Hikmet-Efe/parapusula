import React, { useState, useEffect } from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DailyHeroCard from './components/DailyHeroCard';
import MonthOverview from './components/MonthOverview';
import CalendarHistory from './components/CalendarHistory';
import DebtsSection from './components/DebtsSection';
import QuickExpenseModal from './components/QuickExpenseModal';
import BudgetSetupModal from './components/BudgetSetupModal';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';
import { Plus, Compass, CreditCard, PieChart, Calendar } from 'lucide-react';
import { triggerHaptic } from './utils/notifications';
import { hasCompletedOnboarding, setOnboardingCompleted } from './db/storage';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('compass');
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isBudgetSetupOpen, setIsBudgetSetupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const { debtStats } = useBudget();

  useEffect(() => {
    // If first time user, launch onboarding wizard automatically
    if (!hasCompletedOnboarding()) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    setOnboardingCompleted(true);
    setIsOnboardingOpen(false);
  };

  const desktopTabs = [
    { id: 'compass', label: 'Pusula', icon: Compass },
    { id: 'debts', label: 'Borç & Taksit', icon: CreditCard, badge: debtStats.pendingCount > 0 ? debtStats.pendingCount : null },
    { id: 'budget', label: 'Aylık Bütçe', icon: PieChart },
    { id: 'history', label: 'Geçmiş & Takvim', icon: Calendar }
  ];

  const handleTabChange = (id) => {
    triggerHaptic('light');
    setActiveTab(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white pb-28 sm:pb-12 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <Header 
        onOpenBudgetSetup={() => setIsBudgetSetupOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Desktop Navigation Pill Bar (Hidden on Mobile) */}
      <div className="hidden sm:block border-b border-slate-900 bg-slate-900/40 backdrop-blur-sm sticky top-[61px] z-20">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
          {desktopTabs.map((t) => {
            const Icon = t.icon;
            const isCurrent = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer relative ${
                  isCurrent
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.badge && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        {/* TAB 1: PUSULA (ANA SAYFA) */}
        {activeTab === 'compass' && (
          <div className="space-y-6 animate-fadeIn">
            <DailyHeroCard 
              onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            />

            {/* Quick Glimpse of Monthly Savings */}
            <MonthOverview />
          </div>
        )}

        {/* TAB 2: BORÇLAR & TAKSİTLER */}
        {activeTab === 'debts' && (
          <DebtsSection />
        )}

        {/* TAB 3: AYLIK BÜTÇE & RAPOR */}
        {activeTab === 'budget' && (
          <div className="space-y-6 animate-fadeIn">
            <MonthOverview />
          </div>
        )}

        {/* TAB 4: GEÇMİŞ & TAKVİM */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <CalendarHistory />
          </div>
        )}
      </main>

      {/* Footer (Desktop Only) */}
      <footer className="hidden sm:block mt-auto py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>ParaPusula v2.1</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Capacitor &bull; Çevrimdışı &bull; Güvenli Yerel Depolama
          </p>
        </div>
      </footer>

      {/* Mobile Floating Action Button (Only on compass tab) */}
      {activeTab === 'compass' && (
        <div className="sm:hidden fixed bottom-20 right-5 z-30">
          <button
            onClick={() => {
              triggerHaptic('medium');
              setIsQuickExpenseOpen(true);
            }}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/50 active:scale-95 transition cursor-pointer"
            title="Hızlı Harcama Gir"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <BottomNav 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
      />

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />

      <QuickExpenseModal 
        isOpen={isQuickExpenseOpen} 
        onClose={() => setIsQuickExpenseOpen(false)} 
      />

      <BudgetSetupModal 
        isOpen={isBudgetSetupOpen} 
        onClose={() => setIsBudgetSetupOpen(false)} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BudgetProvider>
      <Dashboard />
    </BudgetProvider>
  );
}
