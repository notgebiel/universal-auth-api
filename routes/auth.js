const express = require('express');
const app = express();
const config = require('../config/config');
const cors = require('cors');
const pool = require('../database/db');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


const JWT_SECRET = config.JWT_SECRET;
const EMAIL_USER = config.EMAIL.user;
const EMAIL_PASS = config.EMAIL.pass;
const EMAIL_SERVICE = config.EMAIL_SERVICE
const BCRYPT_SALT_ROUNDS = config.BCRYPT_SALT_ROUNDS;
const RESET_TOKEN_SECRET = config.RESET_TOKEN_SECRET;


const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }
})

app.use(express.json());
app.use(session({ secret: JWT_SECRET}))