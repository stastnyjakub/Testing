const pool = require('../startup/db');

async function getCommission() {
  const find = `SELECT commission_id, vat FROM commission where vat <> ''`;

  try {
    let pgres = await pool.query(find);
    return pgres.rows;
  } catch (err) {
    console.log(err.message);
  }
}

async function run() {
  const commissions = await getCommission();

  for await (const { commission_id: id, vat: num } of commissions) {
    const invoiceNumber = parseInt(num, 10);

    if (!isNaN(invoiceNumber)) {
      const update = `UPDATE "invoice" SET "invoiceNumber" = '${invoiceNumber}' where commission_id = '${id}'`;

      try {
        await pool.query(update);
        console.warn(id, 'updated');
      } catch (err) {
        console.error(err.message);
        console.error('Update failed');
        return;
      }
    }
  }
  console.log('Update was successful');
}

run();
