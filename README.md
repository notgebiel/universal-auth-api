# Universal Auth API

A reusable and configurable authentication API built with Express.js and PostgreSQL. This package provides ready-to-use login and registration routes that you can plug into your own project with minimal setup.

## Features

- User registration and login
- PostgreSQL integration
- Easily configurable via `config.js`
- NPM-ready modular structure

---

## Installation

```bash
npm install universal-auth-api
```

---

## Usage

In your main project (e.g. `app.js`):

```js
const express = require('express');
const createAuthRouter = require('universal-auth-api');
const config = require('./config');

const app = express();
const authRouter = createAuthRouter(config);

app.use('/api', authRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```



---

## Configuration

Create a `config.js` file in your project with the following content:

```js
module.exports = {
  sessionSecret: 'your-secret-key',
  salt_rounds: 10,
  db: {
    pool: require('./db'), // Exported Pool from pg
    table: 'users' // Table name where user data is stored
  }
};
```

> **Important:** Do **not** store secrets directly in version control. Use environment variables in production.

---

## Folder Structure

```
universal-auth-api/
├── index.js
├── config.js
├── routes/
│   ├── auth.js
│   └── user.js
├── controllers/
│   ├── authController.js
│   └── userController.js
├── utils/
│   └── db.js
├── package.json
└── README.md
```

---

## Available Routes

All routes are prefixed with `/api` (or whatever path you mount the router on).

### POST `/api/auth/register`

Registers a new user.

**Body:**

```json
{
  "email": "example@mail.com",
  "password": "yourPassword"
}
```
**Response:**
```json
{*
  "message": "Registration succesful",
  "user": {
    "email": "example@gmail.com",
    "id": 1
  }
}
```

### POST `/api/auth/login`

Logs in a user.

**Body:**

```json
{
  "email": "example@mail.com",
  "password": "yourPassword"
}
```
**Response:**
```json
{*
  "message": "Login succesful",
  token
  }
}
```
### POST `/api/user/get-profile`

Returns a profile.

**Header:**

```json
{
  "Authorization": "Bearer (token)",
}
```

**Body:**

```json
{
  "user": 
  {
    "email": "email",
  }
}
```
**Response:**

```json
{
  "email": "email",
  "id": 0
}
```
---

## License

MIT License. See `LICENSE` file for details.

---

## Support

Feel free to open an issue or pull request on [GitHub](https://github.com/notgebiel/universal-auth-api) if you find a bug or want to contribute.
