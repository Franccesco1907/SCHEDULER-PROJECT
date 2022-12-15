import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData, postData, putData } from "/utils/fetch.js";
let loadRequests = undefined;
let idPro = undefined;
let plaza = undefined;
let idPlaza = undefined;
let candidatesDataTable = undefined;
let idCandidate = undefined;
let criteriosDataTable = undefined;
let idEvaluacionPostulacion = undefined;
let criterios = undefined;
let evaluations = undefined;
let fecha1 = undefined;
let fecha2 = undefined;
let theAnexo = undefined;
let anex = undefined;
let dataCriteriosBase = undefined;
let listCriteriosTable = undefined;

let idRequest = undefined;
let justRequest = undefined;
let cantRequest = undefined;
let dptoRequest = undefined;
let dapRequest = undefined;
let areaRequest = undefined;

$(async function () {
  $('.date').bootstrapMaterialDatePicker({
    format: 'DD/MM/YYYY',
    weekStart: 1,
    time: false,
    cancelText: 'Cancelar',
    okText: 'Elegir',
    nowText: 'Ahora',
    lang: 'es'
  });
  let today = new Date();

  let aboutToDate1, aboutToDate2, beginning, end;

  // PRIMERO LISTO EL ULTIMO PROCESO QUE ESTUVO ACTIVO
  let procesos = await getData(`plazas/procesosplazas/listar?tamanioPag=2000&tipoProcesoPlaza=NUEVO_DOCENTE&idDepartamento=${idDepartamento}`, jwt);

  const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
  const procesosSort = procesos.data.sort((a, b) => (formattingStringDate(a.fechaFin) > formattingStringDate(b.fechaFin)) ? 1 : -1)
  const lastProcess = procesosSort.pop();

  if (procesoActivo) { // proceso activo estado = 1
    aboutToDate1 = procesoActivo.fechaInicio, aboutToDate2 = procesoActivo.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
    ////console.log(procesoActivo);
    idPro = procesoActivo.idProcesosPlazas;
  } else if (lastProcess) { // ultimo proceso activo estado = 0
    aboutToDate1 = lastProcess.fechaInicio, aboutToDate2 = lastProcess.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2)
    ////console.log(lastProcess);
    idPro = lastProcess.idProcesosPlazas;
  }

  // AHORA LISTO LA PLAZA SOLICITADA PARA MI SECCION DEL ULTIMO PROCESO ACTIVO
  ////console.log(idPro,idSeccion)
  if (idPro) {
    let pq = await getData(`plazas/plazadocentecontratado/listar?tamanioPag=2000&idSeccion=${parseInt(idSeccion)}&idProcesoPlaza=${parseInt(idPro)}`, jwt);
    ////console.log(pq);
    ////console.log(pq.data);
    if (pq.data.length > 0) {
      plaza = pq.data.pop();
      ////console.log(plaza.aprobadasPorDAP)
      idPlaza = plaza.idPlazaDocente;
      ////console.log(idPlaza)
      fecha1 = formattingStringDate(plaza.fechaInicio);
      fecha2 = formattingStringDate(plaza.fechaFin);

    }
  }

  ////console.log(idSeccion,idPlaza);
  ////console.log(plaza);

  $(".select2").select2();

  $("#range_09").ionRangeSlider({
    grid: true,
    from: 0,
    to_fixed: true,//block the top
    from_fixed: true,//block the from
    values: ["NO CREADO", "CREADO", "INICIADO", "EN PROCESO", "FINALIZADO"],
  });
  // IMPORTANTE : PROCESO DE CONVOCATORIA DE UNA SECCION
  if (procesoActivo) { // SI HAY UN PROCESO ACTIVO AUN NO PUEDO INICIAR CONVOCATORIA
    ////console.log("HAY UN PROCESO DE PLAZAS EN MARCHA DENTRO DEL DEPARTAMENTO");

    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
    $('#initp').prop('disabled', true);
    $('#endp').prop('disabled', true);
    $('#btn-evaluate').prop('disabled', true);
    $('#btn-define-criterios').prop('disabled', true);
    $('#beginning').prop('placeholder', '--/--/----');
    $('#end').prop('placeholder', '--/--/----');
    $('#area').prop('disabled', true);
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 0,
    });
    //pq.data.length>0
  } else { // NO HAY PROCESO, ENTONCES PUEDO CREAR CONVOCATORIA SI ES QUE ...
    ////console.log("NO HAY UN PROCESO DE PLAZAS EN MARCHA DENTRO DEL DEPARTAMENTO");
    if (plaza) { // SI MI SECCION ENVIO UNA PLAZA ...
      ////console.log(plaza);
      ////console.log(plaza.aprobadasPorDAP)
      if (plaza.aprobadasPorDAP > 0) { // SI ME ACEPTARON LAS PLAZAS (>0) ENTONCES PUEDO CREAR UNA CONVOCATORIA O YA EXISTE UNA

        ////console.log("ME ACEPTARON LAS PLAZAS QUE SOLICITE");

        if (!plaza.estadoPostulacion) { // AUN NO HA SIDO CREADO
          ////console.log("AUN NO CREE UN PROCESO DE CONVOCATORIA");

          $('#beginning').prop('disabled', false);
          $('#end').prop('disabled', false);
          $('#btn-evaluate').prop('disabled', true);
          $('#initp').prop('disabled', false);
          $('#btn-define-criterios').prop('disabled', false);
          $('#endp').prop('disabled', true);
          $('#area').prop('disabled', false);
          let data = $("#range_09").data("ionRangeSlider");
          data.update({
            from: 0,
          });

        } else if (plaza.estadoPostulacion) { // YA CREE UNO; AQUI CONSIDERAR CASOS
          ////console.log("YA CREE UN PROCESO DE CONVOCATORIA");

          $('#beginning').prop('disabled', true);
          $('#end').prop('disabled', true);
          $('#initp').prop('disabled', true);
          $('#btn-define-criterios').prop('disabled', true);
          $('#endp').prop('disabled', true);
          $('#beginning').val(plaza.fechaInicio);
          $('#end').val(plaza.fechaFin);
          $('#area').prop('disabled', true);
          await searchLastRequest();
          $('#area').val(areaRequest);
          await loadCandidates();
          // //console.log(today,beginning,end,fecha1,fecha2);
          if (today < fecha1) { // AUN NO INICIA
            //console.log("AUN NO INICIA MI PROCESO");

            $('#btn-evaluate').prop('disabled', true);
            let data = $("#range_09").data("ionRangeSlider");
            data.update({
              from: 1,
            });

          } else if (today < fecha2) { // YA INICIO
            ////console.log("YA INICIO MI PROCESO");

            $('#btn-evaluate').prop('disabled', true);
            let data = $("#range_09").data("ionRangeSlider");
            data.update({
              from: 2,
            });

          } else { // YA ACABO; EN PROCESO
            //console.log("AYA ACABO MI PROCESO");

            $('#btn-evaluate').prop('disabled', false);
            let data = $("#range_09").data("ionRangeSlider");
            data.update({
              from: 3,
            });
          }

        } else if (!plaza.estado) { // YA FINALIZO LO QUE CREE; CONSIDERAR CASOS
          ////console.log("YA FINALIZO MI PROCESO Y ACABE DE EVALUAR");

          $('#beginning').prop('disabled', true);
          $('#end').prop('disabled', true);

          if (end > new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000))) { // MENOR A 5 DIAS
            ////console.log("AUN ESTAMOS EN LOS 5 DIAS");

            $('#beginning').val(plaza.fechaInicio)
            $('#end').val(plaza.fechaFin)
            $('#initp').prop('disabled', true);
            $('#btn-define-criterios').prop('disabled', true);
            $('#endp').prop('disabled', false);
            $('#area').prop('disabled', true);
            let data = $("#range_09").data("ionRangeSlider");
            data.update({
              from: 4,
            });

          } else { // YA PASO MAS DE 5 DIAS
            //console.log("YA ACABO HACE RATO OE");

            $('#beginning').prop('placeholder', '--/--/----');
            $('#end').prop('placeholder', '--/--/----');
            $('#area').prop('disabled', true);
            $('#btn-define-criterios').prop('disabled', true);
            let data = $("#range_09").data("ionRangeSlider");
            data.update({
              from: 0,
            });
          }
        }

      } else {
        ////console.log("NO ME ACPETARON LAS PLAZAS QUE SOLICITE")
        $('#beginning').prop('disabled', true);
        $('#end').prop('disabled', true);
        $('#initp').prop('disabled', true);
        $('#endp').prop('disabled', true);
        $('#btn-evaluate').prop('disabled', true);
        $('#beginning').prop('placeholder', '--/--/----');
        $('#end').prop('placeholder', '--/--/----');
        $('#area').prop('disabled', true);
      }
    } else {
      ////console.log("MI SECCION NO SOLICITO PLAZAS PARA ESTE PROCESO");
      $('#beginning').prop('disabled', true);
      $('#end').prop('disabled', true);
      $('#initp').prop('disabled', true);
      $('#endp').prop('disabled', true);
      $('#btn-evaluate').prop('disabled', true);
      $('#beginning').prop('placeholder', '--/--/----');
      $('#end').prop('placeholder', '--/--/----');
      $('#area').prop('disabled', true);
    }
  }


  $("#initp").on("click", async function () {
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
    let area = $('#area').val()
    //console.log(area);
    if (area == "") {
      showNotification('alert-warning', 'Debe ingresar una descripcion para la convocatoria actual <i class="fas fa-exclamation-triangle pl-2"></i>');
      return false;
    }
    ////console.log(idPlaza); 
    let new_request = {
      "area": area,
      "plazain": {
        "idPlaza": idPlaza,
        "fechaInicio": aboutToDateBe.toString(),
        "fechaFin": aboutToDateEnd.toString()
      },
      "estadoPostulacion": true
    }
    let response = await putData(`plazas/plazadocentecontratado/actualizarpostvalor`, new_request, jwt, user);

    location.reload();
  });

  $("#endp").on("click", async function () {
    if (!$('#beginning').val() || !$('#end').val()) {
      showNotification('alert-warning', 'Por favor elija las fechas de inicio y fin <i class="fas fa-exclamation-triangle pl-2"></i>');
      return false;
    }
    let new_request = {
      "plazain": {
        "idPlaza": idPlaza
      },
      "estado": false
    }
    let response = await putData(`plazas/plazadocentecontratado/actualizarpostvalor`, new_request, jwt, user);
    location.reload();
  });

  $("#btn-evaluate").on("click", async function () {
    if (typeof (idCandidate) !== "number")
      idCandidate = parseInt(idCandidate.split("-")[1]);


    if (idCandidate === undefined) {
      showNotification("alert-warning", "Debe seleccionar un candidato")
    } else {
      $("#help").trigger("click");



      evaluations = await getData(`plazas/evaluacion/listar?tamanioPag=2000&idPostulacion=${idCandidate}`, jwt);
      //console.log(evaluations);

      evaluations = evaluations.data;


      if (evaluations.length == 0) {
        //no tiene una evaluación, se le crea una 
        evaluations = [{
          "puntajeTotal": 0,
          "idPostulacion": idCandidate,
          "idPlaza": idPlaza
        }]
        idEvaluacionPostulacion = await postData(`plazas/evaluacion/guardar`, evaluations[0], jwt, user);
        idEvaluacionPostulacion = idEvaluacionPostulacion.data;
        evaluations[0].idEvaluacionPostulacion = idEvaluacionPostulacion;
      }
      //ya existe una evaluación, solo se lista
      else idEvaluacionPostulacion = evaluations[0].idEvaluacionPostulacion;

      evaluations[0].idPlaza = idPlaza;
      $("#puntajeTotal").attr("value", evaluations[0].puntajeTotal);
      criterios = await getData(`plazas/criterios/listar?tamanioPag=2000&idEvaluacionPostulacion=${idEvaluacionPostulacion}`, jwt);
      criterios = criterios.data;
      //console.log(criterios);
      if (criteriosDataTable !== undefined) criteriosDataTable.destroy();
      let optionsCriterios = {
        idTable: "criteria-table",
        data: criterios,
        fields: [
          "descripcion",
          "puntajeMaximo",
          "puntaje"
        ],
        name: "Candidate",
        idName: "idCriteriosEvPostulacion",
        className: "Candidate-row",
        addButtons: false,
      }

      criteriosDataTable = createDataTableCriterios(optionsCriterios)
    }
  });

  $("#evaluation-modal").on('hidden.bs.modal', function () {
    idCandidate = `idPostulacion-${idCandidate}`;
  });

  $(document).on("click", "#accept-derivation", async function () {
    //console.log(criterios);
    let abort = false;
    criterios.forEach((element) => {
      let valor = parseInt(
        $(`#puntaje-${element.idCriteriosEvPostulacion}`).val()
      );
      ////console.log(valor,element.puntajeMaximo);
      if (valor > element.puntajeMaximo || valor < 0) {
        let tipo = valor > 0 ? "menor" : "mayor";
        let restriccion = valor > 0 ? element.puntajeMaximo : 0;
        showNotification(
          "alert-danger",
          `El puntaje de ${element.descripcion} debe ser ${tipo} que ${restriccion}`
        );
        abort = true;
        return;
      }
    });
    if (abort == true) return;
    for (let i = 0; i < criterios.length; i++) {
      criterios[i].puntaje = parseInt($(`#puntaje-${criterios[i].idCriteriosEvPostulacion}`).val());
      criterios[i].estado = !$(`#check-${criterios[i].idCriteriosEvPostulacion}`).prop("checked");

      let aux = await putData("plazas/criterios/actualizar", criterios[i], jwt, user);
      $("#close-derivate-modal").trigger("click");

    }
    //console.log(criterios);
    //console.log(evaluations[0])
    evaluations[0].puntajeTotal = parseInt($("#puntajeTotal").val());
    let aux = await putData("plazas/evaluacion/actualizar", evaluations[0], jwt, user);
    showNotification("alert-success", "Se ha registrado la nota correctamente");
    //swal("¡Los Docentes se han guardado correctamente!", ":)", "success");

  });

  $("#btn-define-criterios").on("click", async function () {
    loadListCriterios();
  });

  $(document).on("click", "#agregar-criterio", async function () {
    let descripcion = $("#input-descripcion").val();
    let puntaje = parseInt($("#input-puntaje").val());
    let newCriterio = {
      "descripcion": descripcion,
      "puntajeMaximo": puntaje,
      "puntaje": 0,
      "estado": true,
      "idPlaza": parseInt(idPlaza)
    }
    await postData("plazas/criteriobase/guardar", newCriterio, jwt, user);
    if (listCriteriosTable) listCriteriosTable.destroy();
    listCriteriosTable = loadListCriterios();
  });

  $(document).on('click', '.list-criterio-row', function () {
    //console.log(idListCriterio)  ;
    if (idListCriterio !== undefined && idListCriterio == $(this).attr('id')) {
      ////console.log(idListCriterio)  ;
      $(`#${idListCriterio}`).removeClass('cv-reception-selected');
      idListCriterio = undefined;
    } else {

      $(`#${idListCriterio}`).removeClass('cv-reception-selected');
      idListCriterio = $(this).attr('id');
      $(this).addClass("cv-reception-selected");
      ////console.log(idListCriterio)  ;
    }
  });

  $(document).on('click', '.cv-reception-row', function () {
    ////console.log(idCandidate)  ;
    if (idCandidate !== undefined && idCandidate == $(this).attr('id')) {
      ////console.log(idCandidate)  ;
      $(`#${idCandidate}`).removeClass('cv-reception-selected');

      idCandidate = undefined;
    } else {

      $(`#${idCandidate}`).removeClass('cv-reception-selected');
      idCandidate = $(this).attr('id');
      //nameCourseSelected = $(this).children().eq(1).html();
      theAnexo = $(this).children().eq(2).html();
      // anex = $(this).children().eq(2);
      // //console.log(theAnexo);
      $(this).addClass("cv-reception-selected");
      ////console.log(idCandidate)  ;
    }
  });

  $(document).on('click', '#desactivar-criterio', async function () {
    if (idListCriterio === undefined) return;
    else {
      let id = idListCriterio.split("-")[1]
      ////console.log(dataCriteriosBase);
      let seleccion = dataCriteriosBase.find((it) => {
        return it.idCriteriosEvPostulacion == id;
      });
      seleccion.estado = false;

      await putData("plazas/criterios/actualizar", seleccion, jwt, user);
      if (listCriteriosTable) listCriteriosTable.destroy();
      loadListCriterios();
    }
  });

  $("#btn-donwload").on("click", async function () {
    if (idCandidate == undefined) {
      showNotification("alert-warning", `Debe seleccionar un candidato <i class="fas fa-exclamation-triangle pl-2"></i>`)
      $("#btn-donwload").removeAttr("href");
      $("#btn-donwload").removeAttr("download");
      return;
    }
    let data = theAnexo.split('/');
    let file = data[0];
    let original = data[1];
    $("#btn-donwload").attr("href", `/files/requests/guests/${file}`);
    $("#btn-donwload").attr("download", `${original}`)
  });

  //*desabilitar la opcion de introducir pu

  $(document).on("change", ".check", function () {
    let id = $(this).attr("id");
    id = id.split("-")[1];

    if ($(this).is(":checked")) {
      $(`#puntaje-${id}`).prop("disabled", true);
      ////console.log(`#puntaje-${id}`);
    } else {
      $(`#puntaje-${id}`).prop("disabled", false);
    }
  });

  $("#btn-evaluate").prop("disabled", false);

});

async function loadCandidates() {
  //let candidates = await getData(`plazas/plazadocentecontratado/listarpersonasporplaza?tamanioPag=2000&idPlaza=${idPlaza}`,jwt);
  let candidates = await getData(`plazas/plazadocentecontratado/listarpersonasporplaza?tamanioPag=2000&idPlaza=${idPlaza}`, jwt);
  ////console.log(candidates);
  let loadcandidates = candidates.data;
  for (let c of loadcandidates) {
    c.nombreCompleto = c.nombre + " " + c.apellidoPaterno + " " + c.apellidoMaterno;
    let cad = c.anexo.split('/');
    c.nombreArchivo = cad[1];
  }
  let options = {
    idTable: "cv-reception-data-table",
    data: loadcandidates,
    fields: [
      "nombreCompleto",
      "correo",
      "anexo"
    ],
    name: "Convocatoria de nuevos docentes",
    idName: "idPostulacion",
    className: "cv-reception-row",
    addButtons: false,
  };
  if (candidatesDataTable) candidatesDataTable.destroy();

  candidatesDataTable = createCandidatesTable(options);
  $("#cv-reception-table_wrapper").children().first().remove();

}

function createCandidatesTable(options) {

  let { idTable, data, fields, name, idName, className, addButtons } = options;

  let htmlBody = '';
  for (let object of data) {
    htmlBody += `<tr class="${className}" id="${idName + '-' + object[idName]}">`;
    for (let field of fields) {
      let whoami = object[field];
      if (field === "anexo") {
        let file = whoami.split('/');
        whoami = `<a href="/files/requests/guests/${file[0]}" download="${file[1]}" type = "button" class="btn btn-primary"> Descargar CV</a>`;
      }
      htmlBody += `<td>${whoami}</td>`;
    }
    htmlBody += `</tr>`
  }

  $(`#${idTable} tbody`).html(htmlBody);

  let buttons = [];
  if (addButtons) buttons = ['copy', 'csv', 'excel', 'pdf', 'print'];

  let config = {
    destroy: true,
    buttons: buttons,
    bDestroy: true,
    stateSave: false,
    ordering: true,
    order: [[0, 'desc']],
    //lengthChange: false,
    searching: false,
    language: {
      "copy": "Copiar Datos",
      "print": "Imprimir",
      "decimal": "",
      "emptyTable": `No hay ${name}`,
      "info": `Mostrando _START_ a _END_ de _TOTAL_ ${name}`,
      "infoEmpty": `Mostrando 0 a 0 de 0 ${name}`,
      "infoFiltered": `(Filtrado de _MAX_ total ${name})`,
      "infoPostFix": "",
      "thousands": ",",
      "lengthMenu": `Mostrar _MENU_ ${name}`,
      "loadingRecords": "Cargando...",
      "processing": "Procesando...",
      "search": "Buscar:",
      "zeroRecords": "Sin resultados encontrados",
      "paginate": {
        "first": "Primero",
        "last": "Ultimo",
        "next": "SIG",
        "previous": "ANT"
      }
    }
  };

  if (addButtons) config.dom = 'Bfrtip';

  let dataTable = $(`#${idTable}`).DataTable(config);

  return dataTable;
}


function formattingStringDate(stringDate) {
  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`;
  return new Date(stringDate);
}

async function loadListCriterios() {

  dataCriteriosBase = await getData("plazas/criteriobase/listar?tamanioPag=100&tipoCriterio=BASE&idPlaza=" + idPlaza, jwt);
  ////console.log(dataCriteriosBase);
  dataCriteriosBase = dataCriteriosBase.data;
  let options = {
    idTable: 'criterios-table',
    data: dataCriteriosBase,
    fields: ['descripcion', 'puntajeMaximo'],//,'estado'],
    name: 'Criterio',
    idName: 'idCriteriosEvPostulacion',
    className: 'list-criterio-row',
    addButtons: false
  };
  listCriteriosTable = createDataTable(options);

}



function createDataTableCriterios(options) {

  let { idTable, data, fields, name, idName, className, addButtons } = options;

  let htmlBody = '';
  for (let object of data) {
    htmlBody += `<tr class="${className}" id="${idName + '-' + object[idName]}">`;
    htmlBody += `<td>${object[fields[0]]}</td>`;
    htmlBody += `<td>${object[fields[1]]}</td>`;

    htmlBody += `<td align="center" >
      <input type="number" class="form-control" id="puntaje-${object[idName]}" value="${object[fields[2]]}"   max="${object[fields[1]]}">
      
  </td>`;



    htmlBody += `</tr>`
  }

  $(`#${idTable} tbody`).html(htmlBody);

  let buttons = [];
  if (addButtons) buttons = ['copy', 'csv', 'excel', 'pdf', 'print'];

  let config = {
    destroy: true,
    buttons: buttons,
    bDestroy: true,
    stateSave: false,
    ordering: true,
    order: [[0, 'desc']],
    //lengthChange: false,
    searching: false,
    language: {
      "copy": "Copiar Datos",
      "print": "Imprimir",
      "decimal": "",
      "emptyTable": `No hay ${name}`,
      "info": `Mostrando _START_ a _END_ de _TOTAL_ ${name}`,
      "infoEmpty": `Mostrando 0 a 0 de 0 ${name}`,
      "infoFiltered": `(Filtrado de _MAX_ total ${name})`,
      "infoPostFix": "",
      "thousands": ",",
      "lengthMenu": `Mostrar _MENU_ ${name}`,
      "loadingRecords": "Cargando...",
      "processing": "Procesando...",
      "search": "Buscar:",
      "zeroRecords": "Sin resultados encontrados",
      "paginate": {
        "first": "Primero",
        "last": "Ultimo",
        "next": "SIG",
        "previous": "ANT"
      }
    }
  };

  if (addButtons) config.dom = 'Bfrtip';

  let dataTable = $(`#${idTable}`).DataTable(config);

  return dataTable;
}

async function searchLastRequest() { // en realidad solo deberia ser una solicitud por seccion, asi que deberia devolver lista de 1 elemento

  let lastRequest = await getData(`plazas/plazadocentecontratado/listar?tamanioPag=200&idSeccion=${parseInt(idSeccion)}&idProcesoPlaza=${idPro}`, jwt);

  let request = lastRequest.data.pop();
  ////console.log(request);
  if (request) {
    idRequest = request.idPlazaDocente;
    areaRequest = request.area;
    ////console.log("area" + areaRequest)
    justRequest = request.motivo;
    cantRequest = request.cantidadSolicitadas;
    dptoRequest = request.aprobadasPorDepartamento;
    dapRequest = request.aprobadasPorDAP;
    return true;
  }
  else return false;
}