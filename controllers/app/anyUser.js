const router = require('express').Router();
const { getData, postData } = require('../utils/fetchData');

router.route('/register-request')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            let jwt = req.session.jwt;

            let categories = await getData('mesa/asunto/listar?tamanioPag=1000', jwt);
            let departments = await getData('universidad/departamento/listar', jwt);
            categories.data = categories.data.filter(x => x.estado === true);

            res.render("any-user/register-request", {
                user: req.user,
                csrfToken: req.csrfToken(),
                jwt,
                categories: (categories ? categories.data : []),
                departments: (departments ? departments.data : []),
            });
        } else {
            req.flash('error_messages', "Necesita Iniciar Sesión");
            res.redirect('/user/login');
        }
    });

router.route('/requests-sent')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {

            let jwt = req.session.jwt;
            let subjects = await getData('mesa/asunto/listar?tamanioPag=1000', jwt);
            res.render("any-user/requests-sent", {
                user: req.user,
                csrfToken: req.csrfToken(),
                subjects: subjects ? subjects.data : [],
                jwt
            });
        } else {
            req.flash('error_messages', "Necesita Iniciar Sesión");
            res.redirect('/user/login');
        }
    });

router.route('/requests-received')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {

            let jwt = req.session.jwt;
            let users = await getData('persona/listar?tamanioPag=1000', jwt);
            let subjects = await getData('mesa/asunto/listar?tamanioPag=1000', jwt);
            res.render("any-user/requests-received", {
                user: req.user,
                csrfToken: req.csrfToken(),
                subjects: subjects ? subjects.data : [],
                users: users ? users.data : [],
                jwt
            });
        } else {
            req.flash('error_messages', "Necesita Iniciar Sesión");
            res.redirect('/user/login');
        }
    });

router.route('/view-request')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            let idRequest = req.query.idRequest;
            let idRequestPerson = req.query.idRequestPerson;
            let jwt = req.session.jwt;

            if (idRequest && idRequestPerson) {
                let request = await getData(`mesa/solicitud/buscar?idSolicitud=${idRequest}`, jwt);
                let requestPerson = await getData(`mesa/solicitudespersona/buscar?idSolicitudesPersona=${idRequestPerson}`, jwt);
                let users = await getData('persona/listarusuarios?tamanioPag=1000', jwt);
                let departments = await getData('universidad/departamento/listar', jwt);
                let emails = [];

                users = users.data.map(user => {
                    emails.push({
                        idPersona: user.idPersona,
                        email: user.email
                    });

                    return {
                        idPersona: user.idPersona,
                        nombre: user.nombreCompleto
                    }
                });

                res.render("any-user/view-request", {
                    user: req.user,
                    csrfToken: req.csrfToken(),
                    jwt,
                    request: {
                        ...requestPerson.data,
                        ...request.data,
                    },
                    users: users.filter(x => x.idPersona !== req.user.idPersona),
                    emails,
                    departments: (departments ? departments.data.filter(x => x.estado === true && x.nombre !== req.user.departamento) : [])
                });
            } else {
                res.redirect('/');
            }
        } else {
            req.flash('error_messages', "Necesita Iniciar Sesión");
            res.redirect('/user/login');
        }
    });

module.exports = router;
