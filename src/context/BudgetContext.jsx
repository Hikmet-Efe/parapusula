// ======================================================================================
// 🌐 BUDGET CONTEXT - TÜM UYGULAMANIN MERKEZİ VERİ VE DURUM (STATE) YÖNETİMİ
// ======================================================================================
// BURADA NE YAPMAYA ÇALIŞTIM?
// React'ta ekranlar arası veri taşırken prop karmaşası yaşamamak için en tepeye bir Context
// havuzu kurdum. Böylece uygulamanın herhangi bir yerindeki buton (örneğin Hızlı Harcama)
// bu havuza direkt erişip harcama ekleyebiliyor ve tüm ekranlarım anında güncelleniyor.
// ======================================================================================

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
  // 💾 Telefonun hafızasından (LocalStorage) kayıtlı verilerimi çekiyorum
  const [config, setConfig] = useState(loadBudgetConfig);        // Gelir, sabit giderlerim, hedef birikimim
  const [spendings, setSpendings] = useState(loadSpendings);      // Gün gün girdiğim harcamalar
  const [settings, setSettings] = useState(loadSettings);        // Bildirim saatim vb. tercihlerim
  const [debts, setDebts] = useState(loadDebts);                // Kredi ve taksit listem
  const [permissionState, setPermissionState] = useState(getNotificationPermission);

  // 🗓️ Görüntülediğim ay ve yıl (Önceki veya sonraki aylara bakabilmem için)
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12

  // 🛡️ AKILLI ÖNLEM: Ay ortası başlangıç günümü otomatik mühürleme
  // Uygulamayı ilk kez kurup ayın ortasında açtığımda, startDay henüz atanmamışsa
  // bugünün tarihini başlangıç günü olarak kaydediyorum ki geçmiş 29 günün parası bugüne devretmesin.
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

  // 💳 BORÇ VE TAKSİT İSTATİSTİKLERİMİ HESAPLIYORUM
  // Toplam borcum ne kadar, bu ay ne kadar taksit ödeyeceğim, kaç taksitim kaldı?
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

  // 🔗 BORÇLARI SABİT GİDERLERİME OTOMATİK BAĞLAMA SİSTEMİM
  // Eğer ayarlardan borç bağlamayı açtıysam, bu ayki toplam taksit tutarını sanki kira veya fatura gibi
  // zorunlu bir gider sayıp harçlığımdan peşinen düşüyorum. Böylece taksit param güvende kalıyor!
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

  // 🧮 CANLI BÜTÇE HESAPLAMAM
  // Harcama eklediğimde veya ayı değiştirdiğimde tüm bütçe motorunu burada anında tetikliyorum.
  const budget = useMemo(() => {
    return calculateMonthBudget(effectiveConfig, spendings, selectedYear, selectedMonth);
  }, [effectiveConfig, spendings, selectedYear, selectedMonth]);

  // ⏰ GECE BİLDİRİMİ SİSTEMİM
  // Her gece belirlediğim saatte (örn. 23:00) telefonuma o gün kalan bakiyemi hatırlatmasını sağlıyorum.
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

  // ➕ YENİ HARCAMA GİRME FONKSİYONUM (Titreşimli)
  // Ekranda harcama girdiğim an hem telefona titreşim veriyorum hem de harcamayı günün tarihine işliyorum.
  const addExpense = (amount, note = '') => {
    const num = Math.abs(parseFloat(amount) || 0);
    if (num <= 0) return;

    // Dokunma hissi (Haptic) veriyorum
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

  // ✏️ GEÇMİŞ BİR GÜNÜN HARCAMASINI DÜZELTME
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

  // 💳 BORÇ İŞLEMLERİM
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

  // ⚙️ BÜTÇE VE AYARLARI KAYDETME
  const updateConfig = (newConfig) => {
    triggerHaptic('light');
    setConfig(newConfig);
    saveBudgetConfig(newConfig);
  };

  const updateSettings = (newSettings) => {
    triggerHaptic('light');
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // 🔔 BİLDİRİM İZNİ ALMA
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

  const sendTestNotification = () => {
    triggerNotification(
      '🧭 ParaPusula Hatırlatıcı (Test)',
      `Bugünkü kalan kullanılabilir bakiyeniz: ₺${Math.round(budget.todayData.remainingBalance)}. Günlük harcamanızı girmeyi unutmayın!`
    );
  };

  // ◀️ ▶️ AYLAR ARASI GEÇİŞ YAPMA
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

  // 📦 YEDEK ALMA VE YEDEK YÜKLEME SİSTEMİM (JSON)
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

// 🪝 Kolayca erişmek için yazdığım özel React Hook'um
export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
