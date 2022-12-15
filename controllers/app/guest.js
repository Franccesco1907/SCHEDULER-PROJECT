const router = require('express').Router();
const { getData, postData } = require('../utils/fetchData');
const { getDirectoryProject } = require('../utils/getDirectoryProject');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const dirProject = getDirectoryProject(__dirname);
const { sendSuccessfulRequest } = require("../utils/email/successfulRequest");
const { jwt } = require("../../config/jwt");

router.route('/')
    .get(async (req, res) => {
        res.render("guest/main", {
            user: (req.user ? req.user : {
                rol: 'VISITANTE',
                nombre: 'Visitante',
                apellidos: 'del Sistema',
                seccion: 'Si usted tiene una cuenta, inicie sesión para tener acceso a todas las funcionalidades del Sistema',
                correo: '-',
                celular: '-'
            }),
            csrfToken: req.csrfToken(),
        });
    });


router.route('/register-request')
    .get(async (req, res) => {
        let categories = await getData('mesa/asunto/listar?tamanioPag=1000', jwt);
        let departments = await getData('universidad/departamento/listar', jwt);
        categories.data = categories.data.filter(x => x.estado === true);

        res.render("guest/register-request", {
            user: (req.user ? req.user : {
                rol: 'VISITANTE',
                nombre: 'Visitante',
                apellidos: 'del Sistema',
                seccion: 'Si usted tiene una cuenta, inicie sesión para tener acceso a todas las funcionalidades del Sistema',
                correo: '-',
                celular: '-'
            }),
            csrfToken: req.csrfToken(),
            categories: (categories ? categories.data : []),
            departments: (departments ? departments.data : [])
        });
    });


router.route('/successful-request')
    .post(async (req, res) => {

        try {

            const { email, name, departament, requestCode } = req.body;
            await sendSuccessfulRequest(email, name, departament, requestCode);
            res.status(200).json('OK');

        } catch (e) {
            console.log(e);
        }

    });

router.route('/view-request')
    .get(async (req, res) => {
        let requestCode = req.query.requestCode;
        let email = req.query.email;

        if (requestCode && email) {
            let requestPerson = await getData(`mesa/solicitudespersona/buscarexterno?correo=${email}&keyValue=${requestCode}`, jwt);
            let request = await getData(`mesa/solicitud/buscar?idSolicitud=${requestPerson.data.idSolicitud}`, jwt);

            res.render("guest/view-request", {
                user: (req.user ? req.user : {
                    rol: 'VISITANTE',
                    nombre: 'Visitante',
                    apellidos: 'del Sistema',
                    seccion: 'Si usted tiene una cuenta, inicie sesión para tener acceso a todas las funcionalidades del Sistema',
                    correo: '-',
                    celular: '-'
                }),
                csrfToken: req.csrfToken(),
                request: { ...requestPerson.data, ...request.data }
            });
        } else {
            res.redirect('/');
        }
    });

router.route('/load-file-request')
    .post(upload.single('file'), (req, res, next) => {
        //console.log(req);
        let file = req.file;

        var oldPath = file.path;
        var newPath = `public/files/requests/guests/${file.filename}`;

        fs.rename(dirProject + oldPath, dirProject + newPath, function (err) {
            if (err) throw err;
            console.log('Se cargó el archivo correctamente!');
        });

        return res.status(200).send(file);
    });

router.route('/select-convocation')
    .get(async (req, res) => {
        let departments = await getData('universidad/departamento/listar', jwt);
        res.render("guest/select-convocation", {
            user: (req.user ? req.user : {
                rol: 'VISITANTE',
                nombre: 'Visitante',
                apellidos: 'del Sistema',
                seccion: 'Si usted tiene una cuenta, inicie sesión para tener acceso a todas las funcionalidades del Sistema',
                correo: '-',
                celular: '-'
            }),
            csrfToken: req.csrfToken(),
            departments: (departments ? departments.data.filter(x => x.estado) : []),
        });
    });

router.route('/teaching-convocation')
    .get(async (req, res) => {
        console.log(req);
        let idSeccion = req.query.idSeccion;
        let idPlazaDocente = req.query.idPlazaDocente;
        res.render("guest/teaching-convocation", {
            user: (req.user ? req.user : {
                rol: 'VISITANTE',
                nombre: 'Visitante',
                apellidos: 'del Sistema',
                seccion: 'Si usted tiene una cuenta, inicie sesión para tener acceso a todas las funcionalidades del Sistema',
                correo: '-',
                celular: '-'
            }),
            csrfToken: req.csrfToken(),
            idSeccion: idSeccion,
            idPlazaDocente: idPlazaDocente,
        });
    });

module.exports = router;