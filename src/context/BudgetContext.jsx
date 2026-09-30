import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  loadBudgetConfig,
  saveBudgetConfig,
  loadSpendings,
  saveSpendings,
  loadSettings,
  saveSettings,
  loadDebts,
  saveDebts,
  exportAllData,
  importAllData
} from '../db/storage';
import {
  calculateMonthBudget,
  formatDateKey
} from '../utils/calculations';
import {
  startNotificationScheduler,
  triggerNotification,
  requestNotificationPermission,
  getNotificationPermission,
  triggerHaptic
} from '../utils/notifications';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [config, setConfig] = useState(loadBudgetConfig);
  const [spendings, setSpendings] = useState(loadSpendings);
  const [settings, setSettings] = useState(loadSettings);
  const [debts, setDebts] = useState(loadDebts);
  const [permissionState, setPermissionState] = useState(getNotificationPermission);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12

  // Auto-pin startDay to today if missing so mid-month users don't get 30 days of accumulated fake rollover
  useEffect(() => {
    if (!config.startDay) {
      const now = new Date();
      const updated = {
        ...config,
        startDay: now.getDate(),
        startMonth: now.getMonth() + 1,
        startYear: now.getFullYear()
      };
      setConfig(updated);
      saveBudgetConfig(updated);
    }
  }, [config]);

  // Calculate total monthly debt commitments
  const debtStats = useMemo(() => {
    let totalDebt = 0;
    let monthlyCommitment = 0;
    let paidThisMonth = 0;
    let pendingCount = 0;

    debts.forEach((d) => {
      const remainingTotal = Number(d.totalAmount) || 0;
      const monthly = Number(d.monthlyPayment) || 0;
      totalDebt += remainingTotal;
      monthlyCommitment += monthly;
      if (d.isPaidThisMonth) {
        paidThisMonth += monthly;
      } else {
        pendingCount += 1;
      }
    });

    const pendingThisMonth = Math.max(0, monthlyCommitment - paidThisMonth);

    return {
      totalDebt,
      monthlyCommitment,
      paidThisMonth,
      pendingThisMonth,
      pendingCount,
      allPaid: debts.length > 0 && pendingCount === 0
    };
  }, [debts]);

  // Merge debt commitments into budget config if includeDebtsInFixedExpenses is enabled
  const effectiveConfig = useMemo(() => {
    if (!config.includeDebtsInFixedExpenses || debtStats.monthlyCommitment === 0) {
      return config;
    }
    const debtItem = {
      id: 'system_debts',
      title: '💳 Borç & Taksit Ödemeleri (Aylık)',
      amount: debtStats.monthlyCommitment
    };
    return {
      ...config,
      fixedExpenses: [...config.fixedExpenses, debtItem]
    };
  }, [config, debtStats.monthlyCommitment]);

  // Re-calculate the budget and dynamic rollover
  const budget = useMemo(() => {
    return calculateMonthBudget(effectiveConfig, spendings, selectedYear, selectedMonth);
  }, [effectiveConfig, spendings, selectedYear, selectedMonth]);

  // Nightly notification scheduler effect
  useEffect(() => {
    const unsubscribe = startNotificationScheduler(
      settings,
      budget.todayData.remainingBalance,
      (dateStr) => {
        const updated = { ...settings, lastNotificationDate: dateStr };
        setSettings(updated);
        saveSettings(updated);
      }
    );
    return () => unsubscribe();
  }, [settings, budget.todayData.remainingBalance]);

  // Add an expense with haptic vibration
  const addExpense = (amount, note = '') => {
    const num = Math.abs(parseFloat(amount) || 0);
    if (num <= 0) return;

    triggerHaptic('light');

    const dateKey = formatDateKey(new Date());
    const existing = spendings[dateKey] || [];
    
    let entries = Array.isArray(existing) ? [...existing] : [{ id: '1', amount: Number(existing), time: '12:00', note: '' }];
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    entries.push({
      id: Date.now().toString(),
      amount: num,
      time: timeStr,
      note: note.trim()
    });

    const newSpendings = { ...spendings, [dateKey]: entries };
    setSpendings(newSpendings);
    saveSpendings(newSpendings);
  };

  // Override total spending for a specific day
  const setDaySpending = (dateKey, totalAmount) => {
    triggerHaptic('light');
    const num = Math.max(0, parseFloat(totalAmount) || 0);
    const newSpendings = {
      ...spendings,
      [dateKey]: [{ id: Date.now().toString(), amount: num, time: '23:00', note: 'Güncelleme' }]
    };
    setSpendings(newSpendings);
    saveSpendings(newSpendings);
  };

  // Debt Operations
  const addDebt = (debtItem) => {
    triggerHaptic('medium');
    const newDebt = {
      id: Date.now().toString(),
      title: debtItem.title.trim(),
      totalAmount: parseFloat(debtItem.totalAmount) || 0,
      monthlyPayment: parseFloat(debtItem.monthlyPayment) || 0,
      remainingMonths: parseInt(debtItem.remainingMonths, 10) || 1,
      totalMonths: parseInt(debtItem.remainingMonths, 10) || 1,
      dueDay: parseInt(debtItem.dueDay, 10) || 15,
      isPaidThisMonth: false,
      note: debtItem.note ? debtItem.note.trim() : ''
    };
    const updated = [...debts, newDebt];
    setDebts(updated);
    saveDebts(updated);
  };

  const updateDebt = (id, updatedFields) => {
    triggerHaptic('light');
    const updated = debts.map(d => d.id === id ? { ...d, ...updatedFields } : d);
    setDebts(updated);
    saveDebts(updated);
  };

  const deleteDebt = (id) => {
    triggerHaptic('medium');
    const updated = debts.filter(d => d.id !== id);
    setDebts(updated);
    saveDebts(updated);
  };

  const toggleDebtPaid = (id) => {
    triggerHaptic('medium');
    const updated = debts.map(d => {
      if (d.id === id) {
        return { ...d, isPaidThisMonth: !d.isPaidThisMonth };
      }
      return d;
    });
    setDebts(updated);
    saveDebts(updated);
  };

  // Update budget configuration
  const updateConfig = (newConfig) => {
    triggerHaptic('light');
    setConfig(newConfig);
    saveBudgetConfig(newConfig);
  };

  // Update app settings
  const updateSettings = (newSettings) => {
    triggerHaptic('light');
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Request notification permissions
  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermissionState(getNotificationPermission());
    if (granted) {
      const updated = { ...settings, notificationEnabled: true };
      updateSettings(updated);
      triggerNotification('🧭 ParaPusula Bildirimleri Aktif!', 'Her gece saat ' + settings.notificationTime + ' de harcama hatırlatıcınız gelecek.');
    }
    return granted;
  };

  // Test Notification
  const sendTestNotification = () => {
    triggerNotification(
      '🧭 ParaPusula Hatırlatıcı (Test)',
      `Bugünkü kalan kullanılabilir bakiyeniz: ₺${Math.round(budget.todayData.remainingBalance)}. Günlük harcamanızı girmeyi unutmayın!`
    );
  };

  // Month navigation
  const prevMonth = () => {
    triggerHaptic('light');
    if (selectedMonth === 1) {
      setSelectedYear(y => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    triggerHaptic('light');
    if (selectedMonth === 12) {
      setSelectedYear(y => y + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const resetToCurrentMonth = () => {
    triggerHaptic('light');
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  // Backup and Restore
  const handleExport = () => {
    triggerHaptic('medium');
    exportAllData();
  };

  const handleImport = (jsonStr) => {
    const res = importAllData(jsonStr);
    if (res.success) {
      triggerHaptic('medium');
      setConfig(loadBudgetConfig());
      setDebts(loadDebts());
      setSpendings(loadSpendings());
      setSettings(loadSettings());
    }
    return res;
  };

  return (
    <BudgetContext.Provider
      value={{
        config,
        updateConfig,
        spendings,
        addExpense,
        setDaySpending,
        debts,
        debtStats,
        addDebt,
        updateDebt,
        deleteDebt,
        toggleDebtPaid,
        settings,
        updateSettings,
        budget,
        selectedYear,
        selectedMonth,
        prevMonth,
        nextMonth,
        resetToCurrentMonth,
        permissionState,
        enableNotifications,
        sendTestNotification,
        handleExport,
        handleImport
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
