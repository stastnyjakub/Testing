import { aboutUs, genericStyle } from '@/utils';

import { t } from '../middleware/i18n';

import { Substitutions } from './delivery.interface';

export const template = (substitutions: Substitutions, lang: string) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>${t('delivery.title', lang)}</title>
    <style type="text/css">
      ${genericStyle()}
    </style>
  </head>
  <body>
    <div id="page_1">
      <div id="id_1">
        <p class="p0 ft0">${t('delivery.confirmation', lang)}:</p>
        <p class="p1 ft1">${t('delivery.fromCompany', lang, {
          company: substitutions.customerCompany,
        })}</p>
        <p class="p2 ft1">${t('genericConfirmation.goods', lang)}: ${substitutions.items}</p>
        <p class="p3 ft1">${t('delivery.dischargeDate', lang)}: ${substitutions.dischargeDate}</p>
        <p class="p3 ft1">${t('delivery.dischargeTime', lang)}: ${substitutions.dischargeTime}</p>
        <p class="p4 ft1">${t('genericConfirmation.plates', lang)}: ${substitutions.carrierRegistrationPlate}</p>
        <p class="p5 ft1">${t('genericConfirmation.driver', lang)}: ${
          substitutions.carrierDriver
        }, ${t('genericConfirmation.phone', lang)}: ${substitutions.carrierGsm}</p>
        <p class="p6 ft1">${t('genericConfirmation.changes', lang)}</p>
        <p class="p7 ft2">${t('delivery.freeVehicle', lang)}</p>
      </div>
      ${aboutUs(lang)}
    </div>
  </body>
</html>
  `;
};
