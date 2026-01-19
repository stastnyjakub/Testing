const { Pool } = require("pg");
require("dotenv/config")

module.exports = new Pool({
  host: process.env.QLPGHOST || 'localhost',
  database: process.env.QLPGDATABASE || 'qapline', // Create at step 3
  password: process.env.QLPGPASSWORD || 'postgres',
  user: process.env.QLPGUSER || 'postgres',
  port: process.env.QLPGPORT || 5432,
  connector: "postgresql",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
