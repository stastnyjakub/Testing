const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = dispatcher_vehicle => {
  const schema = Joi.object({
    dispatcherVehicleFeature_id: Joi.number()
      .min(1)
      .max(2147483647),
    dispatcherVehicle_id: Joi.number()
      .min(1)
      .max(2147483647),
    vehicleFeature_id: Joi.number()
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
    after: Joi.number()
  });
  return schema.validate(params);
};

/**
 * Returns all dispatcherVehicleFeatures
 * @param {integer} id dispatcherVehicleFeature id, '' for all dispatcherVehicleFeatures
 * @param {dispatcher_id} dispatcherVehicle_id dispatchervehicles id
 * @returns dispatcherVehicles object or error
 */
const get = async (id = false, dispatcherVehicle_id = false) => {
  if (id == "all") {
    let query = `SELECT * from dispatchervehiclefeature where deleted = false order by "dispatcherVehicleFeature_id" DESC`;
    try {
      pgres = await pool.query(query);
      return pgres.rows;
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  } else if (dispatcherVehicle_id) {
    let query = {
      text:
        'SELECT * from "dispatchervehiclefeature" where "dispatcherVehicle_id"=$1 and where deleted = false',
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
      text:
      'SELECT * from dispatchervehiclefeature where "dispatcherVehicleFeature_id"=$1 and deleted=false;',
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

const getDispatcherVehicleTypeFeature = async () => {
  let query = {
    text: 'SELECT * FROM "vehiclefeature" NATURAL JOIN "vehicletypefeature"'
  };
  try {
    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Save dispatchervehiclefeature
 * @param {objec} data dispatchervehiclefeature data object
 * @returns dispatchervehiclefeature object or error
 */
const save = async data => {
  let counter = 1;
  const query = {
    text: `INSERT INTO dispatchervehiclefeature (${Object.keys(data)
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
  if (!id) id = data.dispatcherVehicleFeature_id;

  let query = {
    text: `SELECT "dispatcherVehicleFeature_id" from dispatchervehiclefeature where "dispatcherVehicleFeature_id" = $1`,
    values: [id]
  };
  // let query = {
  //   text: `SELECT "dispatcherVehicleFeature_id" from dispatchervehiclefeature where "vehicleFeature_id" = $1 and "dispatcherVehicle_id" = $2`,
  //   values: [ data.vehicleFeature_id, data.dispatcherVehicle_id ]
  // };
  // console.log(query);

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested dispatcherVehicleFeature was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update dispatchervehiclefeature set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "dispatcherVehicleFeature_id" = '${id}' RETURNING *`;

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
    text: `SELECT "dispatcherVehicleFeature_id" from dispatchervehiclefeature where "dispatcherVehicleFeature_id" = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested dispatcher vehicle feature was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message:
          "Requested dispatcher vehicle feature was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE dispatchervehiclefeature set "deleted" = true where "dispatcherVehicleFeature_id" = $1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateDispatcherVehicleFeature = validate;
exports.validateParams = validateParams;
exports.getDispatcherVehicleFeature = get;
exports.getDispatcherVehicleTypeFeature = getDispatcherVehicleTypeFeature;
exports.saveDispatcherVehicleFeature = save;
exports.updateDispatcherVehicleFeature = update;
exports.deleteDispatcherVehicleFeature = remove;
