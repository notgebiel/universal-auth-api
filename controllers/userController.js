const pool = require('../utils/db');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1] // extract token from header

    if(!token) {
        return res.status(401).json({ message: "Invalid token" });
    }

    jwt.verify(token, config.jwt_secret, (err, decodedUser) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
    })
    
}