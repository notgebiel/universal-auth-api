const express = require('express');
const { authenticateToken, getProfile } = require('../controllers/userController');

module.exports = (config) => {
    const router = express.Router();

    router.post('/get-profile', authenticateToken, (req, res) => getProfile(req, res, config));

    return router;
}