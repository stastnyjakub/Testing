const pool = require("../../startup/db");

// přepsat na selektor
const find = async (params, filters, order = false, limit = false) => {
    let counter = 1;
    let condition = [];
    
    // const filters = {
    //     commission_id: {
    //         condition: "",
    //         operator: "=",
    //         value: "10"
    //     },
    //     customer_id: {
    //         condition: "and",
    //         operator: ">",
    //         value: "11"
    //     }
    // }

    for (const [key, value] of Object.entries(filters)) {
        condition.push(`${value.condition} "${key}" ${value.operator} $${counter}`);
        ++counter;
    }

    limit = limit ? ` limit ${limit}` : '';
    order = order ? ` order by "${Object.keys(order)}" ${Object.values(order)}`: ''; 

    let query = {
        text: `SELECT ${params.map((param) => `"${param}"`).join(",")} from "commissiondischarge" where ${condition.join(" ")}${order}${limit}`,
        values: Object.values(filters).map(d => d.value)
    };


    try {
        pgres = await pool.query(query);
        return pgres.rows;
    } catch (error) {
        return { error_code: 404, error_message: error.stack };
    }
};

module.exports = { find };