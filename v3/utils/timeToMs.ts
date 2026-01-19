export enum ETimeUnit {
  Seconds = 's',
  Minutes = 'm',
  Hours = 'h',
  Days = 'd',
  Weeks = 'w',
  Months = 'M',
  Years = 'y',
}

const unitMultipliers: Record<ETimeUnit, number> = {
  [ETimeUnit.Seconds]: 1000,
  [ETimeUnit.Minutes]: 1000 * 60,
  [ETimeUnit.Hours]: 1000 * 60 * 60,
  [ETimeUnit.Days]: 1000 * 60 * 60 * 24,
  [ETimeUnit.Weeks]: 1000 * 60 * 60 * 24 * 7,
  [ETimeUnit.Months]: 1000 * 60 * 60 * 24 * 30,
  [ETimeUnit.Years]: 1000 * 60 * 60 * 24 * 365,
};

export const getTimeInMs = (value: number, unit: ETimeUnit): number => {
  return value * (unitMultipliers[unit] || 0);
};

export const getTimeInUnit = (value: number, unit: ETimeUnit, resultUnit: ETimeUnit): number => {
  return getTimeInMs(value, unit) / (unitMultipliers[resultUnit] || 0);
};
