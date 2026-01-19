/**
 * Rounds a number to the nearest level.
 * Rounds up (ceil)
 * @param num The number to round.
 * @param level The level to round to.
 * @returns The rounded number.
 * @example
 * roundToLevel(1234, 'hundred'); // 1300
 * roundToLevel(1234, 'thousand'); // 2000
 */
export const roundToLevel = (num: number, level: 'ten' | 'hundred' | 'thousand' | 'tenThousand'): number => {
  const levelToNumber = {
    ten: 10,
    hundred: 100,
    thousand: 1000,
    tenThousand: 10000,
  };
  const levelNumber = levelToNumber[level];
  return Math.ceil(num / levelNumber) * levelNumber;
};
