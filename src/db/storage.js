// LocalStorage database engine for ParaPusula
// Zero-server, 100% offline, persistent storage

const STORAGE_KEYS = {
  CONFIG: 'parapusula_config',
  SPENDINGS: 'parapusula_spendings',
  SETTINGS: 'parapusula_settings',
  DEBTS: 'parapusula_debts'
};

// Default initial budget configuration
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

// Default sample debts
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

// Default app settings
export const DEFAULT_SETTINGS = {
  notificationEnabled: true,
  notificationTime: '23:00',
  soundEnabled: true,
  hapticEnabled: true,
  lastNotificationDate: null
};

// Read Config
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

// Save Config
export function saveBudgetConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error saving config:', e);
    return false;
  }
}

// Read All Spendings Map { 'YYYY-MM-DD': [ { id, amount, time, note } ] }
export function loadSpendings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPENDINGS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error loading spendings:', e);
    return {};
  }
}

// Save All Spendings Map
export function saveSpendings(spendings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SPENDINGS, JSON.stringify(spendings));
    return true;
  } catch (e) {
    console.error('Error saving spendings:', e);
    return false;
  }
}

// Read Debts
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

// Save Debts
export function saveDebts(debts) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    return true;
  } catch (e) {
    console.error('Error saving debts:', e);
    return false;
  }
}

// Read Settings
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

// Save Settings
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Error saving settings:', e);
    return false;
  }
}

// Export Complete Data as JSON
export function exportAllData() {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    config: loadBudgetConfig(),
    debts: loadDebts(),
    spendings: loadSpendings(),
    settings: loadSettings()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `ParaPusula_Yedek_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import Complete Data from JSON
export function importAllData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.config) saveBudgetConfig(data.config);
    if (data.debts) saveDebts(data.debts);
    if (data.spendings) saveSpendings(data.spendings);
    if (data.settings) saveSettings(data.settings);
    return { success: true };
  } catch (e) {
    console.error('Failed to import backup:', e);
    return { success: false, error: e.message };
  }
}
