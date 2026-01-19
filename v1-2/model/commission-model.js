const Joi = require('@hapi/joi');
const pool = require('../startup/db');
const { getStatesLanguages } = require('./language-model');

//validation
const validate = (commission) => {
  const schema = Joi.object({
    addedBy: Joi.string().allow(null, ''),
    commission_id: Joi.number().min(1).max(2147483647),
    carrier_id: Joi.number().min(1).max(2147483647).allow(null, '', 'NULL'),
    carrierDriver: Joi.string().allow(null, ''),
    carrierGsm: Joi.string().allow(null, ''),
    carrierOrderCreatedBy: Joi.string().allow(null, ''),
    carrierOrderSent: Joi.boolean(),
    currencyCarrier: Joi.string().allow(null, ''),
    currencyCustomer: Joi.string().allow(null, ''),
    carrierNote: Joi.string().allow(null, ''),
    carrierRegistrationPlate: Joi.string().allow(null, ''),
    carrierVat: Joi.alternatives().try(
      Joi.string().allow(null, ''),
      Joi.number(),
    ),
    carriersTable: Joi.array(),
    customer_id: Joi.number().min(1).max(2147483647).allow(null, '', 'NULL'),
    customerContact_id: Joi.number()
      .min(1)
      .max(2147483647)
      .allow(null, '', 'NULL'),
    dischargeConfirmationSent: Joi.boolean(),
    dischargeRadius: Joi.number().allow(null),
    dispatcher_id: Joi.number().min(1).max(2147483647).allow(null, '', 'NULL'),
    dispatchersTable: Joi.array(),
    disposition: Joi.string().allow(null, ''),
    editedBy: Joi.string().allow(null, ''), //check if backend
    enteredCarrierBy: Joi.string().allow(null, ''), //check if backend
    enteredCarrierByNumber: Joi.number().allow(null),
    exchangeRateCarrier: Joi.number().allow(null),
    exchangeRateCustomer: Joi.number().allow(null),
    invoice_id: Joi.number().min(1).max(2147483647).allow(null, '', 'NULL'),
    loadingConfirmationSent: Joi.boolean().allow(null),
    loadingRadius: Joi.number().allow(null),
    note: Joi.string().allow(null, ''),
    number: Joi.number().allow(null, ''),
    orderConfirmationSent: Joi.boolean(),
    oldid: Joi.string().allow(null, ''),
    phoneNumberCarrierOrderCreatedBy: Joi.string().allow(null, ''), //check if backend
    priceCarrier: Joi.number().allow(null),
    priceCustomer: Joi.number().allow(null),
    provision: Joi.number().allow(null),
    qid: Joi.string().allow(null, ''),
    relation: Joi.string().allow(null, ''),
    state: Joi.number().allow(null),
    tsAdded: Joi.number().allow(null),
    tsCarrierOrderCreatedBy: Joi.number().allow(null),
    tsEdited: Joi.number().allow(null),
    tsEnteredCarrier: Joi.number().allow(null),
    vat: Joi.alternatives().try(Joi.string().allow(null, ''), Joi.number()),
    week: Joi.number().allow(null),
    year: Joi.number().allow(null),
    deleted: Joi.boolean(),
    notification: Joi.boolean(),
    orderDate: Joi.number().allow(null),
    orderNumber: Joi.string().allow(null, ''),
  });
  return schema.validate(commission);
};

const validateParams = (params) => {
  const schema = Joi.object({
    id: Joi.number().min(1).max(2147483647),
    ordering: Joi.string().allow(null, '').valid('asc', 'desc', ''),
    order_by: Joi.alternatives().try(
      Joi.string().allow(null, ''),
      Joi.number(),
    ),
    parameter: Joi.alternatives().try(
      Joi.string().allow(null, ''),
      Joi.number(),
    ),
    limit: Joi.number(),
    after: Joi.number(),
    state: Joi.number(),
    number: Joi.number(),
    relation: Joi.string().allow(null, ''),
    week: Joi.number(),
    year: Joi.number(),
    loading_date: Joi.number(), //commissionloading
    loading_city: Joi.string().allow(null, ''), //commissionloading
    loading_zip: Joi.string().allow(null, ''), //commissionloading
    commission_discharge_date: Joi.number(), //commissiondischarge
    discharge_city: Joi.string().allow(null, ''), //commissiondischarge
    discharge_zip: Joi.string().allow(null, ''), //commissiondischarge
    commission_item_weight: Joi.string().allow(null, ''), //commissionitem
    commission_item_loading_meters: Joi.number(), //commissionitem
    priceCustomer: Joi.number(),
    priceCarrier: Joi.number(),
    carrier_company: Joi.string().allow(null, ''),
    customer_company: Joi.string().allow(null, ''),
    provision: Joi.number(),
    added_by: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    carrier_vat: Joi.number(),
    vat: Joi.number(),
    invoiced: Joi.boolean(), //invoice_id,
    currency: Joi.string(),
  });
  return schema.validate(params);
};

const validateDispatecherSearch = (params) => {
  const schema = Joi.object({
    locations: Joi.object()
      .keys({
        loading: Joi.object().keys({
          lat: Joi.number().required().messages({
            'any.required': `GPS údaje nakládky nejsou kompletní`,
          }),
          lon: Joi.number().required().messages({
            'any.required': `GPS údaje nakládky nejsou kompletní`,
          }),
          radius: Joi.number()
            .required()
            .messages({ 'any.required': `Radius nakládky není zadaný` }),
        }),
        discharge: Joi.object().keys({
          lat: Joi.number().required().messages({
            'any.required': `GPS údaje vykládky nejsou kompletní`,
          }),
          lon: Joi.number().required().messages({
            'any.required': `GPS údaje vykládky nejsou kompletní`,
          }),
          radius: Joi.number()
            .required()
            .messages({ 'any.required': `Radius vykládky není zadaný` }),
        }),
      })
      .required()
      .messages({ 'any.required': `GPS údaje nejsou kompletně zadané` }),
    searchType: Joi.string(),
    directions: Joi.bool(),
    vehicleType: Joi.array(),
    vehicleFeaturesMustHaveOne: Joi.array(),
    vehicleFeaturesMustHaveAll: Joi.array(),
    minLength: Joi.number(),
    minHeight: Joi.number(),
    minWeight: Joi.number(),
  });
  return schema.validate(params);
};

/**
 * Returns filter for sql request, case insensitive
 * accepts number, company, street, postalcode, country, phone, email, note
 * @param {object} filter req.query
 * @returns array [sqlquery,values]
 */
const filter = (filter) => {
  let filterObjects = [
    'relation',
    'week',
    'year',
    'loading_date', //array
    'loading_city', //array
    'loading_zip', //array
    'discharge_date', //array
    'discharge_city', //array
    'discharge_zip', //array
    'total_weight',
    'total_loading_meters',
    'priceCustomer',
    'priceCarrier',
    'carrier_company',
    'customer_company',
    'provision',
    'added_by',
    'note',
    'carrier_vat',
    'vat',
    'notification',
    'invNumber',
    'invoiced',
    'currency',
  ];

  let filterRules = '',
    values = [];
  let counter = 1;

  for (const [key, value] of Object.entries(filter)) {
    if (filterObjects.includes(key)) {
      if (
        key == 'loading_date' ||
        key == 'loading_city' ||
        key == 'loading_zip' ||
        key == 'discharge_date' ||
        key == 'dischare_city' ||
        key == 'discharge_zip'
      ) {
        filterRules += ` and array_to_string(${key},',') ILIKE $${counter++}`;
        values.push(`%${value}%`);
      } else if (key == 'invoiced') {
        if (value == '1' || value == 'true') {
          console.log('invoiced');
          filterRules += `and invoice_id IS NOT NULL`;
        } else {
          filterRules += `and invoice_id IS NULL`;
        }
      } else if (isNaN(value) == true) {
        filterRules += ` and "${key}" ILIKE $${counter++}`;
        values.push(`%${value}%`);
      } else {
        filterRules += ` and "${key}" = $${counter++}`;
        values.push(value);
      }
    }
  }
  console.log(filterRules);
  return [filterRules, values];
};

const cursor = (reqQuery) => {
  reqQuery.ordering = reqQuery.ordering || 'desc';
  reqQuery.limit = reqQuery.limit || 'all';
  reqQuery.order_by = reqQuery.order_by || 'commission_id';
  reqQuery.mark = reqQuery.ordering === 'desc' ? '<=' : '>=';
  const operator = reqQuery.mark == '<=' ? 'max' : 'min';
  reqQuery.after =
    reqQuery.after !== undefined
      ? `'${reqQuery.after}'`
      : `(SELECT ${operator}(${reqQuery.order_by}) FROM "complete_commission" where deleted = false)`;

  return reqQuery;
};

/**
 * Returns all commissions
 * @param {integer} id commission id, all for all commissions
 * @param {object} reqQuery = false for pagination and cursor
 * @returns commissions object or error
 */
const get = async (id = false, reqQuery = false) => {
  if (id == 'all') {
    const pagination = cursor(reqQuery);
    const filtering = filter(reqQuery);

    let selectQuery = `SELECT * from "complete_commission" where deleted = false ${
      filtering[0]
    } and "${pagination.order_by}" ${pagination.mark} ${
      pagination.after
    } ORDER BY ${pagination.order_by} ${pagination.ordering} limit ${
      pagination.limit == 'all' ? 'all' : parseInt(pagination.limit) + 1
    }`;

    try {
      let query = {
        text: selectQuery,
        values: filtering[1],
      };

      pgres = await pool.query(query);

      const nextCursor =
        pgres.rows.length - 1 == pagination.limit
          ? pgres.rows[pagination.limit][pagination.order_by]
          : '';
      const responseRows =
        pgres.rows.length - 1 == pagination.limit
          ? pgres.rows.slice(0, -1)
          : pgres.rows;
      response = {
        data: responseRows,
        next_cursor: nextCursor,
      };

      // return null if price customer and price carrier is null

      return response;
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  } else {
    let query = {
      text: 'SELECT c.*, (SELECT "invoiceNumber" FROM invoice i where i.invoice_id = c.invoice_id LIMIT 1) AS "invNumber" from "commission" c where commission_id=$1',
      values: [id],
    };

    try {
      pgres = await pool.query(query);
      return pgres.rows[0];
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  }
};

/**
 * Get data from complete_commission table
 * @param {string} parameter
 * @param {string} value
 * @returns result in array
 */
const getCommissionBy = async (parameter, value) => {
  let selectQuery = `SELECT * from "complete_commission" where deleted = false and ${parameter} = $1`;

  try {
    let query = {
      text: selectQuery,
      values: [value],
    };

    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Save commission
 * @param {object} data commission data object
 * @param {integer} customer_id can be false, customer id data
 * @returns commission object or error
 */
const save = async (data, customer_id = false, user_id = false) => {
  if (customer_id) data.customer_id = customer_id;

  if (data.carrier_id) data.number = await getNumber();

  let counter = 1;
  const query = {
    text: `INSERT INTO commission (${Object.keys(data)
      .map((d) => `"${d}"`)
      .join(',')}) values (${Object.values(data)
      .map((d) => `$${counter++}`)
      .join(',')}) RETURNING *`,
    values: Object.values(data),
  };

  try {
    let pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const update = async (id = false, data) => {
  if (!id) id = data.commission_id;

  let query = {
    text: `SELECT commission_id, number, carrier_id from commission where commission_id = $1`,
    values: [id],
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: 'Requested commission was not found',
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  if (!pgres.rows[0].number && !pgres.rows[0].carrier_id && data.carrier_id)
    data.number = await getNumber();

  let counter = 1;
  let updateQuery = 'update commission set';
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    '',
  )} where "commission_id" = '${id}' RETURNING *`;

  query = {
    text: updateQuery,
    values: Object.values(data),
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Removes commission
 * @param {integer} id id of commission to be removed
 * @returns commission object of removed commission
 */
const remove = async (id) => {
  let query = {
    text: 'SELECT commission_id,deleted from "commission" where commission_id=$1',
    values: [id],
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: 'Requested commission was not found',
      };
    } else if (pgres.rows[0]['deleted']) {
      return {
        error_code: 404,
        error_message: 'Requested commission was already deleted',
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text: 'UPDATE commission set "deleted" = true where commission_id=$1 RETURNING *',
    values: [id],
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const fultextSearch = async (param) => {
  let selectQuery = `SELECT * from "complete_commission" where deleted = false and year = $2 and "relation" ilike $1
  or CAST(week AS TEXT) like $1 
  or CAST(number AS TEXT) like $1
  or CAST("priceCarrier" AS TEXT) like $1
  or CAST("priceCustomer" AS TEXT) like $1	
  or CAST(provision AS TEXT) like $1	
  or note like $1	
  or "addedBy" like $1	
  or "enteredCarrierBy" like $1	
  or "customer_company" like $1	
  or "carrier_company" like $1	
  or CAST(total_weight AS TEXT) like $1	
  or CAST(total_loading_meters AS TEXT) like $1	
  or loading_city_string like $1	
  or loading_zip_string like $1	
  or discharge_city_string like $1	
  or discharge_zip_string like $1
  or CAST(vat AS TEXT) like $1
  or CAST("carrierVat" AS TEXT) like $1
order by commission_id DESC`;

  try {
    let query = {
      text: selectQuery,
      values: [`%${param.parameter}%`, param.year],
    };

    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Returns proper commission number
 * @returns number
 */
const getNumber = async () => {
  const query = `SELECT max(number) from commission where deleted='false' and year = '${new Date().getFullYear()}'`;

  try {
    pgres = await pool.query(query);
    return (number = pgres.rows[0]['max'] ? pgres.rows[0]['max'] + 1 : 1);
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Searches the carriers and their dispatchers
 * @param {obj} data request
 * @returns {obj} dispatchers grouped by carriers
 */
const dispatcherSearch = async (data) => {
  try {
    const { searchType } = data;
    let dispatchersAndCars = [];

    if (searchType == 'dispatcher' || !searchType)
      dispatchersAndCars = [
        ...dispatchersAndCars,
        ...(await searchDispatchersAndCars('dispatcher', data)),
      ];
    if (searchType == 'commission' || !searchType)
      dispatchersAndCars = [
        ...dispatchersAndCars,
        ...(await searchDispatchersAndCars('commission', data)),
      ];
    if (searchType == 'hq' || !searchType)
      dispatchersAndCars = [
        ...dispatchersAndCars,
        ...(await searchDispatchersAndCars('hq', data)),
      ];

    dispatchersAndCars = filterCars(data, dispatchersAndCars);

    dispatchersAndCars = dispatchersAndCars.reduce((a, b) => {
      let isIn = a.find((element) => element.dispatcher_id === b.dispatcher_id);
      if (!isIn) a.push(b);
      return a;
    }, []);

    const statesLanguages = await getStatesLanguages();

    return groupDispatchersByCarriersAndAddLanguage(
      dispatchersAndCars,
      statesLanguages,
    );
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Groups dispatchers by carriers
 * @param {obj} carriersWithDispatchers
 * @returns {obj} grouped dispatchers with carriers
 */
let groupDispatchersByCarriersAndAddLanguage = (
  carriersWithDispatchers,
  statesLanguages,
) => {
  let response = [];

  carriersWithDispatchers.forEach((carrierWithDispatcher) => {
    let {
      carrier_id,
      company,
      note,
      languageCode,
      place,
      dispatcher_id,
      firstName,
      lastName,
      lastRequestTimeSent,
      email,
    } = carrierWithDispatcher;

    languageCode = languageCode
      ? [languageCode]
      : statesLanguages.find(
          (statelang) => statelang.countrycode == place.countryCode,
        ).languagecodes;

    const id = response.findIndex(
      (res) => res.carrier_id == carrierWithDispatcher.carrier_id,
    );

    if (id == -1) {
      response.push({
        carrier_id,
        company,
        note,
        place,
        dispatcher: [
          {
            dispatcher_id,
            firstName,
            lastName,
            lastRequestTimeSent,
            email,
            languageCode,
          },
        ],
      });
    } else {
      response[id].dispatcher.push({
        dispatcher_id,
        firstName,
        lastName,
        lastRequestTimeSent,
        email,
        languageCode,
      });
    }
  });

  return response;
};

/**
 * Filters vehicles
 * @param {obj} request filters
 * @param {obj} dispatchersAndCars  data to filter
 * @returns {obj} response
 */
let filterCars = (request, dispatchersAndCars) => {
  const {
    vehicleType,
    vehicleFeaturesMustHaveOne,
    vehicleFeaturesMustHaveAll,
    minLength,
    minHeight,
    minWeight,
  } = request;

  return dispatchersAndCars.filter((dispatcher) => {
    if (
      !(
        !minWeight ||
        minWeight < parseFloat(dispatcher.maxWeight) ||
        dispatcher.maxWeight == null
      )
    )
      return false;
    if (
      !(
        !minHeight ||
        minHeight < parseFloat(dispatcher.maxHeight) ||
        dispatcher.maxHeight == null
      )
    )
      return false;
    if (
      !(
        !minLength ||
        minLength < parseFloat(dispatcher.maxLength) ||
        dispatcher.maxLength == null
      )
    )
      return false;
    if (
      !(
        vehicleType.length == 0 ||
        vehicleType.some((part) => part == dispatcher.vehicleType_id)
      )
    )
      return false;
    if (
      !(
        vehicleFeaturesMustHaveOne.length == 0 ||
        vehicleFeaturesMustHaveOne.some(
          (part) => dispatcher.dispatchervehiclefeatures.indexOf(part) >= 0,
        )
      )
    )
      return false;
    if (
      !(
        vehicleFeaturesMustHaveAll.length == 0 ||
        vehicleFeaturesMustHaveAll.every(
          (part) => dispatcher.dispatchervehiclefeatures.indexOf(part) >= 0,
        )
      )
    )
      return false;
    return true;
  });
};

/**
 * Search dispatchers and carriers by given paramaters
 * @param {obj} data search paramateres
 * @returns {obj} dispatchers with their carriers
 */
let searchDispatchersAndCars = async (searchType, data) => {
  const { locations, directions } = data;
  const paramsNeeded = {
    carrier: ['ca.carrier_id', 'ca.company', 'ca.note', 'ca.place'],
    dispatcher: [
      'di.dispatcher_id',
      'di."firstName"',
      'di."lastName"',
      'di.email',
      'di."lastRequestTimeSent"',
      'di.language_id',
    ],
    car: [
      'car."dispatcherVehicle_id"',
      'car."maxHeight"',
      'car."maxLength"',
      'car."maxWeight"',
      'car."vehicleType_id"',
    ],
    lang: ['lang."languageCode"'],
    vehiclesAgg:
      'array_agg(cf."vehicleFeature_id") as dispatchervehiclefeatures',
  };

  if (searchType == 'dispatcher') {
    let carriers = [],
      dispatchers = [];

    const directionFirstLocation = !directions
      ? ''
      : `and (array_upper(d1.directions, 1) is null or d1.directions && ARRAY[0])`;
    const directionSecondLocation = !directions
      ? ''
      : `and (array_upper(d2.directions, 1) is null or d2.directions && ARRAY[1])`;

    let locationsWithdirections = `(distance(${locations.loading.lat}, ${locations.loading.lon}, d1.latitude, d1.longitude) <= '${locations.loading.radius}')
    and (distance(${locations.discharge.lat}, ${locations.discharge.lon}, d2.latitude, d2.longitude) <= '${locations.discharge.radius}')
    ${directionFirstLocation}
    ${directionSecondLocation}`;

    let query = `SELECT DISTINCT d1.dispatcher_id, d1.carrier_id from place as d1 RIGHT JOIN place as d2 ON d1.dispatcher_id = d2.dispatcher_id where ${locationsWithdirections} and d1.deleted = false and d2.deleted = false`;
    let pgres = await pool.query(query);

    if (pgres.rows.length == 0) return [];

    pgres.rows.forEach((row) => {
      if (row.dispatcher_id && row.carrier_id) {
        dispatchers.push(row.dispatcher_id);
        carriers.push(row.carrier_id);
      }
    });

    query = `SELECT ${paramsNeeded.carrier.join(
      ',',
    )}, ${paramsNeeded.dispatcher.join(',')}, ${paramsNeeded.lang.join(
      ',',
    )}, ${paramsNeeded.car.join(',')}, ${paramsNeeded.vehiclesAgg}
from carrier as ca
/* their dispatchers */ RIGHT JOIN dispatcher as di ON ca.carrier_id = di.carrier_id
/* their cars */ RIGHT JOIN dispatchervehicle as car ON di.dispatcher_id = car.dispatcher_id
/* their cars features */ LEFT JOIN dispatchervehiclefeature as cf ON car."dispatcherVehicle_id" = cf."dispatcherVehicle_id"
/* language */ LEFT JOIN language as lang ON di.language_id = lang.language_id
where 
/* carrier filter */ ca.carrier_id = ANY('{${carriers.join(',')}}'::int[]) 
/* dispatcher filter */ and di.dispatcher_id = ANY('{${dispatchers.join(
      ',',
    )}}'::int[])
and ca.deleted = false and di.deleted = false and (car.deleted = false or car.deleted is null) and (cf.deleted = false or cf.deleted is null)
GROUP BY ca.carrier_id, di.dispatcher_id, car."dispatcherVehicle_id", lang."languageCode"`;

    pgres = await pool.query(query);
    return pgres.rows;
  }

  if (searchType == 'commission') {
    let carriers = [],
      dispatchers = [],
      locationsWithdirections;

    let locationsSameDirection = `(distance(${locations.loading.lat}, ${locations.loading.lon}, lo.latitude, lo.longitude) <= '${locations.loading.radius}' and distance(${locations.discharge.lat}, ${locations.discharge.lon}, di.latitude, di.longitude) <= '${locations.discharge.radius}')`;
    let locationsOpositeDirection = `(distance(${locations.loading.lat}, ${locations.loading.lon}, di.latitude, di.longitude) <= '${locations.loading.radius}' and distance(${locations.discharge.lat}, ${locations.discharge.lon}, lo.latitude, lo.longitude) <= '${locations.discharge.radius}')`;

    if (!directions)
      locationsWithdirections = `${locationsSameDirection} or ${locationsOpositeDirection}`;
    if (directions) locationsWithdirections = locationsSameDirection;

    let query = `SELECT DISTINCT co.carrier_id, co.dispatcher_id
from commission as co 
JOIN commissionloading as cl on co.commission_id = cl.commission_id
JOIN loading as lo on lo.loading_id = cl.loading_id
JOIN commissiondischarge as cd on co.commission_id = cd.commission_id
JOIN discharge as di on cd.discharge_id = di.discharge_id
WHERE ${locationsWithdirections} 
and co.deleted = false and cd.deleted = false and cl.deleted = false and lo.deleted = false and di.deleted = false`;

    let pgres = await pool.query(query);

    if (pgres.rows.length == 0) return [];

    pgres.rows.forEach((row) => {
      if (row.dispatcher_id && row.carrier_id) {
        dispatchers.push(row.dispatcher_id);
        carriers.push(row.carrier_id);
      }
    });

    query = `SELECT ${paramsNeeded.carrier.join(
      ',',
    )}, ${paramsNeeded.dispatcher.join(',')}, ${paramsNeeded.lang.join(
      ',',
    )}, ${paramsNeeded.car.join(',')}, ${paramsNeeded.vehiclesAgg}
from carrier as ca
/* their dispatchers */ RIGHT JOIN dispatcher as di ON ca.carrier_id = di.carrier_id
/* their cars */ RIGHT JOIN dispatchervehicle as car ON di.dispatcher_id = car.dispatcher_id
/* their cars features */ LEFT JOIN dispatchervehiclefeature as cf ON car."dispatcherVehicle_id" = cf."dispatcherVehicle_id"
/* language */ LEFT JOIN language as lang ON di.language_id = lang.language_id
where 
/* carrier filter */ ca.carrier_id = ANY('{${carriers.join(',')}}'::int[]) 
/* dispatcher filter */ and di.dispatcher_id = ANY('{${dispatchers.join(
      ',',
    )}}'::int[])
and ca.deleted = false and di.deleted = false and (car.deleted = false or car.deleted is null) and (cf.deleted = false or cf.deleted is null) 
GROUP BY ca.carrier_id, di.dispatcher_id, car."dispatcherVehicle_id", lang."languageCode"`;

    pgres = await pool.query(query);
    return pgres.rows;
  }

  if (searchType == 'hq' || !searchType) {
    let query = `SELECT ${paramsNeeded.carrier.join(
      ',',
    )}, ${paramsNeeded.dispatcher.join(',')}, ${paramsNeeded.lang.join(',')}, 
${paramsNeeded.car.join(',')}, 
${paramsNeeded.vehiclesAgg}
from carrier as ca
/* their dispatchers */ RIGHT JOIN dispatcher as di ON ca.carrier_id = di.carrier_id
/* language */ LEFT JOIN language as lang ON di.language_id = lang.language_id
/* their cars */ RIGHT JOIN dispatchervehicle as car ON di.dispatcher_id = car.dispatcher_id
/* their cars features */ LEFT JOIN dispatchervehiclefeature as cf ON car."dispatcherVehicle_id" = cf."dispatcherVehicle_id"
/* distance */ where ((distance(${locations.discharge.lat}, ${
      locations.discharge.lon
    }, (place->'latitude')::int, (place->'longitude')::int) <= '${
      locations.discharge.radius
    }') or (distance(${locations.loading.lat}, ${
      locations.loading.lon
    }, (place->'latitude')::int, (place->'longitude')::int) <= '${
      locations.loading.radius
    }'))
and ca.deleted = false and di.deleted = false and (car.deleted = false or car.deleted is null) and (cf.deleted = false or cf.deleted is null)
GROUP BY ca.carrier_id, di.dispatcher_id, car."dispatcherVehicle_id", lang."languageCode"`;

    let pgres = await pool.query(query);
    return pgres.rows;
  }
};

exports.getCommissionBy = getCommissionBy;
exports.commissionGetNumber = getNumber;
exports.validateCommission = validate;
exports.validateParams = validateParams;
exports.validateDispatecherSearch = validateDispatecherSearch;
exports.getCommission = get;
exports.saveCommission = save;
exports.updateCommission = update;
exports.deleteCommission = remove;
exports.commissionFulltextSearch = fultextSearch;
exports.dispatcherSearch = dispatcherSearch;
