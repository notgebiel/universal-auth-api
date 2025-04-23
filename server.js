const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const cors = require('cors');
const pool = require('./database/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const session = require('express-session');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');


const JWT_SECRET = process.env.JWT_SECRET;
const MICROSOFT_CLIENT_ID = process.env.MICRO_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICRO_CLIENT_SECRET_WAARDE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET;
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
})


app.use(express.json());
app.use(cors());
app.use(session({ secret: process.env.EXPRESS_SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new MicrosoftStrategy({
    clientID:  MICROSOFT_CLIENT_ID,
    clientSecret: MICROSOFT_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/microsoft/callback",
    scope: ['user.read'],

}, async (accessToken, refreshToken, profile, done) => {
    try {
        let email = profile.emails[0].value;
        let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            const result = await pool.query('INSERT INTO users (email, password, is_microsoft_user) VALUES ($1, $2, $3) RETURNING *', [email, null, true]);
            user = result;
        }

        const jwtToken = jwt.sign({ email: user.rows[0].email, id: user.rows[0].id,}, JWT_SECRET, {expiresIn: '1h'});
        return done(null, {token: jwtToken})
    }catch(error) {
        return done(error, null);
    }
}
));

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((obj, done) => {
    done(null, obj);
})

app.get('/auth/microsoft', passport.authenticate('microsoft'));

app.get('/auth/microsoft/callback', passport.authenticate('microsoft', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect(`http://localhost:3000/profile?token=${req.user.token}`);
}
);

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({message: 'Email of wachtwoord zijn verplicht'});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
            [email, hashedPassword]
        );
        res.status(201).json({message: 'Registratie succesvol', user: result.rows[0]});
    }catch (error) {
        res.status(500).json({error: 'interne server error', error});
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({message: 'Email en wachtwoord zijn verplicht'})
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({message: 'Ongeldige inloggegevens'});
        }
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({error: 'Email of wachtwoord onjuist'});
        }


        const token = jwt.sign({email: user.email, id: user.id}, JWT_SECRET, {expiresIn: '1h'});

        res.status(200).json({message: 'Succesvol ingelogd', token});
    }catch (error) {
        res.status(500).json({error: 'Interne server error'})
        console.log(error);
    }
});

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; //token uit authorization header halen

    if (!token) return res.status(401).json({error: 'Ongeldig token'});
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) return res.status(403).json({error: 'Ongeldig token'});

        req.user = decodedUser;
        next();
    })
}

app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.user.email]);

        if (result.rows.length === 0) {
           return res.status(404).json({error: 'Gebruiker niet gevonden'})
        }

        const user = result.rows[0];
        res.status(200).json({email: user.email, id: user.id});
    }catch (error) {
        res.status(500).json({error: 'interne server error'});
    }
});

app.post('/google-login', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Geen token ontvangen' });
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;

        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            result = await pool.query('INSERT INTO users (email, password, is_google_user) VALUES ($1, $2, $3) RETURNING *', [email, null, true]);
        }

        const user = result.rows[0];
        const authToken = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h'})

        res.status(200).json({ message: "Succesvol ingelogd!", token: authToken});
    }catch (error) {
        res.status(401).json({error: `Ongeldige Google login: ${error}`});
    }
    })

app.post('/change-password', async (req, res) => {
    const id = req.body.id;
    const newpassword = req.body.newpassword;

    if (!id || !newpassword) {
        return res.status(404).json({error: "Ongeldig verzoek: Wachtwoord verplicht"});
    }

    try {
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Gebruiker niet gevonden"});
        }

        const user = result.rows[0];

        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
        res.status(200).json({message: "Wachtwoord gewijzigd"});
    }catch (error) {
        console.error(error);
        res.status(500).json({error: "Interne servererror"});
    }

})

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({error: "email ontbreekt"});
    }

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Gebruiker niet gevonden"});
        }

        const token = jwt.sign({ email }, RESET_TOKEN_SECRET, { expiresIn: '15m'});

        const resetLink = `http://localhost:3000/nieuw-wachtwoord?token=${token}`;
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Wachtwoord herstellen',
            text: `Klik op de link om je wachtwoord te resetten: ${resetLink}. Deze link verloopt in 15 minuten.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email verstuurd. Controleer je inbox'});
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: `Interne server error: ${error}`});
    }
});

app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    console.log(req.body);

    if (!token || !newPassword) {
        return res.status(400).json({error: 'Token en nieuw wachtwoord zijn verplicht!'});
    }

    try {
        const decoded = jwt.verify(token, RESET_TOKEN_SECRET);
        const email = decoded.email;

        const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

        res.status(200).json({ message: 'Wachtwoord reset succesvol!' });
    }catch(error) {
        return res.status(500).json({ error: `Interne server error: ${error}` });
    }
})
 

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})