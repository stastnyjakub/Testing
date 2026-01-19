import { timestamp } from '@/utils';

export const convertDateToISO8601 = (date: string | number) => {
  // Helper function to pad single digit numbers with a leading zero
  const padZero = (num: string) => num.padStart(2, '0');

  // Handle numeric timestamp input
  if (typeof date === 'number') {
    const formatted = timestamp(date)?.format('YYYY-MM-DD');
    if (formatted === undefined) throw new Error('Invalid timestamp provided');
    return formatted.replaceAll('-', '');
  }

  // Handle string input in the format DD.MM.YYYY
  let [day, month, year] = date.split('.');
  day = padZero(day);
  month = padZero(month);
  year = year;

  return `${year}${month}${day}`;
};
