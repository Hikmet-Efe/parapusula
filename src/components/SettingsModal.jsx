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
  Compass
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
    handleImport 
  } = useBudget();

  const [notificationTime, setNotificationTime] = useState(settings.notificationTime || '23:00');
  const [notificationEnabled, setNotificationEnabled] = useState(settings.notificationEnabled ?? true);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    updateSettings({
      ...settings,
      notificationTime,
      notificationEnabled
    });
    onClose();
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
              Sunucuya ihtiyaç duymadan verilerinizi telefonunuza veya bilgisayarınıza aktarmak için JSON yedeği alabilirsiniz.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Yedek İndir (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Yedek Yükle</span>
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

          {/* Platform Guide */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 sm:p-4 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Mobilde (Telefonda) Nasıl Kullanılır?</span>
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Telefonunuzun tarayıcısından linki açıp <strong>"Ana Ekrana Ekle" (Uygulama Olarak Yükle)</strong> butonuna bastığınızda, cihazınıza bağımsız bir mobil uygulama gibi kurulur ve çevrimdışı çalışır.
            </p>
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
