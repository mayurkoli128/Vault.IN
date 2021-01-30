const express = require('express');
const app = express();
const error = require('./middleware/error');
require('express-async-errors');
const cookieParser = require('cookie-parser');
const flash=require('connect-flash');
const session = require('express-session');
const user = require('./routes/user');
const join = require('./routes/join');
const secrets = require('./routes/secrets');
const settings = require('./routes/userSettings');
const home = require('./routes/home');
require('dotenv').config();

// flash messaging...
app.use(cookieParser('keyboard cat'));
app.use(session({ 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }}
));
app.use(flash());

//standard middleware for parsing json request
app.use(express.json());

//form data parsing
app.use(express.urlencoded({extended:false}));


// rendering public static files
app.use('/', express.static('public'));
app.use('/', express.static('API'));
app.use('/', express.static('lib'));

//set view engine ejs
app.set('view engine', 'ejs');

// route
app.use('/', home);
app.use('/join/', join);
app.use('/user/', user);
app.use('/secrets/', secrets);
app.use('/settings/', settings);
app.use(error);

app.listen(8080, ()=> {
    console.log('connected to server...');
});