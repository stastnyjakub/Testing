import i18next from 'i18next';

export enum Namespace {
  COMMON = 'common',
  VALIDATION = 'validation',
}

i18next.init({
  fallbackLng: 'cs',
  ns: ['common', 'validation'],
  defaultNS: 'common',
  fallbackNS: 'common',
  resources: {
    en: {
      validation: require('../../resources/locales/en/validation.json'),
      common: require('../../resources/locales/en/common.json'),
    },
    cs: {
      validation: require('../../resources/locales/cs/validation.json'),
      common: require('../../resources/locales/cs/common.json'),
    },
    de: {
      validation: require('../../resources/locales/de/validation.json'),
      common: require('../../resources/locales/de/common.json'),
    },
  },
});

export const tEn = (key: string) => {
  return i18next.t(key, { lng: 'en' });
};

export const tCs = (key: string) => {
  return i18next.t(key, { lng: 'cs' });
};

export const t = (key: string, lng = 'cs', interpolation?: Record<string, any>, ns: Namespace = Namespace.COMMON) => {
  return i18next.t(key, { lng, ns, ...interpolation });
};
