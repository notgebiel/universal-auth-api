const express = require('express');
const { register, login } = require('../controllers/authController');

module.exports = (config) => {
    const router = express.Router()

    router.post('/register', (req, res) => register(req, res, config));
    router.post('/login', (req, res) => login(req, res, config));

    return router;
}
