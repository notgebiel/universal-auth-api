module.exports = {
    PORT: 3001,
    DB: {
        user: "Your postgres user",
        host: "Your postgres host",
        database: "Your postgres database",
        password: "Your database password",
        port: 5432, //db port
    },
    JWT_SECRET: "Your jsonwebtoken key",
    CRYPT_SECRET: "Your encryption key",
    EMAIL: {
        user: "you@example.com",
        pass: "Your email password",
        service: "Your email service",
    },
    FRONTEND_URL: "https://example.com"
}