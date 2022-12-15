const { getData, postData, putData } = require("../utils/fetchData");
const { clientId, clientSecret } = require('../../config/googleData');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const { jwt } = require('../../config/jwt');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: "http://34.192.199.128.nip.io/user/google/callback",
        //callbackURL: "http://35.221.53.4.nip.io/user/google/callback",
        //callbackURL: "http://localhost:8000/user/google/callback",
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, params, profile, done) => {

        let response = await postData('seguridad/login/google', { value: params.id_token });
        if (response) {
            if (response.error !== undefined) {
                return done(null, false, { message: response.error });
            } else {
                req.session.jwt = jwt;
                await putData(`persona/actualizarfoto`, { idPersona: response.idPersona, foto: profile.photos[0].value }, jwt);
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