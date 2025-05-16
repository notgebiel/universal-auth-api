const express = require('express');
const { authenticateToken, getProfile } = require('../controllers/userController');

module.exports = (config) => {
    const router = express.Router();

    router.post('/get-profile', authenticateToken(config), (req, res) => getProfile(req, res, config));

    return router;
}