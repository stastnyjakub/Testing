import { TAttachmentFile } from '@/attachment/types';

export const getFullFileName = (file: Express.Multer.File) => {
  const suffix = file.originalname.split('.').pop();
  return `${file.filename}.${suffix}`;
};

export const getAttachmentFileFromMulterFile = ({
  originalname,
  mimetype,
  filename,
  size,
}: Express.Multer.File): TAttachmentFile => {
  const decodedFileName = Buffer.from(originalname, 'latin1').toString('utf8');
  return {
    size,
    filename,
    mimetype,
    originalname: decodedFileName,
  };
};
