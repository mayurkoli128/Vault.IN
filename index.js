const express = require('express');
const app = express();
const error = require('./middleware/error');
require('express-async-errors');
const cookieParser = require('cookie-parser');
const users = require('./routes/users');
const auth = require('./routes/auth');
const home = require('./routes/home');
require('dotenv').config();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use('/api/auth/', auth);
app.use('/api/users/', users);
app.use('/', home);
app.use(error);


app.listen(8080, ()=> {
    console.log('connected to server...');
});