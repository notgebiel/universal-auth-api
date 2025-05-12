const express = require('express');
const createAuthRouter = require('./index');
const config = require('./config/config');

const app = express();
const authRouter = createAuthRouter(config);

app.use(express.json());
app.use('/api', authRouter);


app.listen(3000, () => {
    console.log('server listening');
})