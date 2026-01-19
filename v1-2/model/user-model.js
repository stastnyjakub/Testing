const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const pool = require("../startup/db");
const bcrypt = require("bcryptjs");

//validation
const validate = user => {
  const schema = Joi.object({
    user_id: Joi.number()
      .min(1)
      .max(2147483647),
    number: Joi.number()
      .min(1)
      .max(2147483647)
      .required()
      .messages({
        "any.required": `Je nutné zadat číslo.`
      }),
    email: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné zadat email.`
      }),
    emailPassword: Joi.string().allow(null, ""),
    password: Joi.string().allow(null, ""),
    jobTitle: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné zadat práci.`
      }),
    mobilePhone: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné zadat číslo.`
      }),
    name: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné zadat jméno.`
      }),
    surname: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné zadat příjmení.`
      }),
    username: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné zadat uživatelské jméno.`
      }),
    deleted: Joi.boolean()
  });
  return schema.validate(user);
};

const validateParams = params => {
  const schema = Joi.object({
    id: Joi.number()
      .min(1)
      .max(2147483647)
  });
  return schema.validate(params);
};

/**
 * Generatas Json Web Token for user
 * @param {integer} id id of user
 * @param {string} email email of user
 * @returns JWT
 */
const generateAuthToken = user => {
  const expiresIn = process.env.QLJWTEXPIRESIN || "15m"
  if (process.env.QLSTATE == "testing" || "testing-heroku") {
    (id = 1), (email = "miroslav.sirina@koala42.com");
    number = "777 932 681";
    user_id = 0;
    number = 0;
    emailPassword = "heslo";
    mobilePhone = "777 932 681";
    jobTitle = "vývojář";
    name = "Miroslav";
    surname = "Šiřina";
    username = "miroslav.sirina";
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      number: user.number,
      emailPassword: user.emailPassword,
      mobilePhone: user.mobilePhone,
      jobTitle: user.jobTitle,
      name: user.name,
      surname: user.surname,
      username: user.username
    },
    process.env.QLJWTPRIVATEKEY,
    { expiresIn }
  );

  return token;
};

/**
 * Generates JWT refresh token for user
 * @param {object} user user object
 * @returns JWT refresh token
 */
const generateRefreshToken = user => {
  const refreshExpiration = process.env.QLJWTREFRESHEXPIRESIN || "14d"
  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      number: user.number,
      emailPassword: user.emailPassword,
      mobilePhone: user.mobilePhone,
      jobTitle: user.jobTitle,
      name: user.name,
      surname: user.surname,
      username: user.username
    },
    process.env.QLJWTREFRESHKEY,
    { expiresIn: refreshExpiration }
  );
  return token;
};

/**
 * Get all users from carrier
 * @param {integer} user_id ID usera
 * @returns {array} array of all users
 */

const get = async (user_id = false) => {
  let query;

  if (user_id === false) {
    query = {
      text:
        'SELECT user_id, number, email, "emailPassword", "jobTitle", "mobilePhone", name, surname, username, role from "users" where deleted = false'
    };
  } else {
    query = {
      text:
        'SELECT user_id, number, email, "emailPassword", "jobTitle", "mobilePhone", name, surname, username, deleted, role from "users" where user_id=$1',
      values: [user_id]
    };
  }

  try {
    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Save users data
 * @param {object} data object with user data
 * @returns object or error
 */

const save = async data => {
  const salt = await bcrypt.genSalt(10);
  data.password = await bcrypt.hash(data.password, salt);

  counter = 1;
  const query = {
    text: `INSERT INTO "users" (${Object.keys(data)
      .map(d => `"${d}"`)
      .join(",")}) values (${Object.values(data)
      .map(d => `$${counter++}`)
      .join(
        ","
      )}) RETURNING user_id, number, email, "emailPassword", "jobTitle", "mobilePhone", name, surname, username`,
    values: Object.values(data)
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const update = async (id = "", data) => {
  if (id == "") id = data.user_id;
  let query = {
    text: `SELECT user from users where user_id = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return { error_code: 404, error_message: "Requested user was not found" };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }

  let counter = 1;
  let updateQuery = "update users set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "user_id" = '${id}' RETURNING  user_id, number, email, "emailPassword", "jobTitle", "mobilePhone", name, surname, username`;

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
 * Removes user
 * @param {integer} id id of user to be removed
 * @returns user object of removed user
 */
const remove = async id => {
  let query = {
    text: 'SELECT user_id,deleted from "users" where user_id=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return { error_code: 404, error_message: "Requested user was not found" };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested user was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE users set "deleted" = true where user_id=$1 RETURNING  user_id, number, email, "emailPassword", "jobTitle", "mobilePhone", name, surname, username',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.deleteUser = remove;
exports.saveUser = save;
exports.getUser = get;
exports.updateUser = update;
exports.validateUser = validate;
exports.validateParams = validateParams;
exports.generateAuthToken = generateAuthToken;
exports.generateRefreshToken = generateRefreshToken;
