import moment from 'moment-timezone';

export const timestamp = (timestamp: number | string): moment.Moment | null => {
  if (typeof timestamp === 'string') timestamp = Number(timestamp);
  if (isNaN(timestamp)) return null;

  // converts timestamp from milliseconds to seconds
  if (timestamp > 9999999999) timestamp = Math.floor(timestamp / 1000);
  // converts timestamp from microseconds to seconds
  if (timestamp > 9999999999999) timestamp = Math.floor(timestamp / 1000000);
  const momentInstance = moment.unix(timestamp);
  return momentInstance;
};
