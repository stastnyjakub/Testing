import { Lang } from '../types';
export enum ELanguageCallbackContext {
  MAILING = 'mailing',
}
export const getLanguageCallback = (context: ELanguageCallbackContext): Lang => {
  switch (context) {
    case ELanguageCallbackContext.MAILING:
      return 'cs';
    default:
      return 'cs';
  }
};
