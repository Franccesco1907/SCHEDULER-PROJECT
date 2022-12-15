import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData, postData, putData } from "/utils/fetch.js";
let requestLessHoursDataTable = undefined;
let selectedRequestTeacher = undefined;
let loadRequests = undefined;
let idPro = undefined;
let edit = false;
let idPetD = undefined;
let idT = undefined;

$(async function () {

  let idRequestLessHours = undefined;
  let selectedRequestDate = undefined;

  let selectedRequestHours = undefined;
  let selectedRequestId = undefined;

  let today = new Date();

  let aboutToDate1, aboutToDate2, beginning, end;

  let procesos = await getData(`gestiondocente/procesos/listar?tamanioPag=2000&tipoProceso=DESCARGA&idDepartamento=${idDepartamento}`, jwt);
  const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
  const procesosSort = procesos.data.sort((a, b) => (formattingStringDate(a.fechaFin) > formattingStringDate(b.fechaFin)) ? 1 : -1)
  let lastProcess = undefined;
  if (procesosSort) lastProcess = procesosSort.pop();
  if (procesoActivo) {
    aboutToDate1 = procesoActivo.fechaInicio, aboutToDate2 = procesoActivo.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
    //console.log(procesoActivo);
    idPro = procesoActivo.idProceso;
  } else if (lastProcess) {
    aboutToDate1 = lastProcess.fechaInicio, aboutToDate2 = lastProcess.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2)
    console.log(lastProcess);
    idPro = lastProcess.idProceso;
  }

  $('#success-add-new-request').on('click', function () {
    swal("¡Se ha registrado correctamente la solicitud de descarga!", "", "success");
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
    //console.log(selectedRequestHours);
  });


  $('#edit-request-modal').on('click', async function () {

    if (idRequestLessHours) {
      //let id = idRequestLessHours.split('-')[1];
      //window.location.replace(`/department-secretary/view-request?idRequestLessHours=${id}`);
      let motivo = await searchMotivoPeticionDescarga();
      $("#activate-edit-modal").trigger("click");
      $('.inputHorasEditRequest').prop('placeholder', selectedRequestHours);
      $('.motivoEdit').val(motivo);
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


  $('#delete-request-modal').on('click', function () {

    if (idRequestLessHours) {
      //let id = idRequestLessHours.split('-')[1];
      //window.location.replace(`/department-secretary/view-request?idRequestLessHours=${id}`);
      $("#activate-delete-modal").trigger("click");
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

  $('#delete-request').on('click', async function () {
    let id = idRequestLessHours.split("-")[1];
    let idProfe = await findIdTeacher();
    let newEstado = false;


    let edit_request = {
      "idPeticionDescarga": parseInt(id),
      "idDocente": idProfe,
      "idCiclo": currentSemester.data.idCiclo,
      "idProcesos": parseInt(idPro),
      "estado": newEstado
    }

    //console.log(edit_request);

    let response = await postData(
      `gestiondocente/peticiondescarga/actualizar`, edit_request, jwt, user
    );
    //console.log(response.data);
    if (response.data) {
      await loadLessHours();
      $('#close-delete-request-modal').trigger('click');
      $('#success-delete-request').trigger('click');
    } else {
      showNotification(
        $(this).data("color-name"),
        'Hubo un problema al eliminar la solicitud de descarga<i class="fas fa-exclamation pl-2"></i>'
      );
    }
  });

  $('#success-delete-request').on('click', function () {
    swal("¡Se ha eliminado correctamente la solicitud de descarga!", "", "success");
  });

  $("#edit-button-modal").on("click", async function () {


    let id = idRequestLessHours.split("-")[1];
    let newHoras = $("#input-horas-new-request-modal").val();
    let motivo = $("#description-modal").val();
    let idProfe = await findIdTeacher();

    //console.log("gaaa", newHoras);

    if (newHoras > 0 && newHoras <= 10) {
      let edit_request = {
        "idPeticionDescarga": parseInt(id),
        "idDocente": idProfe,
        "idCiclo": currentSemester.data.idCiclo,
        "motivo": motivo,
        "horasSolicitadas": parseInt(newHoras),
        "idProcesos": parseInt(idPro)
      }

      //console.log(edit_request);

      let response = await postData(
        `gestiondocente/peticiondescarga/actualizar`, edit_request, jwt, user
      );
      //console.log(response.data);
      if (response.data) {
        await loadLessHours();
        $('#close-end-process-modal').trigger('click');
      } else {
        var placementFrom = $(this).data("placement-from");
        var placementAlign = $(this).data("placement-align");
        var colorName = $(this).data("color-name");
        showNotification(
          colorName,
          'Usted no ha seleccionado ninguna solicitud de descarga <i class="fas fa-exclamation-triangle pl-2"></i>'
        );
      }
    } else {
      await loadLessHours();
      showNotification(
        $(this).data("color-name"),
        'Debe ingresar un valor positivo y menor o igual a 10 (limite de horas) <i class="fas fa-exclamation pl-2"></i>');
    }


  });


  $(document).on("click", "#btn-add-new-request", async function () {

    let id_docente = $("#teacher").val();
    let horas = $("#input-horas-new-request").val();
    let dateString = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    let edit = 0;
    //console.log("Docente de id " + id_docente + " esta pidiendo " + horas);
    let flag = await searchTeacher();
    let motivo = $("#description").val();
    //console.log("FLAG " + flag);
    if (horas <= 10 && horas > 0 && (flag == false || flag == true && edit == 1) && motivo != "") {

      let new_request = {
        "fechaEnvio": dateString,
        "anexo": "a",
        "motivo": motivo,
        "idDocente": id_docente,
        "horasSolicitadas": horas,
        "horasAprobadas": 0,
        "estadoPeticion": "EN_PROCESO",
        "idProcesos": idPro,
      }
      //console.log(new_request);
      let response;
      if (edit == 1) {
        let edit_request = {
          "idPeticionDescarga": idPetD,
          "idDocente": idT,
          "fechaEnvio": dateString,
          "idCiclo": currentSemester.data.idCiclo,
          "idProcesos": parseInt(idPro),
          "estado": true
        }
        //console.log(edit_request);
        response = await postData(
          `gestiondocente/peticiondescarga/actualizar`, edit_request, jwt, user
        );
      } else {
        response = await postData(
          `gestiondocente/peticiondescarga/guardar`, new_request, jwt, user
        );
      }
      //console.log(response.data);

      if (response.data) {
        await loadLessHours();
        $("#input-docente-new-request").val("");
        $("#input-horas-new-request").val("");
        $("#description").val("");
        $('#success-add-new-request').trigger('click');
      } else {
        showNotification(
          $(this).data("color-name"),
          'Hubo un problema al registrar las horas a aprobar <i class="fas fa-exclamation pl-2"></i>'
        );
      }
    } else if (flag == true) {
      showNotification(
        $(this).data("color-name"),
        'No se puede ingresar una solicitud para un mismo profesor mas de una vez <i class="fas fa-exclamation pl-2"></i>'
      );
    } else if (motivo == "") {
      showNotification(
        $(this).data("color-name"),
        'Debe ingresar un motivo para la solicitud <i class="fas fa-exclamation pl-2"></i>'
      );
    } else {
      showNotification(
        $(this).data("color-name"),
        'Debe ingresar un valor positivo y menor o igual a 10 (limite de horas) <i class="fas fa-exclamation pl-2"></i>'
      );
    }
  });

  $(".select2").select2();

  function showSuccessMessage() {
    swal("¡El curso se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
  }

  $('#success-delete-course').on('click', function () {
    showSuccessMessage();
  });

  $("#range_09").ionRangeSlider({
    grid: true,
    from: 0,
    to_fixed: true,//block the top
    from_fixed: true,//block the from
    values: ["NO INICIADO", "INICIADO", "EN PROCESO", "FINALIZADO"],
  });
  // IMPORTANTE : PROCESO DE NUEVOS DOCENTES - COORD DE SECCION

  $('#beginning').prop('disabled', true);
  $('#end').prop('disabled', true);

  if (procesoActivo) {

    $('#beginning').val(aboutToDate1)
    $('#end').val(aboutToDate2)

    if (today < beginning) {
      // AUN NO LLEGA A LA FECHA DE INICIO
      console.log("NO INICIADO");
      let data = $("#range_09").data("ionRangeSlider");
      data.update({
        from: 0,
      });

      $('#teacher').prop('disabled', true);
      $('#input-horas-new-request').prop('disabled', true);
      $('#btn-add-new-request').prop('disabled', true);
      $('#description').prop('disabled', true);

    } else if (today > beginning && today < end) {
      //console.log("INICIADO");
      // LLEGO A LA FECHA DE INICIO
      await loadLessHours();

      let data = $("#range_09").data("ionRangeSlider");
      data.update({
        from: 1,
      });

      $('#teacher').prop('disabled', false);
      $('#input-horas-new-request').prop('disabled', false);
      $('#btn-add-new-request').prop('disabled', false);
      $('#description').prop('disabled', false);

    } else if (today > end) {
      //console.log("EN PROCESO");
      // LLEGO A LA FECHA FIN
      await loadLessHours();

      let data = $("#range_09").data("ionRangeSlider");
      data.update({
        from: 2,
      });
      //console.log("Today es menor");

      $('#teacher').prop('disabled', true);
      $('#input-horas-new-request').prop('disabled', true);
      $('#btn-add-new-request').prop('disabled', true);
      $('#edit-request-modal').prop('disabled', true);
      $('#delete-request-modal').prop('disabled', true);
      $('#description').prop('disabled', true);

    }
  } else if (end > new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000))) {
    // FIN DE PROCESO PERO AUN NO DESAPARECE LA FECHA
    //console.log("5 DIAS RAA")
    //console.log(new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000)));
    await loadLessHours();
    $('#beginning').val(aboutToDate1)
    $('#end').val(aboutToDate2)
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 3,
    });
    $('#teacher').prop('disabled', true);
    $('#input-horas-new-request').prop('disabled', true);
    $('#btn-add-new-request').prop('disabled', true);
    $('#edit-request-modal').prop('disabled', true);
    $('#delete-request-modal').prop('disabled', true);
    $('#description').prop('disabled', true);
  } else {
    // FIN DE PROCESO HACE TIEMPO
    $('#beginning').prop('placeholder', '--/--/----');
    $('#end').prop('placeholder', '--/--/----');
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 0,
    });
    $('#teacher').prop('disabled', true);
    $('#input-horas-new-request').prop('disabled', true);
    $('#btn-add-new-request').prop('disabled', true);
    $('#edit-request-modal').prop('disabled', true);
    $('#delete-request-modal').prop('disabled', true);
    $('#description').prop('disabled', true);
  }



  // $(".initp").on("click", function () {
  //   let data = $("#range_09").data("ionRangeSlider");
  //   if (!$('#beginning').val() || !$('#end').val()) {
  //     showNotification('alert-warning', 'Por favor elija las fechas de inicio y fin <i class="fas fa-exclamation-triangle pl-2"></i>');
  //     return false;
  //   }
  //   data.update({
  //     from: 1,
  //   });
  // });
  // $(".endp").on("click", function () {
  //   if (!$('#beginning').val() || !$('#end').val()) {
  //     showNotification('alert-warning', 'Por favor elija las fechas de inicio y fin <i class="fas fa-exclamation-triangle pl-2"></i>');
  //     return false;
  //   }
  //   let data = $("#range_09").data("ionRangeSlider");
  //   data.update({
  //     from: 3,
  //   });
  // });

});

async function loadLessHours() {
  let lessHoursData = await getData(`gestiondocente/peticiondescarga/listar?idSeccion=${parseInt(idSeccion)}&idProceso=${idPro}&tamanioPag=2000&pagina=1`, jwt
  );
  loadRequests = lessHoursData.data;
  let options = {
    idTable: "request-less-hours-data-table",
    data: lessHoursData.data,
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

async function searchMotivoPeticionDescarga() {
  let idTeacher = await findIdTeacher();
  let lessHour = await getData(`gestiondocente/peticiondescarga/listar?idSeccion=${parseInt(idSeccion)}&idProceso=${idPro}&idDocente=${idTeacher}&tamanioPag=2000&pagina=1`, jwt
  );
  //console.log(lessHour.data[0].nombreDocente);
  if (lessHour) return lessHour.data[0].motivo;
  else return null;
}

function formattingStringDate(stringDate) {
  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`;
  return new Date(stringDate);
}

async function searchTeacher() {
  //let nombreProf = "";
  let profes = loadRequests;
  //console.log(loadRequests)
  for (let profe of profes) {
    if (profe.idDocente == $('#teacher').val()) {
      // if (profe.estado == false) {
      //   console.log("ya existia :v ");
      //   edit = 1;
      //   idPetD = profe.idPeticionDescarga;
      //   idT = profe.idDocente;
      // }
      return true;
    }//nombreProf = profe.nombreCompleto;
    //console.log(profe.idPersona + "   " + $('#teacher').val());
  }
  //console.log(nombreProf);
  // for (let req of loadRequests) {
  //   if (req.nombreDocente.localeCompare(nombreProf) == 0) return true;
  // }
  return false;
}

async function findIdTeacher() {
  for (let profe of teachers) {
    if (profe.nombreCompleto == selectedRequestTeacher) return profe.idPersona;
  }
  return -1;
}