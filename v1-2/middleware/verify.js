const pool = require("../startup/db");
module.exports = async function(req, res, next) {
  const { token } = req.params.token ? req.params : req.body;

  if (!token) return res.status(401).send("Přístup odepřen.");
  const query = {
    text: `SELECT dispatcher_id, carrier_id from dispatcher where token::text = $1`,
    values: [token]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length !== 1) throw "Dispačer nebyl nalezen";
    req.dispatcher_id = pgres.rows[0].dispatcher_id;
    req.carrier_id = pgres.rows[0].carrier_id;
    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};
