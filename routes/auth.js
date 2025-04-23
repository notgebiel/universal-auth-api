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
