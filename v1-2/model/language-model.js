const pool = require('../startup/db');

/**
 * Get all states language codes
 * @returns array of language codes
 */
const getStatesLanguages = async () => {
  pgres = await pool.query(`select st."countryCode" as countryCode, array_agg(la."languageCode") as languageCodes from languagestate as ls
    join state as st on ls.state_id = st.state_id
    join language as la on ls.language_id = la.language_id
    group by st."countryCode";`);
  return pgres.rows;
};

exports.getStatesLanguages = getStatesLanguages;
