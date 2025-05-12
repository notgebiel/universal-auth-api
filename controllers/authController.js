const bcrypt = require('bcrypt');
const { createPool } = require('../utils/db');
const jwt = require('jsonwebtoken');


async function register(req, res, config) {
    const pool = createPool(config)
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email or password necessary"});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, config.salt_rounds);
        const result = await pool.query('INSERT INTO ' + config.db.table + ' (email, password) VALUES ($1, $2) RETURNING *', [email, hashedPassword]);
        res.status(201).json({ message: "Registration succesful", user: result.rows[0]});
    }catch (error) {
        res.status(500).json({ error: "Registration failed:", error})
        console.error(error);
    }
}

async function login (req, res, config) {
    const pool = createPool(config)
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: "Email or password missing"});
    }

    try {
        const result = await pool.query('SELECT * FROM ' + config.db.table + ' WHERE email = $1', [email]);

        if (result.rows.length === 0){
            return res.status(401).json({ message: "User does not exist"});
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch) {
            return res.status(401).json({ message: "Email or password does not match"});
        }

        const token = jwt.sign({email: user.email, id: user.id}, config.jwt_secret, {expiresIn: config.jwt_expire});

        res.status(200).json({ message: "Login succesful", token});
    }catch (error) {
        res.status(500).json({ error: "Login failed: ", error});
    }
}

module.exports = { register, login };

