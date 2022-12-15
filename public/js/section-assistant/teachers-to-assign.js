
import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";
let teachersNoAssignedDataTable = undefined;
let teachersAssignedDataTable = undefined;
let teachersPreferredNoAssigned = undefined;
let teachersPreferred = undefined;
let listIdTeachersPreferred = undefined;
let teachersCurrentSection = undefined;
let listIdTeachersCurrentSection = undefined;
let teachersAll = undefined;
var teachersAssignment = undefined;
var teachersAssigned = undefined;
var teachersNoAssigned = undefined;

let teachersAlreadyAssigned = undefined;
let teachersNotAssignedYet = undefined;

$(function () {
    let currentLoadProcess = undefined;
    if (loadProcess && loadProcess.length > 0) {
        currentLoadProcess = loadProcess.pop();
        let stage = getLoadProcessStage(currentLoadProcess);
        if (stage != 4) { // Si no está en la etapa de asignación de docentes
            $('#allocate').css('visibility', 'hidden');
            $('#deallocate').css('visibility', 'hidden');
            $('#save-assignment').css('visibility', 'hidden');
            $('#dictationType').attr('disabled', true);
        }
    }
    else {
        $('#allocate').css('visibility', 'hidden');
        $('#deallocate').css('visibility', 'hidden');
        $('#save-assignment').css('visibility', 'hidden');
        $('#dictationType').attr('disabled', true);
    }

    // Se cargan las tablas de docentes asignados y no asignados
    loadTeachersIntoTables();
    // Se cargan los docentes con preferencia
    loadPreferredTeachers();

    $('#dictationType').val(schedule.tipoDictado);
    $('#allocate').attr('disabled', true);
    $('#deallocate').attr('disabled', true);

    let idTeacherNoAssigned = undefined;
    let nameTeacherNoAssignedSelected = undefined;
    let loadTeacherNoAssignedSelected = undefined;
    let typeTeacherNoAssignedSelected = undefined;
    $(document).on('click', ".teachers-no-assigned-row", function () {
        if (idTeacherNoAssigned !== undefined && idTeacherNoAssigned == $(this).attr('id')) {
            $(`#${idTeacherNoAssigned}`).removeClass("teacher-no-assigned-selected");
            idTeacherNoAssigned = undefined;
            $('#allocate').attr('disabled', true);
        } else {
            $(`#${idTeacherNoAssigned}`).removeClass("teacher-no-assigned-selected");
            idTeacherNoAssigned = $(this).attr('id');
            nameTeacherNoAssignedSelected = $(this).children().eq(0).html();
            loadTeacherNoAssignedSelected = $(this).children().eq(1).html();
            typeTeacherNoAssignedSelected = $(this).children().eq(2).html();
            $(this).addClass("teacher-no-assigned-selected");
            $('#allocate').attr('disabled', false);
        }
    });


    let idTeacherAssigned = undefined;
    let nameTeacherAssignedSelected = undefined;

    $(document).on('click', '.teachers-assigned-row', function () {
        if (idTeacherAssigned !== undefined && idTeacherAssigned == $(this).attr('id')) {
            $(`#${idTeacherAssigned}`).removeClass('teacher-assigned-selected');
            idTeacherAssigned = undefined;
            $('#deallocate').attr('disabled', true);
        } else {
            $(`#${idTeacherAssigned}`).removeClass('teacher-assigned-selected');
            idTeacherAssigned = $(this).attr('id');
            nameTeacherAssignedSelected = $(this).children().eq(0).html();
            $(this).addClass("teacher-assigned-selected");
            $('#deallocate').attr('disabled', false);
        }
    });

    // Cambio de tipo de dictado
    $('#dictationType').on('change', async function () {

        $('#label-dictation-type').text($('#dictationType').val());

        for (let t of teachersAlreadyAssigned) {
            teachersNotAssignedYet.push({
                "idDocente": t.idDocente,
                "nombres": t.nombre,
                "horas": t.horasCarga - t.horasAsignadas,
                "tipo": (listIdTeachersPreferred.includes(t.idDocente) ? 'PREFERENTE' : (listIdTeachersCurrentSection.includes(t.idDocente) ? 'SECCIÓN' : 'OTRO'))
            });
        }
        teachersAlreadyAssigned = [];
        updateTeacherTables();
    });

    // Clic en botón Asignar carga
    $('#allocate').on('click', async function () {
        if ($('#dictationType').val() < 1) {
            showNotification('alert-warning', 'Debe seleccionar el tipo de dictado primero. <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }

        if ($('#dictationType').val() == "INDIVIDUAL" && teachersAlreadyAssigned.length >= 1) {
            showNotification('alert-warning', 'Debe cambiar a CODICTADO o COMPARTIDO para asignar múltiples docentes. <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }

        teachersAlreadyAssigned.push({
            "idDocente": parseInt(idTeacherNoAssigned.split("-")[1]),
            "nombre": nameTeacherNoAssignedSelected,
            "horasCarga": parseFloat(loadTeacherNoAssignedSelected) + (['INDIVIDUAL', 'CODICTADO'].includes($('#dictationType').val()) ? schedule.horas : (schedule.horas / (teachersAlreadyAssigned.length + 1))),
            "horasAsignadas": (['INDIVIDUAL', 'CODICTADO'].includes($('#dictationType').val()) ? schedule.horas : (schedule.horas / (teachersAlreadyAssigned.length + 1))),
            "tipo": typeTeacherNoAssignedSelected
        });
        teachersAlreadyAssigned.forEach(x => {
            x["horasCarga"] -= x["horasAsignadas"];
            x["horasAsignadas"] = (['INDIVIDUAL', 'CODICTADO'].includes($('#dictationType').val()) ? schedule.horas : (schedule.horas / teachersAlreadyAssigned.length));
            x["horasCarga"] += x["horasAsignadas"];
        });

        teachersNotAssignedYet = teachersNotAssignedYet.filter(x => x.idDocente !== parseInt(idTeacherNoAssigned.split("-")[1]));
        updateTeacherTables();
        $('#allocate').attr('disabled', true);
        $('#deallocate').attr('disabled', true);
    });

    // Clic en botón Desasignar carga
    $('#deallocate').on('click', async function () {

        if ($('#dictationType').val() < 1) {
            showNotification('alert-warning', 'Debe seleccionar el tipo de dictado primero <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }

        var teacherToRemove = { "idDocente": parseInt(idTeacherAssigned.split("-")[1]) };

        var teacherFoundToRemoveFromAlreadyAssigned = teachersAlreadyAssigned.find(x => x.idDocente == teacherToRemove.idDocente);
        teachersNotAssignedYet.push({
            "idDocente": teacherFoundToRemoveFromAlreadyAssigned.idDocente,
            "nombres": teacherFoundToRemoveFromAlreadyAssigned.nombre,
            "horas": teacherFoundToRemoveFromAlreadyAssigned.horasCarga - teacherFoundToRemoveFromAlreadyAssigned.horasAsignadas,
            "tipo": (listIdTeachersPreferred.includes(teacherFoundToRemoveFromAlreadyAssigned.idDocente) ? 'PREFERENTE' : (listIdTeachersCurrentSection.includes(teacherFoundToRemoveFromAlreadyAssigned.idDocente) ? 'SECCIÓN' : 'OTRO'))
        });

        teachersAlreadyAssigned = teachersAlreadyAssigned.filter(x => x.idDocente !== teacherToRemove.idDocente);
        if ($('#dictationType').val() == 'COMPARTIDO') {
            teachersAlreadyAssigned.forEach(elem => {
                elem['horasCarga'] = elem['horasCarga'] - (schedule.horas / (teachersAlreadyAssigned.length + 1)) + (schedule.horas / teachersAlreadyAssigned.length);
                elem['horasAsignadas'] = schedule.horas / teachersAlreadyAssigned.length;
            });
        }

        updateTeacherTables();
        $('#allocate').attr('disabled', true);
        $('#deallocate').attr('disabled', true);
    });

    // Clic en el botón Guardar cambios
    $('#save-assignment').on('click', async function () {
        $('body').css('cursor', 'progress');
        $('section').css('pointer-events', 'none');

        $('#save-assignment').attr('disabled', true);
        $('#allocate').attr('disabled', true);
        $('#deallocate').attr('disabled', true);

        let clean = {
            "idHorario": idSchedule,
            "tipoDictado": $('#dictationType').val(), "listaHorarioDocente": []
        };
        let asignacion = {
            "idHorario": idSchedule,
            "tipoDictado": $('#dictationType').val(), "listaHorarioDocente": teachersAlreadyAssigned
        };
        let response = await postData('universidad/horario/guardarhorariodocente', clean, jwt, user);
        response = await postData('universidad/horario/guardarhorariodocente', asignacion, jwt, user);

        let arrayIdAlreadyAssigned = teachersAlreadyAssigned.map(function (e) { return e.idDocente; });
        for (let prefTeacherID of listIdTeachersPreferred) {
            if (arrayIdAlreadyAssigned.includes(prefTeacherID)) {
                let updatePref = {
                    "idDocente": prefTeacherID,
                    "idHorario": idSchedule,
                    "estado": "ATENDIDO",
                    "activo": true
                };
                let prefResponse = await putData('gestiondocente/preferencias/actualizar', updatePref, jwt, user);
            }
            else {
                let updatePref = {
                    "idDocente": prefTeacherID,
                    "idHorario": idSchedule,
                    "estado": "PENDIENTE",
                    "activo": true
                };
                let prefResponse = await putData('gestiondocente/preferencias/actualizar', updatePref, jwt, user);
            }
        }

        $('section').css('pointer-events', 'auto');
        $('body').css('cursor', 'default');

        if (response) {
            swal({
                title: "¡Los docentes se asignaron al horario correctamente!",
                text: "Presione OK para ver el Listado de asignación de cursos.",
                type: "success"
            },
                function () { window.location.href = "/section-assistant/courses-to-assign/"; }
            );
        }
        else {
            showNotification('alert-danger', `${response.error} <i class="fas fa-exclamation-triangle pl-2"></i>`);
        }
    });
});

async function loadTeachersIntoTables() {
    $("body").css("cursor", "progress");

    teachersAssignment = await getData(`gestiondocente/cargadocente/listarcargaseccion?idHorario=${idSchedule}&idSeccion=${idSection}&tamanioPag=2000&pagina=1`, jwt);
    if (!teachersAssignment) {
        return false;
    }

    // Se carga la tabla de docentes asignados
    teachersAssigned = teachersAssignment.docentesAsignados ?? [];
    if (teachersAssignedDataTable) teachersAssignedDataTable.destroy();
    teachersAssigned.forEach(x => {
        x['horasAsignadas'] = Math.round((x['horasAsignadas'] + Number.EPSILON) * 100) / 100;
        x['horasCarga'] = Math.round((x['horasCarga'] + Number.EPSILON) * 100) / 100;
    });
    let optionsAssignedDataTable = {
        idTable: 'teachers-assigned-data-table',
        data: teachersAssigned,
        fields: [
            'nombre',
            'horasAsignadas',
            'horasCarga'
        ],
        name: 'Docentes asignados',
        idName: 'idDocente',
        className: "teachers-assigned-row",
        addButtons: false
    };
    teachersAssignedDataTable = createDataTable(optionsAssignedDataTable);
    $("#teachers-assigned-data-table_wrapper").children().first().remove();

    // Se carga la tabla de docentes no asignados
    teachersNoAssigned = [];
    let auxTeachersNoAssigned = (teachersAssignment.docentesNoAsignadosSeccion ?? []).concat(teachersAssignment.docentesPreferidosNoAsignados ?? []);
    let arrIdDocentesNoAsignadosSeccion = (teachersAssignment.docentesNoAsignadosSeccion ?? []).map(function (e) { return e.idPersona; });
    let arrIdDocentesPreferidosNoAsignados = (teachersAssignment.docentesPreferidosNoAsignados ?? []).map(function (e) { return e.idDocente; });
    auxTeachersNoAssigned.forEach(element => {
        let isInSection = arrIdDocentesNoAsignadosSeccion.includes(element.idPersona);
        let isPreferred = arrIdDocentesPreferidosNoAsignados.includes(element.idDocente);
        teachersNoAssigned.push({
            "idDocente": element.idDocente ? element.idDocente : element.idPersona,
            "nombres": element.nombres ? element.nombres : element.nombreCompleto,
            "horas": (element.horas != null && element.horas != undefined) ? element.horas : element.cargaTotal,
            "tipo": (isPreferred && isInSection) ? "PREF & SEC" : ((isInSection ? "SECCIÓN" : "") + (isPreferred ? "PREFERENTE" : ""))
        });
    });
    teachersNoAssigned = [... new Set(teachersNoAssigned)];

    if (teachersNoAssignedDataTable) teachersNoAssignedDataTable.destroy();
    teachersNoAssigned.forEach(x => {
        x['horas'] = Math.round((x['horas'] + Number.EPSILON) * 100) / 100;
    });
    let optionsNoAssignedDataTable = {
        idTable: 'teachers-no-assigned-data-table',
        data: teachersNoAssigned,
        fields: [
            'nombres',
            'horas',
            'tipo'
        ],
        name: 'Docentes no asignados',
        idName: 'idDocente',
        className: "teachers-no-assigned-row",
        addButtons: false
    };
    teachersNoAssignedDataTable = createDataTable(optionsNoAssignedDataTable);
    $("#teachers-no-assigned-data-table_wrapper").children().first().remove();

    // Actualizar labels de estado del horario
    if (teachersAssigned && teachersAssigned.length > 0)
        $('#label-schedule-state').text("ASIGNADO");
    else $('#label-schedule-state').text("NO ASIGNADO");

    // Crear listas de docentes asignados y no asignados para el traslado entre tablas
    teachersAlreadyAssigned = teachersAssigned ? teachersAssigned.slice() : [];
    teachersNotAssignedYet = teachersNoAssigned ? teachersNoAssigned.slice() : [];

    $("body").css("cursor", "default");
}

async function loadPreferredTeachers() {
    teachersPreferred = await getData(`gestiondocente/preferencias/listar?idHorario=${idSchedule}&tamanioPag=2000&pagina=1`, jwt);
    listIdTeachersPreferred = teachersPreferred.data ? teachersPreferred.data.map(function (e) { return e.idDocente; }) : [];

    teachersCurrentSection = await getData(`persona/docente/listarseccion?idSeccion=${idSection}&tamanioPag=2000&pagina=1`, jwt);
    listIdTeachersCurrentSection = teachersCurrentSection.data ? teachersCurrentSection.data.map(function (e) { return e.idPersona; }) : [];
}

function updateTeacherTables() {
    // Actualizar tabla de docentes asignados
    if (teachersAssignedDataTable) teachersAssignedDataTable.destroy();
    teachersAlreadyAssigned.forEach(x => {
        x['horasAsignadas'] = Math.round((x['horasAsignadas'] + Number.EPSILON) * 100) / 100;
        x['horasCarga'] = Math.round((x['horasCarga'] + Number.EPSILON) * 100) / 100;
    });
    let optionsAssignedDataTable = {
        idTable: 'teachers-assigned-data-table',
        data: teachersAlreadyAssigned,
        fields: [
            'nombre',
            'horasAsignadas',
            'horasCarga'
        ],
        name: 'Docentes asignados',
        idName: 'idDocente',
        className: "teachers-assigned-row",
        addButtons: false
    };
    teachersAssignedDataTable = createDataTable(optionsAssignedDataTable);
    $("#teachers-assigned-data-table_wrapper").children().first().remove();

    // Actualizar tabla de docentes no asignados
    if (teachersNoAssignedDataTable) teachersNoAssignedDataTable.destroy();
    teachersNotAssignedYet.forEach(x => {
        x['horas'] = Math.round((x['horas'] + Number.EPSILON) * 100) / 100;
    });
    let optionsNoAssignedDataTable = {
        idTable: 'teachers-no-assigned-data-table',
        data: teachersNotAssignedYet,
        fields: [
            'nombres',
            'horas',
            'tipo'
        ],
        name: 'Docentes no asignados',
        idName: 'idDocente',
        className: "teachers-no-assigned-row",
        addButtons: false
    };
    teachersNoAssignedDataTable = createDataTable(optionsNoAssignedDataTable);
    $("#teachers-no-assigned-data-table_wrapper").children().first().remove();

    // Actualizar labels de estado del horario
    if (teachersAlreadyAssigned && teachersAlreadyAssigned.length > 0)
        $('#label-schedule-state').text("ASIGNADO");
    else $('#label-schedule-state').text("NO ASIGNADO");
}
function getLoadProcessStage(process) {

    let date3 = formattingStringDate(process.fechaAsignacion).getTime();
    let date4 = formattingStringDate(process.fechaFin).getTime();
    let today = new Date().getTime();

    if (today < date3) { return 3; }                    // Antes de asignación
    if (date3 <= today && today < date4) { return 4; }  // Asignación de docentes
    if (date4 <= today) { return 5; }                   // Finalizado
    return 0;   // No creado
}

function formattingStringDate(stringDate) {
    // String to Date
    const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
    const month = stringDate.slice(3, 6); // month and '/'
    const year = stringDate.slice(6, 10); // year
    stringDate = `${month}${day}${year}`;
    return new Date(stringDate);
}
