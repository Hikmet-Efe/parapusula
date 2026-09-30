// Financial and Rollover Balance Calculation Engine for ParaPusula

/**
 * Robust numeric parser supporting both standard numbers and Turkish thousand separators ("20.000", "20,000")
 */
export function parseCleanNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim().replace(/\s/g, '').replace('₺', '');
  // If user typed e.g. "20.000" or "20,000" (three digits after separator, no decimal part)
  if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    str = str.replace(/\./g, '');
  } else if (/^\d{1,3}(,\d{3})+$/.test(str)) {
    str = str.replace(/,/g, '');
  } else {
    str = str.replace(',', '.');
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Returns the number of days in a given year and month (1-indexed month: 1=Jan, 12=Dec)
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Formats a Date object as 'YYYY-MM-DD'
 */
export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats currency amount in Turkish Lira format
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
 * Calculates sum of fixed expenses
 */
export function calculateTotalFixed(fixedExpenses = []) {
  return fixedExpenses.reduce((sum, item) => sum + (parseCleanNumber(item.amount) || 0), 0);
}

/**
 * Calculates the total spending on a specific date from the spendings map
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
 * Core Dynamic Rollover Calculation for an entire month
 * Supports starting from mid-month (o ayın o gününden itibaren) without dumping fake past rollovers.
 * @param {Object} config - Budget configuration
 * @param {Object} spendingsMap - Map of dateKey -> entries/amount
 * @param {number} year - Year e.g. 2026
 * @param {number} month - Month 1-12 e.g. 10
 */
export function calculateMonthBudget(config, spendingsMap, year, month) {
  const totalDays = getDaysInMonth(year, month);
  const income = parseCleanNumber(config.monthlyIncome) || 0;
  const totalFixed = calculateTotalFixed(config.fixedExpenses);
  const targetSavings = parseCleanNumber(config.targetSavings) || 0;

  // Net usable free budget for the whole month
  const freeBudget = Math.max(0, income - totalFixed - targetSavings);

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const currentDayNumber = isCurrentMonth ? now.getDate() : (now > new Date(year, month - 1, 1) ? totalDays : 1);

  // Standard daily allowance calculated from the full month
  const standardDailyAllowance = totalDays > 0 ? freeBudget / totalDays : 0;

  // Check if this month has a custom start day (e.g. user started app on the 15th or 30th)
  let effectiveStartDay = 1;
  const isStartMonth = config.startYear === year && config.startMonth === month;
  if (isStartMonth && config.startDay && config.startDay > 1) {
    effectiveStartDay = Math.min(config.startDay, totalDays);
  }

  // Active days count from the start day to end of month
  const activeDaysCount = Math.max(1, totalDays - effectiveStartDay + 1);

  // For the starting month, daily quota is the standard daily allowance
  const baseDailyAllowance = standardDailyAllowance;

  // Day-by-day simulation and rollover accumulation
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
      // Days prior to starting the app: no rollover accumulation, treated as past/inactive
      startingBalance = 0;
      remainingBalance = 0;
      dailyDiff = 0;
    } else {
      // Active days (from startDay onwards)
      const activeDayIndex = d - effectiveStartDay + 1; // Exactly 1 on the very first day!
      cumulativeAllowance += baseDailyAllowance;

      // Starting balance for this day = total allowance accumulated since startDay minus all spending since startDay
      // On the first day (activeDayIndex = 1): (1 * baseDailyAllowance) - 0 = baseDailyAllowance!
      // So on day 30, starting balance is exactly 1 day of daily quota, NOT 30 days!
      startingBalance = (activeDayIndex * baseDailyAllowance) - cumulativeSpent;
      remainingBalance = startingBalance - daySpent;
      dailyDiff = baseDailyAllowance - daySpent;

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

  // Current day details
  const todayIndex = Math.min(Math.max(0, currentDayNumber - 1), totalDays - 1);
  const todayData = days[todayIndex] || days[0];

  // Month-to-date stats (only considering days from effectiveStartDay to currentDayNumber)
  const activeDaysSoFar = Math.max(1, currentDayNumber - effectiveStartDay + 1);
  const spentSoFar = days.slice(effectiveStartDay - 1, currentDayNumber).reduce((sum, d) => sum + d.spent, 0);
  const allowanceSoFar = activeDaysSoFar * baseDailyAllowance;
  const netSurplusSoFar = allowanceSoFar - spentSoFar;

  // Remaining days in month from tomorrow onwards
  const remainingDays = Math.max(0, totalDays - currentDayNumber);
  const remainingMonthBudget = (activeDaysCount * baseDailyAllowance) - spentSoFar;
  const dynamicRemainingDaily = (remainingDays + 1) > 0 ? Math.max(0, remainingMonthBudget / (remainingDays + 1)) : 0;

  // Health Status
  let health = 'great';
  if (todayData.remainingBalance < 0) {
    health = 'danger';
  } else if (todayData.remainingBalance < baseDailyAllowance * 0.4) {
    health = 'warning';
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
