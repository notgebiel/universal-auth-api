const pool = require('../utils/db');
const jwt = require('jsonwebtoken');
const { createPool } = require('../utils/db');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1] // extract token from header

    if(!token) {
        return res.status(401).json({ message: "Invalid token" });
    }

    jwt.verify(token, config.jwt_secret, (err, decodedUser) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        req.user = decodedUser;
        next();
    })
}

async function getProfile(req, res, config){
    const pool = createPool(config);
    try {

        const result = await pool.query(`SELECT * FROM ${config.db.table} WHERE email = $1`, [req.user.email]);

        if(result.rows.length === 0) {
            res.status(404).json({error: "User not found"});
        }

        const user = result.rows[0];
        res.status(200).json({ email: user.email, id: user.id});

    }catch(error){
        res.status(500).json({ error: "internal server error", error});
        console.error(error);
    }
}



module.exports = { authenticateToken, getProfile }