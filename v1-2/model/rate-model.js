const Joi = require('@hapi/joi');
const pool = require('../startup/db');
const axios = require('axios').default;

const validate = (rate) => {
  const schema = Joi.object({
    rate_id: Joi.number(),
    date: Joi.date().required(),
    rates: Joi.object().required(),
    base: Joi.string().allow(null, '').required().valid('EUR'),
    success: Joi.boolean().required(),
    timestamp: Joi.number(),
  });
  return schema.validate(rate);
};

const get = async () => {
  let rates;

  const query = `SELECT * from "rate" where base = 'EUR' limit 1`;
  try {
    pgres = await pool.query(query);
    rates = pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  if (rates.timestamp * 1000 > Date.now() - 2 * 60 * 60 * 1000) return rates;

  rates = await fetch();

  if (rates.status !== 200)
    return {
      error_code: rates.status,
      error_message: 'cannot fetch exchange rates',
    };

  res = await update(rates.data);
  return res;
};

const update = async (data) => {
  data.rates = JSON.stringify(data.rates) || undefined;

  let counter = 1;
  let updateQuery = 'update rate set';
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(/.$/, '')}  where base = '${
    data.base
  }' RETURNING *`;

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

const fetch = async () => {
  let rate = axios.get(
    `http://data.fixer.io/api/latest?access_key=${process.env.QLRATESKEY}`,
  );
  return rate;
};

const getCZKrates = async (date) => {
  // utc offset
  let parsedDate = new Date(date + 7200000);
  parsedDate = parsedDate.toLocaleString('cs-CZ', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const parsedDateArr = parsedDate.replaceAll('.', '').split(' ');

  // because of utc offset
  const parsedDbDateStr = `${parsedDateArr[2]}-${parsedDateArr[1]}-${parsedDateArr[0]} 02:00:00`;

  // fetch from db
  try {
    let query = `SELECT rates from rate where date = '${parsedDbDateStr}' limit 1`;
    let pgres = await pool.query(query);

    if (pgres.rows.length > 0) return { ...pgres.rows[0], source: 'db' };

    const rates = await fetchRatesFromCnb(parsedDateArr);

    query = `INSERT INTO "rate" ("date", "rates", "base", "success", "timestamp")
    VALUES ('${parsedDbDateStr}', '${JSON.stringify(
      rates,
    )}', 'CZK', 't', '${date}') RETURNING *`;
    pgres = await pool.query(query);
    return { ...pgres.rows[0], source: 'api' };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const fetchRatesFromCnb = async (dateArr) => {
  let rates = await axios.get(
    `https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt;jsessionid=1?date=${dateArr[0]}.${dateArr[1]}.${dateArr[2]}`,
  );

  return parseCNBresponse(rates.data);
};

const parseCNBresponse = (rates) => {
  ratesArr = rates.split(/\r?\n/);
  let res = {};

  for (let i = 0; i < ratesArr.length - 1; i++) {
    if (i < 2) continue;
    const rate = ratesArr[i].split('|');
    if (rate[0].trim() === '') continue;
    res[rate[3].trim()] = Number(rate[4].replace(',', '.')) / Number(rate[2]);
  }

  return res;
};

exports.getCZKrates = getCZKrates;
exports.fetchRatesFromCnb = fetchRatesFromCnb;
exports.parseCNBresponse = parseCNBresponse;
exports.getRates = get;
exports.updateRates = update;
exports.validateRate = validate;
