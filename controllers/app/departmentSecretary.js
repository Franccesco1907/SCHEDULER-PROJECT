const router = require('express').Router();
const { getData, postData } = require('../utils/fetchData');
const { getDirectoryProject } = require('../utils/getDirectoryProject');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const dirProject = getDirectoryProject(__dirname);

router.route('/request-list')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            if (['ADMINISTRADOR', 'ASISTENTE_SECCION', "SECRETARIA"].includes(req.user.rol)) {
                let jwt = req.session.jwt;
                let subjects = await getData('mesa/asunto/listar?tamanioPag=1000', jwt);

                res.render("department-secretary/request-list", {
                    user: req.user,
                    csrfToken: req.csrfToken(),
                    jwt,
                    subjects: subjects ? subjects.data : [],
                });
            } else {
                res.redirect('/');
            }
        } else {
            req.flash('error_messages', "Necesita Iniciar Sesión");
            res.redirect('/user/login');
        }
    });

/*
router.route('/view-request')
.get(async (req, res) => {
    if (req.isAuthenticated()) {
        let idRequest = req.query.idRequest;
        let jwt = req.session.jwt;
        let emisor = req.query.sender;
        let requestType = req.query.requestType;

        //console.log(idRequest);
        if (idRequest) {
            let request = await getData(`mesa/solicitud/buscar?idSolicitud=${idRequest}`, jwt);
            let users = await getData('persona/listar?tamanioPag=1000', jwt);
            let departments = await getData('universidad/departamento/listar', jwt);
            //console.log(request);
            res.render("department-secretary/view-request", {
                user: req.user,
                csrfToken: req.csrfToken(),
                jwt,
                request: (request ? request.data : null),
                emisor,
                users: (users ? users.data : []),
                departments: (departments ? departments.data : []),
                requestType
            });
        } else {
            res.redirect('/');
        }
    } else {
        req.flash('error_messages', "Necesita Iniciar Sesión");
        res.redirect('/user/login');
    }
});*/

router.route('/load-file-request')
    .post(upload.single('file'), (req, res, next) => {
        let file = req.file;

        var oldPath = file.path;
        var newPath = `public/files/requests/${file.filename}`;

        fs.rename(dirProject + oldPath, dirProject + newPath, function (err) {
            if (err) throw err;
            console.log('Se cargó el archivo correctamente!');
        })

        return res.status(200).send(file);
    });

module.exports = router;
