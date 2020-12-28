const express = require('express');
const app = express();
const error = require('./middleware/error');
require('express-async-errors');
const cookieParser = require('cookie-parser');
const flash=require('connect-flash');
const session = require('express-session');
const users = require('./routes/users');
const auth = require('./routes/auth');
const secrets = require('./routes/secrets');
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
app.use(express.static('public'));

//set view engine ejs
app.set('view engine', 'ejs');

// route
app.use('/', home);
app.use('/api/auth/', auth);
app.use('/api/users/', users);
app.use('/api/secrets/', secrets);
app.use(error);

app.listen(8080, ()=> {
    console.log('connected to server...');
});