const express = require('express');
const app = express();
const config = require('../config/config');
const cors = require('cors');
const pool = require('../database/db');
const jwt = require('jsonwebtoken');
//const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');


const JWT_SECRET = config.JWT_SECRET;
const BCRYPT_SALT_ROUNDS = config.BCRYPT_SALT_ROUNDS;
const EXPRESS_SESSION_SECRET = config.EXPRESS_SESSION_SECRET;





app.use(express.json());
app.use(session({ secret: EXPRESS_SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(cors(config.FRONTEND_URL));

app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email or password necessary"});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const result = await pool.query('INSERT INTO $1 (email, password) VALUES ($2, $3) RETURNING *', [config.DB.table, email, hashedPassword]);
        res.status(201).json({ message: "Registration succesful", user: result.rows[0]});
    }catch (error) {
        res.status(500).json({ error: "Registration failed:", error})
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: "Email or password missing"});
    }

    try {
        const result = await pool.query('SELECT * FROM $1 WHERE email = $2', [config.DB.table, email]);

        if (result.rows.length === 0){
            return res.status(401).json({ message: "User does not exist"});
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch) {
            return res.status(401).json({ message: "Email or password does not match"});
        }

        const token = jwt.sign({email: user.email, id: user.id}, JWT_SECRET, {expiresIn: config.JWT_EXPIRE});

        res.status(200).json({ message: "Login succesful", token});
    }catch (error) {
        res.status(500).json({ error: "Login failed: ", error});
    }
});

app.post('/auth/change-password', )

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});