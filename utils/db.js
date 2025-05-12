const { Pool } = require('pg');

function createPool(config) {
    const pool = new Pool({
        user: config.db.user,
        password: config.db.password,
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
    });
};



module.exports = { createPool };