import { NextFunction, Request, Response } from 'express';

import { HttpException } from '@/errors';

import { validateFilePathQuery, validateListFilesQuery } from './file.model';
import { deleteFile, getFile, listFiles, saveFile } from './file.service';

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Files']
    #swagger.description = 'Upload file'
    #swagger.operationId = 'fileUpload'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['file'] = {
      in: 'formData',
      type: 'file',
      description: "Selected file"
    }
    #swagger.parameters['directory'] = {
      in: 'formData',
      description: 'File directory',
      type: 'string'
    }

    #swagger.parameters['id'] = {
      in: 'formData',
      description: 'Subdirectory',
      type: 'integer'
    }

  */

  try {
    if (req.file === undefined) {
      throw new HttpException(400, 'File is required');
    }
    req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const filename = `${req.body.directory}/${req.body.id}/${req.file.originalname}`;

    await saveFile(filename, req.file.buffer, req.file.mimetype);
    return res.send();
  } catch (e) {
    next(e);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Files']
    #swagger.description = 'List files'
    #swagger.operationId = 'fileList'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 

    #swagger.parameters['directory'] = {
      in: 'query',
      description: 'File directory',
      type: 'string'
    }

    #swagger.parameters['id'] = {
      in: 'query',
      description: 'Subdirectory',
      type: 'integer'
    }

    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3FileListResponseBody'}
    }
  */

  const { error } = validateListFilesQuery(req.query);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    const path = `${req.query.directory}/${req.query.id}/`;
    const fileNames = await listFiles(path);

    return res.send(fileNames);
  } catch (e) {
    next(e);
  }
};

export const download = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Files']
    #swagger.description = 'Download file'
    #swagger.operationId = 'fileDownload'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 

    #swagger.parameters['filePath'] = {
      in: 'query',
      description: 'Full file path',
      type: 'string',
    }

    #swagger.responses[200] = {
      content: {"application/pdf": {}}
    }
  */
  const { error } = validateFilePathQuery(req.query);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    const { contentType, content } = await getFile(req.query.filePath as string);

    contentType && res.contentType(contentType);
    return res.send(content);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Files']
    #swagger.description = 'Delete file'
    #swagger.operationId = 'fileDelete'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 

    #swagger.parameters['filePath'] = {
      in: 'query',
      description: 'Full file path',
      type: 'string',
    }
  */

  const { error } = validateFilePathQuery(req.query);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    await deleteFile(req.query.filePath as string);

    return res.send();
  } catch (e) {
    next(e);
  }
};
