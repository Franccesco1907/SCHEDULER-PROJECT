import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";

let teachersDataTable = undefined;
$(function () {
    let idSection = $("#selectSection").val();
    console.log("idSection: ", idSection);
    loadTeachers(idSection);

    // Evento para cambiar de sección
    $('#selectSection').on('change', function(){
        loadTeachers($("#selectSection").val());
    });
    // este codigo es de otra cosa, cambiar !

    let idCourse = undefined;
    let nameCourseSelected = undefined;

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

    $('#teachers-data-table_wrapper').children().first().remove();
});


async function loadTeachers(idSection) {
    console.log("Soy el idSeccion: ", idSection);
    // idSection = 1;
    let teachersData = await getData(`persona/docente/listarseccion?idSeccion=${idSection}&tamanioPag=2000&pagina=1`, jwt);
    console.log(teachersData.data);
    let options = {
      idTable: "teachers-data-table", 
      data: teachersData.data,
      fields: [
        "codigo",
        "nombreCompleto",
        "dedicacion",
        "categoria",
        "deudaTotal"
      ],
      name: "Docentes",
      idName: "idPersona",
      className: "requests-teachers-row",
      addButtons: false,
    };
    if (teachersDataTable) teachersDataTable.destroy();
  
    teachersDataTable = createDataTable(options);
    $("#teachers-data-table_wrapper").children().first().remove();
}