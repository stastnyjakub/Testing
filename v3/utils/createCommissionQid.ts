export const createCommissionQId = (
  relation: string,
  week: number,
  number: number,
  enteredBy: number,
  year: number,
): string => {
  const paddedNumber = number.toString().padStart(4, '0');
  const yearYY = year.toString().slice(-2);

  return `${relation}-${week}${paddedNumber}${enteredBy}-${yearYY}`;
};
