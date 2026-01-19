/**
 * @param age - age string to convert to seconds (e.g. '1d', '2w', '3M', '4y')
 * @returns number of seconds or null if invalid
 */
export const convertAgeToSeconds = (age: string): number | null => {
  const regexMatchArray = age.match(/^(\d+)(\D+)$/);
  if (regexMatchArray === null) {
    return null;
  }
  const [_, valueString, unit] = regexMatchArray;

  const value = Number(valueString);
  if (isNaN(value)) {
    return null;
  }

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    case 'w':
      return value * 60 * 60 * 24 * 7;
    case 'M':
      return value * 60 * 60 * 24 * 30;
    case 'y':
      return value * 60 * 60 * 24 * 365;
    default:
      return null;
  }
};
