const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'loginsysteem',
    password: 'notpostgres',
    port: 5432
})

module.exports = {
    /*port: 3001,
    db: {
        user: "Your postgres user",
        host: "Your postgres host",
        database: "Your postgres database",
        password: "Your database password",
        port: 5432, //db port
        table: "User table"
    },
    jwt_secret: "Your jsonwebtoken key",
    jwt_expire: "1h",
    crypt_secret: "Your encryption key",
    email: {
        user: "you@example.com",
        pass: "Your email password",
        service: "Your email service",
    },
    frontend_url: "https://example.com",
    salt_rounds: 10,
    reset_token_secret: "Secure secret",
    express_session_secret: "Secure secret",*/
    port: 3000,
    db: {
        pool,
        table: 'users'
    },
    jwt_secret: 'zerhgdfsrethdfythd',
    jwt_expire: '1h',
    crypt_secret: 'regdhsreythdggsrethd',
    frontend_url: "http://localhost:3000",
    salt_rounds: 10,
    express_session_secret: "rsgdfhftjhgbghdv",
}

