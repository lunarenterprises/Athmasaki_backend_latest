var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);
const getConnection = util.promisify(db.getConnection).bind(db);

module.exports.CheckCountryname = async (country_name) => {
    let Query = `SELECT * FROM country WHERE LOWER(country_name) = LOWER(?)`
    return await query(Query, [country_name])
}

module.exports.CheckStatename = async (state_name) => {
    let Query = `SELECT * FROM states WHERE LOWER(state_name) = LOWER(?)`
    return await query(Query, [state_name])
}

module.exports.CheckDistrictname = async (district_name) => {
    let Query = `SELECT * FROM districts WHERE LOWER(district_name) = LOWER(?)`
    return await query(Query, [district_name])
}

module.exports.AddCountry = async (country_name) => {
    let Query = `insert into country (country_name) values(?)`
    return await query(Query, [country_name])
}

module.exports.AddState = async (country_id, state_name) => {
    let Query = `insert into states (state_country_id,state_name) values(?,?)`
    return await query(Query, [country_id, state_name])
}

module.exports.AddDistrict = async (district_country_id, district_state_id, district_name) => {
    let Query = `insert into districts (district_country_id,district_state_id,district_name) values(?,?,?)`
    return await query(Query, [district_country_id, district_state_id, district_name])
}

module.exports.ListCountry = async () => {
    let Query = `select * from country`
    return await query(Query)
}

module.exports.ListStates = async (country_id) => {
    let Query = `select * from states where state_country_id =?`
    return await query(Query, [country_id])
}

module.exports.ListDistricts = async (state_id) => {
    let Query = `select * from districts where district_state_id =?`
    return await query(Query, [state_id])
}

module.exports.ListAllDistricts = async () => {
    let Query = `select * from districts `
    return await query(Query)
}

module.exports.CheckCountry = async (country_id) => {
    let Query = `select * from country where country_id=?`
    return await query(Query, [country_id])
}

module.exports.CheckState = async (state_id) => {
    let Query = `select * from states where state_id=?`
    return await query(Query, [state_id])
}

module.exports.CheckDistricts = async (district_id) => {
    let Query = `select * from districts where district_id=?`
    return await query(Query, [district_id])
}

module.exports.UpdateCountry = async (condition, country_id) => {
    let Query = `update country set ${condition} where country_id=?`
    return await query(Query, [country_id])
}

module.exports.UpdateStates = async (condition, state_id) => {
    let Query = `update states set ${condition} where state_id=?`
    return await query(Query, [state_id])
}

module.exports.UpdateDistricts = async (condition, district_id) => {
    let Query = `update districts set ${condition} where district_id=?`
    return await query(Query, [district_id])
}



module.exports.DeleteCountry = async (country_id) => {
    const connection = await getConnection(); // ✅ properly await connection
    const transQuery = util.promisify(connection.query).bind(connection);

    try {
        // Begin transaction
        await transQuery('START TRANSACTION');

        // Delete districts under this country
        await transQuery(
            `DELETE FROM districts WHERE district_country_id = ?`,
            [country_id]
        );

        // Delete states under this country
        await transQuery(
            `DELETE FROM states WHERE state_country_id = ?`,
            [country_id]
        );

        // Delete country
        const result = await transQuery(
            `DELETE FROM country WHERE country_id = ?`,
            [country_id]
        );

        // Commit transaction
        await transQuery('COMMIT');

        console.log(`✅ Deleted country ${country_id} with related states & districts.`);
        connection.release();
        return result;
    } catch (error) {
        // Rollback on error
        await transQuery('ROLLBACK');
        connection.release();
        console.error(`❌ Failed to delete country ${country_id}:`, error);
        throw error;
    }
};



module.exports.DeleteStates = async (state_id) => {
    const connection = await getConnection(); // ✅ properly await connection
    const transQuery = util.promisify(connection.query).bind(connection);

    try {
        // Begin transaction
        await transQuery('START TRANSACTION');

        // Delete districts under this state
        await transQuery(
            `DELETE FROM districts WHERE district_state_id = ?`,
            [state_id]
        );

        // Delete state
        const result = await transQuery(
            `DELETE FROM states WHERE state_id = ?`,
            [state_id]
        );

        // Commit transaction
        await transQuery('COMMIT');

        console.log(`✅ Deleted state ${state_id} with related districts.`);
        connection.release();
        return result;
    } catch (error) {
        // Rollback on error
        await transQuery('ROLLBACK');
        connection.release();
        console.error(`❌ Failed to delete state ${state_id}:`, error);
        throw error;
    }
};


module.exports.DeleteDistricts = async (district_id) => {
    let Query = `delete from districts where district_id=?`
    return await query(Query, [district_id])
}