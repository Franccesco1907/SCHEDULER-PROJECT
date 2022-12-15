const router = require("express").Router();
const { getData } = require("../utils/fetchData");

router.route("/register-preferences").get(async (req, res) => {
  if (req.isAuthenticated()) {
    let jwt = req.session.jwt;
    let idDocente = req.user.idPersona;
    let temp = await getData(`persona/docente/listar?tamanioPag=2000`, jwt);
    let dedicacion;
    for (let i of temp.data) {
      if (i.idPersona == idDocente) {
        dedicacion = i.dedicacion;
        break;
      }
    }
    if (["DOCENTE"].includes(req.user.rol) && dedicacion == "TC") {
      let departments = await getData(`universidad/departamento/listar`, jwt);
      //Agregar una etiqueta para poder elegir todos los departamentos
      departments.data.unshift({
        idDepartamento: departments.data.length + 1,
        nombre: "Todos",
      });
      res.render("teacher/register-preferences", {
        user: req.user,
        csrfToken: req.csrfToken(),
        departments: departments ? departments.data : [],
        jwt,
        idDocente,
      });
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route("/current-preferences").get(async (req, res) => {
  if (req.isAuthenticated()) {
    let jwt = req.session.jwt;
    let idDocente = req.user.idPersona;
    //let idSeccion = req.user.idSeccion;
    let idDepartamento = req.user.idDepartamento;
    let temp = await getData(`persona/docente/listar?tamanioPag=2000`, jwt);
    let currentSemester = await getData('universidad/ciclo/actual', jwt);
   // let currentSection = await getData(`universidad/seccion/buscar?idSeccion=${idSeccion}`, jwt);
    let loadProcess = await getData(`gestiondocente/procesoscarga/listar?idDepartamento=${idDepartamento}&idCiclo=${currentSemester.data.idCiclo}&tamanioPag=2000&pagina=1`, jwt);
    let dedicacion;
    for (let i of temp.data) {
      if (i.idPersona == idDocente) {
        dedicacion = i.dedicacion;
        break;
      }
    }
    if (["DOCENTE"].includes(req.user.rol) && dedicacion == "TC") {
      res.render("teacher/current-preferences", {
        user: req.user,
        csrfToken: req.csrfToken(),
        jwt,
        idDocente,
        idDepartamento,
        currentSemester,
        loadProcess
      });
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route("/record").get(async (req, res) => {
  if (req.isAuthenticated()) {
    let jwt = req.session.jwt;
    let idDocente = req.user.idPersona;
    if (
      [
        "DOCENTE",
        "ASISTENTE_DEPARTAMENTO",
        "JEFE_DEPARTAMENTO",
        "ASISTENTE_SECCION",
        "COORDINADOR_SECCION",
        "ADMINISTRADOR",
        "ASISTENTE_INVESTIGACION",
        "SECRETARIA",
      ].includes(req.user.rol)
    ) {
      let semesters = await getData(
        `universidad/ciclo/listar?tamanioPag=1000`,
        jwt
      );
      let currentSemester = await getData(`universidad/ciclo/actual`, jwt);
      if (["DOCENTE"].includes(req.user.rol)) {
        idDocente = req.user.idPersona;
        res.render(`teacher/record`, {
          user: req.user,
          csrfToken: req.csrfToken(),
          jwt,
          semesters: semesters,
          currentSemester: currentSemester,
          idDocente,
        });
      } else {
        idDocente = -req.user.idPersona; // Valor negativo del idPersona necesario para la comprobación en record.js
        res.render(`teacher/record`, {
          user: req.user,
          csrfToken: req.csrfToken(),
          jwt,
          semesters: semesters,
          currentSemester: currentSemester,
          idDocente,
        });
      }
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

module.exports = router;
