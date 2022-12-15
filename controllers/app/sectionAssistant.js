const { getData } = require("../utils/fetchData");
const { readFile } = require('../utils/readExcelFile');
const { getDirectoryProject } = require('../utils/getDirectoryProject');
const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const dirProject = getDirectoryProject(__dirname);

const typeSchedules = ['CLASE', 'LABORATORIO', 'PRACTICA', 'ASESORIA'];
const allowedRoles = [ 'ADMINISTRADOR','ASISTENTE_SECCION','COORDINADOR_SECCION'];

router.route('/list-courses')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            if (allowedRoles.includes(req.user.rol)) {
                let jwt = req.session.jwt;
                let idSeccion = req.user.idSeccion;
                let courses = await getData(`universidad/curso/listar?idSeccion=${idSeccion}&tamanioPag=2000&pagina=1`, jwt);
                res.render("section-assistant/list-courses", {
                    user: req.user,
                    csrfToken: req.csrfToken(),
                    courses: (courses ? courses.data : []),
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


// ! Asistente de sección - Cursos a Asignar
router.route('/courses-to-assign')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            if (allowedRoles.includes(req.user.rol)) {
                let jwt = req.session.jwt;
                let idSeccion = req.user.idSeccion;
                let courses = await getData(`universidad/curso/listar?idSeccion=${idSeccion}&tamanioPag=2000&pagina=1`, jwt);
                let currentSemester = await getData('universidad/ciclo/actual', jwt);
                let currentSection = await getData(`universidad/seccion/buscar?idSeccion=${idSeccion}`, jwt);
                let loadProcess = await getData(`gestiondocente/procesoscarga/listar?idDepartamento=${currentSection.data.idDepartamento}&idCiclo=${currentSemester.data.idCiclo}&tamanioPag=2000&pagina=1`, jwt);
                res.render("section-assistant/courses-to-assign", {
                    user: req.user,
                    csrfToken: req.csrfToken(),
                    courses: (courses ? courses.data : []),
                    currentSemester: currentSemester.data,
                    currentSection: currentSection.data,
                    loadProcess: (loadProcess ? loadProcess.data : []),
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

// ! Asistente de sección - Docentes a asignar
router.route('/teachers-to-assign')
    .get(async (req, res) => {
    if (req.isAuthenticated()) {
        if (allowedRoles.includes(req.user.rol)) {
            let jwt = req.session.jwt;
            let idSchedule = req.query.idSchedule;
            let idSeccion = req.user.idSeccion;
            //letx
            let schedule = await getData(`universidad/horario/buscar?idHorario=${idSchedule}`, jwt);
            let currentSemester = await getData('universidad/ciclo/actual', jwt);
            let currentSection = await getData(`universidad/seccion/buscar?idSeccion=${idSeccion}`, jwt);
            let loadProcess = await getData(`gestiondocente/procesoscarga/listar?idDepartamento=${currentSection.data.idDepartamento}&idCiclo=${currentSemester.data.idCiclo}&tamanioPag=2000&pagina=1`, jwt);
            let arrSchedulesSection = await getData(`universidad/horario/listarespecial?idSeccion=${idSeccion}&idCiclo=${currentSemester.data.idCiclo}`, jwt);
            if(arrSchedulesSection && arrSchedulesSection.data.map(function(e){return e.idHorario;}).includes(parseInt(idSchedule))){
                res.render("section-assistant/teachers-to-assign", {
                    user: req.user,
                    csrfToken: req.csrfToken(),
                    schedule: (schedule ? schedule.data : []),
                    idSchedule,
                    idSeccion,
                    loadProcess: (loadProcess ? loadProcess.data : []),
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

router.route('/register-course')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            if (allowedRoles.includes(req.user.rol)) {
                let jwt = req.session.jwt;
                let semesters = await getData(`universidad/ciclo/listar?tamanioPag=2&pagina=1`, jwt);
                let faculties = await getData('universidad/facultad/listar', jwt);
                res.render("section-assistant/register-course", {
                    user: req.user,
                    semesters: (semesters ? semesters.data : []),
                    faculties: (faculties ? faculties.data : []),
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

router.route('/edit-course')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            if (allowedRoles.includes(req.user.rol)) {
                let jwt = req.session.jwt;
                let idCourse = req.query.idCourse;
                if (idCourse) {
                    let semesters = await getData(`universidad/ciclo/listar?tamanioPag=2&pagina=1`, jwt);
                    let course = await getData(`universidad/curso/buscar?idCurso=${idCourse}`, jwt);
                    let faculties = await getData(`universidad/facultad/listar`, jwt);
                    res.render("section-assistant/edit-course", {
                        user: req.user,
                        semesters: (semesters ? semesters.data : []),
                        faculties: (faculties ? faculties.data : []),
                        course: (course ? course.data : null),
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


router.route('/load-data-courses')
    .post(async (req, res) => {
        let body = req.body, response = { result: 'NOK' };

        try {
            let file = body.fileCourses,
                jwt = req.session.jwt,
                idSeccion = req.user.idSeccion,
                dataCourses = readFile(`${dirProject}/uploads/${file.filename}`),
                faculties = await getData(`universidad/facultad/listar`, jwt),
                courses = [],
                errors = [];

            faculties = faculties.data;

            let length = 0;
            for (let dataCourse of dataCourses) {
                let faculty = faculties.find(x => x.nombre === dataCourse.facultad);
                let course = await getData(`universidad/curso/listar?idSeccion=${idSeccion}&tamanioPag=10&pagina=1&codigoNombre=${dataCourse.codigo}`, jwt);

                if (course.data.length) {
                    errors.push(`Error en la fila ${length + 2}: Curso con código ${dataCourse.codigo} ya existe`);
                } else {
                    if (faculty) {
                        if (dataCourse.horasClase === '') {
                            errors.push(`Error en la fila ${length + 2}: Horas Clase es un campo obligatorio`);
                        } else {
                            courses.push({
                                codigo: dataCourse.codigo.toUpperCase(),
                                nombre: dataCourse.nombre.toUpperCase(),
                                creditos: parseFloat(dataCourse.creditos),
                                idSeccion: +idSeccion,
                                idFacultad: +faculty.idFacultad,
                                facultad: dataCourse.facultad,
                                horaClase: +dataCourse.horaClase,
                                horaLaboratorio: dataCourse.horaLaboratorio === '' ? null : +dataCourse.horaLaboratorio,
                                horaPractica: dataCourse.horaPractica === '' ? null : +dataCourse.horaPractica
                            });
                        }
                    } else {
                        errors.push(`Error en la fila ${length + 2}: Facultad no existente`);
                    }
                }

                length++;
            }

            response.content = courses;
            response.errors = errors;
            response.result = 'OK';
        } catch (e) {
            console.log(e);
        }

        res.status(200).json(response);
    });

router.route('/load-data-schedules')
    .post(async (req, res) => {
        let body = req.body, response = { result: 'NOK' };

        try {
            let file = body.fileSchedules,
                jwt = req.session.jwt,
                idSeccion = req.user.idSeccion,
                dataSchedules = readFile(`${dirProject}/uploads/${file.filename}`),
                semesters = await getData(`universidad/ciclo/listar?tamanioPag=1000`, jwt),
                schedulesToUpload = [],
                errors = [];

            semesters = semesters.data;

            let length = 0;
            for (let dataSchedule of dataSchedules) {
                let { codigoCurso, ciclo, codigoHorario, tipoHorario } = dataSchedule;
                let course = await getData(`universidad/curso/listar?idSeccion=${idSeccion}&tamanioPag=10&pagina=1&codigoNombre=${codigoCurso}`, jwt);
                if (course.data.length) {
                    let semester = semesters.find(x => x.nombre === ciclo);
                    if (semester) {
                        tipoHorario = tipoHorario.toUpperCase();
                        if (typeSchedules.includes(tipoHorario)) {
                            let idCourse = course.data[0].idCurso;
                            let schedules = await getData(`universidad/curso/buscar?idCurso=${idCourse}`, jwt);
                            schedules = schedules.data.listaHorario;
                            console.log(schedules);
                            let schedule = schedules.find(x => x.codigo === codigoHorario && x.tipoHorario === tipoHorario);
                            if (!schedule) {
                                schedulesToUpload.push({
                                    codigo: codigoHorario,
                                    ciclo: ciclo,
                                    idCiclo: +semester.idCiclo,
                                    idCurso: +idCourse,
                                    tipoHorario: tipoHorario,
                                    codigoCurso: codigoCurso,
                                });
                            } else {
                                errors.push(`Error en la fila ${length + 2}: El horario con código ${codigoHorario} y tipo de horario ${tipoHorario} ya existe en el ciclo ${ciclo}`);
                            }
                        } else {
                            errors.push(`Error en la fila ${length + 2}: El tipo de horario ${tipoHorario} no existe, por favor revise las instrucciones`);
                        }
                    } else {
                        errors.push(`Error en la fila ${length + 2}: El ciclo ${ciclo} no existe`);
                    }
                } else {
                    errors.push(`Error en la fila ${length + 2}: El código de curso ${codigoCurso} no existe`);
                }

                length++;
            }

            response.content = schedulesToUpload;
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
