import { createDataTable } from '/utils/data-table.js';
import { getData, deleteData, postData, putData } from '/utils/fetch.js';
import { showNotification } from '/utils/notifications.js';

var fileCourses = undefined;
var fileSchedules = undefined;

var coursesDataTable = undefined;
let idCourse = undefined;
let nameCourseSelected = undefined;

var coursesPreview = undefined;
var coursesPreviewDataTable = undefined;
var coursesErrors = undefined;

var schedulesPreview = undefined;
var schedulesPreviewDataTable = undefined;
var schedulesErrors = undefined;

var $codeNameCourse = $('#code-name-course');

Dropzone.options.uploadCourses = {
    url: "/section-assistant/load-file",
    addRemoveLinks: true,
    maxFiles: 1,
    maxFilesize: 20, //MB
    acceptedFiles: '.xlsx,.xls',
    dictDefaultMessage: '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i>Arrastre los archivos aquí <span class="font-xs">para añadirlos</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (O darle Click)</h4></span>',
    dictResponseError: '¡Error al cargar el archivo!',
    headers: {
        'X-CSRF-TOKEN': $('#csrf').val()
    },
    init: function () {
        this.on('success', function (file, res) {
            fileCourses = res;
        });
    },
};

Dropzone.options.uploadSchedules = {
    url: "/section-assistant/load-file",
    addRemoveLinks: true,
    maxFiles: 1,
    maxFilesize: 20, //MB
    acceptedFiles: '.xlsx,.xls',
    dictDefaultMessage: '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i>Arrastre los archivos aquí <span class="font-xs">para añadirlos</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (O darle Click)</h4></span>',
    dictResponseError: '¡Error al cargar el archivo!',
    headers: {
        'X-CSRF-TOKEN': $('#csrf').val()
    },
    init: function () {
        this.on('success', function (file, res) {
            fileSchedules = res;
        });
    },
};

$(function () {
    loadDataCourses();

    $(document).on('click', '.courses-row', function () {
        if (idCourse !== undefined && idCourse == $(this).attr('id')) {
            $(`#${idCourse}`).removeClass('course-selected');
            idCourse = undefined;
        } else {
            $(`#${idCourse}`).removeClass('course-selected');
            idCourse = $(this).attr('id');
            nameCourseSelected = $(this).children().eq(1).html();
            $(this).addClass("course-selected");
        }
    });

    $('#edit-course-modal').on('click', function () {
        if (idCourse) {
            let id = idCourse.split('-')[1];
            window.location.replace(`/section-assistant/edit-course?idCourse=${id}`);
        } else {
            showNotification('alert-warning', 'Necesita seleccionar un curso <i class="fas fa-exclamation-triangle pl-2"></i>');
        }
    });

    $('#delete-course-modal').on('click', function () {
        if (idCourse) {
            $('#deleteCourseModal .modal-body .name-course').html(nameCourseSelected);
            $('#deleteCourseModal').modal('show');
        } else {
            showNotification('alert-warning', 'Necesita seleccionar un curso <i class="fas fa-exclamation-triangle pl-2"></i>');
        }
    });

    $('#delete-course').on('click', async function () {
        if (idCourse) {
            let id = idCourse.split('-')[1];
            let data = await deleteData('universidad/curso/eliminar?idCurso=' + id, jwt);
            if (data.data === 1) {
                courses = await getData(`universidad/curso/listar?idSeccion=${idSeccion}&tamanioPag=1000&pagina=1`, jwt);
                courses = courses.data;
                loadDataCourses();
                $('#deleteCourseModal').trigger('click');
                swal("¡El curso se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
                idCourse = undefined;
            } else {
                console.log('Ocurrió un error');
            }
        } else {
            console.log('Ocurrió un error');
        }
    });

    /****** CARGA MASIVA DE CURSOS ******/

    $('#load-data-courses').on('click', async function () {
        let response;

        await fetch('/section-assistant/load-data-courses', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('#csrf').val(),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileCourses
            })
        })
            .then(response => response.json())
            .then(data => {
                response = data;
            });

        if (response.result === 'OK') {
            $('#loadMasiveCoursesModal').modal('hide');
            $('#previewCoursesModal').modal('show');

            coursesPreview = response.content;
            coursesErrors = response.errors;

            loadDataCoursesPreview();
            loadErrors('courses');

            $('#table-courses-preview tr td').css("height", "20px");
        } else {
            console.log('Ocurrió un error en la lectura de archivo');
        }

    });

    $('#load-courses-massive').on('click', async function () {
        if (coursesPreview.length) {
            let coursesMassive = coursesPreview.map(course => {
                return {
                    "nombre": course.nombre,
                    "codigo": course.codigo,
                    "creditos": course.creditos,
                    "idSeccion": course.idSeccion,
                    "idFacultad": course.idFacultad,
                    "horaClase": course.horaClase,
                    "horaLaboratorio": course.horaLaboratorio,
                    "horaPractica": course.horaPractica,
                    "listaHorario": [],
                }
            });

            let response = await postData('universidad/curso/guardarmasivo', coursesMassive, jwt, user);

            if (response.data) {
                courses = await getData(`universidad/curso/listar?idSeccion=${idSeccion}&tamanioPag=2000&pagina=1`, jwt);
                courses = courses.data;
                loadDataCourses();
                $('#previewCoursesModal').modal('hide');
                swal("¡Los cursos se han guardado correctamente!", "Presione OK para ver la lista de cursos registrados", "success");
                coursesPreview = [];
                loadDataCoursesPreview();
            } else {
                console.log("ERROR EN API DE CARGA MASIVA DE CURSOS");
            }
        } else {
            alert("No hay cursos que cargar");
        }
    });

    /****** CARGA MASIVA DE HORARIOS ******/

    $('#load-data-schedules').on('click', async function () {
        let response;

        await fetch('/section-assistant/load-data-schedules', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('#csrf').val(),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileSchedules
            })
        })
            .then(response => response.json())
            .then(data => {
                response = data;
            });

        if (response.result === 'OK') {
            $('#loadMasiveSchedulesModal').modal('hide');
            $('#previewSchedulesModal').modal('show');

            schedulesPreview = response.content;
            schedulesErrors = response.errors;

            loadDataSchedulesPreview();
            loadErrors('schedules');

            $('#table-schedules-preview tr td').css("height", "20px");
        } else {
            console.log('Ocurrió un error en la lectura de archivo');
        }

    });

    $('#load-schedules-massive').on('click', async function () {
        console.log(schedulesErrors);
        if (schedulesErrors.length) {
            alert('Corrija los erorres y cargue nuevamente el archivo');
            return false;
        } else {
            if (schedulesPreview.length) {
                let scheduless = [];
                schedulesPreview.forEach(schedule => {
                    scheduless.push({
                        "idCiclo": +schedule.idCiclo,
                        "idCurso": +schedule.idCurso,
                        "codigo": schedule.codigo,
                        "tipoHorario": schedule.tipoHorario,
                        "codigoCurso": schedule.codigoCurso,
                        "listaHorarioDocente": []
                    });
                });

                //Thanks to backend...
                let courseWanted = await getData(`universidad/curso/buscar?idCurso=${schedulesPreview[0].idCurso}`, jwt);
                courseWanted = courseWanted.data;
                let faculties = await getData(`universidad/facultad/listar`, jwt);
                let facultyWanted = faculties.data.find(x => x.nombre === courseWanted.facultad);

                let schedulesMassive = {
                    "idCurso": +schedulesPreview[0].idCurso,
                    "nombre": courseWanted.nombre,
                    "codigo": courseWanted.codigo,
                    "creditos": courseWanted.creditos,
                    "idFacultad": facultyWanted.idFacultad,
                    "horaClase": courseWanted.horaClase,
                    "listaHorario": scheduless
                }

                let response = await putData('universidad/curso/actualizar', schedulesMassive, jwt, user);

                if (response.data) {
                    $('#previewSchedulesModal').modal('hide');
                    swal("¡Los horarios se han guardado correctamente!", "Presione OK para ver la lista de cursos registrados", "success");
                } else {
                    console.log("ERROR EN API DEL BACK BACK");
                }
            } else {
                alert("No hay horarios que cargar");
            }
        }
    });

    $('#search-course').on('click', async () => {
        let nameCodeCourse = $codeNameCourse.val();
        let coursesData = await getData(`universidad/curso/listar?codigoNombre=${nameCodeCourse}&idSeccion=${idSeccion}&tamanioPag=10000&pagina=1`, jwt);
        courses = coursesData.data || [];
        loadDataCourses();
    });
});

function loadDataCourses() {
    if (coursesDataTable) coursesDataTable.destroy();
    let options = {
        idTable: 'courses-data-table',
        data: courses,
        fields: ['codigo', 'nombre', 'facultad', 'horaClase', 'creditos'],
        name: 'Cursos',
        idName: 'idCurso',
        className: 'courses-row',
        addButtons: true
    };
    coursesDataTable = createDataTable(options);
    $("#courses-data-table_wrapper").children().first().remove();
}

function loadDataCoursesPreview() {
    if (coursesPreviewDataTable) coursesPreviewDataTable.destroy();
    let options = {
        idTable: 'table-courses-preview',
        data: coursesPreview,
        fields: ['codigo', 'nombre', 'creditos', 'facultad', 'horaClase'],
        name: 'Cursos',
        idName: 'codigo',
        className: '',
        addButtons: false
    };

    coursesPreviewDataTable = createDataTable(options);
}

function loadDataSchedulesPreview() {
    if (schedulesPreviewDataTable) schedulesPreviewDataTable.destroy();
    let options = {
        idTable: 'table-schedules-preview',
        data: schedulesPreview,
        fields: ['codigoCurso', 'ciclo', 'codigo', 'tipoHorario'],
        name: 'Horarios',
        idName: 'codigo',
        className: '',
        addButtons: false
    };

    schedulesPreviewDataTable = createDataTable(options);
}

function loadErrors(type) {
    let errors = type === 'courses' ? coursesErrors : schedulesErrors;

    $(`#errors-${type}`).html(errors.map(
        error => `<div class="alert alert-danger" role="alert">
                    <div class="container">
                    <div class="alert-icon">
                        <i class="zmdi zmdi-block"></i>
                    </div>
                    <strong>¡Lo sentimos!</strong> ${error}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">
                        <i class="zmdi zmdi-close"></i>
                        </span>
                    </button>
                    </div>
                </div>`).join(''));
}