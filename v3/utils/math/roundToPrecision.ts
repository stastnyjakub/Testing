/**
 *
 * @param value - The value to round
 * @param significantDigits - The number of significant digits to round to
 * @returns The rounded value as a number
 * @example roundToPrecision(123.45632, 2) -> 120.45
 */
export const roundToPrecision = (value: number, significantDigits: number) => {
  // toPrecision use inclusive rounding, so we need to add 1 to the significant digits
  return parseFloat(value.toPrecision(significantDigits + 1));
};
