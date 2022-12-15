import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";
let requestPlacesNewTeachersDataTable = undefined;
let idProceso = undefined;
let idPro = undefined;
let $jwt = $('#jwt');
let placesNewTeachersData = undefined;

$(async function () {


  let idRequestPlacesNewTeachers = undefined;
  let selectedRequestDate = undefined;
  let selectedRequestTeacher = undefined;
  let selectedRequestPlaces = undefined;
  let selectedRequestDetail = undefined;
  let selectedRequestId = undefined;

  $('.date').bootstrapMaterialDatePicker({
    format: 'DD/MM/YYYY',
    //format: 'DD MMMM YYYY',
    //format: 'dd-mmmm-yyyy',
    //clearButton: true,
    weekStart: 1,
    time: false,
    cancelText: 'Cancelar',
    okText: 'Elegir',
    nowText: 'Ahora',
    lang: 'es'
  });

  //algoritmo para colorear y descolorear la fila seleccionada
  $(document).on("click", ".requests-places-new-teachers-row", function () {
    if (
      idRequestPlacesNewTeachers !== undefined &&
      idRequestPlacesNewTeachers == $(this).attr("id")
    ) {
      console.log("SI ENTREEE GAAA");
      $(`#${idRequestPlacesNewTeachers}`).removeClass("request-places-new-teachers-selected");
      idRequestPlacesNewTeachers = undefined;
    } else {
      $(`#${idRequestPlacesNewTeachers}`).removeClass("request-places-new-teachers-selected");
      idRequestPlacesNewTeachers = $(this).attr("id");
      selectedRequestDate = $(this).children().eq(0).html(); //field that u want, bro Raa
      selectedRequestTeacher = $(this).children().eq(1).html();
      selectedRequestPlaces = parseInt($(this).children().eq(2).html());
      $(this).addClass("request-places-new-teachers-selected");
    }
  });

  $("#edit-request-places-new-teachers").on("click", async function () {
    let placesCouncil = $("#requested-approved-places-council").val();
    let placesDap = $("#requested-approved-places-dap").val();
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    if (placesCouncil === "" || parseInt(placesCouncil) < 0) {
      showNotification(
        $(this).data("color-name"),
        'El valor de plazas a aprobar por el departamento es incorrecto ' + message
      );
      $("#close-request-places-new-teachers-modal").trigger("click");
      return false;
    }
    if (placesCouncil > selectedRequestPlaces) {
      showNotification(
        $(this).data("color-name"),
        'El valor de plazas a aprobar por el departamento no puede ser mayor que la solicitada ' + message
      );
      $("#close-request-places-new-teachers-modal").trigger("click");
      return false;
    }
    if (placesDap === "" || parseInt(placesDap) < 0) {
      showNotification(
        $(this).data("color-name"),
        'El valor de plazas a aprobar por la DAP es incorrecto ' + message
      );
      $("#close-request-places-new-teachers-modal").trigger("click");
      return false;
    }
    if (placesDap > selectedRequestPlaces) {
      showNotification(
        $(this).data("color-name"),
        'El valor de plazas a aprobar por la DAP no puede ser mayor que la solicitada ' + message
      );
      $("#close-request-places-new-teachers-modal").trigger("click");
      return false;
    }
    let id = parseInt(idRequestPlacesNewTeachers.split("-")[1]);
    console.log("VERIFICANDO");
    console.log(id + " " + placesCouncil + " " + placesDap);
    let response2 = await putData(
      `plazas/plazaordinaria/actualizarpostvalor`, { "plazain": { "idPlaza": id, "cantidadAceptadas": placesCouncil, "numeroAprobadasDAP": placesDap } }, $jwt.val(), user
    );
    if (response2) {
      await loadPlacesNewTeachers($("#selectPlacesNewTeachers").val());
      $('#editRequestPlacesNewTeachersModal .close-selected').trigger('click');
    } else {
      showNotification(
        $(this).data("color-name"),
        'Hubo un problema al editar las plazas a aprobar <i class="fas fa-exclamation pl-2"></i>'
      );
    }
  });



  $('.select2').select2();
  // //button: kebab case
  //modal: camelCase

  //editar API
  $("#edit-request-places-new-teachers-modal").on("click", function () {

    if (idRequestPlacesNewTeachers) {
      console.log(idRequestPlacesNewTeachers + " WWWWWWW");
      $("#activate-edit-modal").trigger("click");
      $("#date-request").val(`${selectedRequestDate}`);
      $("#teacher-request").val(`${selectedRequestTeacher}`);
      $("#requested-hours").val(`${selectedRequestPlaces}`);
      let id = parseInt(idRequestPlacesNewTeachers.split("-")[1]);
      console.log(id, "id");
      let wantedP = placesNewTeachersData.data.find(x => x.idPlaza == id);
      console.log(wantedP, "wanted");
      $("#description").val(wantedP.motivo);
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
  let today = new Date();
  let procesos = await getData(`plazas/procesosplazas/listar?tamanioPag=2000&tipoProcesoPlaza=ORDINARIO&idDepartamento=${idDepartamento}`, $jwt.val());
  const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
  const procesosSort = procesos.data.sort((a, b) => (a.fechaFin > b.fechaFin) ? 1 : -1)
  const lastProcess = procesosSort.pop();
  let aboutToDate1, aboutToDate2, beginning, end;
  if (procesoActivo) {
    idProceso = procesoActivo.idProcesosPlazas;
    loadPlacesNewTeachers();
    aboutToDate1 = procesoActivo.fechaInicio, aboutToDate2 = procesoActivo.fechaFin;//API
    // aboutToDate1="01/10/2021", aboutToDate2="10/10/2021"; //spanish
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
  } else if (lastProcess) {
    aboutToDate1 = lastProcess.fechaInicio, aboutToDate2 = lastProcess.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2)
    //console.log(lastProcess);
    idProceso = lastProcess.idProcesosPlazas;
  }

  if (procesoActivo && today < beginning) { //CREADO
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 1,
    });
    $('#edit-request-places-new-teachers-modal').prop('disabled', true);
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
    $('#edit-request-places-new-teachers-modal').prop('disabled', false);
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
    await loadPlacesNewTeachers();
    $('#beginning').val(aboutToDate1)
    $('#end').val(aboutToDate2)
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 4,
    });
    $('#edit-request-places-new-teachers-modal').prop('disabled', true);
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
    $('#edit-request-places-new-teachers-modal').prop('disabled', true);
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
    let response3 = await postData(
      `plazas/procesosplazas/guardar`, { "fechaInicio": aboutToDateBe, "fechaFin": aboutToDateEnd, "estado": true, "tipoProcesoPlaza": "ORDINARIO", "idDepartamento": idDepartamento }, $jwt.val(), user
    );
    location.reload();
  });

  $('#success-end-process').on('click', function () {
    swal("¡El proceso se ha finalizado correctamente!", "", "success");
  });

  $('#end-process').on('click', async function () {

    //ACA VA API DE ACTUALIZAR ESTADO DEL PROCESO
    let aboutToDateBe = $('#beginning').val(), aboutToDateEnd = $('#end').val();
    let newEs = false;
    let tipoP = "ORDINARIO";
    let res = await putData(
      `plazas/procesosplazas/actualizar`, {
      "idProcesosPlazas": idProceso,
      "estado": newEs,
      "tipoProcesoPlaza": tipoP,
      "fechaInicio": aboutToDateBe,
      "fechaFin": aboutToDateEnd
    }, $jwt.val(), user
    );
    if (res) {
      //console.log("Se ha finalizado el proceso");

      await loadPlacesNewTeachers($("#selectPlacesNewTeachers").val());
      $('#editRequestPlacesNewTeachersModal .close-selected').trigger('click');

      let data = $("#range_09").data("ionRangeSlider");
      data.update({
        from: 4,
      });
      $('#edit-request-places-new-teachers-modal').prop('disabled', true);
      $('.endp').prop('disabled', true);
      //other ones area actually disabled

      $('#close-end-process-modal').trigger('click');
      //mensaje de succes
      $('#success-end-process').trigger('click');

      idProceso = undefined;

    } else {
      showNotification(
        $(this).data("color-name"),
        'Hubo un problema al finalziar el proceso <i class="fas fa-exclamation pl-2"></i>'
      );
    }
  });
});

async function loadPlacesNewTeachers() {
  placesNewTeachersData = await getData(`plazas/plazaordinaria/listar?tamanioPag=2000&idProcesoPlaza=${idProceso}`, $jwt.val()
  );
  //console.log("DATAAAA");
  //console.log(placesNewTeachersData);
  let options = {
    idTable: "request-places-new-teachers-data-table",
    data: idProceso ? placesNewTeachersData.data : [],
    fields: [
      "fechaEnvio",
      "nombreSeccion",
      "cantidadSolicitadas",
      "aprobadasPorDepartamento",
      "aprobadasPorDAP"
    ],
    name: "Plazas Solicitadas",
    idName: "idPlaza",
    className: "requests-places-new-teachers-row",
    addButtons: false,
  };
  if (requestPlacesNewTeachersDataTable) requestPlacesNewTeachersDataTable.destroy();
  requestPlacesNewTeachersDataTable = createDataTable(options);
  $("#request-places-new-teachers-data-table_wrapper").children().first().remove();
}

function formattingStringDate(stringDate) {
  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`;
  return new Date(stringDate);
}