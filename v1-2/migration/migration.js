const query = require("./db_template");
const pool = require("../startup/db");

const makeDatabaseStructure = async () => {
  //console.log(query);
  try {
    await pool.query(query);
    console.log("Database structure was made");
  } catch (err) {
    console.log(err.message);
  }
};

makeDatabaseStructure();
