// Hybrid Notification and Haptic Feedback Engine for ParaPusula
// Seamlessly operates in both Web/PWA and Native Android (Capacitor)

let CapacitorLocalNotifications = null;
let CapacitorHaptics = null;

// Dynamically load Capacitor plugins safely if installed and available
(async () => {
  try {
    const localNotifModule = await import('@capacitor/local-notifications');
    CapacitorLocalNotifications = localNotifModule.LocalNotifications;
  } catch (e) {
    // In web mode, falls back gracefully
  }

  try {
    const hapticsModule = await import('@capacitor/haptics');
    CapacitorHaptics = hapticsModule.Haptics;
  } catch (e) {
    // In web mode, falls back gracefully
  }
})();

/**
 * Trigger subtle tactile vibration (Haptic Feedback) on button tap / expense input
 */
export async function triggerHaptic(type = 'light') {
  try {
    if (CapacitorHaptics) {
      const { ImpactStyle } = await import('@capacitor/haptics');
      const style = type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
      await CapacitorHaptics.impact({ style });
      return;
    }
  } catch (e) {
    // fallback
  }

  // Web fallback
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(type === 'medium' ? 40 : 25);
    } catch (e) {}
  }
}

/**
 * Play a gentle audio chime using Web Audio API (Zero external mp3 needed)
 */
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(523.25, 0, 0.4); // C5
    playTone(659.25, 0.15, 0.6); // E5
    playTone(783.99, 0.3, 0.8); // G5
  } catch (e) {
    console.warn('Audio chime could not play:', e);
  }
}

/**
 * Checks if Notification is supported
 */
export function isNotificationSupported() {
  return typeof window !== 'undefined' && ('Notification' in window || !!CapacitorLocalNotifications);
}

/**
 * Get current notification permission state
 */
export function getNotificationPermission() {
  if (typeof window === 'undefined') return 'unsupported';
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'default';
}

/**
 * Request permission from user
 */
export async function requestNotificationPermission() {
  if (CapacitorLocalNotifications) {
    try {
      const res = await CapacitorLocalNotifications.requestPermissions();
      return res.display === 'granted';
    } catch (e) {
      console.warn('Capacitor notification permission error:', e);
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }
  return false;
}

/**
 * Show a local notification via Capacitor or Web Notification
 */
export async function triggerNotification(title, body) {
  playNotificationChime();
  triggerHaptic('medium');

  // Try Native Capacitor LocalNotification first
  if (CapacitorLocalNotifications) {
    try {
      await CapacitorLocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 100000),
            title,
            body,
            schedule: { at: new Date(Date.now() + 500) },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_compass'
          }
        ]
      });
      return true;
    } catch (e) {
      console.warn('Capacitor schedule fallback to web:', e);
    }
  }

  // Web Notification fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const options = {
      body,
      icon: '/compass.svg',
      badge: '/compass.svg',
      tag: 'parapusula-daily-reminder',
      renotify: true,
      vibrate: [200, 100, 200]
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRIGGER_NOTIFICATION',
        title,
        options
      });
      return true;
    } else {
      try {
        new Notification(title, options);
        return true;
      } catch (e) {
        console.warn('Fallback Notification failed:', e);
        return false;
      }
    }
  }

  return false;
}

/**
 * Sets up background interval to check current time every 25 seconds
 * Fires at configured time (default 23:00) once per day
 */
export function startNotificationScheduler(settings, todayRemainingBalance, onNotified) {
  if (!settings.notificationEnabled) return () => {};

  const intervalId = setInterval(() => {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    const targetTime = settings.notificationTime || '23:00';
    const todayStr = now.toISOString().split('T')[0];

    // If time matches and haven't notified today
    if (currentTimeStr === targetTime && settings.lastNotificationDate !== todayStr) {
      const balanceStr = typeof todayRemainingBalance === 'number' ? `Bugünkü kalan bakiyen: ₺${Math.round(todayRemainingBalance)}.` : '';
      triggerNotification(
        '🧭 ParaPusula: Günlük Harcamanı Gir',
        `Günü kapatmadan önce bugünkü harcamalarını kaydetmeyi unutma! ${balanceStr}`
      );

      if (onNotified) {
        onNotified(todayStr);
      }
    }
  }, 25000);

  return () => clearInterval(intervalId);
}
