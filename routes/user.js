const express = require('express');
const app = express();
const config = require('../config/config');
const cors = require('cors');
const pool = require('../utils/db');
const jwt = require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ error: 'Invalid token'});
    }

    jwt.verify(token, config.JWT_SECRET, (err, decodedUser) => {
        if(err) return res.status(403).json({ error: 'Invalid token'});

        req.user = decodedUser;
        next();
    });
}

app.get('/user/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM $1 WHERE email = $2', [config.DB.table, req.user.email]);

        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'User does not exist'});
        } 

        const user = result.rows[0];
        res.status(200).json({email: user.email, id: user.id});
    }catch (error) {
        res.status(500).json({ error: "Failed to fetch profile", error});
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})