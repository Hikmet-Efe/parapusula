// ======================================================================================
// 💾 STORAGE ENGINE - ÇEVRİMDIŞI YEREL VERİTABANI MOTORUM (LOCALSTORAGE)
// ======================================================================================
// BURADA NE YAPMAYA ÇALIŞTIM?
// ParaPusula'yı sıfır sunucu (serverless) ve %100 çevrimdışı (offline-first) olacak şekilde tasarladım.
// Maaşım, borçlarım veya harcamalarım asla internetteki yabancı bir sunucuya gitmiyor.
// Tamamen telefonumun kendi güvenli web hafızasında (HTML5 LocalStorage) JSON formatında saklanıyor.
// Bu dosya ile tüm okuma, yazma, yedek alma (export) ve geri yükleme (import) işlerimi yönetiyorum.
// ======================================================================================

// 🔑 LocalStorage İçinde Kullandığım Standart Anahtarlarım (Keys)
const STORAGE_KEYS = {
  CONFIG: 'parapusula_config',       // Gelirim, sabit giderlerim, hedef birikimim
  SPENDINGS: 'parapusula_spendings', // Gün gün girdiğim harcamaların haritası
  SETTINGS: 'parapusula_settings',   // Bildirim saatim vb. tercihlerim
  DEBTS: 'parapusula_debts',         // Borçlarım ve taksitlerim
  ONBOARDED: 'parapusula_onboarded'  // İlk kurulum sihirbazını bitirdim mi?
};

// 📌 İlk kurulumda boş kalmasın diye sunduğum şablon bütçe ayarlarım
export const DEFAULT_CONFIG = {
  monthlyIncome: 35000,
  fixedExpenses: [
    { id: '1', title: 'Ev Kirası / Aidat', amount: 15000 },
    { id: '2', title: 'Faturalar & Abonelikler', amount: 3000 },
    { id: '3', title: 'Ulaşım / Yakıt', amount: 2000 }
  ],
  targetSavings: 9000,
  includeDebtsInFixedExpenses: true, // Borç ödemelerimi bütçeye otomatik bağlama
  currency: '₺'
};

// 📌 İlk kurulumda sunduğum örnek taksit kalemi
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

// 📌 Varsayılan bildirim ve ses ayarlarım
export const DEFAULT_SETTINGS = {
  notificationEnabled: true,
  notificationTime: '23:00', // Her gece harcama hatırlatma saatim
  soundEnabled: true,
  hapticEnabled: true,       // Dokunma titreşimi
  lastNotificationDate: null
};

// --------------------------------------------------------------------------------------
// 🧭 İLK KURULUM (ONBOARDING) KONTROLLERİM
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
// ⚙️ BÜTÇE AYARLARIMI (CONFIG) OKUMA VE YAZMA
// --------------------------------------------------------------------------------------
export function loadBudgetConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Bütçe ayarları yüklenirken hata:', e);
    return DEFAULT_CONFIG;
  }
}

export function saveBudgetConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Bütçe ayarları kaydedilirken hata:', e);
    return false;
  }
}

// --------------------------------------------------------------------------------------
// 🛒 HARCAMA HARİTAMI (SPENDINGS) OKUMA VE YAZMA
// Format: { 'YYYY-MM-DD': [ { id, amount, time, note } ] }
// --------------------------------------------------------------------------------------
export function loadSpendings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPENDINGS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Harcamalar yüklenirken hata:', e);
    return {};
  }
}

export function saveSpendings(spendings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SPENDINGS, JSON.stringify(spendings));
    return true;
  } catch (e) {
    console.error('Harcamalar kaydedilirken hata:', e);
    return false;
  }
}

// --------------------------------------------------------------------------------------
// 💳 BORÇ VE TAKSİTLERİMİ (DEBTS) OKUMA VE YAZMA
// --------------------------------------------------------------------------------------
export function loadDebts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (!raw) return DEFAULT_DEBTS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Borçlar yüklenirken hata:', e);
    return DEFAULT_DEBTS;
  }
}

export function saveDebts(debts) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    return true;
  } catch (e) {
    console.error('Borçlar kaydedilirken hata:', e);
    return false;
  }
}

// --------------------------------------------------------------------------------------
// 🔔 AYARLARIMI (SETTINGS) OKUMA VE YAZMA
// --------------------------------------------------------------------------------------
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Ayarlar yüklenirken hata:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Ayarlar kaydedilirken hata:', e);
    return false;
  }
}

// --------------------------------------------------------------------------------------
// 📦 TÜM VERİLERİMİ TEK BİR JSON DOSYASI OLARAK YEDEKLEME (EXPORT)
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

  // İndirilebilir JSON dosyası üretiyorum
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
// 📥 DIŞARIDAN YEDEK DOSYASINI YÜKLEME (IMPORT)
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
    console.error('Yedek yükleme başarısız oldu:', e);
    return { success: false, error: e.message };
  }
}
