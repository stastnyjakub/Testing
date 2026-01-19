import CryptoJs from 'crypto-js';

import env from '@/env';

// Format date according to KB API requirements
export const formatDateForKbApi = (date: moment.Moment) => {
  return date.format('YYYY-MM-DD');
};

export const encryptKbRefreshToken = (refreshToken: string) => {
  const refreshTokenCipher = CryptoJs.AES.encrypt(refreshToken, env().KB_BANK_REFRESH_TOKEN_SECRET).toString();
  return refreshTokenCipher;
};

export const decryptKbRefreshToken = (refreshTokenCipher: string) => {
  const refreshToken = CryptoJs.AES.decrypt(refreshTokenCipher, env().KB_BANK_REFRESH_TOKEN_SECRET).toString(
    CryptoJs.enc.Utf8,
  );
  return refreshToken;
};
