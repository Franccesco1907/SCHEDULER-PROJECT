
import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";
let coursesAssignDataTable = undefined;
let paramArr = ["",""];
$(function () {
    
    $("#range_09").ionRangeSlider({
        grid: true,
        from: 0,
        to_fixed: true,     //block the top
        from_fixed: true,   //block the from
        values: ["NO CREADO", "CREADO", "CREACIÓN DE HORARIOS",
                 "PREFERENCIA DE DICTADO", "ASIGNACIÓN DE DOCENTES",
                 "REVISIÓN", "FINALIZADO"]
    });

    let currentLoadProcess = undefined;
    if(loadProcess && loadProcess.length > 0){
        currentLoadProcess = loadProcess.pop();
        let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        $('#beginning-assignment').val(formattingStringDate(currentLoadProcess.fechaAsignacion).toLocaleDateString('es',dateOptions));   // Fecha de inicio de asignación de docentes
        $('#end-assignment').val(formattingStringDate(currentLoadProcess.fechaFin).toLocaleDateString('es',dateOptions));                // Fecha de fin de asignación de docentes

        let stage = undefined;
        if(currentLoadProcess.estadoCarga == 'FINALIZADO'){
            stage = 6;
        }
        else {
            stage = getLoadProcessStage(currentLoadProcess);
        }

        if(stage == 4){ // Si está en la etapa de asignación de docentes
            $('#assign-teacher').html('Asignar Docentes');
        }
        else if(stage > 4){ // Si ha finalizado el proceso de asignación de docentes
            $('#assign-teacher').html('Ver Docentes Asignados');
        }
        else{
            $('#assign-teacher').hide();
        }
    }
    else{
        $('#assign-teacher').hide();
    }

    // Se carga el dataTable
    loadCoursesToAssign();

    let idCourseToAssign = undefined;
    let codeCourse = undefined;
    let nameCourseToAssignSelected = undefined;
    let typeSchedule = undefined;
    let codeSchedule = undefined;
    let chargeHours = undefined;
    let dictation = undefined;
    let state = undefined;

    $(document).on('click', '.courses-to-assign-row', function () {
        if (idCourseToAssign !== undefined && idCourseToAssign == $(this).attr('id')) {
            $(`#${idCourseToAssign}`).removeClass('course-to-assign-selected');
            idCourseToAssign = undefined;
        } else {
            $(`#${idCourseToAssign}`).removeClass('course-to-assign-selected');
            idCourseToAssign = $(this).attr('id');
            codeCourse = $(this).children().eq(0).html();
            nameCourseToAssignSelected = $(this).children().eq(1).html();
            typeSchedule = $(this).children().eq(2).html();
            codeSchedule = $(this).children().eq(3).html();
            chargeHours = $(this).children().eq(4).html();
            dictation = $(this).children().eq(5).html();
            state = $(this).children().eq(6).html();
            $(this).addClass("course-to-assign-selected");
        }
    });
    $('#codigoNombre').on('keyup',function(){
        paramArr[0] = $(this).val();
        loadCoursesToAssign();
    });

    $('#selectStatus').on('change',function(){
        paramArr[1] = $(this).val();
        loadCoursesToAssign();
    });
    $('#assign-teacher').on('click', function(){
        if(idCourseToAssign) {
            let id = idCourseToAssign.split('-')[1];
            window.location.replace(`/section-assistant/teachers-to-assign?idSchedule=${id}`);
            localStorage.setItem('nombreCurso',nameCourseToAssignSelected);
            localStorage.setItem('codigoCurso',codeCourse);
            localStorage.setItem('tipoHorario',typeSchedule);
            localStorage.setItem('tipoDictado',dictation);
            localStorage.setItem('horas',chargeHours);
            localStorage.setItem('estado',state);

        } else {    
            showNotification('alert-warning', 'Debe seleccionar un horario para asignar los docentes <i class="fas fa-exclamation-triangle pl-2"></i>');
        }
    });

});

/*
Listar procesos de carga /gestiondocente/procesoscarga/listar con idDept y el idCiclo (arr de 1 ==> pop)
    Si lista vacío, no existe proceso de carga, por lo que no se puede hacer nada.
        NO CREADO
    Si existe:
        Comprobar que esté dentro del rango de fecha inicio y fin de asignación, que se obtienen del listar anterior
        Si no está dentro del rango, quitar botón Asignar Docentes

Actualizar barra de estado
Quitar permisos de teachers-to-assign

Trigger de No Asignado
Cuando llega a finalizado, borrar botones de asignar, desasignar y guardar cambios.
*/

async function loadCoursesToAssign() {
    coursesToAssign = await getData(`universidad/horario/listarespecial?idSeccion=${idSeccion}&estadoHorario=${paramArr[1]}&idCiclo=${currentSemester.idCiclo}`, jwt);
    coursesToAssign=coursesToAssign.data;
    coursesToAssign=coursesToAssign.filter(x => x.codigoCurso.toLowerCase().includes(paramArr[0].toLowerCase()) || x.nombreCurso.toLowerCase().includes(paramArr[0].toLowerCase()));
    if (coursesAssignDataTable) coursesAssignDataTable.destroy();
    let options = {
        idTable: 'courses-to-assign-data-table',
        data: coursesToAssign,
        fields: [
            'codigoCurso', 
            'nombreCurso', 
            'tipoHorario', 
            'codigo', 
            'horas', 
            'tipoDictado', 
            'estadoHorario'
        ],
        name: 'Cursos',
        idName: 'idHorario',
        className: 'courses-to-assign-row',
        addButtons: false
    };
    coursesAssignDataTable = createDataTable(options);
    $("#courses-data-table_wrapper").children().first().remove();
}

function formattingStringDate(stringDate) {
    // String to Date
    const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
    const month = stringDate.slice(3, 6); // month and '/'
    const year = stringDate.slice(6, 10); // year
    stringDate = `${month}${day}${year}`;
    return new Date(stringDate);
}

function getLoadProcessStage(process){
  
    let date3 = formattingStringDate(process.fechaAsignacion).getTime();
    let date4 = formattingStringDate(process.fechaFin).getTime();      
    let today = new Date().getTime();

    if(today < date3){return 3;}                    // Antes de asignación
    if(date3 <= today && today < date4){return 4;}  // Asignación de docentes
    if(date4 <= today){return 5;}                   // Finalizado
    return 0;   // No creado
}
