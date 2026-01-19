import multer = require('multer');
import { Bucket, CreateWriteStreamOptions, PredefinedAcl, Storage, StorageOptions } from '@google-cloud/storage';
import { spawn } from 'child_process';
import { Request } from 'express';
import { finished } from 'stream/promises';
import { v4 as uuid } from 'uuid';

type TGoogleCloudBlobFileReference = {
  destination?: string;
  filename: string;
};

export type TContentTypeFunction = (req: Request, file: Express.Multer.File) => string | undefined;
export type TDestinationFunction = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: any, destination: string) => void,
) => void;
export type TFilenameFunction = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: any, filename: string) => void,
) => void;

export type TMulterGoogleCloudStorageOptions = {
  acl?: PredefinedAcl;
  bucket?: string;
  contentType?: string | TContentTypeFunction;
  destination?: string | TDestinationFunction;
  filename?: string | TFilenameFunction;
  filenameEncoding?: boolean;
  hideFilename?: boolean;
  uniformBucketLevelAccess?: boolean;
  pdfCompression?: 'ebook' | 'screen' | 'printer' | 'prepress' | 'default';
};

export default class MulterGoogleCloudStorage implements multer.StorageEngine {
  private gcsBucket: Bucket;
  private gcsStorage: Storage;
  private options: StorageOptions & TMulterGoogleCloudStorageOptions;

  getFilename: TFilenameFunction = (req, file, cb) => {
    if (typeof file.originalname === 'string') cb(null, file.originalname);
    else cb(null, `${uuid()}`);
  };

  getDestination: TDestinationFunction = (req, file, cb) => {
    cb(null, '');
  };

  getContentType: TContentTypeFunction = (req, file) => {
    if (typeof file.mimetype === 'string') return file.mimetype;
    else return undefined;
  };

  private getBlobFileReference(req: any, file: any): TGoogleCloudBlobFileReference | false {
    const blobFile: TGoogleCloudBlobFileReference = {
      destination: '',
      filename: '',
    };

    this.getDestination(req, file, (err, destination) => {
      if (err) {
        return false;
      }

      let escDestination = '';
      escDestination += destination.replace(/^\.+/g, '').replace(/^\/+|\/+$/g, '');

      if (escDestination !== '') {
        escDestination = escDestination + '/';
      }

      blobFile.destination = escDestination;
    });

    this.getFilename(req, file, (err, filename) => {
      if (err) {
        return false;
      }

      if (this.options.filenameEncoding) {
        blobFile.filename = encodeURIComponent(
          filename.replace(/^\.+/g, '').replace(/^\/+/g, '').replace(/\r|\n/g, '_'),
        );
      } else {
        blobFile.filename = filename;
      }
    });

    return blobFile;
  }

  constructor(opts?: StorageOptions & TMulterGoogleCloudStorageOptions) {
    const options = opts || {};

    typeof options.destination === 'string'
      ? (this.getDestination = function (req, file, cb) {
          cb(null, options.destination as string);
        })
      : (this.getDestination = options.destination || this.getDestination);

    if (options.hideFilename) {
      this.getFilename = function (req, file, cb) {
        cb(null, `${uuid()}`);
      };
      this.getContentType = function (_req, _file) {
        return undefined;
      };
    } else {
      typeof options.filename === 'string'
        ? (this.getFilename = function (req, file, cb) {
            cb(null, options.filename as string);
          })
        : (this.getFilename = options.filename || this.getFilename);

      typeof options.contentType === 'string'
        ? (this.getContentType = function () {
            return options.contentType as string;
          })
        : (this.getContentType = options.contentType || this.getContentType);
    }

    const bucket = options.bucket || null;
    const projectId = options.projectId || null;
    const keyFilename = options.keyFilename || null;

    if (!bucket) {
      throw new Error('You have to specify bucket for Google Cloud Storage to work.');
    }

    if (!projectId) {
      throw new Error('You have to specify project id for Google Cloud Storage to work.');
    }

    /*
     * If credentials and keyfile are not defined, Google Storage should appropriately be able to locate the
     * default credentials for the environment see: https://cloud.google.com/docs/authentication/application-default-credentials#search_order
     */

    this.gcsStorage = new Storage({
      ...options,
      projectId,
      keyFilename: keyFilename || undefined,
    });

    this.gcsBucket = this.gcsStorage.bucket(bucket);

    this.options = options;
  }

  async _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (
      error?: any,
      info?: Partial<Express.Multer.File> & {
        bucket?: string;
        contentType?: string;
        uri?: string;
        linkUrl?: string;
        selfLink?: string;
      },
    ) => void,
  ): Promise<void> {
    try {
      const blobFile = this.getBlobFileReference(req, file);
      if (blobFile === false) {
        throw new Error('Failed to get blob file reference');
      }

      const blobName = blobFile.destination + blobFile.filename;
      const blob = this.gcsBucket.file(blobName);

      const streamOpts: CreateWriteStreamOptions = {};
      if (!this.options.uniformBucketLevelAccess) {
        streamOpts.predefinedAcl = this.options.acl || 'private';
      }

      const contentType = this.getContentType(req, file);
      if (contentType) {
        streamOpts.metadata = { contentType };
      }

      const blobStream = blob.createWriteStream(streamOpts);

      // temporarily disable pdf compression - too slow
      if (this.options.pdfCompression && contentType === 'application/pdf' && false) {
        const gsProcess = spawn('gs', [
          '-sDEVICE=pdfwrite',
          '-dCompatibilityLevel=1.4',
          `-dPDFSETTINGS=/${this.options.pdfCompression}`,
          '-sUseOCR=Never',
          '-dNOPAUSE',
          '-dQUIET',
          '-dBATCH',
          '-sOutputFile=-',
          '-',
        ]);

        // insert the file stream into the gs process
        file.stream.pipe(gsProcess.stdin);
        // output the gs process stream back into the blob stream
        gsProcess.stdout.pipe(blobStream);
      } else {
        file.stream.pipe(blobStream);
      }

      // Wait until blobStream finishes writing.
      await finished(blobStream);

      // Use blob.metadata to extract additional info if available.
      const name = blob.metadata.name || blobName;
      const filename = name.slice(name.lastIndexOf('/') + 1);

      cb(null, {
        filename,
        bucket: blob.metadata.bucket,
        destination: blobFile.destination,
        path: `${blobFile.destination}${filename}`,
        contentType: blob.metadata.contentType,
        size: blob.metadata.size === undefined ? undefined : Number(blob.metadata.size),
        uri: `gs://${blob.metadata.bucket}/${blobFile.destination}${filename}`,
        linkUrl: `${this.gcsStorage.apiEndpoint}/${blob.metadata.bucket}/${blobFile.destination}${filename}`,
        selfLink: blob.metadata.selfLink,
      });
    } catch (err) {
      cb(err);
    }
  }

  _removeFile(req: Request, file: Express.Multer.File, cb: (error: Error | null) => void): void {
    const blobFile = this.getBlobFileReference(req, file);
    if (blobFile !== false) {
      const blobName = blobFile.destination + blobFile.filename;
      const blob = this.gcsBucket.file(blobName);
      blob.delete();
      cb(null);
    }
  }
}
