import { calculateMonthBudget, getDaysInMonth } from './src/utils/calculations.js';

// Test 1: Check 30-day month with 30,000 income, 15,000 fixed, 9,000 savings target
// Free budget = 30000 - 15000 - 9000 = 6000
// Days in month = 30 -> Daily base allowance = 200 TL / day
const config = {
  monthlyIncome: 30000,
  fixedExpenses: [{ id: '1', title: 'Sabit', amount: 15000 }],
  targetSavings: 9000
};

// Scenario:
// Day 1: User spends 100 TL (100 TL saved)
// Day 2: Starting balance must be 200 + 100 = 300 TL! User spends 250 TL (50 TL saved)
// Day 3: Starting balance must be 300 - 250 + 200 = 250 TL!
const spendingsMap = {
  '2026-04-01': 100,
  '2026-04-02': 250
};

const result = calculateMonthBudget(config, spendingsMap, 2026, 4); // April has 30 days

console.log('--- Test Results ---');
console.log('Total Days in April:', result.totalDays);
console.assert(result.totalDays === 30, 'April should have 30 days');

console.log('Free Budget:', result.freeBudget);
console.assert(result.freeBudget === 6000, 'Free budget should be 6000');

console.log('Base Daily Allowance:', result.baseDailyAllowance);
console.assert(result.baseDailyAllowance === 200, 'Daily allowance should be 200');

// Day 1
const day1 = result.days[0];
console.log('Day 1 starting balance:', day1.startingBalance, 'spent:', day1.spent, 'remaining:', day1.remainingBalance);
console.assert(day1.startingBalance === 200, 'Day 1 starting balance should be 200');
console.assert(day1.remainingBalance === 100, 'Day 1 remaining balance should be 100');

// Day 2
const day2 = result.days[1];
console.log('Day 2 starting balance:', day2.startingBalance, 'spent:', day2.spent, 'remaining:', day2.remainingBalance);
console.assert(day2.startingBalance === 300, 'Day 2 starting balance should be 300');
console.assert(day2.remainingBalance === 50, 'Day 2 remaining balance should be 50');

// Day 3
const day3 = result.days[2];
console.log('Day 3 starting balance:', day3.startingBalance, 'spent:', day3.spent, 'remaining:', day3.remainingBalance);
console.assert(day3.startingBalance === 250, 'Day 3 starting balance should be 250');

console.log('All rollover calculation tests passed successfully!');
