const { Pool } = require('pg');
const config = require('../config/config')

const pool = new Pool({
    user: config.DB.user,
    password: config.DB.password,
    host: config.DB.host,
    port: config.DB.port,
    database: config.DB.database,
});

module.exports = pool;