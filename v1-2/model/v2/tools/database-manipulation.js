const pool = require('../../../startup/db');

// napsat selector
// nahradit ve findOne select selector
// co potrebuju
// response parameters
// table name
// filters
// filters like strapi https://strapi.io/documentation/developer-docs/latest/developer-resources/content-api/content-api.html#filters

// sort GET /users?_sort=email:ASC
// limit GET /users?_limit=30
// limit with start GET /users?_start=10&_limit=10

// Filter	Description implementation
// No suffix or eq	- Equal - yes
// ne	- Not equal - yes
// lt	- Less than - yes
// gt	- Greater than - yes
// lte - Less than or equal to - no
// gte - Greater than or equal to - no
// in - Included in an array - no
// nin - Not included in an array - no
// contains	- Contains - no
// ncontains - Doesn't contain - no
// containss - Contains, case sensitive - no
// ncontainss - Doesn't contain, case sensitive - no
// null	- Is null or not null - no
// Examples:
// GET /restaurants?price_gte=3

/**
 * Select including filters
 * @param {array} responseParams
 * @param {string} table
 * @param {object} filters
 * @param {object} search
 * @param {bool} returnLen
 * @returns array
 */
const selector = async (
  responseParams = [],
  table,
  filters,
  search,
  returnLen = false,
) => {
  let query,
    searchTerm = '',
    order = '',
    limit = '',
    values = [],
    keys = [];
  hasNullOperator = false;

  const suffixes = {
    eq: '=',
    gt: '>',
    lt: '<',
    ne: '<>',
    null: 'IS',
  };

  responseParams =
    responseParams.length === 0
      ? '*'
      : responseParams.map((param) => `"${param}"`).join(',');

  if (filters._sort) {
    let parts = filters._sort.split(':');
    if (parts.length === 1) parts.push('DESC');
    order = `order by "${parts[0]}" ${parts[1]}`;
  }

  if (filters._limit) {
    limit = ` limit ${filters._limit}${
      filters._start ? ` OFFSET ${filters._start}` : ''
    }`;
  }

  let counter = 1;
  for (const [key, value] of Object.entries(filters)) {
    if (
      key == '_sort' ||
      key == '_limit' ||
      key == '_start' ||
      key == '_search'
    )
      continue;
    const keyParts = key.split('_');
    const len = keyParts.length;

    let operator = suffixes[keyParts[len - 1]] ?? '=';

    if (operator != suffixes.null) values.push(value);

    if (suffixes[keyParts[len - 1]]) {
      // because of search without case sensitivity
      if (operator === suffixes.null) {
        hasNullOperator = true;
        if (value === 'true')
          keys.push(
            `"${keyParts.slice(0, len - 1).join('_')}" ${operator} NULL`,
          );
        if (value === 'false')
          keys.push(
            `"${keyParts.slice(0, len - 1).join('_')}" ${operator} NOT NULL`,
          );
        continue;
      }

      if (operator === '=' && Object.is(parseInt(value), NaN)) operator = '~*';
      keys.push(
        `"${keyParts.slice(0, len - 1).join('_')}" ${operator} $${counter}`,
      );
    } else {
      // because of search without case sensitivity
      if (Object.is(parseInt(value), NaN)) operator = '~*';
      keys.push(`"${key}" ${operator} $${counter}`);
    }
    ++counter;
  }

  if (search) {
    values.push(`%${search.value}%`);
    if (values.length > 1 || hasNullOperator) searchTerm += ' AND';
    searchTerm += '(';
    for (let i = 0; i < search.query.length; i++) {
      if (i === 0) searchTerm += `${search.query[i]} $${values.length}`;
      if (i !== 0) searchTerm += ` or ${search.query[i]} $${values.length}`;
    }
    searchTerm += ')';
  }

  query = {
    text: `SELECT ${responseParams} from ${table}${
      values.length == 0 && !hasNullOperator ? ' ' : ' where '
    }${keys.join(' and ')}${searchTerm} ${order} ${limit}`,
    values: values.filter((v) => v !== ''),
  };

  try {
    pgres = await pool.query(query);
    if (!returnLen) return pgres.rows;

    const entriesCount = {
      text: `SELECT count(*) from ${table}${
        values.length == 0 && !hasNullOperator ? ' ' : ' where '
      }${keys.join(' and ')}${searchTerm}`,
      values: values.filter((v) => v !== ''),
    };

    const num = await pool.query(entriesCount);
    return { data: pgres.rows, len: num.rows[0].count };
  } catch (error) {
    return { error_message: error.stack };
  }
};

/**
 * Updates database table
 * @param {number} id
 * @param {string} table
 * @param {object} data
 * @param {array} responseParams parameters to return
 * @returns promise to object
 */
const updator = async (id, table, data, responseParams = []) => {
  let counter = 1;
  let updateQuery = `update "${table}" set`;
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    '',
  )} where "${table}_id" = '${id}' RETURNING ${
    responseParams.length === 0
      ? `*`
      : responseParams.map((param) => `"${param}"`).join(',')
  }`;

  query = {
    text: updateQuery,
    values: Object.values(data),
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_message: error.stack + table };
  }
};

/**
 * Check if record with id exist in table
 * @param {number} id
 * @param {string} table
 * @returns bool
 */
const exist = async (id, table) => {
  try {
    pgres = await pool.query({
      text: `SELECT "${table}_id" from "${table}" where "${table}_id" = $1`,
      values: [id],
    });

    if (pgres.rows.length === 0) return false;
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { updator, exist, selector };
