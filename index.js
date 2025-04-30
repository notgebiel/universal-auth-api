const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');


function createAuthRouter(config) {
    const router = express.Router();

    //Middleware
    router.use(express.json());
    router.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
    }));

    //routes
    router.use('/auth', authRoutes(config));
    router.use('/user', userRoutes(config));

    return router;
}

module.exports = createAuthRouter;