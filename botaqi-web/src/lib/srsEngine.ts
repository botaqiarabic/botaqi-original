/**
 * SM-2 Algorithm Implementation for Botaqi
 * 
 * Inputs:
 * - quality: 0-5 rating from user (0=Blackout, 5=Perfect)
 * - currentInterval: Days since last review
 * - currentEase: Ease factor (default 2.5)
 * 
 * Output:
 * - nextInterval: Days until next review
 * - nextEase: Updated ease factor
 * - dueDate: Date object for next review
 */

export const calculateNextReview = (
  quality: 0 | 1 | 2 | 3 | 4 | 5,
  currentInterval: number,
  currentEase: number
): { nextInterval: number; nextEase: number; dueDate: Date } => {
  
  // 1. Handle "Again" / Fail cases (Quality < 3)
  if (quality < 3) {
    return {
      nextInterval: 1, // Reset to 1 day
      nextEase: currentEase, // Ease factor doesn't change on fail
      dueDate: addDays(new Date(), 1)
    };
  }

  // 2. Calculate new Ease Factor
  // Formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q)*0.02))
  // Minimum EF is 1.3
  let newEase = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  // 3. Calculate new Interval
  let nextInterval: number;
  if (currentInterval === 0) {
    nextInterval = 1;
  } else if (currentInterval === 1) {
    nextInterval = 6;
  } else {
    // Bonus multiplier for "Perfect" (5) rating
    const intervalMultiplier = quality === 5 ? 1.3 : 1;
    nextInterval = Math.round(currentInterval * newEase * intervalMultiplier);
  }

  return {
    nextInterval,
    nextEase: parseFloat(newEase.toFixed(2)), // Round to 2 decimals
    dueDate: addDays(new Date(), nextInterval)
  };
};

// Helper to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
