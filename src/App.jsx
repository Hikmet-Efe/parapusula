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

  const { debtStats, settings } = useBudget();

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
    <div
      data-theme={settings?.theme || 'emerald'}
      className="h-[100dvh] max-h-[100dvh] w-full max-w-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white overflow-hidden"
    >
      {/* Üst Sabit Başlık (Asla kaymaz ve kararmaz) */}
      <Header 
        onOpenBudgetSetup={() => setIsBudgetSetupOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Desktop Navigation Pill Bar (Hidden on Mobile) */}
      <div className="hidden sm:block flex-shrink-0 border-b border-slate-900 bg-slate-900">
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

      {/* Ortadaki Kaydırılabilir Ana İçerik Alanı (Sadece burası aşağı-yukarı kayar) */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 py-3.5 sm:py-6 space-y-5 pb-6">
          {/* TAB 1: PUSULA (ANA SAYFA) */}
          {activeTab === 'compass' && (
            <div className="space-y-5">
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
            <div className="space-y-5">
              <MonthOverview 
                showDetails={true} 
                onOpenBudgetSetup={() => setIsBudgetSetupOpen(true)} 
              />
            </div>
          )}

          {/* TAB 4: GEÇMİŞ & TAKVİM */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <CalendarHistory />
            </div>
          )}
        </div>
      </main>

      {/* Mobil Alt Sabit 4'lü Sekme Çubuğu (Flex yapısında en altta çivili durur, asla kaymaz) */}
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
