import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData, postData, putData } from "/utils/fetch.js";

let idPro = undefined;
let idRequest = undefined;
let justRequest = undefined;
let cantRequestPri = undefined;
let dptoRequestPri = undefined;
let dapRequestPri = undefined;
let cantRequestAux = undefined;
let dptoRequestAux = undefined;
let dapRequestAux = undefined;
let editable = 0;

$(async function () {

  let today = new Date();
  let aboutToDate1, aboutToDate2, beginning, end;
  // listar procesos de procesosplazas
  let procesos = await getData(`plazas/procesosplazas/listar?tamanioPag=2000&tipoProcesoPlaza=ASCENSO&idDepartamento=${idDepartamento}`, jwt);

  const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
  const procesosSort = procesos.data.sort((a, b) => (a.fechaFin > b.fechaFin) ? 1 : -1)
  const lastProcess = procesosSort.pop();

  if (procesoActivo) { // proceso activo estado = 1
    aboutToDate1 = procesoActivo.fechaInicio, aboutToDate2 = procesoActivo.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
    //console.log(procesoActivo);
    idPro = procesoActivo.idProcesosPlazas;
  } else if (lastProcess) { // ultimo proceso activo estado = 0
    aboutToDate1 = lastProcess.fechaInicio, aboutToDate2 = lastProcess.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2)
    //console.log(lastProcess);
    idPro = lastProcess.idProcesosPlazas;
  }

  $(document).on("click", "#btn-add-new-request", async function () {

    let plazas1 = $("#input-places-new-teachers-request-aux").val();
    let plazas2 = $("#input-places-new-teachers-request-pri").val();
    let motivo = $("#description").val();
    let dateString = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    if (motivo != "" && plazas1 > 0 && plazas2 > 0) {

      let new_request = {
        "plazain": {
          "fechaInicio": dateString,
          "fechaFin": dateString,
          "idSeccion": idSeccion,
          "cantidadPlazas": plazas2,
          "justificacion": motivo,
          "cantidadAceptadas": 0,
          "numeroAprobadasDAP": 0,
          "idProcesoPlaza": idPro,
          "fechaEnvio": dateString
        },
        "esOrdinario": false,
        "cantidadAceptadasAuxiliar": 0,
        "cantidadPlazasAuxiliar": plazas1,
        "numeroAprobadasDAPAuxiliar": 0
      }

      let response = await postData(
        `plazas/plazaordinaria/guardar`, new_request, jwt, user
      );

      if (response.data) {
        $('#btn-add-new-request').prop('disabled', true);

        swal("¡La solicitud se ha enviado correctamente!", "Espera a los resultados del proceso", "success");

      } else {
        showNotification(
          $(this).data("color-name"),
          'Hubo un problema al registrar la solicitud de plazas <i class="fas fa-exclamation pl-2"></i>'
        );
      }
    } else if (motivo == "") {
      showNotification(
        $(this).data("color-name"),
        'Debe ingresar una justificacion para la solicitud <i class="fas fa-exclamation pl-2"></i>'
      );
    } else {
      showNotification(
        $(this).data("color-name"),
        'Debe ingresar un valor positivo para la cantidad de plazas solicitadas <i class="fas fa-exclamation pl-2"></i>'
      );
    }
  });

  $(document).on("click", "#btn-edit-new-request", async function () {

    if (editable == 0) {
      const b = document.getElementById("btn-edit-new-request");
      b.innerText = "Guardar cambios";
      $("#description").prop('disabled', false);
      $("#input-places-new-teachers-request-aux").prop('disabled', false);
      $("#input-places-new-teachers-request-pri").prop('disabled', false);
      editable = 1;
    } else {
      let plazas1 = $("#input-places-new-teachers-request-aux").val();
      let plazas2 = $("#input-places-new-teachers-request-pri").val();
      let motivo = $("#description").val();
      let dateString = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
      if (motivo != "" && plazas1 > 0 && plazas2 > 0) {

        let new_request = {
          "plazain": {
            "idPlaza": idRequest,
            "cantidadPlazas": plazas2,
            "justificacion": motivo,
            "fechaEnvio": dateString
          },
          "cantidadPlazasAuxiliar": plazas1
        }
        console.log(new_request);
        let response = await putData(
          `plazas/plazaordinaria/actualizarprevalor`, new_request, jwt, user
        );

        if (response.data) {
          $('#btn-edit-new-request').prop('disabled', true);

          swal("¡La solicitud se ha editado correctamente!", "Espera a los resultados del proceso", "success");
          location.reload();
        } else {
          showNotification(
            $(this).data("color-name"),
            'Hubo un problema al registrar la solicitud de plazas <i class="fas fa-exclamation pl-2"></i>'
          );
        }
      } else if (motivo == "") {
        showNotification(
          $(this).data("color-name"),
          'Debe ingresar una justificacion para la solicitud <i class="fas fa-exclamation pl-2"></i>'
        );
      } else {
        showNotification(
          $(this).data("color-name"),
          'Debe ingresar un valor positivo para la cantidad de plazas solicitadas <i class="fas fa-exclamation pl-2"></i>'
        );
      }
      editable = 0;
    }
  });

  $(".select2").select2();

  $("#range_09").ionRangeSlider({
    grid: true,
    from: 0,
    to_fixed: true,//block the top
    from_fixed: true,//block the from
    values: ["NO INICIADO", "INICIADO", "EN PROCESO", "FINALIZADO"],
  });

  // IMPORTANTE : PROCESO DE ASCENSO DOCENTES - COORD DE SECCION

  $('#beginning').prop('disabled', true);
  $('#end').prop('disabled', true);
  $('#input-places-teachers-request-dpto-aux').prop('disabled', true);
  $('#input-places-teachers-request-dpto-pri').prop('disabled', true);
  $('#input-places-teachers-request-dap-aux').prop('disabled', true);
  $('#input-places-teachers-request-dap-pri').prop('disabled', true);

  if (procesoActivo) {

    $('#beginning').val(aboutToDate1)
    $('#end').val(aboutToDate2)

    if (today < beginning) {
      // AUN NO LLEGA A LA FECHA DE INICIO
      //console.log("NO INICIADO");

      let data = $("#range_09").data("ionRangeSlider");
      data.update({
        from: 0,
      });

      $("#input-places-new-teachers-request-aux").prop('disabled', true);
      $("#input-places-new-teachers-request-pri").prop('disabled', true);
      $("#description").prop('disabled', true);
      $('#btn-add-new-request').prop('disabled', true);

    } else if (today > beginning && today < end) {
      // LLEGO A LA FECHA DE INICIO
      //console.log("INICIADO");

      let data = $("#range_09").data("ionRangeSlider");
      data.update({
        from: 1,
      });

      let flag = await searchLastRequest();

      if (flag == true) {
        //console.log("YA HAY UNA SOLICITUD");

        $("#input-places-new-teachers-request-aux").prop('disabled', true);
        $("#input-places-new-teachers-request-pri").prop('disabled', true);
        $("#input-places-new-teachers-request-aux").val(cantRequestAux);
        $("#input-places-new-teachers-request-pri").val(cantRequestPri);
        $('#input-places-teachers-request-dpto-aux').val(dptoRequestAux);
        $('#input-places-teachers-request-dpto-pri').val(dptoRequestPri);
        $('#input-places-teachers-request-dap-aux').val(dapRequestAux);
        $('#input-places-teachers-request-dap-pri').val(dapRequestPri);
        $("#description").prop('disabled', true);
        $('#btn-add-new-request').prop('disabled', true);
        $("#description").val(justRequest);

      } else {
        //console.log("AUN NO SE ENVIO NADA");

        $("#input-places-new-teachers-request-aux").prop('disabled', false);
        $("#input-places-new-teachers-request-pri").prop('disabled', false);
        $("#input-places-new-teachers-request-aux").val('');
        $("#input-places-new-teachers-request-pri").val('');
        $('#input-places-teachers-request-dpto-aux').val('');
        $('#input-places-teachers-request-dpto-pri').val('');
        $('#input-places-teachers-request-dap-aux').val('');
        $('#input-places-teachers-request-dap-pri').val('');
        $("#description").prop('disabled', false);
        $('#btn-add-new-request').prop('disabled', false);
        $("#description").val('');

      }

    } else if (today > end) {
      //console.log("EN PROCESO");
      // LLEGO A LA FECHA FIN

      await searchLastRequest();
      $("#input-places-new-teachers-request-aux").prop('disabled', true);
      $("#input-places-new-teachers-request-pri").prop('disabled', true);
      $("#input-places-new-teachers-request-aux").val(cantRequestAux);
      $("#input-places-new-teachers-request-pri").val(cantRequestPri);
      $('#input-places-teachers-request-dpto-aux').val(dptoRequestAux);
      $('#input-places-teachers-request-dpto-pri').val(dptoRequestPri);
      $('#input-places-teachers-request-dap-aux').val(dapRequestAux);
      $('#input-places-teachers-request-dap-pri').val(dapRequestPri);
      $("#description").prop('disabled', true);
      $('#btn-add-new-request').prop('disabled', true);
      $("#description").val(justRequest);

      let data = $("#range_09").data("ionRangeSlider");
      data.update({
        from: 2,
      });

    }
  } else if (end > new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000))) {
    // FIN DE PROCESO PERO AUN NO DESAPARECE LA FECHA
    //console.log("5 DIAS RAA")

    $('#beginning').val(aboutToDate1)
    $('#end').val(aboutToDate2)

    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 3,
    });

    await searchLastRequest();
    $("#input-places-new-teachers-request-aux").prop('disabled', true);
    $("#input-places-new-teachers-request-pri").prop('disabled', true);
    $("#input-places-new-teachers-request-aux").val(cantRequestAux);
    $("#input-places-new-teachers-request-pri").val(cantRequestPri);
    $('#input-places-teachers-request-dpto-aux').val(dptoRequestAux);
    $('#input-places-teachers-request-dpto-pri').val(dptoRequestPri);
    $('#input-places-teachers-request-dap-aux').val(dapRequestAux);
    $('#input-places-teachers-request-dap-pri').val(dapRequestPri);
    $("#description").val(justRequest);
    $("#description").prop('disabled', true);
    $('#btn-add-new-request').prop('disabled', true);


  } else {
    // FIN DE PROCESO HACE TIEMPO
    //console.log("NO HAY PROCESOS ACTIVOS Y HACE TIEMPO ACABO EL ULTIMO");

    $('#beginning').prop('placeholder', '--/--/----');
    $('#end').prop('placeholder', '--/--/----');

    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 0,
    });

    $("#input-places-new-teachers-request-aux").prop('disabled', true);
    $("#input-places-new-teachers-request-pri").prop('disabled', true);
    $("#description").prop('disabled', true);
    $('#btn-add-new-request').prop('disabled', true);

  }

  $(".initp").on("click", function () {
    let data = $("#range_09").data("ionRangeSlider");
    if (!$('#beginning').val() || !$('#end').val()) {
      showNotification('alert-warning', 'Por favor elija las fechas de inicio y fin <i class="fas fa-exclamation-triangle pl-2"></i>');
      return false;
    }
    data.update({
      from: 1,
    });
  });
  $(".endp").on("click", function () {
    if (!$('#beginning').val() || !$('#end').val()) {
      showNotification('alert-warning', 'Por favor elija las fechas de inicio y fin <i class="fas fa-exclamation-triangle pl-2"></i>');
      return false;
    }
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 3,
    });
  });

});

function formattingStringDate(stringDate) {
  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`;
  return new Date(stringDate);
}

async function searchLastRequest() { // en realidad solo deberia ser una solicitud por seccion, asi que deberia devolver lista de 1 elemento

  let lastRequest = await getData(`plazas/plazaordinaria/listarascenso?tamanioPag=200&idSeccion=${parseInt(idSeccion)}&idProcesoPlaza=${idPro}`, jwt);
  let request = lastRequest.data.pop();

  if (request) {
    idRequest = request.idPlaza;
    justRequest = request.motivo;
    cantRequestPri = request.cantidadSolicitadas;
    dptoRequestPri = request.aprobadasPorDepartamento;
    dapRequestPri = request.aprobadasPorDAP;
    cantRequestAux = request.cantidadSolicitadasAuxiliar;
    dptoRequestAux = request.aprobadasPorDepartamentoAuxiliar;
    dapRequestAux = request.aprobadasPorDAPAuxiliar;
    return true;
  }
  else return false;
}