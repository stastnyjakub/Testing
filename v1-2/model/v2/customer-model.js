const pool = require("../../startup/db");
const { find: findCustomerContact } = require("./customer-contact-model");


// přepsat na selektor
const findOne = async (id, params, relations) => {

    let query = {
        text: `SELECT ${params.map((param) => `"${param}"`).join(",")} from "customer" where customer_id=$1`,
        values: [id]
    };

    try {
        pgres = await pool.query(query);
        customer = pgres.rows[0];

        if (relations?.customerContact) customer.customerContact = await findCustomerContact(['email'], { customer_id: {
            condition: "",
            operator: "=",
            value: customer.customer_id,
          }});
        

        return customer;
    } catch (error) {
        return { error_code: 404, error_message: error.stack };
    }
};

module.exports = { findOne };