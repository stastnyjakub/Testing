import _ from 'lodash';

import { EFileSizeUnit } from '@/types';

const fileSizeUnitToBytes = {
  [EFileSizeUnit.B]: Math.pow(1000, 0),
  [EFileSizeUnit.KB]: Math.pow(1000, 1),
  [EFileSizeUnit.MB]: Math.pow(1000, 2),
  [EFileSizeUnit.GB]: Math.pow(1000, 3),
  [EFileSizeUnit.TB]: Math.pow(1000, 4),
};

/**
 *
 * @param fileSize - file size in bytes
 */
export const formatFileSize = (fileSize: number, unit?: EFileSizeUnit) => {
  if (!unit) {
    if (fileSize > fileSizeUnitToBytes[EFileSizeUnit.TB]) {
      unit = EFileSizeUnit.TB;
    } else if (fileSize > fileSizeUnitToBytes[EFileSizeUnit.GB]) {
      unit = EFileSizeUnit.GB;
    } else if (fileSize > fileSizeUnitToBytes[EFileSizeUnit.MB]) {
      unit = EFileSizeUnit.MB;
    } else if (fileSize > fileSizeUnitToBytes[EFileSizeUnit.KB]) {
      unit = EFileSizeUnit.KB;
    } else {
      unit = EFileSizeUnit.B;
    }
  }
  return `${_.round(fileSize / fileSizeUnitToBytes[unit], 2)} ${unit}`;
};

export const getFileSizeInBytes = (fileSize: number, unit: EFileSizeUnit) => {
  return fileSize * fileSizeUnitToBytes[unit];
};
