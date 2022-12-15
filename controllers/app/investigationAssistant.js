const router = require('express').Router();
const { getData, postData } = require('../utils/fetchData');
const multer = require('multer');

router.route('/investigations-repository')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            if (['ADMINISTRADOR', 'ASISTENTE_INVESTIGACION'].includes(req.user.rol)) {
                let jwt = req.session.jwt;
                let idDepartamento = req.user.idDepartamento;
                let articles = await getData(`investigacion/publicacion/listar?tamanioPag=1000`, jwt);
                res.render("investigation-assistant/investigations-repository", {
                    user: req.user,
                    csrfToken: req.csrfToken(),
                    idDepartamento: idDepartamento,
                    articles: articles ? articles.data : [],
                    jwt
                });
            } else {
                res.redirect('/');
            }
        } else {
            req.flash('error_messages', "Necesita Iniciar Sesión");
            res.redirect('/user/login');
        }
    });
router.route('/dashboard')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            if (['ADMINISTRADOR', 'ASISTENTE_INVESTIGACION'].includes(req.user.rol)) {
                let jwt = req.session.jwt;
                let idDepartamento = req.user.idDepartamento;
                let sections = await getData(`universidad/seccion/listar?tamanioPag=1000&pagina=1&idDepartamento=${idDepartamento}`, jwt);
                let articles = await getData(`mesa/solicitudespersona/listarpordepartamento?tamanioPag=1000&idDepartamento=${idDepartamento}`, jwt);
                res.render("investigation-assistant/dashboard", {
                    user: req.user,
                    csrfToken: req.csrfToken(),
                    idDepartamento: idDepartamento,
                    articles: articles?articles:[],
                    sections:sections?sections.data:[],
                    jwt
                });
            } else {
                res.redirect('/');
            }
        } else {
            req.flash('error_messages', "Necesita Iniciar Sesión");
            res.redirect('/user/login');
        }
});

router.route('/register-investigation')
.get(async (req, res) => {
    if (req.isAuthenticated()) {
        if (['ADMINISTRADOR', 'ASISTENTE_INVESTIGACION'].includes(req.user.rol)) {
            let jwt = req.session.jwt;
            let idDepartamento = req.user.idDepartamento;
            let idArticle = req.query.idArticle;
            let teachers = await getData(`persona/docente/listar?tamanioPag=1000`, jwt);
            let article = null;
            if(idArticle) {
                article = await getData(`investigacion/publicacion/buscar?idPublicacion=${idArticle}`, jwt);
                article = article ? article.data : null;
            }
            res.render("investigation-assistant/register-investigation", {
                user: req.user,
                csrfToken: req.csrfToken(),
                idDepartamento: idDepartamento,
                teachers: teachers ? teachers.data : [],
                idArticle: idArticle,
                article: article,
                jwt
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
