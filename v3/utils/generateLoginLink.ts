import env from '@/env';

export function generateLoginLink(queryParams: Record<string, any> = {}) {
  const base = `${env().CO_URL}/login`;
  if (Object.keys(queryParams).length === 0) {
    return base;
  }
  for (const key in queryParams) {
    if (queryParams.hasOwnProperty(key)) {
      queryParams[key] = queryParams[key].toString();
    }
  }
  const query = new URLSearchParams(queryParams);
  return `${base}?${query}`;
}
