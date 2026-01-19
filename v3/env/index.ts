import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

import { envFromSecretManagerSchema, envSchema, TEnv } from './envSchema';

let envValues = {} as TEnv;

export const loadEnv = async () => {
  if (process.env.LOCAL === 'true') {
    envValues = envSchema.parse({
      ...process.env,
    });
    return;
  }

  const secretClient = new SecretManagerServiceClient();
  const secretLoadPromises = Object.keys(envFromSecretManagerSchema.shape).map(async (key) => {
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/${process.env.GCLOUD_PROJECT_ID}/secrets/${key}-${process.env.ENVIRONMENT?.toUpperCase()}/versions/latest`,
    });
    return {
      key,
      value: version.payload?.data?.toString(),
    };
  });
  const secrets = await Promise.allSettled(secretLoadPromises);
  const values = secrets.reduce<Record<string, string>>((acc, result) => {
    if (result.status === 'rejected') return acc;
    const { value, key } = result.value;
    if (!value || !key) return acc;
    return { ...acc, [key]: value };
  }, {});
  const { success, data, error } = envSchema.safeParse({
    ...process.env,
    ...values,
  });

  if (success) {
    envValues = data;
    return;
  }

  const errorMessages = error.errors.map(({ code, message, path }) => `${code}, ${message}, ${path}`).join('\n');
  throw new Error(`Environment variables validation failed:\n${errorMessages}`);
};

export default function env() {
  return envValues;
}
