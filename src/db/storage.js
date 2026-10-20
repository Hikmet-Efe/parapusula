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

// 📌 Mevcut kullandığım bütçe ayarlarım ve hazır bütçe şablonlarım (Templates)
export const BUDGET_TEMPLATES = [
  {
    id: 'kisisel',
    name: '🧭 Kişisel Planım (10.100 ₺)',
    description: 'Saf serbest harçlık odaklı, günlük ~326 ₺ devirli plan',
    monthlyIncome: 10100,
    targetSavings: 0,
    fixedExpenses: []
  },
  {
    id: 'ogrenci',
    name: '🎓 Öğrenci & Harçlık',
    description: 'Burs/harçlık, yurt-ev gideri ve cep harçlığı dengesi',
    monthlyIncome: 15000,
    targetSavings: 2000,
    fixedExpenses: [
      { id: 't1', title: 'Yurt / Ev Payı', amount: 3500 },
      { id: 't2', title: 'Telefon & Abonelikler', amount: 500 }
    ]
  },
  {
    id: 'calisan',
    name: '💼 Çalışan / Bekar',
    description: 'Standart maaş, kira, faturalar ve %20 dokunulmaz birikim',
    monthlyIncome: 38000,
    targetSavings: 8000,
    fixedExpenses: [
      { id: 't3', title: 'Ev Kirası / Aidat', amount: 15000 },
      { id: 't4', title: 'Faturalar & İnternet', amount: 2500 },
      { id: 't5', title: 'Ulaşım / Yakıt', amount: 2500 }
    ]
  },
  {
    id: 'tasarruf',
    name: '🔥 Sıkı Tasarruf (Maksimum Birikim)',
    description: 'Gelirin yüksek kısmını dokunulmaz kumbaraya ayıran disiplin modu',
    monthlyIncome: 45000,
    targetSavings: 18000,
    fixedExpenses: [
      { id: 't6', title: 'Zorunlu Konut & Fatura', amount: 15000 }
    ]
  }
];

export const DEFAULT_CONFIG = {
  monthlyIncome: 10100,
  fixedExpenses: [],
  targetSavings: 0,
  includeDebtsInFixedExpenses: false,
  currency: '₺'
};

// 📌 Varsayılan borç listesi
export const DEFAULT_DEBTS = [];

// 📌 Mevcut Ekim 2026 harcama geçmişim (Yeni kurulumda veri kaybı olmaması için hazır yüklü)
export const DEFAULT_SPENDINGS = {
  '2026-10-02': [{ id: 'd2', amount: 1720, time: '21:00', note: 'Harcama' }],
  '2026-10-03': [{ id: 'd3', amount: 290, time: '21:00', note: 'Harcama' }],
  '2026-10-04': [{ id: 'd4', amount: 752, time: '21:00', note: 'Harcama' }],
  '2026-10-05': [{ id: 'd5', amount: 92, time: '21:00', note: 'Harcama' }],
  '2026-10-06': [{ id: 'd6', amount: 1660, time: '21:00', note: 'Harcama' }],
  '2026-10-07': [{ id: 'd7', amount: 500, time: '21:00', note: 'Harcama' }],
  '2026-10-08': [{ id: 'd8', amount: 10, time: '21:00', note: 'Harcama' }],
  '2026-10-09': [{ id: 'd9', amount: 700, time: '21:00', note: 'Harcama' }],
  '2026-10-10': [{ id: 'd10', amount: 10, time: '21:00', note: 'Harcama' }],
  '2026-10-11': [{ id: 'd11', amount: 730, time: '21:00', note: 'Harcama' }],
  '2026-10-12': [{ id: 'd12', amount: 220, time: '21:00', note: 'Harcama' }],
  '2026-10-14': [{ id: 'd14', amount: 370, time: '21:00', note: 'Harcama' }],
  '2026-10-15': [{ id: 'd15', amount: 50, time: '21:00', note: 'Harcama' }],
  '2026-10-16': [{ id: 'd16', amount: 42, time: '21:00', note: 'Harcama' }],
  '2026-10-17': [{ id: 'd17', amount: 332, time: '21:00', note: 'Harcama' }],
  '2026-10-18': [{ id: 'd18', amount: 40, time: '21:00', note: 'Harcama' }]
};

// 📌 Varsayılan bildirim, ses ve görsel tema şablonu ayarlarım
export const DEFAULT_SETTINGS = {
  notificationEnabled: true,
  notificationTime: '23:00', // Her gece harcama hatırlatma saatim
  soundEnabled: true,
  hapticEnabled: true,       // Dokunma titreşimi
  theme: 'emerald',          // Görsel tema şablonu: emerald | ocean | gold | purple
  lastNotificationDate: null
};

// --------------------------------------------------------------------------------------
// 🧭 İLK KURULUM (ONBOARDING) KONTROLLERİM
// --------------------------------------------------------------------------------------
export function hasCompletedOnboarding() {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.ONBOARDED);
    if (val === null) return true; // Mevcut verilerim hazır yüklü olduğu için direkt ana ekran açılsın
    return val === 'true';
  } catch (e) {
    return true;
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
    return raw ? JSON.parse(raw) : DEFAULT_SPENDINGS;
  } catch (e) {
    console.error('Harcamalar yüklenirken hata:', e);
    return DEFAULT_SPENDINGS;
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
// 📦 TÜM VERİLERİMİ TEK BİR JSON METNİ VEYA DOSYASI OLARAK YEDEKLEME (EXPORT)
// --------------------------------------------------------------------------------------
// Mobil APK içinde WebView bazen dosya indirmeyi (Blob download) engellediği için,
// hem direkt metin/kod olarak kopyalanabilen hem de dosya olarak indirilebilen
// iki aşamalı bir yedekleme sistemi kurdum.
export function getBackupJsonString() {
  const data = {
    version: '2.2',
    exportDate: new Date().toISOString(),
    config: loadBudgetConfig(),
    debts: loadDebts(),
    spendings: loadSpendings(),
    settings: loadSettings(),
    onboarded: hasCompletedOnboarding()
  };
  return JSON.stringify(data);
}

export function exportAllData() {
  const jsonStr = getBackupJsonString();
  const data = JSON.parse(jsonStr);

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
