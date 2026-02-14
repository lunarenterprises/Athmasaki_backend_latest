var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);
const getConnection = util.promisify(db.getConnection).bind(db);

module.exports.AddReligion = async (religion_name) => {
    let Query = `insert into religion (r_name) values(?)`
    return await query(Query, [religion_name])
}

module.exports.AddCommunity = async (r_id, community_name) => {
    let Query = `insert into community (cm_religion_id,cm_name) values(?,?)`
    return await query(Query, [r_id, community_name])
}

module.exports.Listreligion = async () => {
    let Query = `select * from religion`
    return await query(Query)
}

module.exports.ListCommunity = async (condition) => {
    let Query = `select * from community ${condition}`
    return await query(Query)
}

module.exports.CheckCommunity = async (cm_id) => {
    let Query = `select * from community where cm_id=?`
    return await query(Query, [cm_id])
}

module.exports.Checkcommunityname = async (community_name, religion_id) => {
    let Query = `select * from community where lower(cm_name)=? and cm_religion_id=?`
    return await query(Query, [community_name.toLowerCase(), religion_id])
}

module.exports.Checkreligion = async (r_id) => {
    let Query = `select * from religion where r_id=?`
    return await query(Query, [r_id])
}

module.exports.UpdateReligion = async (condition, r_id) => {
    let Query = `update religion set ${condition} where r_id=?`
    return await query(Query, [r_id])
}

module.exports.Checkreligionname = async (religion_name) => {
    let Query = `select * from religion where lower(r_name)=?`
    return await query(Query, [religion_name.toLowerCase()])
}

module.exports.UpdateCommunity = async (condition, cm_id) => {
    let Query = `update community set ${condition} where cm_id=?`
    return await query(Query, [cm_id])
}



module.exports.DeleteReligion = async (r_id) => {
    const connection = await getConnection(); // ✅ properly await connection
    const transQuery = util.promisify(connection.query).bind(connection);

    try {
        // Begin transaction
        await transQuery('START TRANSACTION');

        // Delete communities under this religion first
        await transQuery(
            `DELETE FROM community WHERE cm_religion_id = ?`,
            [r_id]
        );

        // Delete the religion itself
        const result = await transQuery(
            `DELETE FROM religion WHERE r_id = ?`,
            [r_id]
        );

        // Commit transaction
        await transQuery('COMMIT');

        console.log(`✅ Deleted religion ${r_id} and related communities.`);
        connection.release();
        return result;
    } catch (error) {
        // Rollback on error
        await transQuery('ROLLBACK');
        connection.release();
        console.error(`❌ Failed to delete religion ${r_id}:`, error);
        throw error;
    }
};

module.exports.DeleteCommunity = async (cm_id) => {
    let Query = `delete from community where cm_id=?`
    return await query(Query, [cm_id])
}
