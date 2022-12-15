const express = require('express');
const mongoose = require('mongoose');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
var MemoryStore = require('memorystore')(expressSession);
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

// Initializations
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // ./views
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database
/*
const mongoURI = require('./config/monkoKEY');
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}).then(() => console.log("DB Connected!"));*/

// Middlewares 

app.use(morgan('dev'));

app.use(cookieParser('random'));

app.use(expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    // setting the max age to longer duration
    cookie: { maxAge: 60 * 60 * 1000 }, // 60 minutos
    store: new MemoryStore(),
}));

app.use(express.json());

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(csrf());
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error = req.flash('error');
    next();
});

// Routes

require('./routes/manager')(app);

app.get('*', function (req, res) {
    res.render('404')
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log("Server Started At: http://localhost:" + PORT));