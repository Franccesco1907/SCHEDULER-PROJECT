import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";

let teachersDataTable = undefined;
let text='';
let filter='';
let evaluate=false;

$(function () {
    
    loadTeachers();

    let idTeacher = undefined;
    let nameTeacherSelected = undefined;
    $("#Ver-expediente").attr('disabled',true);
    $(document).on('click', '.teachers-row', function () {
        if (idTeacher !== undefined && idTeacher == $(this).attr('id')) {
            $(`#${idTeacher}`).removeClass('teacher-selected');
            idTeacher = undefined;
            $("#Ver-expediente").attr('disabled',true);
        } else {
            $(`#${idTeacher}`).removeClass('teacher-selected');
            idTeacher = $(this).attr('id');
            nameTeacherSelected = $(this).children().eq(1).html();
            $(this).addClass("teacher-selected");
            $("#Ver-expediente").attr('disabled',false);
        }
    });

    $('#code-name-input').on('keyup', function () {
        let text = $('#code-name-input').val();
        loadTeachersFilters(text);

        idTeacher = undefined;
        $("#Ver-expediente").attr('disabled',true);
    });
  
    $('#Ver-expediente').on('click', function () {
        window.location.href = `/teacher/record?id=${idTeacher.replace('idPersona-','')}`; 
    });
});


async function loadTeachers() {

    if (teachersDataTable) teachersDataTable.destroy();

    professors.forEach(p => {
        p['deudaTotal'] = (p['deudaTotal'] != null && p['deudaTotal'] != undefined) ?
                            (Math.round((p['deudaTotal'] + Number.EPSILON) * 100) / 100) : 0;
    });
    let options = {
      idTable: "teachers-data-table", 
      data: professors,
      fields: [
        "codigo",
        "nombreCompleto",
        "dedicacion",
        "categoria",
        "deudaTotal"
      ],
      name: "Docentes",
      idName: "idPersona",
      className: "teachers-row",
      addButtons: false,
    };
  
    teachersDataTable = createDataTable(options);
    $('#teachers-data-table_wrapper').children().first().remove();
}

async function loadTeachersFilters(codigoNombre) {

    codigoNombre = codigoNombre.toLowerCase();
    let filteredProfessors = professors.filter(
        p => p.codigo.toLowerCase().includes(codigoNombre) || 
        p.nombreCompleto.toLowerCase().includes(codigoNombre)
    );
    
    if (teachersDataTable) teachersDataTable.destroy();
    let options = {
      idTable: "teachers-data-table", 
      data: filteredProfessors,
      fields: [
        "codigo",
        "nombreCompleto",
        "dedicacion",
        "categoria",
        "deudaTotal"
      ],
      name: "Docentes",
      idName: "idPersona",
      className: "teachers-row",
      addButtons: false,
    };
  
    teachersDataTable = createDataTable(options);
    $('#teachers-data-table_wrapper').children().first().remove();
}