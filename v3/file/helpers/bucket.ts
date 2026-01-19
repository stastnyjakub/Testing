import { Bucket, Storage } from '@google-cloud/storage';

import { BUCKET_NAME } from '../../config/constants';

export const getBucket = (): Bucket => {
  const storage = new Storage();

  const bucket = storage.bucket(BUCKET_NAME);
  return bucket;
};
