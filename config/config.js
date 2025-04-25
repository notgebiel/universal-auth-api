module.exports = {
    PORT: 3001,
    DB: {
        user: "Your postgres user",
        host: "Your postgres host",
        database: "Your postgres database",
        password: "Your database password",
        port: 5432, //db port
        table: "User table"
    },
    JWT_SECRET: "Your jsonwebtoken key",
    JWT_EXPIRE: "1h",
    CRYPT_SECRET: "Your encryption key",
    EMAIL: {
        user: "you@example.com",
        pass: "Your email password",
        service: "Your email service",
    },
    FRONTEND_URL: "https://example.com",
    BCRYPT_SALT_ROUNDS: 10,
    RESET_TOKEN_SECRET: "Secure secret",
    EXPRESS_SESSION_SECRET: "Secure secret",
}