import { getData, putData } from '/utils/fetch.js';
import { showNotification } from '/utils/notifications.js';

let $courseCode = $('#course-code');
let $courseName = $('#course-name');
let $weeklyHours = $('#weekly-hours');
let $labHours = $('#lab-hours');
let $practiceHours = $('#practice-hours');
let $credits = $('#credits');
let $semester = $('#semester');
let $scheduleCode = $('#schedule-code');
let $scheduleType = $('#schedule-type');
let $dictationType = $('#dictation-type');
let $faculty = $('#faculty');

let courseSemesters = {};
let nameSemesters = {}

let idSchedule = undefined;
let codeScheduleSelected = undefined;
let typeScheduleSelected = undefined;
let actionFlag = undefined;

$(function () {
    $('.select2').select2();
    $(`#faculty option:contains("${course.facultad}")`).prop('selected', true);
    $faculty.select2();
    $courseCode.val(course.codigo);
    $courseName.val(course.nombre);
    $credits.val(course.creditos);
    $weeklyHours.val(course.horaClase);
    $labHours.val(course.horaLaboratorio || '');
    $practiceHours.val(course.horaPractica || '');

    for (let semester of semesters) {
        courseSemesters[semester.idCiclo] = [];
        nameSemesters[semester.idCiclo] = semester.nombre;
    }

    for (let schedule of course.listaHorario) {
        courseSemesters[schedule.idCiclo].push({
            idCiclo: schedule.idCiclo,
            codigo: schedule.codigo,
            tipoHorario: schedule.tipoHorario,
            idHorario: schedule.idHorario
        });
    }

    loadDataSemester($semester.val());

    $semester.on('change', function () {
        let semester = $(this).val();
        loadDataSemester(semester);
    })

    $('#add-schedule-form').on('submit', function () {
        if ($semester.val() === '') {
            showNotification('alert-warning', 'Por favor seleccione un ciclo <i class="fas fa-exclamation-triangle pl-2"></i>');
            $semester.focus();
            return false;
        } else {
            let semester = $('#semester').val();
            let courseSemester = courseSemesters[semester];
            if (actionFlag) {
                let indexScheduleSelected = courseSemester.findIndex(x => x.codigo === $scheduleCode.val() && x.tipoHorario === $scheduleType.val());
                if (indexScheduleSelected === -1) {
                    courseSemester.push({
                        idCiclo: parseInt($('#semester').val()),
                        codigo: $scheduleCode.val(),
                        tipoHorario: $scheduleType.val(),
                    });
                } else {
                    $('#addScheduleModal').modal('hide');
                    showNotification('alert-warning', 'No puede ingresar un horario con el mismo código y tipo de horario <i class="fas fa-exclamation-triangle pl-2"></i>');
                    return false;
                }
            } else {
                let indexScheduleSelectedOriginal = courseSemester.findIndex(x => x.codigo === codeScheduleSelected && x.tipoHorario === typeScheduleSelected);
                let indexScheduleSelected = courseSemester.findIndex(x => x.codigo === $scheduleCode.val() && x.tipoHorario === $scheduleType.val());
                if (indexScheduleSelected === -1 || indexScheduleSelected === indexScheduleSelectedOriginal) {
                    courseSemester[indexScheduleSelectedOriginal].codigo = $scheduleCode.val();
                    courseSemester[indexScheduleSelectedOriginal].tipoHorario = $scheduleType.val();
                } else {
                    $('#addScheduleModal').modal('hide');
                    showNotification('alert-warning', 'No puede ingresar un horario con el mismo código y tipo de horario <i class="fas fa-exclamation-triangle pl-2"></i>');
                    return false;
                }
            }

            loadDataSemester(semester);
            $scheduleCode.val('');
            $scheduleType.val('').select2();
            $('#addScheduleModal').modal('hide');
            idSchedule = undefined;
            return false;
        }
    });

    $('#delete-schedule-modal').on('click', async function () {
        if (idSchedule) {
            let semester = $('#semester').val();
            let courseSemester = courseSemesters[semester];
            let courseToDelete = courseSemester.find(x => x.codigo === codeScheduleSelected && x.tipoHorario === typeScheduleSelected);
            let idHorario = courseToDelete.idHorario;
            let response = await getData(`universidad/horario/verificar?idHorario=${idHorario}`, jwt);

            if (response.data === 1) {
                $('#deleteScheduleModal .modal-body').html(`
                <div class="text-center">¿Está seguro de querer eliminar el horario con código ${codeScheduleSelected} y tipo de horario ${typeScheduleSelected}?</div>
                <hr class="mt-2 mb-0">
                `);
            } else if (response.data === 0) {
                $('#deleteScheduleModal .modal-body').html(`
                <div class="text-center">¿Está seguro de querer eliminar el horario con código ${codeScheduleSelected} y tipo de horario ${typeScheduleSelected}?. Este horario tiene otras dependencias con el sistema</div>
                <hr class="mt-2 mb-0">
                `);
            } else {
                console.log('Fallo en el API de verificar horario');
            }

            $('#deleteScheduleModal').modal('show');
        } else {
            showNotification('alert-warning', 'No ha seleccionado ningún horario <i class="fas fa-exclamation-triangle pl-2"></i>');
        }
    });

    $('#delete-schedule').on('click', function () {
        let semester = $('#semester').val();
        courseSemesters[semester] = courseSemesters[semester].filter(x => x.codigo !== codeScheduleSelected && x.tipoHorario !== typeScheduleSelected);
        $('#deleteScheduleModal').modal('hide');
        loadDataSemester(semester);
        idSchedule = undefined;
    })

    $(document).on('click', '.schedules-row', function () {
        if (idSchedule !== undefined && idSchedule == $(this).attr('id')) {
            $(`#${idSchedule}`).removeClass('schedule-selected');
            idSchedule = undefined;
        } else {
            $(`#${idSchedule}`).removeClass('schedule-selected');
            idSchedule = $(this).attr('id');
            let dataSchedule = idSchedule.split('-');
            codeScheduleSelected = dataSchedule[1];
            typeScheduleSelected = dataSchedule[2];
            $(this).addClass("schedule-selected");
        }
    });

    $('#add-schedule-modal').on('click', function () {
        if ($semester.val() === '') {
            showNotification('alert-warning', 'Por favor seleccione un ciclo <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        } else {
            $('#addScheduleModal .title').html('Agregar Horario<i class="fas fa-calendar-plus pl-2"></i>');
            $('#add-schedule').html('Agregar');
            $('#addScheduleModal').modal('show');
            actionFlag = 1;
        }
    });

    $('#edit-schedule-modal').on('click', function () {
        if (idSchedule) {
            $('#addScheduleModal .title').html(`Editar Horario ${idSchedule ? 'con código ' + codeScheduleSelected : ''} <i class="fas fa-calendar-check pl-2"></i>`);
            $('#add-schedule').html('Editar <i class="fas fa-edit pl-2"></i>');

            let semester = $('#semester').val();
            let courseSemester = courseSemesters[semester];
            let scheduleSelected = courseSemester.find(x => x.codigo === codeScheduleSelected && x.tipoHorario === typeScheduleSelected);

            $scheduleCode.val(scheduleSelected.codigo);
            $scheduleType.val(scheduleSelected.tipoHorario).select2();
            actionFlag = 0;
            $('#addScheduleModal').modal('show');
        } else {
            showNotification('alert-warning', 'No ha seleccionado ningún horario <i class="fas fa-exclamation-triangle pl-2"></i>');
        }
    });

    $('#save-course').on('click', async function () {
        if ($courseName.val() === '' || $courseCode.val() === '' || $credits.val() === '' || $faculty.val() === '' || $dictationType.val() === '') {
            showNotification('alert-warning', 'Por favor complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }

        let newCourse = {
            "idCurso": course.idCurso,
            "nombre": $courseName.val().toUpperCase(),
            "codigo": $courseCode.val().toUpperCase(),
            "creditos": parseFloat($credits.val()),
            "idSeccion": parseInt(idSeccion),
            "idFacultad": parseInt($('#faculty').val()),
            "horaClase": parseFloat($weeklyHours.val()),
            "horaLaboratorio": $labHours.val() === '' ? 0 : parseFloat($labHours.val()),
            "horaPractica": $practiceHours.val() === '' ? 0 : parseFloat($practiceHours.val()),
            "listaHorario": []
        };

        for (let idSemester in courseSemesters) {
            for (let course of courseSemesters[idSemester]) delete course.idHorario;
            newCourse.listaHorario = newCourse.listaHorario.concat(courseSemesters[idSemester]);
        }

        let response = await putData('universidad/curso/actualizar', newCourse, jwt, user, user);

        if (response.error !== undefined) {
            showNotification('alert-danger', `${response.error} <i class="fas fa-exclamation pl-2"></i>`);
        } else {
            if (response.data >= 0) {
                swal("¡El curso se ha actualizado correctamente!", "Presione OK para ver la lista de cursos registrados", "success");
            } else {
                console.log('ERROR DE API');
            }
        }
    });

    $('#addScheduleModal').on('hidden.bs.modal', function () {
        $scheduleCode.val('');
        $scheduleType.val('').select2();
    });

    $(document).on('click', '.sweet-alert .confirm', function () {
        window.location.replace("/section-assistant/list-courses");
    })
});

function loadDataSemester(semester) {
    if (semester === '') return false;
    let schedules = courseSemesters[semester];
    let htmlDataSemesters = '';

    for (let schedule of schedules) {
        let htmlDataSemester =
            `<tr class="schedules-row" id="schedule-${schedule.codigo}-${schedule.tipoHorario}">
                <th>${nameSemesters[semester]}</th>
                <td>${schedule.codigo}</td>
                <td>${schedule.tipoHorario}</td>
            </tr>`;

        htmlDataSemesters += htmlDataSemester;
    }

    if (schedules.length) $('#message-no-schedule').hide();
    else $('#message-no-schedule').show();

    $('#semester-data').html(htmlDataSemesters);
}




