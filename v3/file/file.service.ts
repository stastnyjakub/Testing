import { once } from 'events';

import { getBucket } from './helpers/bucket';

export const getFile = async (path: string) => {
  const bucket = getBucket();

  const fileMeta = await bucket.file(path).getMetadata();
  const file = await bucket.file(path).download();

  return {
    contentType: fileMeta[0].contentType,
    content: file[0],
    filename: fileMeta[0].name?.split('/').pop(),
  };
};

export const getFileStream = async (path: string) => {
  const bucket = getBucket();

  const fileMeta = await bucket.file(path).getMetadata();
  const fileStream = bucket.file(path).createReadStream();

  return {
    contentType: fileMeta[0].contentType,
    content: fileStream,
    filename: fileMeta[0].name?.split('/').pop(),
  };
};

export const getFileWriteStream = async (path: string) => {
  const bucket = getBucket();
  const fileMeta = await bucket.file(path).getMetadata();
  const fileStream = bucket.file(path).createWriteStream({
    metadata: {
      contentType: fileMeta[0].contentType,
    },
    resumable: false,
  });
  return {
    contentType: fileMeta[0].contentType,
    content: fileStream,
    filename: fileMeta[0].name?.split('/').pop(),
  };
};

export const listFiles = async (path: string): Promise<string[]> => {
  const bucket = getBucket();

  const files = await bucket.getFiles({
    prefix: path,
    delimiter: '/',
    includeTrailingDelimiter: false,
  });

  return files[0].map((file) => file.name);
};

export const deleteFile = async (path: string) => {
  const bucket = getBucket();

  await bucket.file(path).delete();
};

export const saveFile = async (filename: string, file: Buffer, mime: string) => {
  const bucket = getBucket();

  const storedFile = bucket.file(filename);

  const stream = storedFile.createWriteStream({
    metadata: {
      contentType: mime,
    },
    resumable: false,
  });

  stream.on('error', (err) => {
    throw err;
  });

  stream.end(file);
  await once(stream, 'finish');
};
