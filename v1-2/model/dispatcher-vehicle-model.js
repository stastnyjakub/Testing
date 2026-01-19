const Joi = require("@hapi/joi");
const { query } = require("../startup/db");
const pool = require("../startup/db");

//validation
const validate = dispatcher_vehicle => {
  const schema = Joi.object({
    dispatcherVehicle_id: Joi.number()
      .min(1)
      .max(2147483647),
    dispatcher_id: Joi.number()
      .min(1)
      .max(2147483647)
      .allow(null, ""),
    vehicleType_id: Joi.number()
      .min(1)
      .max(2147483647)
      .allow(null, ""),
    maxHeight: Joi.number()
      .min(1)
      .max(2147483647)
      .allow(null, ""),
    maxLength: Joi.number()
      .min(1)
      .max(2147483647)
      .allow(null, ""),
    maxWeight: Joi.number()
      .min(1)
      .max(2147483647)
      .allow(null, ""),
    carrier_id: Joi.number()
      .min(1)
      .max(2147483647),
    deleted: Joi.boolean()
  });
  return schema.validate(dispatcher_vehicle);
};

const validateParams = params => {
  const schema = Joi.object({
    id: Joi.number()
      .min(1)
      .max(2147483647),
    ordering: Joi.string()
      .allow(null, "")
      .valid("asc", "desc", ""),
    order_by: Joi.alternatives().try(
      Joi.string().allow(null, ""),
      Joi.number()
    ),
    limit: Joi.number(),
    after: Joi.number(),
    token: Joi.string().pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  });
  return schema.validate(params);
};

const validateDispatcherVehicleBody = dispatcher_vehicle => {
  const schema = Joi.object({
    all: Joi.array().min(1).items(
      Joi.object({
        dispatcher: Joi.object({
          dispatcher_id: Joi.number().min(1).max(2147483647),
          firstName: Joi.string(),
          lastName: Joi.string(),
          email: Joi.string(),
          phone: Joi.string(),
          language_id: Joi.number().min(1).max(2147483647),
        }),
        dispatcherVehicle_id: Joi.number().min(1).max(2147483647),
        dispatcher_id: Joi.number().min(1).max(2147483647),
        carrier_id: Joi.number().min(1).max(2147483647).required(),
        vehicleType_id: Joi.number().min(1).max(4).required(),
        maxHeight: Joi.number().min(1).max(2147483647).allow(null, ''),
        maxLength: Joi.number().min(1).max(2147483647).allow(null, ''),
        maxWeight: Joi.number().min(1).max(2147483647).allow(null, ''),
        vehicleFeature_ids: Joi.array().min(1).items(Joi.object({
          feature_id: Joi.number().min(1).max(16).required(),
        })),
        deleted: Joi.boolean(),
      }),
    ),
    token: Joi.string(),
    features: Joi.object({
      existingFeatures: Joi.array().items(Joi.object({
        dispatcher: Joi.object({
          firstName: Joi.string(),
          lastName: Joi.string(),
          email: Joi.string(),
          phone: Joi.string(),
          language_id: Joi.number().min(1).max(2147483647),
        }),
        dispatcher_id: Joi.number().min(1).max(2147483647),
        vehicleType_id: Joi.number().min(1).max(4),
        dispatcherVehicleFeature_id: Joi.number().min(1).max(2147483647).required(),
        vehicleFeature_id: Joi.number().min(1).max(16).required(),
        dispatcherVehicle_id: Joi.number().min(1).max(2147483647),
        deleted: Joi.boolean(),
      })),
      newFeatures:  Joi.array().min(1).items(Joi.object({
        dispatcher: Joi.object({
          firstName: Joi.string(),
          lastName: Joi.string(),
          email: Joi.string(),
          phone: Joi.string(),
          language_id: Joi.number().min(1).max(2147483647),
        }),
        dispatcher_id: Joi.number().min(1).max(2147483647),
        vehicleType_id: Joi.number().min(1).max(4),
        vehicleFeature_id: Joi.number().min(1).max(16).required(),
        dispatcherVehicle_id: Joi.number().min(1).max(2147483647),
        deleted: Joi.boolean(),
      })),
    }),
    vehicles: Joi.array().items(Joi.object({
      vehicleType_id: Joi.number().min(1).max(4).required(),
      maxHeight: Joi.number().min(1).max(2147483647).allow(null, ''),
      maxLength: Joi.number().min(1).max(2147483647).allow(null, ''),
      maxWeight: Joi.number().min(1).max(2147483647).allow(null, ''),
      dispatcherVehicle_id: Joi.number().min(1).max(2147483647).allow(null, ''),
    }))
  });
  return schema.validate(dispatcher_vehicle);
};

/**
 * Returns all dispatcherVehicles
 * @param {integer} id dispatcherVehicle id, '' for all dispatcherVehicles
 * @param {dispatcher_id} dispatcher_id dispatchers id
 * @returns dispatcherVehicles object or error
 */
const get = async (id = false, dispatcher_id = false) => {
  if (id == "all") {
    let query = `SELECT * from dispatchervehicle where deleted = false order by "dispatcherVehicle_id" DESC`;
    try {
      pgres = await pool.query(query);
      return pgres.rows;
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  } else if (dispatcher_id) {
    let query = {
      text: 'SELECT * from "dispatchervehicle" where "dispatcher_id"=$1',
      values: [customer_id]
    };

    try {
      pgres = await pool.query(query);
      return pgres.rows;
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  } else {
    let query = {
      text: 'SELECT * from "dispatchervehicle" where "dispatcherVehicle_id"=$1',
      values: [id]
    };

    try {
      pgres = await pool.query(query);
      return pgres.rows[0];
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  }
};

const getDispatcherVehicleType = async () => {
  let query = {
    text: 'SELECT * FROM "vehicletype"'
  };
  try {
    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const getByCarrier = async (id = false, dispatcher_id = false) => {
  if (id == "all") {
    // TODO
  } else if (dispatcher_id) {
    // TODO
  } else {
    let query = {
      // text: 'SELECT * from "dispatchervehicle" NATURAL JOIN (SELECT "dispatcher_id" FROM "dispatcher" WHERE "carrier_id" = $1) AS ds',
      // text: 'SELECT * from "dispatchervehiclefeature" NATURAL JOIN ' +
      // '(SELECT * from "dispatchervehicle" NATURAL JOIN (SELECT "dispatcher_id" FROM "dispatcher" WHERE "carrier_id" = $1) AS ds) AS cv',
      // text:
      //   'SELECT * FROM (SELECT * from "dispatchervehicle" NATURAL JOIN (SELECT "dispatcher_id" FROM "dispatcher" WHERE "carrier_id" = $1) AS ds) AS cv ' +
      //   'LEFT JOIN "dispatchervehiclefeature" ON cv."dispatcherVehicle_id" = "dispatchervehiclefeature"."dispatcherVehicle_id" where "dispatchervehiclefeature".deleted = false',
      // text: 'SELECT * FROM (SELECT * from "dispatchervehicle" NATURAL JOIN (SELECT "dispatcher_id" FROM "dispatcher" WHERE "carrier_id" = $1) AS ds) AS cv ' +
      // 'LEFT JOIN "dispatchervehiclefeature" ON cv."dispatcherVehicle_id" = "dispatchervehiclefeature"."dispatcherVehicle_id" where ' +
      // '"dispatchervehiclefeature"."dispatcherVehicle_id" IS NULL OR "dispatchervehiclefeature".deleted = false',
      text:
        // 'SELECT cv.*, "dispatchervehiclefeature"."dispatcherVehicleFeature_id", "dispatchervehiclefeature"."vehicleFeature_id" FROM ' +
        // '(SELECT * from "dispatchervehicle" NATURAL JOIN (SELECT "dispatcher_id" FROM "dispatcher" WHERE "carrier_id" = $1) AS ds WHERE deleted = false) AS cv ' +
        // 'LEFT JOIN "dispatchervehiclefeature" ON cv."dispatcherVehicle_id" = "dispatchervehiclefeature"."dispatcherVehicle_id" where ' +
        // '"dispatchervehiclefeature"."dispatcherVehicle_id" IS NULL OR "dispatchervehiclefeature".deleted = false',

        // 'SELECT cv.*, "dispatchervehiclefeature"."dispatcherVehicleFeature_id", "dispatchervehiclefeature"."vehicleFeature_id" FROM ' +
        // '(SELECT * from "dispatchervehicle" WHERE deleted = false AND "carrier_id" = $1) AS cv ' +
        // 'LEFT JOIN "dispatchervehiclefeature" ON cv."dispatcherVehicle_id" = "dispatchervehiclefeature"."dispatcherVehicle_id" where ' +
        // '"dispatchervehiclefeature"."dispatcherVehicle_id" IS NULL OR "dispatchervehiclefeature".deleted = false',
        'SELECT a.*, b."dispatcherVehicleFeature_id", b."vehicleFeature_id" FROM ' +
        '(SELECT * FROM "dispatchervehicle" WHERE deleted = false AND "carrier_id" = $1) AS a LEFT JOIN ' +
        '(SELECT * FROM "dispatchervehiclefeature" WHERE deleted = false) as b ' +
        'ON a."dispatcherVehicle_id" = b."dispatcherVehicle_id"',
      values: [id]
    };
    try {
      pgres = await pool.query(query);
      // console.log(pgres)
      // return pgres.rows[0];
      return pgres.rows;
      //return (pgres.rows[0]) ? pgres.rows[0] : [];
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  }
};

/**
 * Save dispatchervehicle
 * @param {objec} data dispatchervehicle data object
 * @returns dispatchervehicle object or error
 */
const save = async data => {
  let counter = 1;
  const query = {
    text: `INSERT INTO dispatchervehicle (${Object.keys(data)
      .map(d => `"${d}"`)
      .join(",")}) values (${Object.values(data)
      .map(d => `$${counter++}`)
      .join(",")}) RETURNING *`,
    values: Object.values(data)
  };
  try {
    let pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const update = async (id = false, data) => {
  if (!id) id = data.dispatcherVehicle_id;

  let query = {
    text: `SELECT "dispatcherVehicle_id" from dispatchervehicle where "dispatcherVehicle_id" = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested dispatcherVehicle was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update dispatchervehicle set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "dispatcherVehicle_id" = '${id}' RETURNING *`;

  query = {
    text: updateQuery,
    values: Object.values(data)
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Removes dispetchervehicle
 * @param {integer} id id of dispatchervehicle to be removed
 * @returns dispetchervehicle object of removed dispetchervehicle
 */
const remove = async id => {
  let query = {
    text: `SELECT "dispatcherVehicle_id" from dispatchervehicle where "dispatcherVehicle_id" = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested dispatcher vehicle was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested dispatcher vehicle was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE dispatchervehicle set "deleted" = true where "dispatcherVehicle_id" = $1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const saveWithFeatures = async data => {
  const client = await pool.connect();
  try{
    await client.query('BEGIN');
    let rows = [];
    for (const d of data) {
      let counter = 1;
      const features = d.dispatcherVehicleFeature;
      delete d.dispatcherVehicleFeature;
      // dispatcher vehicle
      const query = {
        text: `INSERT INTO dispatchervehicle (${Object.keys(d)
          .map(d => `"${d}"`)
          .join(",")}) values (${Object.values(d)
          .map(d => `$${counter++}`)
          .join(",")}) RETURNING *`,
        values: Object.values(d)
      };
      const pgres = await client.query(query);
      pgres.rows[0].vehicleFeatures =[];
      rows.push(pgres.rows[0]);
      if(features){
        for (const f of features) {
          f.dispatcherVehicle_id = pgres.rows[0].dispatcherVehicle_id;
          f.vehicleFeature_id = f.feature_id;
          delete f.feature_id;
          let counter = 1;
          const query = {
            text: `INSERT INTO dispatchervehiclefeature (${Object.keys(f)
              .map(d => `"${d}"`)
              .join(",")}) values (${Object.values(f)
              .map(d => `$${counter++}`)
              .join(",")}) RETURNING *`,
            values: Object.values(f)
          };
          const pgresFeature = await client.query(query);
          rows[rows.length - 1].vehicleFeatures.push(pgresFeature.rows[0]);
        };
      };
    };
    await client.query('COMMIT');
    return rows;
  } catch (error) {
    await client.query('ROLLBACK');
    return { error_code: 500, error_message: error.stack };
  } finally { 
    client.release()
  }
};

const updateWithFeatures = async (data, features) => {
  const client = await pool.connect();
  try{
    await client.query('BEGIN');
    const rows = [];
    for (const d of data) {
      let id = d.dispatcherVehicle_id;
      delete d.dispatcherVehicleFeature;
      if(d.deleted == null) delete d.deleted
      let query;
      let counter = 1;
      let updateQuery = "update dispatchervehicle set";
      for (const [key, value] of Object.entries(d)) {
        updateQuery += `"${key}"=$${counter++},`;
      }
      updateQuery = ` ${updateQuery.replace(
        /.$/,
        ""
      )} where "dispatcherVehicle_id" = '${id}' RETURNING *`;

      query = {
        text: updateQuery,
        values: Object.values(d)
      };
      const pgres = await client.query(query);
      pgres.rows[0].vehicleFeatures = [];
      rows.push(pgres.rows[0]);

      // Existing features
      if(features.existingFeatures){
        for (const f of features.existingFeatures) {
          if (f.dispatcherVehicle_id != id) {
            continue;
          }
          const dispatcherVehicleFeature = await client.query(`SELECT * from dispatchervehiclefeature where "dispatcherVehicleFeature_id" = ${f.dispatcherVehicleFeature_id}`);
          if(dispatcherVehicleFeature.rows.length === 0){
            throw new Error(`DispatcherVehicleFeature s touto ID neexistuje.`);
          } else if (dispatcherVehicleFeature.rows[0].dispatcherVehicle_id != id) {
            throw new Error('DispatcherVehicleFeature s touto ID nemůžete upravovat.');
          }
          delete f.dispatcher;
          delete f.dispatcher_id;
          delete f.vehicleType_id;
          /* Could be remove with SQL DELETE  */
          if (f.vehicleFeature_id === null || f.vehicleFeature_id === undefined) {
            f.deleted = true;
          }
          if (f.deleted) {
            f.dispatcherVehicle_id = null;
          }
          let counter = 1;
          let updateQuery = "update dispatchervehiclefeature set";
          for (const [key, value] of Object.entries(f)) {
            updateQuery += `"${key}"=$${counter++},`;
          }
          updateQuery = ` ${updateQuery.replace(
            /.$/,
            ""
          )} where "dispatcherVehicleFeature_id" = '${
            f.dispatcherVehicleFeature_id
          }' RETURNING *`;
  
          query = {
            text: updateQuery,
            values: Object.values(f)
          };
          const pgresExistingFeature = await client.query(query);
          rows[rows.length - 1].vehicleFeatures.push(pgresExistingFeature.rows[0]);
        };
      }
      // New features
      if(features.newFeatures){
        for (const f of features.newFeatures) {
          if (f.dispatcherVehicle_id != pgres.rows[0].dispatcherVehicle_id) {
            continue;
          }
          delete f.dispatcher;
          delete f.dispatcher_id;
          delete f.vehicleType_id;
          delete f.dispatcherVehicleFeature_id;
          let counter = 1;
          const query = {
            text: `INSERT INTO dispatchervehiclefeature (${Object.keys(f)
              .map(d => `"${d}"`)
              .join(",")}) values (${Object.values(f)
              .map(d => `$${counter++}`)
              .join(",")}) RETURNING *`,
            values: Object.values(f)
          };
  
          let pgresNewFeatures = await client.query(query);
          rows[rows.length - 1].vehicleFeatures.push(pgresNewFeatures.rows[0]);
        };
      }
      
    };
    await client.query('COMMIT');
    return rows;
  } catch (error) {
    await client.query('ROLLBACK');
    return { error_code: 500, error_message: error.stack };
  } finally {
    client.release()
  }
};

exports.validateDispatcherVehicle = validate;
exports.validateDispatcherVehicleBody = validateDispatcherVehicleBody;
exports.validateParams = validateParams;
exports.getDispatcherVehicle = get;
exports.getCarrierVehicle = getByCarrier;
exports.saveDispatcherVehicle = save;
exports.updateDispatcherVehicle = update;
exports.deleteDispatcherVehicle = remove;
exports.getDispatcherVehicleType = getDispatcherVehicleType;
exports.saveWithFeatures = saveWithFeatures;
exports.updateWithFeatures = updateWithFeatures;