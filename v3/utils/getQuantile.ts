export const getQuantileFromArray = <T extends object>(data: T[], target: keyof T, quantile = 90) => {
  if (data.length === 0) return data;
  const quantilePercent = (100 - quantile) / 2;
  const quantileAmount = Math.round((data.length / 100) * quantilePercent);
  const sorted = data.sort((a, b) => (a[target] as number) - (b[target] as number));
  return sorted.slice(quantileAmount, sorted.length - quantileAmount);
};
