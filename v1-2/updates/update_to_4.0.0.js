const pool = require("../startup/db");

async function getCommissionDate() {
  const find = "SELECT * FROM commission";

  try {
    let pgres = await pool.query(find);
    return pgres.rows;
  } catch (err) {
    console.log(err.message);
  }
}

async function saveData(invoices) {
  for await (const item of invoices) {
    let query = `INSERT INTO "invoice" (${Object.keys(item)
      .map(d => `"${d}"`)
      .join(",")}) values (${Object.values(item)
      .map(d => `'${d}'`)
      .join(",")}) RETURNING "invoice_id"`;

    try {
      res = await pool.query(query);
    } catch (error) {
      console.error("Error executing query", query, error.stack);
    }
  }
}

async function start() {
  const commissions = await getCommissionDate();

  const invoices = [];

  if (commissions && commissions.length) {
    for await (const commission of commissions) {
      invoices.push({
        commission_id: commission.commission_id
      });
    }
  }

  await saveData(invoices);
}

start();
