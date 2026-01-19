export type Lang = 'en' | 'cs' | 'de';

export enum ECurrency {
  CZK = 'CZK',
  EUR = 'EUR',
}

export enum EFileSizeUnit {
  B = 'B',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB',
}

export enum EMimeType {
  PDF = 'application/pdf',
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
}

export type Point = {
  latitude: number;
  longitude: number;
};

export * from './helpers';
export * from './multer';
export * from './prisma';
export * from './statusCodes';
