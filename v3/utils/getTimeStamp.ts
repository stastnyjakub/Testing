import moment from 'moment';

export const getTimestampInMilliseconds = () => {
  return moment().unix() * 1000;
};
