const { getData, postData } = require("../utils/fetchData");
var localStrategy = require('passport-local').Strategy;
const { jwt } = require('../../config/jwt');

module.exports = function (passport) {
    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, email, password, done) => {

        let response = await postData('seguridad/login/clasico', { email: email, contrasenia: password });

        if (response) {
            if (response.error) {
                return done(null, false, { message: response.error });
            } else {
                req.session.jwt = response.value;
                return done(null, { id: response.idPersona });
            }
        } else {
            return done(null, false, { message: "Error de API" });
        }

    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        let user = await getData(`persona/buscar?idPersona=${id}`, jwt);
        done(null, user.data);
    });

}