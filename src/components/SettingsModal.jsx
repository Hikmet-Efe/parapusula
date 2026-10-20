import React, { useState, useRef } from 'react';
import { 
  X, 
  Bell, 
  Download, 
  Upload, 
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
    { id: 'ocean', name: '🌊 Okyanus Safir', color: 'bg-sky-500' },
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
        message: 'Yedek kodu kopyalandı! Notlar\'a yapıştırıp saklayabilirsiniz.'
      });
    } catch (err) {
      setPasteText(code);
      setShowPasteBox(true);
      setImportStatus({
        type: 'success',
        message: 'Yedek kodunuz aşağıdaki kutuda hazır.'
      });
    }
  };

  // 📥 YAPIŞTIRILAN YEDEK KODUNU İÇERİ AKTARMA
  const handlePasteImport = () => {
    if (!pasteText.trim()) return;
    const result = handleImport(pasteText.trim());
    if (result.success) {
      setImportStatus({ type: 'success', message: 'Veriler koddan başarıyla yüklendi!' });
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 overflow-hidden overscroll-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SABİT ÜST BAŞLIK (Asla kaymaz ve kararmaz) */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3.5 bg-slate-900 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Bell className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Uygulama Ayarları</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
              Bildirim, Tema & Veri Yönetimi
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* İÇERİK GÖVDESİ (Kompakt, tek ekrana sığan sabit yapı) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-3.5 space-y-2.5">
          
          {/* 1. Başlangıç Rehberi */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">Başlangıç Rehberi (Kurulum)</span>
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                Bütçe adımlarını baştan kurmak için açın.
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

          {/* 2. Bildirim Ayarları */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Gece Harcama Bildirimi</span>
                <span className="text-[11px] text-slate-500">Her gece harcama hatırlatıcısı gönderir.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  checked={notificationEnabled}
                  onChange={(e) => setNotificationEnabled(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Saat:</span>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {permissionState !== 'granted' ? (
                  <button
                    type="button"
                    onClick={enableNotifications}
                    className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-xl text-[11px] cursor-pointer"
                  >
                    İzin Ver
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Aktif
                  </span>
                )}

                <button
                  type="button"
                  onClick={sendTestNotification}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Görsel Arayüz Tema Şablonları (4 Adet) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Arayüz Tema Şablonları</span>
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {themeTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleThemeSelect(tpl.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                    selectedTheme === tpl.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${tpl.color}`} />
                  <span className="truncate">{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Veri Yedekleme & Aktarım */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Veri Yedekleme & Aktarım</span>
            </h4>

            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <button
                type="button"
                onClick={handleCopyBackupCode}
                className="py-2 px-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">Kodu Kopyala</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPasteBox(!showPasteBox)}
                className="py-2 px-2.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">Kodu Yapıştır</span>
              </button>
            </div>

            {showPasteBox && (
              <div className="mb-2 p-2 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5">
                <textarea
                  rows={2}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Yedek kodunu buraya yapıştırın..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-200 font-mono outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handlePasteImport}
                  className="w-full py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Kodu Uygula ve Yükle
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handleExport}
                className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3 text-blue-400" />
                <span>Dosya İndir</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3 h-3 text-emerald-400" />
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
              <div className={`mt-2 p-2 rounded-xl text-[11px] flex items-center gap-1.5 ${
                importStatus.type === 'success' 
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20' 
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/20'
              }`}>
                {importStatus.type === 'success' ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* SABİT ALT KAYDET BUTONU (Asla kaymaz) */}
        <div className="flex-shrink-0 p-3.5 bg-slate-900 border-t border-slate-800">
          <button
            onClick={handleSaveSettings}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
