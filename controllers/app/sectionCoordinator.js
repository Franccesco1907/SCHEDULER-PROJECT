const router = require('express').Router();
const { getData, postData } = require('../utils/fetchData');
const { jwt } = require("../../config/jwt");

const allowedRoles = ['ADMINISTRADOR', 'ASISTENTE_SECCION', 'COORDINADOR_SECCION'];
router.route('/list-less-hours')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (allowedRoles.includes(req.user.rol)) {
        let jwt = req.session.jwt;
        let idSeccion = req.user.idSeccion;
        let idDepartamento = req.user.idDepartamento;
        let teachers = await getData(`persona/docente/listarseccion?idSeccion=${idSeccion}&tamanioPag=1000&pagina=1`, jwt);
        let currentSemester = await getData(`universidad/ciclo/actual`,jwt);
        res.render("section-coordinator/list-less-hours", {
          user: req.user,
          csrfToken: req.csrfToken(),
          requestsLessHours: [],
          teachers: teachers ? teachers.data : [],
          idSeccion,
          idDepartamento,
          currentSemester,
          jwt
        });
      }else {
        res.redirect('/');
        // No tiene permisos para hacer esa acción
      }
    } else {
      req.flash('error_messages', "Necesita Iniciar Sesión");
      res.redirect('/user/login');
    }
  });

router.route('/list-less-hours-history')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (allowedRoles.includes(req.user.rol)) {
        let jwt = req.session.jwt;
        let idSeccion = req.user.idSeccion;
        let teachers = await getData(`persona/docente/listarseccion?idSeccion=${idSeccion}&tamanioPag=1000&pagina=1`, jwt);
        res.render("section-coordinator/list-less-hours-history", {
          user: req.user,
          csrfToken: req.csrfToken(),
          teachers: teachers ? teachers.data : [],
          jwt: jwt,
          idSeccion
        });
      } else {
        res.redirect('/');
        // No tiene permisos para hacer esa acción
      }
    } else {
      req.flash('error_messages', "Necesita Iniciar Sesión");
      res.redirect('/user/login');
    }
  });

router.route("/list-teachers").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (allowedRoles.includes(req.user.rol)) {
      let jwt = req.session.jwt;
      let idSeccion = req.user.idSeccion;
      let professors = await getData(`persona/docente/listarseccion?idSeccion=${idSeccion}&tamanioPag=2000&pagina=1`, jwt);
      let currentSection = await getData(`universidad/seccion/buscar?idSeccion=${idSeccion}`, jwt);
      res.render("section-coordinator/list-teachers", {
        user: req.user,
        professors: (professors ? professors.data : []),
        csrfToken: req.csrfToken(),
        currentSection: currentSection.data,
        jwt: jwt,
        idSeccion: req.user.idSeccion
      });
    }
    else {
      res.redirect('/');
    }
  } else {
    req.flash('error_messages', "Necesita Iniciar Sesión");
    res.redirect('/user/login');
  }
});

router.route('/places-new-teachers')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (req.user.rol === 'COORDINADOR_SECCION' || req.user.rol === 'ADMINISTRADOR') {
        let jwt = req.session.jwt;
        let idSeccion = req.user.idSeccion;
        let idDepartamento = req.user.idDepartamento;
        res.render("section-coordinator/places-new-teachers", {
          user: req.user,
          csrfToken: req.csrfToken(),
          idSeccion: idSeccion,
          idDepartamento: idDepartamento,
          jwt: jwt
        });
      }
    } else {
      req.flash('error_messages', "Necesita Iniciar Sesión");
      res.redirect('/user/login');
    }
  });

router.route('/ordinary-teaching')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (req.user.rol === 'COORDINADOR_SECCION') {
        let jwt = req.session.jwt;
        let idSeccion = req.user.idSeccion;
        let idDepartamento = req.user.idDepartamento;
        res.render("section-coordinator/ordinary-teaching", {
          user: req.user,
          csrfToken: req.csrfToken(),
          idSeccion: idSeccion,
          idDepartamento: idDepartamento,
          jwt: jwt
        });
      }
      else {
        res.redirect('/');
      }
    } else {
      req.flash('error_messages', "Necesita Iniciar Sesión");
      res.redirect('/user/login');
    }
  });

router.route('/places-new-teachers')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (req.user.rol === 'COORDINADOR_SECCION' || req.user.rol === 'ADMINISTRADOR') {
        let jwt = req.session.jwt;
        let idSeccion = req.user.idSeccion;
        let idDepartamento = req.user.idDepartamento;
        res.render("section-coordinator/ordinary-teaching", {
          user: req.user,
          csrfToken: req.csrfToken(),
          idSeccion: idSeccion,
          idDepartamento: idDepartamento,
          jwt: jwt
        });
      }
    } else {
      req.flash('error_messages', "Necesita Iniciar Sesión");
      res.redirect('/user/login');
    }
  });

router.route('/promotion-teachers')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (allowedRoles.includes(req.user.rol)) {
        let jwt = req.session.jwt;
        let idSeccion = req.user.idSeccion;
        let idDepartamento = req.user.idDepartamento;
        res.render("section-coordinator/promotion-teachers", {
          user: req.user,
          csrfToken: req.csrfToken(),
          idSeccion: idSeccion,
          idDepartamento: idDepartamento,
          jwt: jwt
        });
      }
    } else {
      req.flash('error_messages', "Necesita Iniciar Sesión");
      res.redirect('/user/login');
    }
  });


router.route('/cv-reception')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (allowedRoles.includes(req.user.rol)) {
        let jwt = req.session.jwt;
        let idSeccion = req.user.idSeccion;
        let idDepartamento = req.user.idDepartamento;
        res.render("section-coordinator/cv-reception", {
          user: req.user,
          csrfToken: req.csrfToken(),
          idSeccion: idSeccion,
          idDepartamento: idDepartamento,
          jwt: jwt
        });
      }
    } else {
      req.flash('error_messages', "Necesita Iniciar Sesión");
      res.redirect('/user/login');
    }
  });

router.route("/evaluation-teacher").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.rol === 'COORDINADOR_SECCION') {
      
      let idSeccion = req.user.idSeccion;
     
      
      let professors = await getData(`persona/docente/listarseccion?idSeccion=${idSeccion}&tamanioPag=2000&pagina=1`, jwt);
   
      res.render("section-coordinator/evaluation-teacher", {
        user: req.user,
        csrfToken: req.csrfToken(),
        professors: (professors ? professors.data : []),
        idSeccion,
        jwt,
      });



    }
    else {
      res.redirect('/');
    }
  } else {
    req.flash('error_messages', "Necesita Iniciar Sesión");
    res.redirect('/user/login');
  }
});
/*
  router.route('/new-teachers-call')
.get(async(req, res) => {
    if (req.isAuthenticated()) {
        if(req.user.rol === 'COORDINADOR_SECCION' || req.user.rol=== 'ADMINISTRADOR') {
            let jwt = req.session.jwt;
            //let teachers = await getData('persona/docente/listar?tamanioPag=1000', jwt);
            //let solicitudes=await getData('universidad/solicitudes/listar?tamanioPag=1000', jwt)
            
            res.render("section-coordinator/new-teachers-call", {
                user: req.user,
                csrfToken: req.csrfToken(),
                requestsLessHours:[],
                //solicitudes: solicitudes? solicitudes.data:[],
                jwt: jwt
            });           
        }
    } else {
        req.flash('error_messages', "Necesita Iniciar Sesión");
        res.redirect('/user/login');
    }
});
 */
module.exports = router;