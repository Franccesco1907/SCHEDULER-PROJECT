const { putData, getData } = require('../utils/fetchData');
const { jwt } = require('../../config/jwt');
const { sendResetPasswordEmail } = require('../utils/email/resetPassword');
const router = require('express').Router();
const crypto = require('crypto');
const resetToken = require('../../db/models/resetTokens');
const passport = require('passport');
require('../utils/passportLocal')(passport);
require('../utils/googleAuth')(passport);

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Necesita Iniciar Sesión");
        res.redirect('/user/login');
    }
}

router.route('/login')
    .get((req, res) => {
        if (req.query.isRegistered === 'no') {
            res.render("user/login", { csrfToken: req.csrfToken(), error: 'Lo sentimos, usted no se encuentra registrado en el sistema, le recomendamos contactarse con su Jefe de Sección' });
        } else {
            res.render("user/login", { csrfToken: req.csrfToken() });
        }
    });

router.route('/login')
    .post((req, res, next) => {
        passport.authenticate('local', {
            failureRedirect: '/user/login',
            successRedirect: '/',
            failureFlash: true,
        })(req, res, next);
    });

router.route('/logout')
    .get((req, res) => {
        req.logout();
        req.session.destroy(function (err) {
            res.redirect('/user/login');
        });
    });

// GOOGLE AUTH APIS
router.route('/google')
    .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

router.route('/google/callback')
    .get(passport.authenticate('google', { failureRedirect: '/user/login?isRegistered=no' }), (req, res) => {
        if (req.user) {
            res.redirect('/');
        } else {
            req.logout();
            req.session.destroy(function (err) {
                res.redirect('/user/login?isRegistered=no');
            });
        }
    });

router.route('/profile')
    .get(checkAuth, (req, res) => {
        res.render('/', {
            user: req.user
        });
    });

router.route('/forgot-password')
    .get(async (req, res) => {
        res.render('user/forgot-password.ejs', { csrfToken: req.csrfToken(), existsMsg: false, type: '' });
    });

router.route('/forgot-password')
    .post(async (req, res) => {
        const { email } = req.body;
        var userData = await getData(`persona/buscarporcorreo?correo=${email}`, jwt)

        if (userData.data.length) {
            var token = crypto.randomBytes(32).toString('hex');
            await resetToken.create({ token, email });
            sendResetPasswordEmail(email, token);

            res.render('user/forgot-password.ejs', {
                csrfToken: req.csrfToken(),
                msg: "Correo de establecimiento enviado. Por favor revise su correo para mayor información.",
                type: 'success',
                existsMsg: true
            });
        } else {
            res.render('user/forgot-password.ejs', {
                csrfToken: req.csrfToken(),
                msg: "Usuario incorrecto",
                type: 'danger',
                existsMsg: true
            });
        }
    });

router.route('/set-password')
    .get(async (req, res) => {
        const token = req.query.token;
        if (req.isAuthenticated()) {
            req.logout();
            req.session.destroy(function (err) { });
            res.redirect(`user/set-password?token=${token}`);
        }

        if (token) {
            var check = await resetToken.findOne({ token: token });
            res.render('user/set-password', {
                csrfToken: req.csrfToken(),
                expired: (check ? false : true),
                email: (check ? check.email : ''),
            });
        } else {
            res.redirect('/user/login');
        }
    });

router.route('/set-password')
    .post(async (req, res) => {

        const { password, password2, email } = req.body;

        if (password !== password2) {
            res.render('user/set-password.ejs', {
                csrfToken: req.csrfToken(),
                err: "Las contraseñas son distintas",
                email: email
            });
        } else {
            let response = await putData(`seguridad/login/establecercontrasenia?usuario=${email}&contraseniaNueva=${password}`, req.session.jwt);
            if (response) {
                res.redirect('/user/successful-set');
            }
        }

    });

router.route('/successful-set')
    .get(async (req, res) => {
        res.render('user/successful-set');
    });

module.exports = router;