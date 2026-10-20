import React, { useState, useRef } from 'react';
import { 
  X, 
  Bell, 
  Download, 
  Upload, 
  Smartphone, 
  Volume2, 
  Check, 
  AlertCircle,
  ShieldCheck,
  Compass,
  Copy,
  ClipboardPaste
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export default function SettingsModal({ isOpen, onClose, onOpenOnboarding }) {
  const { 
    settings, 
    updateSettings, 
    permissionState, 
    enableNotifications, 
    sendTestNotification,
    handleExport,
    getBackupCode,
    handleImport 
  } = useBudget();

  const [notificationTime, setNotificationTime] = useState(settings.notificationTime || '23:00');
  const [notificationEnabled, setNotificationEnabled] = useState(settings.notificationEnabled ?? true);
  const [selectedTheme, setSelectedTheme] = useState(settings.theme || 'emerald');
  const [importStatus, setImportStatus] = useState(null);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const themeTemplates = [
    { id: 'emerald', name: '🌲 Zümrüt Pusula', color: 'bg-emerald-500' },
    { id: 'ocean', name: '🌊 Okyanus Safir', color: 'bg-cyan-500' },
    { id: 'gold', name: '👑 Altın Kehribar', color: 'bg-amber-500' },
    { id: 'purple', name: '🔮 Siber Mor', color: 'bg-purple-500' }
  ];

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    updateSettings({
      ...settings,
      notificationTime,
      notificationEnabled,
      theme: themeId
    });
  };

  const handleSaveSettings = () => {
    updateSettings({
      ...settings,
      notificationTime,
      notificationEnabled,
      theme: selectedTheme
    });
    onClose();
  };

  // 📋 MOBİL APK İÇİN TEK TIKLA YEDEK KODUNU PANOYA KOPYALAMA
  const handleCopyBackupCode = async () => {
    const code = getBackupCode();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const tempArea = document.createElement('textarea');
        tempArea.value = code;
        document.body.appendChild(tempArea);
        tempArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempArea);
      }
      setImportStatus({
        type: 'success',
        message: 'Yedek kodu panoya kopyalandı! Notlar veya WhatsApp\'a yapıştırıp saklayabilirsiniz.'
      });
    } catch (err) {
      setPasteText(code);
      setShowPasteBox(true);
      setImportStatus({
        type: 'success',
        message: 'Yedek kodunuz aşağıdaki kutuda hazır, kopyalayabilirsiniz.'
      });
    }
  };

  // 📥 YAPIŞTIRILAN YEDEK KODUNU İÇERİ AKTARMA
  const handlePasteImport = () => {
    if (!pasteText.trim()) return;
    const result = handleImport(pasteText.trim());
    if (result.success) {
      setImportStatus({ type: 'success', message: 'Veriler koddan başarıyla geri yüklendi!' });
      setShowPasteBox(false);
      setPasteText('');
    } else {
      setImportStatus({ type: 'error', message: 'Hatalı yedek kodu formatı.' });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = handleImport(content);
        if (result.success) {
          setImportStatus({ type: 'success', message: 'Veriler başarıyla içe aktarıldı!' });
        } else {
          setImportStatus({ type: 'error', message: 'Hatalı dosya formatı.' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 relative my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Bell className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Uygulama Ayarları</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Bildirim & Veri Yönetimi
        </h2>

        <div className="mt-4 space-y-4">
          {/* Onboarding Wizard Reopen Button */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Başlangıç Rehberi (Start-up)</span>
              </span>
              <span className="text-[11px] text-slate-500">
                İlk kurulum adımlarını baştan tamamlamak için açın.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="py-1.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 transition flex-shrink-0 cursor-pointer"
            >
              Rehberi Aç
            </button>
          </div>

          {/* Notification Section */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Gece Harcama Bildirimi</span>
            </h4>

            {/* Toggle */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Günlük Hatırlatıcı</span>
                <span className="text-[11px] text-slate-500">Her gece harcamanızı girmeniz için bildirim gönderir.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationEnabled}
                  onChange={(e) => setNotificationEnabled(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Time Picker */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300">Bildirim Saati</span>
              <input
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Test Button & Permission */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              {permissionState !== 'granted' ? (
                <button
                  type="button"
                  onClick={enableNotifications}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Tarayıcı Bildirim İzni Ver
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Bildirim İzni Aktif
                </span>
              )}

              <button
                type="button"
                onClick={sendTestNotification}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Et</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore (Zero-server sync) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Veri Yedekleme & Aktarım</span>
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Telefonda en hızlı yedekleme için <strong>Yedek Kodunu Kopyala</strong> butonuna basıp Notlar'a kaydedebilir, istediğiniz zaman geri yapıştırabilirsiniz.
            </p>

            {/* Mobil APK dostu Tek Tıkla Kopyala / Yapıştır Butonları */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={handleCopyBackupCode}
                className="flex-1 py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Yedek Kodunu Kopyala</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPasteBox(!showPasteBox)}
                className="flex-1 py-2.5 px-3 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-blue-400" />
                <span>Yedek Kodu Yapıştır</span>
              </button>
            </div>

            {showPasteBox && (
              <div className="mb-3 p-2.5 bg-slate-900 border border-slate-700 rounded-xl space-y-2 animate-fadeIn">
                <textarea
                  rows={3}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder='{"version":"2.2","config":...} yedek kodunu buraya yapıştırın'
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-200 font-mono outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handlePasteImport}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Kodu Uygula ve Verileri Yükle
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Dosya İndir (PC)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dosya Seç</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {importStatus && (
              <div className={`mt-2.5 p-2 rounded-xl text-xs flex items-center gap-1.5 ${
                importStatus.type === 'success' 
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20' 
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/20'
              }`}>
                {importStatus.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* Görsel Arayüz Tema Şablonları (4 Adet) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Arayüz Tema Şablonları</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {themeTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleThemeSelect(tpl.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                    selectedTheme === tpl.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${tpl.color}`} />
                  <span>{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSaveSettings}
          className="w-full mt-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Ayarları Kaydet</span>
        </button>
      </div>
    </div>
  );
}
