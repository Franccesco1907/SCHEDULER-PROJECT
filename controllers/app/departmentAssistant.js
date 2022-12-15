const { getData, postData } = require("../utils/fetchData");
const { readFile } = require('../utils/readExcelFile');
const { getDirectoryProject } = require('../utils/getDirectoryProject');
const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const professorUtils = require("../utils/department-assistant/readDataProfessor");
const dirProject = getDirectoryProject(__dirname);
const crypto = require("crypto");
const resetToken = require("../../db/models/resetTokens");
const { sendSetPasswordEmail } = require("../utils/email/successfulRegister");
//const dirProject ='/Users/DAYANA/Desktop/2021-2/Ingeniería de software/REPOSITORIO/SW-Frontend/';
const { jwt } = require("../../config/jwt");
const allowedRoles = ['ADMINISTRADOR','JEFE_DEPARTAMENTO','ASISTENTE_DEPARTAMENTO'];

router.route("/list-less-hours").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (allowedRoles.includes(req.user.rol)) {
      let jwt = req.session.jwt;
      let idDepartamento = req.user.idDepartamento;
      let idSeccion = req.user.idSeccion;
      let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartamento}&tamanioPag=100&pagina=1`, jwt);
      let teachers = await getData(`persona/docente/listarseccion?idSeccion=${idSeccion}&tamanioPag=1000&pagina=1`, jwt);
      let currentSemester = await getData(`universidad/ciclo/actual`,jwt);
      res.render("department-assistant/list-less-hours", {
        user: req.user,
        idSeccion: idSeccion,
        idDepartamento: idDepartamento,
        csrfToken: req.csrfToken(),
        sections: sections ? sections.data : [],
        teachers: teachers ? teachers.data : [],
        currentSemester,
        jwt
      });

    } else {
      res.redirect('/');
      // No tiene permisos para hacer esa acción
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route('/list-less-hours-history')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (allowedRoles.includes(req.user.rol) || true) {
        let jwt = req.session.jwt;
        let idDepartamento = req.user.idDepartamento;
        let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartamento}&tamanioPag=1000&pagina=1`, jwt);
        res.render("department-assistant/list-less-hours-history", {
          user: req.user,
          csrfToken: req.csrfToken(),
          sections: sections ? sections.data : [],
          jwt: jwt
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
router.route('/ordinary-teaching-history')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (allowedRoles.includes(req.user.rol) || true) {
        let jwt = req.session.jwt;
        let idDepartamento = req.user.idDepartamento;
        let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartamento}&tamanioPag=1000&pagina=1`, jwt);
        res.render("department-assistant/ordinary-teaching-history", {
          user: req.user,
          csrfToken: req.csrfToken(),
          sections: sections ? sections.data : [],
          jwt: jwt
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


router.route('/assigned-courses')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (allowedRoles.includes(req.user.rol) || true) {
        let jwt = req.session.jwt;
        let idSeccion = req.user.idSeccion;
        let idDepartamento = req.user.idDepartamento;
        let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartamento}&tamanioPag=1000&pagina=1`, jwt);
        let currentSemester = await getData(`universidad/ciclo/actual`,jwt);
        res.render("department-assistant/assigned-courses", {
          user: req.user,
          csrfToken: req.csrfToken(),
          sections: sections.data,
          currentSemester,
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

router.route("/places-new-teachers").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (allowedRoles.includes(req.user.rol) || true) {
      let jwt = req.session.jwt;
      let idDepartamento = req.user.idDepartamento;

      res.render("department-assistant/places-new-teachers", {
        user: req.user,
        csrfToken: req.csrfToken(),
        idDepartamento,
        jwt
      });

    } else {
      res.redirect('/');
      // No tiene permisos para hacer esa acción
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route("/ordinary-teaching").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (allowedRoles.includes(req.user.rol) || true) {
      let jwt = req.session.jwt;
      let idDepartamento = req.user.idDepartamento;

      res.render("department-assistant/ordinary-teaching", {
        user: req.user,
        csrfToken: req.csrfToken(),
        idDepartamento,
        jwt
      });

    } else {
      res.redirect('/');
      // No tiene permisos para hacer esa acción
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route("/promotion-teachers").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (allowedRoles.includes(req.user.rol) || true) {
      let jwt = req.session.jwt;
      let idDepartamento = req.user.idDepartamento;

      res.render("department-assistant/promotion-teachers", {
        user: req.user,
        csrfToken: req.csrfToken(),
        idDepartamento,
        jwt
      });

    } else {
      res.redirect('/');
      // No tiene permisos para hacer esa acción
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route("/list-courses").get(async (req, res) => {
  if (req.isAuthenticated()) {
    let idDepartment = 1;
    if (req.user.rol === 'ASISTENTE_DEPARTAMENTO' || req.user.rol === 'ADMINISTRADOR') {
      let jwt = req.session.jwt;
      let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=2000&pagina=1`, jwt);
      res.render("department-assistant/list-courses", {
        user: req.user,
        csrfToken: req.csrfToken(),
        sections: sections ? sections.data : [], // !
        jwt: jwt
      });
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

// ! Asistente de departamento - Listado de cursos - detalle
router.route("/list-courses-detail")
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      let idDepartment = 1;
      if (req.user.rol === 'ASISTENTE_DEPARTAMENTO' || req.user.rol === 'ADMINISTRADOR') {
        let jwt = req.session.jwt;
        let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=2000&pagina=1`, jwt);
        res.render("department-assistant/list-courses-detail", {
          user: req.user,
          csrfToken: req.csrfToken(),
          sections: sections ? sections.data : [], // !
          jwt: jwt
        });
      } else {
        res.redirect("/");
      }
    } else {
      req.flash("error_messages", "Necesita Iniciar Sesión");
      res.redirect("/user/login");
    }
  }
  );

router.route("/list-teachers").get(async (req, res) => {
  if (req.isAuthenticated()) {
    let idDepartment = 1;
    if (req.user.rol === 'ADMINISTRADOR' || req.user.rol === 'ASISTENTE_DEPARTAMENTO') {
      let jwt = req.session.jwt;
      let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=2000&pagina=1`, jwt);
      ////console.lo("IMPRESIÓN DE SECTIONS EN LIST-TEACHERS: ", sections);
      res.render("department-assistant/list-teachers", {
        user: req.user,
        csrfToken: req.csrfToken(),
        sections: sections ? sections.data : [],
        jwt: jwt
      });
    } else {
      res.redirect('/');
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }

});

router.route("/list-professor").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if ( req.user.rol === 'ADMINISTRADOR' || req.user.rol === 'ASISTENTE_DEPARTAMENTO' || req.user.rol === 'JEFE_DEPARTAMENTO') {
      let jwt = req.session.jwt;
      let sections = await getData("universidad/seccion/listar?tamanioPag=100&pagina=1&idDepartamento="+req.user.idDepartamento, jwt);
      let professors = await getData(`persona/docente/listar?tamanioPag=2000&pagina=1&idDepartamento=${req.user.idDepartamento}`, jwt);
      let roles = await getData('seguridad/rol/listar', jwt);
      res.render("department-assistant/list-professor", {
        user: req.user,
        professors: (professors ? professors.data : []),
        sections: (sections ? sections.data : []),
        roles: (roles ? roles : []),
        csrfToken: req.csrfToken(),
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

router.route("/register-professor").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.rol === 'ADMINISTRADOR' || req.user.rol === 'ASISTENTE_DEPARTAMENTO' || req.user.rol === 'JEFE_DEPARTAMENTO') {
      let jwt = req.session.jwt;
      let roles = await getData('seguridad/rol/listar', jwt);
      let sections = await getData("universidad/seccion/listar?tamanioPag=100&pagina=1&idDepartamento=" + req.user.idDepartamento, jwt);
      res.render("department-assistant/register-professor", {
        user: req.user,
        sections: (sections ? sections.data : []),
        roles: (roles ? roles : []),
        csrfToken: req.csrfToken(),
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

router.route('/successful-register')
    .post(async (req, res) => {

        try {

            const { email } = req.body;

            let token = crypto.randomBytes(32).toString('hex');
            await sendSetPasswordEmail(email, token);
            await resetToken.create({ token: token, email: email });
            //await resetToken({ token: token, email: email }).save();
            res.status(200).json('OK');

        } catch (e) {
            ////console.lo(e);
        }

    });




router.route("/edit-professor").get(async (req, res) => {
  if (req.isAuthenticated()) {
    req.user.photo = req.session.photo;
    if (req.user.rol === 'ADMINISTRADOR' || req.user.rol === 'ASISTENTE_DEPARTAMENTO') {
      let jwt = req.session.jwt;
      let idPerson = req.query.idProfessor;
      let edit = req.query.edit;
      if (idPerson) {
        let roles = await getData('seguridad/rol/listar', jwt);
        let sections = await getData("universidad/seccion/listar?tamanioPag=100&pagina=1&idDepartamento=" + req.user.idDepartamento, jwt);
        let personData = await getData("persona/buscar?idPersona=" + idPerson, jwt);

        //enviar info del docente
        res.render("department-assistant/edit-professor", {
          user: req.user,
          sections: (sections ? sections.data : []),
          roles: (roles ? roles : []),
          person: (personData ? personData : []),
          edit: edit,
          csrfToken: req.csrfToken(),
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
  }
});

router
  .route("/load-file-professor")
  .post(upload.single("file"), (req, res, next) => {
    return res.status(200).send(req.file);
  });

router.route('/load-data-professor')
  .post( async(req, res) => {
    let body = req.body, response = { result: 'NOK' };

    try {
      let file = body.fileUploaded;
      let err=[]
      let dataProfessors = professorUtils.readFile(`${dirProject}/uploads/${file.filename}`);
      let sections=await getData("universidad/seccion/listar?tamanioPag=100&pagina=1&idDepartamento=" + req.user.idDepartamento, jwt);
      sections=sections.data;
      let professor = [];
      let length = 0;
      let correct=0;
      for (let dataProfessor of dataProfessors) {
        //console.lo(dataProfessors);
        let sectionTeacher=sections.find(x => x.nombre === dataProfessor['Seccion'].toUpperCase());
        //console.lo(sectionTeacher);
        if(sectionTeacher===undefined){
          err.push(length+1);  
        }
        else{
        professor.push({
          "numeroDocumento": dataProfessor['numeroDocumento'],
          "nombres": dataProfessor['nombres'],
          "codigo": dataProfessor['codigoPUCP'],
          "apellidoPaterno": dataProfessor['apellidoPaterno'],
          "apellidoMaterno": dataProfessor['apellidoMaterno'],
          "sexo": dataProfessor['sexo'],
          "correo": dataProfessor['correo'],
          "celular": dataProfessor['celular'],
          "direccion": dataProfessor['direccion'],
          "fechaNacimiento": dataProfessor['fechaNacimiento'],
          "tipoDocumento": dataProfessor['tipoDocumento'],
          "dedicacion": dataProfessor['dedicacion'],
          "categoria": dataProfessor['categoria'],
          "idDepartamento": req.user.idDepartamento,
          "idSeccion": parseInt(sectionTeacher.idSeccion),
        });
        correct++;
      }
        length++;
      
      }

      response.result = 'OK';
      response.content = professor;
      response.error=err;
      //console.lo(professor);
    } catch (e) {
      //console.lo(e);
    }

    res.json(response);
  });


router.route('/list-sections')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      req.user.photo = req.session.photo;
      if (['ADMINISTRADOR', 'ASISTENTE_DEPARTAMENTO','JEFE_DEPARTAMENTO'].includes(req.user.rol)) {

        let idDepartment = req.user.idDepartamento;
        let sections = undefined;
        let departments = await getData('universidad/departamento/listar', jwt);
        if(req.user.rol!="ADMINISTRADOR"){
          sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=100&pagina=1`,jwt);
        }else{
          sections = await getData(`universidad/seccion/listar?tamanioPag=100&pagina=1`,jwt);
        }
        res.render("department-assistant/list-sections", {
          user: req.user,
          csrfToken: req.csrfToken(),
          departments: (departments ? departments.data : []),
          sections: (sections ? sections.data : []),
          jwt
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

function getSchedulesPerCourses(data) {
  let datos = [];
  ////console.lo("DATOS= ", data);
  for (let i = 0; i < data.length; i++) {
    ////console.lo("i: ", i, "longitud ", data.length);
    for (let j = 0; j < data[i].listaHorario.length; j++) {
      datos[i] = {};
      datos[i].codigoCurso = data[i].codigo;
      datos[i].nombreCurso = data[i].nombre;
      datos[i].codigoHorario = data[i].listaHorario[j].codigo;
      ////console.lo("j: ", j, "longitud ", data[i].listaHorario.length);
      for (let k = 0; k < data[i].listaHorario[j].listaDocente.length; k++) {
        ////console.lo("ENTRO");
        datos[i] = {};
        datos[i].codigoCurso = data[i].codigo;
        datos[i].nombreCurso = data[i].nombre;
        datos[i].codigoHorario = data[i].listaHorario[j].codigo;
        datos[i].nombreDocente = data[i].listaHorario[j].listaDocente[k].nombre;
        datos[i].correoDocente = data[i].listaHorario[j].listaDocente[k].correo;
      }
    }
  }
  ////console.lo("DATOS 2 = ", datos);
  return datos;
}

router.route('/list-schedules')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      req.user.photo = req.session.photo;
      let idSeccion = req.user.idSeccion;
      ////console.lo("idSeccion = ", idSeccion);
      if (['ADMINISTRADOR', 'ASISTENTE_DEPARTAMENTO'].includes(req.user.rol)) {
        let jwt = req.session.jwt;
        let schedules = await getData(`universidad/curso/listar?idSeccion=${idSeccion}&idCiclo=1&tamanioPag=2000&pagina=1`, jwt);
        res.render("department-assistant/list-schedules", {
          user: req.user,
          csrfToken: req.csrfToken(),
          schedules: (schedules ? getSchedulesPerCourses(schedules.data) : []),
          jwt
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

router.route('/load-data-sections')
  .post(async(req, res) => {
    let body = req.body, response = { result: 'NOK' };

    try {
      let file = body.fileUploaded;
      
      let dataSections = readFile(`${dirProject}/uploads/${file.filename}`);
      let rol = req.user.rol;
      let idDepartamento = req.user.idDepartamento;
   
      let sections = [], errors = [];
      let length = 0;
      for (let dataSection of dataSections) {
        let codigo=dataSection['Codigo'].toUpperCase();
        let section = await getData(`universidad/seccion/listar?tamanioPag=10&pagina=1&codigoNombre=${codigo}`, jwt);
       
        if (section.data.length) {
            errors.push(`Error en la fila ${length + 2}: Sección con código ${codigo} ya existe`);
        }
        else if(rol==="ADMINISTRADOR"){
            let departamento = dataSection['Departamento al que pertenece'].toUpperCase();
           
            let departments = await getData('universidad/departamento/listar', jwt);
            departments= departments.data;
            let dptoSelect = departments.find(x => x.nombre === departamento);
           
            if (!dptoSelect) {
              errors.push(`No existe el departamento ${departamento}`);
            }
            else{
              sections.push({
              "codigo": dataSection['Codigo'].toUpperCase(),
              "nombre": dataSection['Nombre de la seccion'].toUpperCase(),
              "fechaCreacion": dataSection['Fecha de creacion'],
              "nombreDepartamento": departamento,
              "idDepartamento": dptoSelect.idDepartamento,
              "resenia": dataSection['Descripcion'],
              });
            }
        }
        else{
          sections.push({
          "codigo": dataSection['Codigo'].toUpperCase(),
          "nombre": dataSection['Nombre de la seccion'].toUpperCase(),
          "fechaCreacion": dataSection['Fecha de creacion'],
          "idDepartamento": idDepartamento,
          "resenia": dataSection['Descripcion'],
          });
        }

        length++;
      }

      response.result = 'OK';
      response.content = sections;
      response.errors = errors;
    } catch (e) {
      ////console.lo(e);
    }

    res.json(response);
  });

router.route('/register-section')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      req.user.photo = req.session.photo;
      if (['ADMINISTRADOR', 'ASISTENTE_DEPARTAMENTO','JEFE_DEPARTAMENTO'].includes(req.user.rol)) {
        
        let departments = await getData('universidad/departamento/listar', jwt);
        res.render("department-assistant/register-section", {
          user: req.user,
          csrfToken: req.csrfToken(),
          departments: (departments ? departments.data : []),
          jwt
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

router.route('/edit-section')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {

      req.user.photo = req.session.photo;
      if (['ADMINISTRADOR', 'ASISTENTE_DEPARTAMENTO','JEFE_DEPARTAMENTO'].includes(req.user.rol) ) {
       
        let idSection = req.query.idSection;
        if (idSection) {
          let departments = await getData('universidad/departamento/listar', jwt);
          let section = await getData(`universidad/seccion/buscar?idSeccion=${idSection}`, jwt);
         
          res.render("department-assistant/edit-section", {
            user: req.user,
            csrfToken: req.csrfToken(),
            departments: (departments ? departments.data : []),
            section: (section ? section.data : null),
            jwt
          });
        }
        else
          res.redirect('/');
      }
      else {
        res.redirect('/');
      }

    } else {
      req.flash('error_messages', "Necesita Iniciar Sesión");
      res.redirect('/user/login');
    }
  });

router.route('/load-file-sections')
  .post(upload.single('file'), (req, res, next) => {
    return res.status(200).send(req.file);
  });

router.route('/register-indicator')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      req.user.photo = req.session.photo;
      if (['JEFE_DEPARTAMENTO', 'ASISTENTE_DEPARTAMENTO'].includes(req.user.rol)) {
       
        res.render("department-assistant/register-indicator", {
          user: req.user,
          csrfToken: req.csrfToken(),
          jwt
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


  router.route("/process-evaluation").get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (['JEFE_DEPARTAMENTO', 'ASISTENTE_DEPARTAMENTO'].includes(req.user.rol)) {
        let idDepartment = req.user.idDepartamento;
        let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=100&pagina=1`, jwt);
      
        res.render("department-assistant/process-evaluation", {
          user: req.user,
          csrfToken: req.csrfToken(),
          sections: (sections ? sections.data : []),
          jwt
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

module.exports = router;
