import { CloudTasksClient } from '@google-cloud/tasks';
import * as Sentry from '@sentry/node';
import { spawn } from 'child_process';
import { finished } from 'stream/promises';

import { routes } from '@/config/routes';
import env from '@/env';
import { HttpException } from '@/errors';
import * as fileService from '@/file/file.service';
import { loggerService } from '@/logging/logging.service';

import { getAttachment, getAttachmentFilePath } from '../attachment.service';

export type TRunCompressionJobArgs = {
  attachmentId: number;
};
export const runCompressionJob = async ({ attachmentId }: TRunCompressionJobArgs) => {
  const attachment = await getAttachment(attachmentId);

  if (attachment.mimeType !== 'application/pdf') {
    throw new HttpException(400, 'attachment.notPdf');
  }

  // Get read and write streams for the attachment file
  const attachmentFileReadStream = await fileService.getFileStream(getAttachmentFilePath(attachment.fileName));
  const attachmentFileWriteStream = await fileService.getFileWriteStream(getAttachmentFilePath(attachment.fileName));

  // Compress the attachment file using Ghostscript
  const gsProcess = spawn('gs', [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    `-dPDFSETTINGS=/ebook`,
    '-sUseOCR=Never',
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    '-sOutputFile=-',
    '-',
  ]);

  // If gsProcess fails, we won't receive an error in the stream, so we need to handle it
  const exitPromise = new Promise((resolve, reject) => {
    gsProcess.on('exit', (code) => {
      if (code !== 0) {
        Sentry.captureException(new Error(`Ghostscript exited with code ${code}`));
        reject(new HttpException(500, 'attachment.compressionFailed'));
      } else {
        resolve(true);
      }
    });
    gsProcess.on('error', (error) => {
      Sentry.captureException(error);
      reject(new HttpException(500, 'attachment.compressionFailed', error.message));
    });
  });

  // Handle errors in the read and write streams
  attachmentFileReadStream.content.on('error', (error) => {
    Sentry.captureException(error);
    gsProcess.kill();
  });
  attachmentFileWriteStream.content.on('error', (error) => {
    Sentry.captureException(error);
    gsProcess.kill();
  });

  // Handle the end of the read stream
  attachmentFileReadStream.content.on('end', () => gsProcess.stdin.end());

  // insert the file stream into the gs process
  attachmentFileReadStream.content.pipe(gsProcess.stdin);
  // output the gs process stream back into the blob stream
  gsProcess.stdout.pipe(attachmentFileWriteStream.content);

  await Promise.all([exitPromise, finished(attachmentFileWriteStream.content)]);
};

export const queueCompressionJob = async (attachmentId: number) => {
  if (env().SERVER_URL.includes('localhost')) {
    loggerService.info(`Skipping Google Cloud Tasks queue for 'localhost' environment. Attachment ID: ${attachmentId}`);
    return;
  }

  const tasksClient = new CloudTasksClient();
  const parent = tasksClient.queuePath(env().GCLOUD_PROJECT_ID, 'europe-west3', 'attachment-compression');
  const [response] = await tasksClient.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: 'POST',
        url: `${env().SERVER_URL}${routes.v3.job.attachmentCompression}`,
        body: Buffer.from(JSON.stringify({ attachmentId })).toString('base64'),
        headers: {
          'x-api-key': env().JOB_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    },
  });
  return response;
};
