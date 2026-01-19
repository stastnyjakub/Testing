import { t } from '@/middleware/i18n';
import { aboutUs, genericStyle } from '@/utils';

import { Substitutions } from './loading.interface';

export const template = (substitutions: Substitutions, lang: string) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>${t('loading.title', lang)}</title>
    <style type="text/css">
      ${genericStyle()}
    </style>
  </head>
  <body>
  <div id="page_1">
    <div id="id_1">
      <p class="p0 ft0">${t('loading.confirmation', lang)}:</p>
      <p class="p1 ft1">${t('loading.forCompany', lang, {
        company: substitutions.customerCompany,
      })}.</p>
      <p id="refNumber" class="p18 ft1">${t('loading.refNumber', lang)}: ${substitutions.loadingRefNumber}.</p>
      <p class="p2 ft1">${t('genericConfirmation.goods', lang)}: ${substitutions.items}</p>
      <p class="p3 ft1">${t('loading.date', lang)}: ${substitutions.loadingDate}</p>
      <p class="p3 ft1">${t('loading.time', lang)}: ${substitutions.loadingTime}</p>
      <p class="p4 ft1">${t('genericConfirmation.plates')}: ${substitutions.carrierRegistrationPlate}</p>
      <p class="p5 ft1">${t('genericConfirmation.driver', lang)}: ${
        substitutions.carrierDriver
      },${t('genericConfirmation.phone', lang)}: ${substitutions.carrierGsm}</p>
      <p class="p6 ft1">${t('genericConfirmation.changes', lang)}</p>
    </div>
    ${aboutUs(lang)}
  </div>
  </body>
</html>
  `;
};
