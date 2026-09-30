// ======================================================================================
// 💾 STORAGE ENGINE - ÇEVRİMDIŞI YEREL VERİTABANI MOTORU (LOCALSTORAGE)
// ======================================================================================
// NE YAPMAYA ÇALIŞIYORUZ?
// ParaPusula sıfır sunucu (serverless) ve %100 çevrimdışı (offline-first) bir uygulamadır.
// Kullanıcının maaşı, borçları ve harcamaları asla internetteki yabancı bir sunucuya gitmez.
// Telefonun kendi güvenli web depolama alanında (HTML5 LocalStorage) JSON formatında saklanır.
// Bu dosya, tüm okuma, yazma, yedekleme (export) ve geri yükleme (import) işlerini yönetir.
// ======================================================================================

// 🔑 LocalStorage İçinde Kullandığımız Standart Anahtarlar (Keys)
const STORAGE_KEYS = {
  CONFIG: 'parapusula_config',       // Gelir, sabit giderler, hedef birikim
  SPENDINGS: 'parapusula_spendings', // Gün gün harcamalar haritası
  SETTINGS: 'parapusula_settings',   // Bildirim saati vb. ayarlar
  DEBTS: 'parapusula_debts',         // Borçlar ve taksitler
  ONBOARDED: 'parapusula_onboarded'  // Kullanıcı ilk sihirbazı tamamladı mı?
};

// 📌 İlk kurulumda boş kalmasın diye sunulan şablon bütçe ayarları
export const DEFAULT_CONFIG = {
  monthlyIncome: 35000,
  fixedExpenses: [
    { id: '1', title: 'Ev Kirası / Aidat', amount: 15000 },
    { id: '2', title: 'Faturalar & Abonelikler', amount: 3000 },
    { id: '3', title: 'Ulaşım / Yakıt', amount: 2000 }
  ],
  targetSavings: 9000,
  includeDebtsInFixedExpenses: true, // Borç ödemelerini bütçeye otomatik bağlama
  currency: '₺'
};

// 📌 İlk kurulumda sunulan örnek borç kalemi
export const DEFAULT_DEBTS = [
  {
    id: '1',
    title: 'Telefon Taksiti',
    totalAmount: 12000,
    monthlyPayment: 2000,
    remainingMonths: 6,
    totalMonths: 6,
    dueDay: 15,
    isPaidThisMonth: false,
    note: 'Kredi kartı taksiti'
  }
];

// 📌 Varsayılan bildirim ve ses ayarları
export const DEFAULT_SETTINGS = {
  notificationEnabled: true,
  notificationTime: '23:00', // Her gece harcama hatırlatma saati
  soundEnabled: true,
  hapticEnabled: true,       // Dokunma titreşimi
  lastNotificationDate: null
};

// --------------------------------------------------------------------------------------
// 🧭 İLK KURULUM (ONBOARDING) KONTROLLERİ
// --------------------------------------------------------------------------------------
export function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  } catch (e) {
    return false;
  }
}

export function setOnboardingCompleted(completed = true) {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, completed ? 'true' : 'false');
  } catch (e) {}
}

// --------------------------------------------------------------------------------------
// ⚙️ BÜTÇE AYARLARINI (CONFIG) OKUMA VE YAZMA
// --------------------------------------------------------------------------------------
export function loadBudgetConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading config:', e);
    return DEFAULT_CONFIG;
  }
}

export function saveBudgetConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error saving config:', e);
    return false;
  }
}

// --------------------------------------------------------------------------------------
// 🛒 HARCAMA HARİTASINI (SPENDINGS) OKUMA VE YAZMA
// Format: { 'YYYY-MM-DD': [ { id, amount, time, note } ] }
// --------------------------------------------------------------------------------------
export function loadSpendings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPENDINGS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error loading spendings:', e);
    return {};
  }
}

export function saveSpendings(spendings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SPENDINGS, JSON.stringify(spendings));
    return true;
  } catch (e) {
    console.error('Error saving spendings:', e);
    return false;
  }
}

// --------------------------------------------------------------------------------------
// 💳 BORÇ VE TAKSİTLERİ (DEBTS) OKUMA VE YAZMA
// --------------------------------------------------------------------------------------
export function loadDebts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (!raw) return DEFAULT_DEBTS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading debts:', e);
    return DEFAULT_DEBTS;
  }
}

export function saveDebts(debts) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    return true;
  } catch (e) {
    console.error('Error saving debts:', e);
    return false;
  }
}

// --------------------------------------------------------------------------------------
// 🔔 KULLANICI AYARLARINI (SETTINGS) OKUMA VE YAZMA
// --------------------------------------------------------------------------------------
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Error saving settings:', e);
    return false;
  }
}

// --------------------------------------------------------------------------------------
// 📦 TÜM UYGULAMA VERİLERİNİ TEK BİR JSON DOSYASI OLARAK İNDİRME (YEDEK ALMA)
// --------------------------------------------------------------------------------------
export function exportAllData() {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    config: loadBudgetConfig(),
    debts: loadDebts(),
    spendings: loadSpendings(),
    settings: loadSettings(),
    onboarded: hasCompletedOnboarding()
  };

  // JSON verisinden indirilebilir bir dosya (Blob) oluşturuyoruz
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `ParaPusula_Yedek_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// --------------------------------------------------------------------------------------
// 📥 DIŞARIDAN BİR YEDEK DOSYASINI YÜKLEME (GERİ YÜKLEME)
// --------------------------------------------------------------------------------------
export function importAllData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.config) saveBudgetConfig(data.config);
    if (data.debts) saveDebts(data.debts);
    if (data.spendings) saveSpendings(data.spendings);
    if (data.settings) saveSettings(data.settings);
    if (data.onboarded !== undefined) setOnboardingCompleted(data.onboarded);
    return { success: true };
  } catch (e) {
    console.error('Failed to import backup:', e);
    return { success: false, error: e.message };
  }
}
