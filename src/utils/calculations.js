// ======================================================================================
// 🧭 PARAPUSULA - FİNANSAL VE DİNAMİK DEVİR HESAPLAMA MOTORU
// ======================================================================================
// Bu dosya uygulamanın beynidir.
// Buradaki temel felsefemiz:
// 1. Ayın başında belirlenen harçlık asla sabit kalmaz, harcamaya göre yarına devredilir.
// 2. Birikim hedefine ve zorunlu sabit giderlere (kira, fatura, borç) asla dokunulmaz.
// 3. Kullanıcı ay ortasında (örneğin ayın 30'unda veya 15'inde) başlarsa, geçmiş günlerin
//    parası bugüne devredilmez; bütçe o günden itibaren paylaştırılır.
// ======================================================================================

/**
 * 🧹 SAYI TEMİZLEME VE PARSE ETME FONKSİYONU
 * --------------------------------------------------------------------------------------
 * NE YAPMAYA ÇALIŞIYORUZ?
 * Kullanıcı mobilde sayı yazarken bazen "25000", bazen "25.000", bazen de "25,000" yazar.
 * Normalde JavaScript'in parseFloat("25.000") fonksiyonu bunu "25" olarak algılar ve
 * kullanıcının 25 bin liralık maaşını 25 TL yaparak sistemi bozar.
 * Bu fonksiyon, Türkçe binlik ayraçlarını (nokta ve virgül) akıllıca temizleyerek
 * her zaman doğru tam sayıyı elde etmemizi sağlar.
 */
export function parseCleanNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  
  // Boşlukları ve TL simgesini temizle
  let str = String(val).trim().replace(/\s/g, '').replace('₺', '');
  
  // Eğer kullanıcı "20.000" veya "20,000" gibi 3 basamaklı binlik formatı girdiyse:
  if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    str = str.replace(/\./g, ''); // Noktaları kaldır
  } else if (/^\d{1,3}(,\d{3})+$/.test(str)) {
    str = str.replace(/,/g, ''); // Virgülleri kaldır
  } else {
    // Normal küsurat virgülünü ondalık noktaya çevir
    str = str.replace(',', '.');
  }
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 📅 AYDAKİ GÜN SAYISINI BULMA
 * --------------------------------------------------------------------------------------
 * Yıl ve aya göre o ayın kaç gün çektiğini bulur (Örn: Şubat 28-29, Eylül 30, Ekim 31).
 * JavaScript'te new Date(year, month, 0) o ayın son gününü verir.
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * 🗓️ TARİHİ 'YYYY-AA-GG' FORMATINA ÇEVİRME
 * --------------------------------------------------------------------------------------
 * Harcamaları veritabanında (LocalStorage) gün bazında saklayabilmek için
 * standart bir anahtar (key) üretir (Örn: '2026-09-30').
 */
export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 💰 TÜRK LİRASI FORMATLAYICI
 * --------------------------------------------------------------------------------------
 * Sayıları ekranda kullanıcının gözüne hoş gelecek şekilde formatlar.
 * Örn: 15400 sayısını -> "15.400 ₺" haline getirir.
 */
export function formatCurrency(amount, currency = '₺') {
  if (isNaN(amount) || amount === null || amount === undefined) amount = 0;
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `${formatted} ${currency}`;
}

/**
 * 🧾 ZORUNLU SABİT GİDERLERİ TOPLAMA
 * --------------------------------------------------------------------------------------
 * Kira, faturalar, aidat gibi kullanıcının listelediği tüm sabit giderlerin toplamını alır.
 */
export function calculateTotalFixed(fixedExpenses = []) {
  return fixedExpenses.reduce((sum, item) => sum + (parseCleanNumber(item.amount) || 0), 0);
}

/**
 * 🛒 BELİRLİ BİR GÜNDE YAPILAN TOPLAM HARCAMAYI GETİRME
 * --------------------------------------------------------------------------------------
 * O gün yapılmış 1 veya birden fazla harcama kaydı varsa hepsini toplar.
 */
export function getDaySpendingTotal(spendingsMap, dateKey) {
  const dayEntries = spendingsMap[dateKey];
  if (!dayEntries) return 0;
  if (Array.isArray(dayEntries)) {
    return dayEntries.reduce((sum, item) => sum + (parseCleanNumber(item.amount) || 0), 0);
  }
  return parseCleanNumber(dayEntries) || 0;
}

/**
 * 🧭 ANA BÜTÇE VE DİNAMİK DEVİR MOTORU (HAYATİ ÖNEMDEKİ FONKSİYON)
 * ======================================================================================
 * NE YAPMAYA ÇALIŞIYORUZ?
 * Bu fonksiyon her render'da tüm ayı simüle eder:
 * 1. Gelir - Sabit Giderler - Hedef Birikim = NET SERBEST BÜTÇE (Dokunulabilir Para)
 * 2. Net Serbest Bütçe / Ayın Gün Sayısı = GÜNLÜK TABAN HARÇLIK
 * 3. Eğer kullanıcı ayın ortasında (örn. 30'unda) ilk defa başladıysa:
 *    - Ayın 1'inden 29'una kadar olan günleri "pasif/geçmiş" sayar.
 *    - Böylece 29 günlük para sahte bir şekilde bugüne birikmez!
 *    - Bugün için yalnızca 1 günlük harçlığı (örn: 500 TL) verir.
 * 4. Devir Kuralı:
 *    - Bugün harçlığından az harcarsan -> Kalan para yarının başlangıç bakiyesine eklenir!
 *    - Bugün harçlığını aşarsan -> Fazla harcanan tutar yarının harçlığından düşülür!
 *    - Böylece ay sonundaki Hedef Birikim asla delinmez!
 * ======================================================================================
 */
export function calculateMonthBudget(config, spendingsMap, year, month) {
  // 1. Ayın toplam gün sayısını öğren (Eylül için 30, Ekim için 31)
  const totalDays = getDaysInMonth(year, month);
  
  // 2. Temel finansal değerleri temizleyerek al
  const income = parseCleanNumber(config.monthlyIncome) || 0;
  const totalFixed = calculateTotalFixed(config.fixedExpenses);
  const targetSavings = parseCleanNumber(config.targetSavings) || 0;

  // 3. Kullanıcının harcamakta tamamen özgür olduğu net tutar:
  // FORMÜL: Net Serbest Bütçe = Gelir - Zorunlu Giderler - Birikim Hedefi
  const freeBudget = Math.max(0, income - totalFixed - targetSavings);

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const currentDayNumber = isCurrentMonth ? now.getDate() : (now > new Date(year, month - 1, 1) ? totalDays : 1);

  // 4. Günlük Standart Harçlık Oranı (Örn: 15.000 TL / 30 gün = 500 TL / gün)
  const standardDailyAllowance = totalDays > 0 ? freeBudget / totalDays : 0;

  // 5. Ay Ortası Başlangıç Kontrolü:
  // Eğer kullanıcı uygulamaya ayın başında değil de örneğin ayın 15'i veya 30'unda başladıysa,
  // başlangıç gününü tespit ediyoruz.
  let effectiveStartDay = 1;
  const isStartMonth = config.startYear === year && config.startMonth === month;
  if (isStartMonth && config.startDay && config.startDay > 1) {
    effectiveStartDay = Math.min(config.startDay, totalDays);
  }

  // Başlangıç gününden ay sonuna kadar kalan aktif gün sayısı
  const activeDaysCount = Math.max(1, totalDays - effectiveStartDay + 1);

  // Taban günlük harçlık
  const baseDailyAllowance = standardDailyAllowance;

  // 6. Günden Güne Simülasyon (1. günden ayın son gününe kadar tek tek hesaplama)
  const days = [];
  let cumulativeSpent = 0;
  let cumulativeAllowance = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const daySpent = getDaySpendingTotal(spendingsMap, dateKey);
    const isBeforeStart = d < effectiveStartDay;

    let startingBalance = 0;
    let remainingBalance = 0;
    let dailyDiff = 0;

    if (isBeforeStart) {
      // ⚠️ DİKKAT: Kullanıcı uygulamayı indirmeden önceki geçmiş günlerde bakiye birikmez!
      // Burası sayesinde ayın 30'unda uygulamayı açan adama 30 günlük bakiye yığılmaz.
      startingBalance = 0;
      remainingBalance = 0;
      dailyDiff = 0;
    } else {
      // ✅ Aktif Günler (Başlangıç gününden itibaren):
      const activeDayIndex = d - effectiveStartDay + 1; // Başlangıç gününde 1 olur!
      cumulativeAllowance += baseDailyAllowance;

      // FORMÜL: O günkü Başlangıç Bakiyesi = (O güne kadar hak edilen toplam harçlık) - (O güne kadar yapılan harcamalar)
      // İlk günde: (1 * 500 TL) - 0 TL = 500 TL olur.
      // Dünden para kalmışsa otomatik olarak bugünün bakiyesine eklenmiş olur.
      startingBalance = (activeDayIndex * baseDailyAllowance) - cumulativeSpent;
      remainingBalance = startingBalance - daySpent; // Gün sonu kalan para
      dailyDiff = baseDailyAllowance - daySpent;    // O günkü tasarruf veya aşım

      cumulativeSpent += daySpent;
    }

    days.push({
      dayNumber: d,
      dateKey,
      dayDate: new Date(year, month - 1, d),
      baseAllowance: isBeforeStart ? 0 : baseDailyAllowance,
      startingBalance,
      spent: daySpent,
      remainingBalance,
      dailyDiff,
      isBeforeStart,
      isToday: isCurrentMonth && d === currentDayNumber,
      isPast: d < currentDayNumber,
      isFuture: d > currentDayNumber
    });
  }

  // 7. Bugünün anlık verilerini seç
  const todayIndex = Math.min(Math.max(0, currentDayNumber - 1), totalDays - 1);
  const todayData = days[todayIndex] || days[0];

  // 8. Ayın genel istatistikleri
  const activeDaysSoFar = Math.max(1, currentDayNumber - effectiveStartDay + 1);
  const spentSoFar = days.slice(effectiveStartDay - 1, currentDayNumber).reduce((sum, d) => sum + d.spent, 0);
  const allowanceSoFar = activeDaysSoFar * baseDailyAllowance;
  const netSurplusSoFar = allowanceSoFar - spentSoFar;

  // Kalan günlerin ve kalan paranın analizi
  const remainingDays = Math.max(0, totalDays - currentDayNumber);
  const remainingMonthBudget = (activeDaysCount * baseDailyAllowance) - spentSoFar;
  const dynamicRemainingDaily = (remainingDays + 1) > 0 ? Math.max(0, remainingMonthBudget / (remainingDays + 1)) : 0;

  // 9. Bütçe Sağlık Durumu (Görsel uyarı rengi için: Yeşil, Sarı, Kırmızı)
  let health = 'great';
  if (todayData.remainingBalance < 0) {
    health = 'danger'; // Bütçe aşıldı!
  } else if (todayData.remainingBalance < baseDailyAllowance * 0.4) {
    health = 'warning'; // Limit tükenmek üzere (%40'ın altına indi)
  }

  return {
    year,
    month,
    totalDays,
    effectiveStartDay,
    activeDaysCount,
    income,
    totalFixed,
    targetSavings,
    freeBudget,
    baseDailyAllowance,
    days,
    todayData,
    currentDayNumber,
    spentSoFar,
    allowanceSoFar,
    netSurplusSoFar,
    remainingDays,
    remainingMonthBudget,
    dynamicRemainingDaily,
    health
  };
}
