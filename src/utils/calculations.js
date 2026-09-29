// Financial and Rollover Balance Calculation Engine for ParaPusula

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
  return fixedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

/**
 * Calculates the total spending on a specific date from the spendings map
 */
export function getDaySpendingTotal(spendingsMap, dateKey) {
  const dayEntries = spendingsMap[dateKey];
  if (!dayEntries) return 0;
  if (Array.isArray(dayEntries)) {
    return dayEntries.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }
  return Number(dayEntries) || 0;
}

/**
 * Core Dynamic Rollover Calculation for an entire month
 * @param {Object} config - Budget configuration
 * @param {Object} spendingsMap - Map of dateKey -> entries/amount
 * @param {number} year - Year e.g. 2026
 * @param {number} month - Month 1-12 e.g. 10
 */
export function calculateMonthBudget(config, spendingsMap, year, month) {
  const totalDays = getDaysInMonth(year, month);
  const income = Number(config.monthlyIncome) || 0;
  const totalFixed = calculateTotalFixed(config.fixedExpenses);
  const targetSavings = Number(config.targetSavings) || 0;

  // Net usable free budget for the entire month
  const freeBudget = Math.max(0, income - totalFixed - targetSavings);

  // Base daily allowance (if spent evenly across all days)
  const baseDailyAllowance = totalDays > 0 ? freeBudget / totalDays : 0;

  // Day-by-day simulation and rollover accumulation
  const days = [];
  let cumulativeSpent = 0;
  let cumulativeAllowance = 0;

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const currentDayNumber = isCurrentMonth ? now.getDate() : (now > new Date(year, month - 1, 1) ? totalDays : 1);

  for (let d = 1; d <= totalDays; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const daySpent = getDaySpendingTotal(spendingsMap, dateKey);

    cumulativeAllowance += baseDailyAllowance;

    // Starting balance for this day = total allowance accumulated up to today minus all past spending
    const startingBalance = (d * baseDailyAllowance) - cumulativeSpent;

    // Remaining at end of this day
    const remainingBalance = startingBalance - daySpent;

    // Did the user spend under or over the base quota today?
    const dailyDiff = baseDailyAllowance - daySpent;

    cumulativeSpent += daySpent;

    days.push({
      dayNumber: d,
      dateKey,
      dayDate: new Date(year, month - 1, d),
      baseAllowance: baseDailyAllowance,
      startingBalance,
      spent: daySpent,
      remainingBalance,
      dailyDiff,
      isToday: isCurrentMonth && d === currentDayNumber,
      isPast: d < currentDayNumber,
      isFuture: d > currentDayNumber
    });
  }

  // Current day details
  const todayIndex = Math.min(Math.max(0, currentDayNumber - 1), totalDays - 1);
  const todayData = days[todayIndex] || days[0];

  // Month-to-date stats
  const spentSoFar = days.slice(0, currentDayNumber).reduce((sum, d) => sum + d.spent, 0);
  const allowanceSoFar = currentDayNumber * baseDailyAllowance;
  const netSurplusSoFar = allowanceSoFar - spentSoFar; // positive = saved more, negative = overspent

  // Remaining days in month from tomorrow onwards
  const remainingDays = Math.max(0, totalDays - currentDayNumber);
  
  // Total remaining free budget for rest of month
  const remainingMonthBudget = freeBudget - spentSoFar;

  // Dynamic daily allowance if rest of budget is smoothed across remaining days
  const dynamicRemainingDaily = (remainingDays + 1) > 0 ? Math.max(0, remainingMonthBudget / (remainingDays + 1)) : 0;

  // Health Status
  let health = 'great'; // green
  if (todayData.remainingBalance < 0) {
    health = 'danger'; // red
  } else if (todayData.remainingBalance < baseDailyAllowance * 0.5) {
    health = 'warning'; // amber
  }

  return {
    year,
    month,
    totalDays,
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
