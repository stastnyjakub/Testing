import { ETransportType, TEstimationData } from '../types';

import { estimationDataDomestic } from './domestic';
import { estimationDataExport } from './export';
import { estimationDataImport } from './import';
import { estimationDataInternational } from './international';

export const estimationData: Record<ETransportType, TEstimationData> = {
  domestic: estimationDataDomestic,
  export: estimationDataExport,
  import: estimationDataImport,
  international: estimationDataInternational,
};
