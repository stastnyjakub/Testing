export const splitApiKey = (apiKey: string) => {
  const [key, secret] = apiKey.split(':');
  return { key, secret };
};
