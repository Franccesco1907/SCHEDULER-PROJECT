const router = require("express").Router();
const crypto = require("crypto");
const resetToken = require("../../db/models/resetTokens");
const { sendSetPasswordEmail } = require("../utils/email/successfulRegister");
const { getData } = require('../utils/fetchData');
const { jwt } = require("../../config/jwt");
const { readFile } = require('../utils/readExcelFile');
const { getDirectoryProject } = require('../utils/getDirectoryProject');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const dirProject = getDirectoryProject(__dirname);
//const dirProject = "C:/Users/LENOVO/Desktop/SW/PROYECTO/SW-Frontend";

router.route('/faculty')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (req.user.rol === 'ADMINISTRADOR') {
        let jwt = req.session.jwt;
        res.render("user/admin/faculty", {
          user: req.user,
          usuarios: [],
          csrfToken: req.csrfToken(),
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

router.route("/cicle").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.rol === "ADMINISTRADOR") {
      let jwt = req.session.jwt;
      res.render("user/admin/cicle", {
        user: req.user,
        usuarios: [],
        csrfToken: req.csrfToken(),
        jwt,
      });
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route("/register-user").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.rol === "ADMINISTRADOR") {
      let jwt = req.session.jwt;
      let departments = await getData("universidad/departamento/listar", jwt);
      let roles = await getData("seguridad/rol/listar", jwt);

      res.render("user/admin/register-user", {
        user: req.user,
        departments: departments ? departments.data : [],
        roles: roles ? roles : [],
        csrfToken: req.csrfToken(),
        jwt,
      });
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route('/list-users')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {

      if (req.user.rol === 'ADMINISTRADOR') {
        let jwt = req.session.jwt;
        let departments = await getData('universidad/departamento/listar', jwt);
        let roles = await getData('seguridad/rol/listar', jwt);
        let users = await getData(`persona/listarfiltros?tamanioPag=2000&nombreSeccion=`, jwt);

        res.render("user/admin/list-users", {
          user: req.user,
          departments: (departments ? departments.data.filter(x => x.estado === true) : []),
          users: (users ? users.data.map(x => {
            return {
              ...x,
              nombreCompleto: `${x.nombre} ${x.apellidos}`
            };
          }) : []),
          roles: (roles ? roles : []),
          csrfToken: req.csrfToken(),
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

router.route('/edit-user')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {
      if (req.user.rol === 'ADMINISTRADOR') {
        let jwt = req.session.jwt;
        let idPerson = req.query.idPerson;

        if (idPerson) {

          let departments = await getData('universidad/departamento/listar', jwt);
          departments.data = departments.data.filter(word => word.estado == true);
          let roles = await getData('seguridad/rol/listar', jwt);
          let cars = roles;
          cars.forEach(function (car, index, object) {
            if (car.nombre === 'PERSONA_EXTERNA') {
              object.splice(index, 1);
            }
          });
          roles = cars;

          let persona = await getData(`persona/buscar?idPersona=${idPerson}`, jwt);

          res.render("user/admin/edit-user", {
            user: req.user,
            departments: (departments ? departments.data : []),
            roles: (roles ? roles : []),
            persona: (persona ? persona.data : null),
            csrfToken: req.csrfToken(),
            jwt
          });

        } else {
          res.redirect('/');
        }


      } else {
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
      console.log(e);
    }

  });

router.route("/successful-register").post(async (req, res) => {
  try {
    const { email } = req.body;

    let token = crypto.randomBytes(32).toString("hex");
    await sendSetPasswordEmail(email, token);
    await resetToken.create({ token: token, email: email });
    //await resetToken({ token: token, email: email }).save();
    res.status(200).json("OK");
  } catch (e) {
    console.log(e);
  }
});

router.route("/matter").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.rol === "ADMINISTRADOR") {
      let jwt = req.session.jwt;
      res.render("user/admin/matter", {
        user: req.user,
        csrfToken: req.csrfToken(),
        jwt,
      });
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route('/edit-department')
  .get(async (req, res) => {
    if (req.isAuthenticated()) {

      req.user.photo = req.session.photo;
      if (['ADMINISTRADOR'].includes(req.user.rol)) {

        let idDepartment = req.query.idDepartment;
        if (idDepartment) {
          let department = await getData(`universidad/departamento/buscar?idDepartamento=${idDepartment}`, jwt);
          res.render("user/admin/edit-department", {
            user: req.user,
            csrfToken: req.csrfToken(),
            department: (department ? department.data : null),
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

router.route("/register-department").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.rol === "ADMINISTRADOR") {
      let jwt = req.session.jwt;

      res.render("user/admin/register-department", {
        user: req.user,
        csrfToken: req.csrfToken(),
        jwt,
      });
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route("/list-departments").get(async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.rol === "ADMINISTRADOR") {
      let jwt = req.session.jwt;
      let departments = await getData("universidad/departamento/listar", jwt);
      res.render("user/admin/list-departments", {
        user: req.user,
        departments: departments ? departments.data : [],
        csrfToken: req.csrfToken(),
        jwt,
      });
    } else {
      res.redirect("/");
    }
  } else {
    req.flash("error_messages", "Necesita Iniciar Sesión");
    res.redirect("/user/login");
  }
});

router.route('/load-data-users')

  .post(async (req, res) => {

    let body = req.body, response = { result: 'NOK' };

    try {

      const docTypes = ['DNI', 'PASAPORTE'];

      let file = body.fileUsers,
        jwt = req.session.jwt,
        dataUsers = readFile(`${dirProject}/uploads/${file.filename}`),
        sections = await getData(`universidad/seccion/listar?tamanioPag=1000&pagina=1`, jwt),
        persons = await getData('persona/listar?tamanioPag=1000', jwt),
        rols = await getData('seguridad/rol/listar', jwt),
        users = [],
        errors = [];

      sections = sections.data;
      persons = persons.data.map(x => x.correo);
      let length = 0;

      for (let dataUser of dataUsers) {
        if (!persons.includes(dataUser.correo)) {
          let existSection = sections.find(x => x.nombre === dataUser.seccion);
          if (existSection) {
            if (existSection.nombreDepartamento === dataUser.departamento) {
              let existRole = rols.find(x => x.nombre === dataUser.rol);
              if (existRole) {
                let user = {
                  numeroDocumento: dataUser.numeroDocumento || '',
                  nombres: dataUser.nombres || '',
                  apellidoPaterno: dataUser.apellidoPaterno || '',
                  apellidoMaterno: dataUser.apellidoMaterno || '',
                  nombreCompleto: `${dataUser.nombres} ${dataUser.apellidoPaterno + (dataUser.apellidoMaterno === undefined ? '' : ' ')}${dataUser.apellidoMaterno || ''}`,
                  sexo: dataUser.sexo,
                  correo: dataUser.correo,
                  celular: dataUser.celular || '',
                  direccion: dataUser.direccion || '',
                  fechaNacimiento: dataUser.fechaNacimiento || '06/12/2021', // Cambia esta fecha por la del día que llamas a esta api 
                  resenia: '',
                  idDepartamento: existSection.idDepartamento,
                  departamento: existSection.nombreDepartamento,
                  idSeccion: existSection.idSeccion,
                  rol: dataUser.rol,
                  idRol: existRole.idRol,
                  tipoDocumento: !docTypes.includes(dataUser.tipoDocumento) ? 0 : docTypes.findIndex(x => x === dataUser.tipoDocumento),
                  foto: '',
                  estado: true
                };

                if (dataUser.rol !== 'DOCENTE') {
                  users.push(user);
                } else {
                  users.push({
                    ...user,
                    codigo: dataUser.codigo,
                    dedicacion: dataUser.dedicacion,
                    categoria: dataUser.categoria,
                  });
                }

              } else {
                errors.push(`Error en la fila ${length + 2}: No existe el rol con nombre ${dataUser.rol}`);
              }
            } else {
              errors.push(`Error en la fila ${length + 2}: No existe el departamento con nombre ${dataUser.departamento}`);
            }
          } else {
            errors.push(`Error en la fila ${length + 2}: No existe la seccion con nombre ${dataUser.seccion}`);
          }
        } else {
          errors.push(`Error en la fila ${length + 2}: Usuario con correo ${dataUser.correo} ya existe`);
        }

        length++;
      }

      response.content = users;
      response.errors = errors;
      response.result = 'OK';
    } catch (e) {
      console.log(e);
    }

    res.status(200).json(response);
  });


router.route("/load-file")
  .post(upload.single("file"), (req, res, next) => {
    return res.status(200).send(req.file);
  });

module.exports = router;