import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";

let requestLessHoursDataTable = undefined;
let idRequestLessHours = undefined;
let selectedRequestDate = undefined;
let selectedRequestTeacher = undefined;
let selectedRequestHours = undefined;
let lessHoursData = undefined;


let today = new Date();
let todayString = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();

let idProceso = undefined;
let idCiclo = undefined;
let $jwt = $('#jwt');

$(async function () {

  let idSectioon = $("#selectLessHours").val();

  $('.date').bootstrapMaterialDatePicker({
    format: 'DD/MM/YYYY',
    weekStart: 1,
    time: false,
    cancelText: 'Cancelar',
    okText: 'Elegir',
    nowText: 'Ahora',
    lang: 'es'
  });

  //algoritmo para colorear y descolorear la fila seleccionada
  $(document).on("click", ".requests-less-hours-row", function () {
    if (
      idRequestLessHours !== undefined &&
      idRequestLessHours == $(this).attr("id")
    ) {
      $(`#${idRequestLessHours}`).removeClass("request-less-hours-selected");
      idRequestLessHours = undefined;
    } else {
      $(`#${idRequestLessHours}`).removeClass("request-less-hours-selected");
      idRequestLessHours = $(this).attr("id");
      selectedRequestDate = $(this).children().eq(0).html(); //field that u want, bro Raa
      selectedRequestTeacher = $(this).children().eq(1).html();
      selectedRequestHours = $(this).children().eq(2).html();
      $(this).addClass("request-less-hours-selected");
    }
  });

  $("#edit-request-less-hours").on("click", async function () {
    let hours = $("#requested-approved-hours").val();
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    if (hours === "" || parseInt(hours) < 0) {
      showNotification(
        $(this).data("color-name"),
        'El valor de horas a aprobar es incorrecto ' + message
      );
      $("#close-request-less-hours-modal").trigger("click");
      return false;
    }
    if (hours > selectedRequestHours) {
      showNotification(
        $(this).data("color-name"),
        'El valor de horas a aprobar no puede ser mayor que la solicitada ' + message
      );
      $("#close-request-less-hours-modal").trigger("click");
      return false;
    }
    let id = idRequestLessHours.split("-")[1];
    let condition = undefined;
    if (hours > 0) condition = "APROBADO";
    else condition = "RECHAZADO";
    let response = await putData(
      `gestiondocente/peticiondescarga/atender?idPeticionDescarga=${id}&horasAprobadas=${hours}&estadoPeticion=${condition}`, [], $jwt.val(), user
    );
    if (response.data === 1) {
      await loadLessHours($("#selectLessHours").val());
      $('#editRequestLessHoursModal .close-selected').trigger('click');
    } else {
      showNotification(
        $(this).data("color-name"),
        'Hubo un problema al editar las horas a aprobar <i class="fas fa-exclamation pl-2"></i>'
      );
    }
  });

  $('#selectLessHours').on('change', function () {
    if (idProceso) loadLessHours($(this).val());

  });

  $('.select2').select2();
  //editar API
  $("#edit-request-less-hours-modal").on("click", async function () {
    if (idRequestLessHours) {
      $("#activate-edit-modal").trigger("click");
      $("#date-request").val(`${selectedRequestDate}`);
      $("#teacher-request").val(`${selectedRequestTeacher}`);
      $("#requested-hours").val(`${selectedRequestHours}`);
      let id = parseInt(idRequestLessHours.split("-")[1]);
      let wantedR = lessHoursData.data.find(x => x.idPeticionDescarga == id);
      $('.motivoEdit').val(wantedR.motivo);
    } else {
      var placementFrom = $(this).data("placement-from");
      var placementAlign = $(this).data("placement-align");
      var colorName = $(this).data("color-name");
      showNotification(
        colorName,
        'Usted no ha seleccionado ninguna solicitud de descarga <i class="fas fa-exclamation-triangle pl-2"></i>'
      );
    }
  });
  // all related to rangeSlider

  $("#range_09").ionRangeSlider({
    grid: true,
    from: 0,
    to_fixed: true,//block the top
    from_fixed: true,//block the from
    values: ["NO CREADO", "CREADO", "INICIADO", "EN PROCESO", "FINALIZADO"]
  });
  //comparing dates to do some stuff

  let procesos = await getData(`gestiondocente/procesos/listar?tamanioPag=2000&&tipoProceso=DESCARGA&idDepartamento=${idDepartamento}`, $jwt.val());
  const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
  const procesosSort = procesos.data.sort((a, b) => (a.fechaFin > b.fechaFin) ? 1 : -1)
  let lastProcess = procesosSort.pop();
  let aboutToDate1, aboutToDate2, beginning, end;
  if (procesoActivo) {
    idProceso = procesoActivo.idProceso;
    loadLessHours(idSectioon);
    aboutToDate1 = procesoActivo.fechaInicio, aboutToDate2 = procesoActivo.fechaFin;//API
    // aboutToDate1="01/10/2021", aboutToDate2="10/10/2021"; //spanish
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
  } else if (lastProcess) {
    aboutToDate1 = lastProcess.fechaInicio, aboutToDate2 = lastProcess.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2)
    //console.log(lastProcess);
    idProceso = lastProcess.idProceso;
  }


  if (procesoActivo && today < beginning) { //CREADO
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 1,
    });
    $('#edit-request-less-hours-modal').prop('disabled', true);
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
    $('.initp').prop('disabled', true);
  } else if (procesoActivo && today > beginning && today < end) { //INICIADO
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 2,
    });
    //$('#edit-request-less-hours-modal').prop('disabled', true);
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
    $('.initp').prop('disabled', true);
  } else if (procesoActivo && today > end) { //EN PROCESO
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 3,
    });
    $('#edit-request-less-hours-modal').prop('disabled', false);
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
    $('.initp').prop('disabled', true);
    $('.endp').prop('disabled', false);
  } else if (end > new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000))) {
    // FIN DE PROCESO PERO AUN NO DESAPARECE LA FECHA
    //console.log("5 DIAS RAA")
    //console.log(new Date(new Date().getTime()-(5*24*60*60*1000)));
    await loadLessHours(idSectioon);
    $('#beginning').val(aboutToDate1)
    $('#end').val(aboutToDate2)
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 4,
    });
    $('#edit-request-less-hours-modal').prop('disabled', true);
    $('.initp').prop('disabled', true);
    $('.endp').prop('disabled', true);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
  } else {
    // NO CREADO
    $('#beginning').prop('disabled', false);
    $('#end').prop('disabled', false);
    $('.initp').prop('disabled', false);
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 0,
    });
    $('#edit-request-less-hours-modal').prop('disabled', true);
    $('.endp').prop('disabled', true);
  }
  $(".initp").on("click", async function () {
    let aboutToDateBe = $('#beginning').val(), aboutToDateEnd = $('#end').val();
    if (!aboutToDateBe || !aboutToDateEnd) {
      showNotification('alert-warning', 'Por favor elija las fechas de inicio y fin <i class="fas fa-exclamation-triangle pl-2"></i>');
      return false;
    }
    let beginningDate = formattingStringDate(aboutToDateBe), endDate = formattingStringDate(aboutToDateEnd);
    if (beginningDate > endDate) {
      showNotification('alert-warning', 'La fecha de inicio no puede ser mayor a la de fin <i class="fas fa-exclamation-triangle pl-2"></i>');
      return false;
    }
    let response = await postData(
      `gestiondocente/procesos/guardar`,
      {
        "fechaInicio": aboutToDateBe,
        "fechaFin": aboutToDateEnd,
        "estado": true,
        "tipoProceso": "DESCARGA",
        "idDepartamento": idDepartamento,
        "idCiclo": currentSemester.data.idCiclo
      },
      $jwt.val(), user
    );
    location.reload();
  });
  $(".endp").on("click", async function () { //FINALIZADO
    let aboutToDateBe = $('#beginning').val(), aboutToDateEnd = $('#end').val();
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 4,
    });
    let response = await putData(
      `gestiondocente/procesos/actualizar`,
      {
        "idProcesos": procesoActivo.idProceso,
        "estado": false,
        "fechaInicio": aboutToDateBe,
        "fechaFin": aboutToDateEnd
      },
      $jwt.val(), user
    );
    // if (response.data === 1) {
    //  //console.log("Soy uno");
    // } else {
    //   //console.log("Soy otro");
    // }
    $('#edit-request-less-hours-modal').prop('disabled', true);
    $('.endp').prop('disabled', true);
  });

});

async function loadLessHours(idSection) {

  lessHoursData = await getData(`gestiondocente/peticiondescarga/listar?idProceso=${idProceso}&idSeccion=${idSection >= 0 && idSection !== "" ? idSection : ""}&tamanioPag=2000&pagina=1`, $jwt.val()
  );
  let options = {
    idTable: "request-less-hours-data-table",
    data: idProceso ? lessHoursData.data : [],
    fields: [
      "fechaEnvio",
      "nombreDocente",
      "horasSolicitadas",
      "horasAprobadas",
    ],
    name: "Descargas Solicitadas",
    idName: "idPeticionDescarga",
    className: "requests-less-hours-row",
    addButtons: false,
  };
  if (requestLessHoursDataTable) requestLessHoursDataTable.destroy();

  requestLessHoursDataTable = createDataTable(options);
  $("#request-less-hours-data-table_wrapper").children().first().remove();
}


function formattingStringDate(stringDate) {
  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`;
  return new Date(stringDate);
}


// async function searchCiclo() {
//   let ciclos = await getData(`universidad/ciclos/listar`, $jwt.val());
//   let cicloActual = await getData(`universidad/ciclo/actual`, $jwt.val());

//   let idCicloActual = -1;
//   if (cicloActual) return idCicloActual;

//   let idLastCiclo = -1;
//   let fechaInicioLastCiclo = todayString;
//   let idCicloRango = -1;

//   let ciclosSort = ciclos.data.sort((a, b) => (a.nombre > b.nombre) ? 1 : -1);
//   for (let ciclo of ciclosSort) {
//     if (todayString <= ciclo.fechaFin && todayString >= ciclo.fechaInicio) { 
//       idCicloRango = ciclo.idCiclo;
//       break;
//     } else if (todayString <= fechaInicioLastCiclo && todayString >= ciclo.fechaFin) {
//       idCicloRango = idLastCiclo;
//       break;
//     }
//     idLastCiclo = ciclo.idCiclo;
//     fechaInicioLastCiclo = ciclo.fechaFin;
//   }
//   return idCicloRango;
// }