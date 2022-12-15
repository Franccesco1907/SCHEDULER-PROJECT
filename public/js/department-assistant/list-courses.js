import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";
let coursesDataTable = undefined;

var fileUploaded = undefined;

$(function () {
    let idSection=$("#selectSection").val();
    let idCourse = undefined;
    let nameCourseSelected = undefined;

    // Se carga el dataTable
    loadCourses(idSection);


    // Evento para cambiar de sección
    $('#selectSection').on('change', function(){
        loadCourses($("#selectSection").val());
    });

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
});

async function loadCourses(idSection) {
    let coursesData = await getData(`universidad/curso/listar?idSeccion=${idSection}&tamanioPag=2000&pagina=1`, jwt);
    console.log(coursesData.data);
    let options = {
      idTable: "courses-data-table", 
      data: coursesData.data,
      fields: [
        "codigo",
        "nombre",
        "horasTotales",
        "numeroHorarios",
        "facultad",
        "tipoDictado"
      ],
      name: "Cursos",
      idName: "idCurso",
      className: "requests-courses-row",
      addButtons: false,
    };
    if (coursesDataTable) coursesDataTable.destroy();
  
    coursesDataTable = createDataTable(options);
    $("#courses-data-table_wrapper").children().first().remove();
}
  