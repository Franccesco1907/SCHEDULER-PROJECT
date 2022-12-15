import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";
let schedulesDataTable = undefined;

var fileUploaded = undefined;

$(function () {
    // Se carga el dataTable
    loadSchedules();

    let idSchedule = undefined;
    let nameScheduleSelected = undefined;

    $(document).on('click', '.schedules-row', function () {
        console.log("IMPRIMIENDO EL SCHEDULE: ",  idSchedule);
        if (idSchedule !== undefined && idSchedule == $(this).attr('id')) {
            $(`#${idSchedule}`).removeClass('schedule-selected');
            idSchedule = undefined;
        } else {
            $(`#${idSchedule}`).removeClass('schedule-selected');
            idSchedule = $(this).attr('id');
            nameScheduleSelected = $(this).children().eq(1).html();
            $(this).addClass("schedule-selected");
        }
    });
});


async function loadSchedules() {
    if (schedulesDataTable) schedulesDataTable.destroy();
    let options = {
      idTable: "schedules-data-table", 
      data: schedules,
      fields: [
        "codigoCurso",
        "nombreCurso",
        "codigoHorario",
        "tipoHorario",
        "nombreDocente",
        "correoDocente",
      ],
      name: "Horarios",
      idName: "idHorario",
      className: "schedules-row",
      addButtons: false,
    };
    schedulesDataTable = createDataTable(options);
    $("#schedules-data-table_wrapper").children().first().remove();
}
  