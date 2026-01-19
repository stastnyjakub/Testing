import { getIndexOfValueFromIntervals } from '../enquiryForm.utils';
import { estimationData } from '../priceEstimationData';
import { ETransportType } from '../types';

export type TGetPricePerLoadingMeterPerKilometerArgs = {
  transportType: ETransportType;
  loadingMeters: number;
  distance: number;
};
export const getPricePerLoadingMeterPerKilometer = async ({
  distance,
  loadingMeters,
  transportType,
}: TGetPricePerLoadingMeterPerKilometerArgs) => {
  const { columnHeaders, rowHeaders, values } = estimationData[transportType];

  const rowHeaderIndex = getIndexOfValueFromIntervals(rowHeaders, loadingMeters);
  const columnHeaderIndex = getIndexOfValueFromIntervals(columnHeaders, distance);

  if (rowHeaderIndex === null || columnHeaderIndex === null) {
    return null;
  }

  return values[rowHeaderIndex][columnHeaderIndex];
};
