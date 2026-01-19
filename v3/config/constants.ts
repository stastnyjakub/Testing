import env from '@/env';
import { Environment, getEnvironment } from '@/utils/getEnvironment';

export const PORT = process.env.PORT || 8080;
export const BUCKET_NAME = `qapline-${getEnvironment() || Environment.DEV}`;

export const SYSTEM_NOTIFICATIONS_USER_IDS = env()
  .SYSTEM_NOTIFICATIONS_USER_IDS.split(',')
  .map((id) => Number(id));

export const USERS = {
  System: {
    id: 1000,
  },
  JindraMachan: {
    id: 1,
  },
};

export const QaplineBillingInfo = {
  name: 'Qapline spol s.r.o.',
  street: 'Tř. Tomáše Bati 299',
  city: 'Zlín',
  zip: '760 01',
  country: 'Česká republika',
  cin: '29316880',
  vat: 'CZ29316880',
  bank: {
    CZK: {
      name: 'Komerční banka, a.s.',
      iban: 'CZ1901000001073934450287',
      accountNumber: '107-3934450287',
      bankCode: '0100',
      swift: 'KOMBCZPP',
    },
    EUR: {
      name: 'Fio banka, a.s.',
      iban: 'CZ8520100000002400374721',
      swift: 'FIOBCZPPXXX',
    },
  },
  phone: '774005555',
  email: ' qapline@qapline.com',
};
