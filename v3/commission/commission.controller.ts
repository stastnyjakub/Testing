import { NextFunction, Request, Response } from 'express';

import { downloadCsv, validateId } from '@/utils';
import { invalidateTag } from '@/websockets';

import { CommissionBodyCreate, CommissionBodyUpdate } from './commission.interface';
import {
  validateCommissionListCommissionNumbersQuery,
  validateParameters,
  validateRequestBodyCreate,
  validateRequestBodyUpdate,
} from './commission.model';
import * as commissionService from './commission.service';

export const listCommissionNumbers = async (req: Request, res: Response, next: NextFunction) => {
  /*
        #swagger.tags = ['Commission - Numbers']
        #swagger.description = 'List of commission numbers'
        #swagger.operationId = 'listCommissionNumbers'
        #swagger.parameters['x-auth-token'] = {
          in: 'header',
          description: 'JWT token',
        }
        #swagger.parameters['search'] = {
          in: 'query',
          description: 'Number search',
          type: 'number',
        }
        #swagger.responses[200] = {
          schema: {$ref: '#/definitions/CommissionListCommissionNumbersResponse'},
        }
  */
  try {
    const { age, search } = validateCommissionListCommissionNumbersQuery(req.query);
    const results = await commissionService.listCommissionNumbers({ age, search });
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
};

export const commissionsGet = async (req: Request, res: Response, next: NextFunction) => {
  /*
      #swagger.tags = ['V3 - Commission']
      #swagger.description = 'Get commissions'
      #swagger.operationId = 'getCommissions'
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      #swagger.parameters['sort'] = {
        in: 'query',
        description: 'Sort by',
        type: 'string',
      }

      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Number of commissions per page',
        type: 'number',
        default: 40
      }
      #swagger.parameters['offset'] = {
        in: 'query',
        description: 'How many commissions to skip',
        type: 'number',
        default: 0
      }
      #swagger.parameters['search'] = {
        in: 'query',
        description: 'Full text search',
        type: 'string',
      }
      #swagger.parameters['omit'] = {
        in: 'query',
        description: 'Omit fields (comma separated)',
        type: 'string',
      }
      #swagger.parameters['selected'] = {
        in: 'query',
        description: 'Select fields (comma separated)',
        type: 'string',
      }
      #swagger.parameters['state'] = {
        in: 'query',
        description: 'Search by state',
        type: 'enum',
      }
      #swagger.parameters['relation'] = {
        in: 'query',
        description: 'Search by relation',
        type: 'string',
      }
      #swagger.parameters['week_gte'] = {
        in: 'query',
        description: 'Search by week greater than or equals',
        type: 'number',
      }
      #swagger.parameters['week_lte'] = {
        in: 'query',
        description: 'Search by week less than or equals',
        type: 'number',
      }
      #swagger.parameters['number_gte'] = {
        in: 'query',
        description: 'Search by number greater than or equals',
        type: 'number',
      }
      #swagger.parameters['number_lte'] = {
        in: 'query',
        description: 'Search by number less than or equals',
        type: 'number',
      }
      #swagger.parameters['year_gte'] = {
        in: 'query',
        description: 'Search by year greater than or equals',
        type: 'number',
      }
      #swagger.parameters['year_lte'] = {
        in: 'query',
        description: 'Search by year less than or equals',
        type: 'number',
      }
      #swagger.parameters['customer_company'] = {
        in: 'query',
        description: 'Search by customer company',
        type: 'string',
      }
      #swagger.parameters['loading_date_gte'] = {
        in: 'query',
        description: 'Search by loading date greater than or equals',
        type: 'number',
      }
      #swagger.parameters['loading_date_lte'] = {
        in: 'query',
        description: 'Search by loading date less than or equals',
        type: 'number',
      }
      #swagger.parameters['loading_city'] = {
        in: 'query',
        description: 'Search by loading city',
        type: 'string',
      }
      #swagger.parameters['loading_zip'] = {
        in: 'query',
        description: 'Search by loading zip',
        type: 'string',
      }
      #swagger.parameters['discharge_date_gte'] = {
        in: 'query',
        description: 'Search by discharge date greater than or equals',
        type: 'number',
      }
      #swagger.parameters['discharge_date_lte'] = {
        in: 'query',
        description: 'Search by discharge date less than or equals',
        type: 'number',
      }
      #swagger.parameters['discharge_city'] = {
        in: 'query',
        description: 'Search by discharge city',
        type: 'string',
      }
      #swagger.parameters['discharge_zip'] = {
        in: 'query',
        description: 'Search by discharge zip',
        type: 'string',
      }
      #swagger.parameters['total_weight_gte'] = {
        in: 'query',
        description: 'Search by total weight greater than or equals',
        type: 'number',
      }
      #swagger.parameters['total_weight_lte'] = {
        in: 'query',
        description: 'Search by total weight less than or equals',
        type: 'number',
      }
      #swagger.parameters['total_loading_meters_gte'] = {
        in: 'query',
        description: 'Search by total loading meters greater than or equals',
        type: 'number',
      }
      #swagger.parameters['total_loading_meters_lte'] = {
        in: 'query',
        description: 'Search by total loading meters less than or equals',
        type: 'number',
      }
      #swagger.parameters['customerPrice_gte'] = {
        in: 'query',
        description: 'Search by customer price greater than or equals',
        type: 'number',
      }
      #swagger.parameters['customerPrice_lte'] = {
        in: 'query',
        description: 'Search by customer price less than or equals',
        type: 'number',
      }
      #swagger.parameters['invNumber_gte'] = {
        in: 'query',
        description: 'Search by invoice number greater than or equals',
        type: 'number',
      }
      #swagger.parameters['invNumber_lte'] = {
        in: 'query',
        description: 'Search by invoice number less than or equals',
        type: 'number',
      }
      #swagger.parameters['carrier_company'] = {
        in: 'query',
        description: 'Search by carrier company',
        type: 'string',
      }
      #swagger.parameters['carrierPrice_gte'] = {
        in: 'query',
        description: 'Search by carrier price greater than or equals',
        type: 'number',
      }
      #swagger.parameters['carrierPrice_lte'] = {
        in: 'query',
        description: 'Search by carrier price less than or equals',
        type: 'number',
      }
      #swagger.parameters['provision_gte'] = {
        in: 'query',
        description: 'Search by provision greater than or equals',
        type: 'number',
      }
      #swagger.parameters['provision_lte'] = {
        in: 'query',
        description: 'Search by provision less than or equals',
        type: 'number',
      }
      #swagger.parameters['addedBy'] = {
        in: 'query',
        description: 'Search by addedBy',
        type: 'string',
      }
      #swagger.parameters['notification'] = {
        in: 'query',
        description: 'Search by notification',
        type: 'boolean',
      }
      #swagger.parameters['note'] = {
        in: 'query',
        description: 'Search by note',
        type: 'string',
      }
      #swagger.responses[200] = {
        schema: {$ref: '#/definitions/V3CommissionsGet'},
      }
    */
  const { query } = req;
  validateParameters(query);
  try {
    const customers = await commissionService.getCommissions(query);
    if (customers.data.length === 0) return res.status(404).send({ message: 'Nebyly nalezeny žádné zakázky' });
    return res.json(customers);
  } catch (e: any) {
    next(e);
  }
};

export const commissionsExportToCsv = async (req: Request, res: Response, next: NextFunction) => {
  /*
      #swagger.tags = ['V3 - Commission']
      #swagger.description = 'Get commissions csv'
      #swagger.operationId = 'commissionsExportToCsv'
      #swagger.parameters['items'] = {
        in: 'query',
        description: 'List of commission items ids (12,13,20)',
        type: 'string',
        default: null
      }
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      */
  validateParameters(req.query);
  try {
    const commissions = await commissionService.getCommissions(req.query, true);
    if (commissions.data == null || commissions.data.length === 0) {
      return res.status(404).send({ message: 'Faktury se nepodařilo načíst' });
    }
    const fields = [
      { label: 'relace', value: 'relation' },
      { label: 'týd.', value: 'week' },
      { label: 'číslo', value: 'number' },
      { label: 'rok', value: 'year' },
      { label: 'zákazník', value: 'customer_company' },
      { label: 'nakl. datum', value: 'loading_date' },
      { label: 'nakl. místo', value: 'loading_city' },
      { label: 'nakl. psč', value: 'loading_zip' },
      { label: 'vykl. datum', value: 'discharge_date' },
      { label: 'vykl. místo', value: 'discharge_city' },
      { label: 'vykl. psč', value: 'discharge_zip' },
      { label: 'hmotnost', value: 'total_weight' },
      { label: 'LDM', value: 'total_loading_meters' },
      { label: 'zák. cena (Kč)', value: 'priceCustomer' },
      { label: 'zák. faktura', value: 'invNumber' },
      { label: 'dopravce', value: 'carrier_company' },
      { label: 'dop. cena (Kč)', value: 'priceCarrier' },
      { label: 'provize (Kč)', value: 'provision' },
      { label: 'zadal', value: 'addedBy' },
      { label: 'notif.', value: 'notification' },
      { label: 'poznámka', value: 'note' },
    ];
    return downloadCsv(res, 'commissions', fields, commissions.data);
  } catch (e: any) {
    next(e);
  }
};

export const commissionGet = async (req: Request, res: Response, next: NextFunction) => {
  /*
      #swagger.tags = ['V3 - Commission']
      #swagger.description = 'Get commission by ID'
      #swagger.operationId = 'getCommission'
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'commission ID',
        required: true,
      }

      #swagger.responses[200] = {
        schema: {$ref: '#/definitions/V3CommissionGet'},
      }
    */
  const { id } = req.params;
  const validatedCommissionId = validateId(id);
  if (typeof validatedCommissionId === 'string') return res.status(400).send({ message: 'Neplatné ID' });
  try {
    const foundCommission = await commissionService.getOneCommission(parseInt(id));
    if (foundCommission === null) return res.status(404).send({ message: 'Zakázku se nepodařilo najít' });
    return res.json(foundCommission);
  } catch (e: any) {
    next(e);
  }
};

export const commissionPost = async (req: Request, res: Response, next: NextFunction) => {
  /*
      #swagger.tags = ['V3 - Commission']
      #swagger.description = 'Create commission'
      #swagger.operationId = 'createCommission'
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      #swagger.requestBody = {
        required: true,
        schema: {$ref: '#/definitions/V3CommissionCreateBody'}
      }
      #swagger.responses[200] = {
        schema: {$ref: '#/definitions/V3CommissionGet'}
      }
    */
  const { error } = validateRequestBodyCreate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { commissionDischarges, commissionLoadings, commissionItems, ...commission }: CommissionBodyCreate = req.body;

  const userId = req.auth?.payload?.userId;

  try {
    const createdCommission = await commissionService.createCommission({
      userId,
      commission,
      commissionItems: commissionItems.toCreate,
      commissionLoadings: commissionLoadings.toCreate,
      commissionDischarges: commissionDischarges.toCreate,
    });

    invalidateTag('Commissions');
    return res.json(createdCommission);
  } catch (e: any) {
    next(e);
  }
};

export const commissionPut = async (req: Request, res: Response, next: NextFunction) => {
  /*
      #swagger.tags = ['V3 - Commission']
      #swagger.description = 'Update commission'
      #swagger.operationId = 'updateCommission'
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'Commission ID',
        required: true,
      }
      #swagger.requestBody = {
        required: true,
        schema: {$ref: '#/definitions/V3CommissionUpdateBody'}
      }
      #swagger.responses[200] = {
        schema: {$ref: '#/definitions/V3CommissionGet'}
      }
    */
  const validatedCommissionId = validateId(req.params.id);
  if (typeof validatedCommissionId === 'string') return res.status(400).send({ message: 'Neplatné ID' });
  const { error } = validateRequestBodyUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { commissionDischarges, commissionLoadings, commissionItems, ...commission }: CommissionBodyUpdate = req.body;
  try {
    const createdCommission = await commissionService.updateCommission(
      validatedCommissionId,
      commission,
      commissionDischarges,
      commissionLoadings,
      commissionItems,
    );

    invalidateTag('Commissions');
    return res.json(createdCommission);
  } catch (e: any) {
    next(e);
  }
};

export const commissionDelete = async (req: Request, res: Response, next: NextFunction) => {
  /*
      #swagger.tags = ['V3 - Commission']
      #swagger.description = 'Delete commission'
      #swagger.operationId = 'deleteCommission'
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'Commission ID',
        required: true,
      }
      #swagger.responses[200] = {
        schema: {$ref: '#/definitions/V3CommissionGet'}
      }
    */
  const { id } = req.params;
  const validatedCommissionId = validateId(id);
  if (typeof validatedCommissionId === 'string') return res.status(400).send({ message: 'Neplatné ID' });
  try {
    const deletedCommission = await commissionService.removeCommission(validatedCommissionId);

    invalidateTag('Commissions');
    return res.json(deletedCommission);
  } catch (e: any) {
    next(e);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  /*
      #swagger.tags = ['Commission - summary']
      #swagger.description = 'Get commissions summary'
      #swagger.operationId = 'getCommissionsSumary'
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      #swagger.parameters['sort'] = {
        in: 'query',
        description: 'Sort by',
        type: 'string',
      }
      #swagger.parameters['search'] = {
        in: 'query',
        description: 'Full text search',
        type: 'string',
      }
      #swagger.parameters['state'] = {
        in: 'query',
        description: 'Search by state',
        type: 'enum',
      }
      #swagger.parameters['relation'] = {
        in: 'query',
        description: 'Search by relation',
        type: 'string',
      }
      #swagger.parameters['week_gte'] = {
        in: 'query',
        description: 'Search by week greater than or equals',
        type: 'number',
      }
      #swagger.parameters['week_lte'] = {
        in: 'query',
        description: 'Search by week less than or equals',
        type: 'number',
      }
      #swagger.parameters['number_gte'] = {
        in: 'query',
        description: 'Search by number greater than or equals',
        type: 'number',
      }
      #swagger.parameters['number_lte'] = {
        in: 'query',
        description: 'Search by number less than or equals',
        type: 'number',
      }
      #swagger.parameters['year_gte'] = {
        in: 'query',
        description: 'Search by year greater than or equals',
        type: 'number',
      }
      #swagger.parameters['year_lte'] = {
        in: 'query',
        description: 'Search by year less than or equals',
        type: 'number',
      }
      #swagger.parameters['customer_company'] = {
        in: 'query',
        description: 'Search by customer company',
        type: 'string',
      }
      #swagger.parameters['loading_date_gte'] = {
        in: 'query',
        description: 'Search by loading date greater than or equals',
        type: 'number',
      }
      #swagger.parameters['loading_date_lte'] = {
        in: 'query',
        description: 'Search by loading date less than or equals',
        type: 'number',
      }
      #swagger.parameters['loading_city'] = {
        in: 'query',
        description: 'Search by loading city',
        type: 'string',
      }
      #swagger.parameters['loading_zip'] = {
        in: 'query',
        description: 'Search by loading zip',
        type: 'string',
      }
      #swagger.parameters['discharge_date_gte'] = {
        in: 'query',
        description: 'Search by discharge date greater than or equals',
        type: 'number',
      }
      #swagger.parameters['discharge_date_lte'] = {
        in: 'query',
        description: 'Search by discharge date less than or equals',
        type: 'number',
      }
      #swagger.parameters['discharge_city'] = {
        in: 'query',
        description: 'Search by discharge city',
        type: 'string',
      }
      #swagger.parameters['discharge_zip'] = {
        in: 'query',
        description: 'Search by discharge zip',
        type: 'string',
      }
      #swagger.parameters['total_weight_gte'] = {
        in: 'query',
        description: 'Search by total weight greater than or equals',
        type: 'number',
      }
      #swagger.parameters['total_weight_lte'] = {
        in: 'query',
        description: 'Search by total weight less than or equals',
        type: 'number',
      }
      #swagger.parameters['total_loading_meters_gte'] = {
        in: 'query',
        description: 'Search by total loading meters greater than or equals',
        type: 'number',
      }
      #swagger.parameters['total_loading_meters_lte'] = {
        in: 'query',
        description: 'Search by total loading meters less than or equals',
        type: 'number',
      }
      #swagger.parameters['customerPrice_gte'] = {
        in: 'query',
        description: 'Search by customer price greater than or equals',
        type: 'number',
      }
      #swagger.parameters['customerPrice_lte'] = {
        in: 'query',
        description: 'Search by customer price less than or equals',
        type: 'number',
      }
      #swagger.parameters['invNumber_gte'] = {
        in: 'query',
        description: 'Search by invoice number greater than or equals',
        type: 'number',
      }
      #swagger.parameters['invNumber_lte'] = {
        in: 'query',
        description: 'Search by invoice number less than or equals',
        type: 'number',
      }
      #swagger.parameters['carrier_company'] = {
        in: 'query',
        description: 'Search by carrier company',
        type: 'string',
      }
      #swagger.parameters['carrierPrice_gte'] = {
        in: 'query',
        description: 'Search by carrier price greater than or equals',
        type: 'number',
      }
      #swagger.parameters['carrierPrice_lte'] = {
        in: 'query',
        description: 'Search by carrier price less than or equals',
        type: 'number',
      }
      #swagger.parameters['provision_gte'] = {
        in: 'query',
        description: 'Search by provision greater than or equals',
        type: 'number',
      }
      #swagger.parameters['provision_lte'] = {
        in: 'query',
        description: 'Search by provision less than or equals',
        type: 'number',
      }
      #swagger.parameters['addedBy'] = {
        in: 'query',
        description: 'Search by addedBy',
        type: 'string',
      }
      #swagger.parameters['notification'] = {
        in: 'query',
        description: 'Search by notification',
        type: 'boolean',
      }
      #swagger.parameters['note'] = {
        in: 'query',
        description: 'Search by note',
        type: 'string',
      }
      #swagger.responses[200] = {
        schema: {$ref: '#/definitions/CommissionsSummary'},
      }
    */
  try {
    const { query } = req;
    validateParameters(query);

    const summary = await commissionService.getCommissionsSummary(query);
    res.json(summary);
  } catch (e) {
    next(e);
  }
};
