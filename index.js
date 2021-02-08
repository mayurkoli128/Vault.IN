const express = require('express');
const app = express();

require('express-async-errors');

require('dotenv').config();

require('./startup/routes')(app, express);

app.listen(process.env.PORT || 8080, ()=> {
    console.log('Listening on PORT: 8080');
});