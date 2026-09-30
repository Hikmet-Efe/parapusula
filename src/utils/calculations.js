// ======================================================================================
// 🧭 PARAPUSULA - FİNANSAL VE DİNAMİK DEVİR HESAPLAMA MOTORU
// ======================================================================================
// Bu dosya uygulamanın beyni. Projeyi geliştirirken temel amacım şuydu:
// 1. Ayın başında belirlediğim harçlık asla sabit kalmasın; o gün az harcarsam kalan para
//    yarının bakiyesine devretsin, fazla harcarsam yarının harçlığından düşsün.
// 2. Hedeflediğim dokunulmaz birikime ve kira/fatura gibi sabit giderlerime asla el sürülmesin.
// 3. Eğer uygulamayı ayın başında değil de örneğin ayın 15'i ya da 30'unda kullanmaya başlarsam,
//    geçmiş 29 günün parası bugüne sahte bir şekilde yığılmasın; bütçemi o günden itibaren paylaştırsın.
// ======================================================================================

/**
 * 🧹 SAYI TEMİZLEME VE PARSE ETME FONKSİYONUM
 * --------------------------------------------------------------------------------------
 * BURADA NE YAPMAYA ÇALIŞTIM?
 * Mobilde harcama ya da maaş girerken bazen klavyeden "25000", bazen "25.000", bazen de "25,000" yazabiliyoruz.
 * JavaScript'in normal parseFloat("25.000") fonksiyonu ne yazık ki bunu "25" olarak okuyor ve
 * 25 bin liralık maaşımı 25 TL yaparak tüm bütçe hesabını çökertiyordu.
 * Bu sorunu çözmek için aradaki noktaları ve virgülleri akıllıca ayıran, Türkçe binlik formatını
 * bozmadan tam sayıya çeviren bu temizleme fonksiyonunu yazdım.
 */
export function parseCleanNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  
  // Boşlukları ve TL simgesini temizliyorum
  let str = String(val).trim().replace(/\s/g, '').replace('₺', '');
  
  // Eğer kullanıcı "20.000" veya "20,000" gibi 3 basamaklı binlik formatı girdiyse:
  if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    str = str.replace(/\./g, ''); // Noktaları uçur
  } else if (/^\d{1,3}(,\d{3})+$/.test(str)) {
    str = str.replace(/,/g, ''); // Virgülleri uçur
  } else {
    // Normal ondalık virgülünü noktaya çevir
    str = str.replace(',', '.');
  }
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 📅 AYDAKİ GÜN SAYISINI BULMA
 * --------------------------------------------------------------------------------------
 * Hangi ayın kaç gün çektiğini (Şubat 28-29, Eylül 30, Ekim 31) dinamik olarak alıyorum.
 * new Date(year, month, 0) hilesiyle o ayın son takvim gününü yakalıyorum.
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * 🗓️ TARİHİ 'YYYY-AA-GG' FORMATINA ÇEVİRME
 * --------------------------------------------------------------------------------------
 * Harcamaları LocalStorage'da gün gün saklarken karışıklık olmasın diye standart bir
 * anahtar (key) üretiyorum (Örn: '2026-09-30').
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
 * Ekrana yazdırdığım sayıların göze güzel görünmesi için Türk Lirası formatı uyguluyorum.
 * Örn: 15400 sayısını alıp ekranda "15.400 ₺" şeklinde şık bir biçimde gösteriyorum.
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
 * Kira, fatura, aidat gibi her ay mutlaka ödemek zorunda olduğum kalemlerin toplamını alıyorum.
 */
export function calculateTotalFixed(fixedExpenses = []) {
  return fixedExpenses.reduce((sum, item) => sum + (parseCleanNumber(item.amount) || 0), 0);
}

/**
 * 🛒 BELİRLİ BİR GÜNDE YAPILAN TOPLAM HARCAMAYI GETİRME
 * --------------------------------------------------------------------------------------
 * O gün içinde yaptığım tüm harcama kayıtlarını tek tek toplayıp o günün toplam harcamasını buluyorum.
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
 * 🧭 ANA BÜTÇE VE DİNAMİK DEVİR MOTORUM (EN KRİTİK ALAN)
 * ======================================================================================
 * BURADA NASIL BİR MANTIK KURDUM?
 * 1. Önce harcamakta tamamen özgür olduğum parayı buluyorum:
 *    Net Serbest Bütçem = Maaşım - Sabit Giderlerim - Hedef Birikimim.
 * 2. Bunu ayın gün sayısına bölerek günlük taban harçlığımı hesaplıyorum.
 * 3. AY ORTASI BAŞLANGIÇ ÇÖZÜMÜM:
 *    Eğer uygulamayı ayın 30'unda açtıysam, ayın 1'inden 29'una kadar olan günleri "pasif" sayıyorum.
 *    Böylece geçmiş 29 gün boyunca harcanmamış gibi görünen devasa para bugüne yığılmıyor!
 *    Bugün bana tam olarak sadece bugünün 1 günlük harçlığını (örn. 500 TL) veriyor.
 * 4. DEVİR KURALIM:
 *    Bugün 500 TL harçlığım varken 300 TL harcarsam, kalan 200 TL yarının bakiyesine eklenir (Yarın 700 TL olur).
 *    Bugün 600 TL harcarsam, aşan 100 TL yarının harçlığından düşülür (Yarın 400 TL kalır).
 *    Böylece ay sonunda hedeflediğim birikim asla delinmemiş olur!
 * ======================================================================================
 */
export function calculateMonthBudget(config, spendingsMap, year, month) {
  // 1. Ayın kaç gün çektiğini buluyorum (30 mu, 31 mi?)
  const totalDays = getDaysInMonth(year, month);
  
  // 2. Girilen bütçe verilerini temizleyip alıyorum
  const income = parseCleanNumber(config.monthlyIncome) || 0;
  const totalFixed = calculateTotalFixed(config.fixedExpenses);
  const targetSavings = parseCleanNumber(config.targetSavings) || 0;

  // 3. Dokunulmaz harcamalar çıktıktan sonra elimde kalan net harcama param:
  const freeBudget = Math.max(0, income - totalFixed - targetSavings);

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const currentDayNumber = isCurrentMonth ? now.getDate() : (now > new Date(year, month - 1, 1) ? totalDays : 1);

  // 4. Günlük standart taban harçlığım (Örn: 15.000 TL / 30 gün = 500 TL)
  const standardDailyAllowance = totalDays > 0 ? freeBudget / totalDays : 0;

  // 5. Ay ortası başlangıç kontrolüm:
  // Eğer uygulamaya ayın 1'inde değil de örneğin ayın 30'unda başladıysam, başlangıç günümü işaretliyorum.
  let effectiveStartDay = 1;
  const isStartMonth = config.startYear === year && config.startMonth === month;
  if (isStartMonth && config.startDay && config.startDay > 1) {
    effectiveStartDay = Math.min(config.startDay, totalDays);
  }

  // Başladığım günden ayın sonuna kadar kaç günüm kaldığını hesaplıyorum
  const activeDaysCount = Math.max(1, totalDays - effectiveStartDay + 1);

  // Günlük hakkım standart günlük harçlığım kadar
  const baseDailyAllowance = standardDailyAllowance;

  // 6. Günden güne simülasyon: Ayın 1'inden son gününe kadar tek tek bakiyeleri işletiyorum
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
      // 💡 BENİM ÇÖZÜMÜM: Uygulamayı henüz kullanmadığım geçmiş günlere bakiye veya devir işletmiyorum.
      // Burası sayesinde ayın son günü başlasam bile 30 günlük para birden bugüne yığılmıyor.
      startingBalance = 0;
      remainingBalance = 0;
      dailyDiff = 0;
    } else {
      // ✅ Uygulamayı kullanmaya başladığım aktif günler:
      const activeDayIndex = d - effectiveStartDay + 1; // Başladığım ilk gün 1 oluyor!
      cumulativeAllowance += baseDailyAllowance;

      // FORMÜLÜM: O günkü Başlangıç Param = (O güne kadar hak ettiğim harçlık) - (O güne kadar harcadıklarım)
      // İlk günde (activeDayIndex = 1): (1 * 500) - 0 = 500 TL ile tertemiz başlıyorum!
      startingBalance = (activeDayIndex * baseDailyAllowance) - cumulativeSpent;
      remainingBalance = startingBalance - daySpent; // Gün sonunda cebimde kalan
      dailyDiff = baseDailyAllowance - daySpent;    // O gün artıya mı geçtim eksiye mi?

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

  // 7. Bugünün anlık durumunu çekiyorum
  const todayIndex = Math.min(Math.max(0, currentDayNumber - 1), totalDays - 1);
  const todayData = days[todayIndex] || days[0];

  // 8. Ayın genel gidişat istatistikleri
  const activeDaysSoFar = Math.max(1, currentDayNumber - effectiveStartDay + 1);
  const spentSoFar = days.slice(effectiveStartDay - 1, currentDayNumber).reduce((sum, d) => sum + d.spent, 0);
  const allowanceSoFar = activeDaysSoFar * baseDailyAllowance;
  const netSurplusSoFar = allowanceSoFar - spentSoFar;

  // Ay sonuna kadar kalan günlerim ve kalan toplam bütçem
  const remainingDays = Math.max(0, totalDays - currentDayNumber);
  const remainingMonthBudget = (activeDaysCount * baseDailyAllowance) - spentSoFar;
  const dynamicRemainingDaily = (remainingDays + 1) > 0 ? Math.max(0, remainingMonthBudget / (remainingDays + 1)) : 0;

  // 9. Bütçe Sağlık Durumu (Görsel olarak yeşil/sarı/kırmızı yapmak için):
  let health = 'great';
  if (todayData.remainingBalance < 0) {
    health = 'danger'; // Bütçeyi aştım!
  } else if (todayData.remainingBalance < baseDailyAllowance * 0.4) {
    health = 'warning'; // Limitim %40'ın altına indi, dikkat etmeliyim!
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
