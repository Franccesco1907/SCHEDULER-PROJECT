import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";
let teachersDataTable = undefined;
let idProceso = undefined;
let idTeacher = undefined;
let idPro = undefined;
let $jwt = $('#jwt');
let idCiclo = undefined;

$(async function () {


  let cicloActual = await getData(`universidad/ciclo/actual`, $jwt.val());
  idCiclo = cicloActual.data.idCiclo;

  loadTeachers(-1);
  let idSection = $("#selectSection").val();
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


  let nameTeacherSelected = undefined;
  $(document).on('click', '.teachers-row', function () {
    if (idTeacher !== undefined && idTeacher == $(this).attr('id')) {
      $(`#${idTeacher}`).removeClass('teacher-selected');
      idTeacher = undefined;
    } else {
      $(`#${idTeacher}`).removeClass('teacher-selected');
      idTeacher = $(this).attr('id');
      nameTeacherSelected = $(this).children().eq(1).html();
      $(this).addClass("teacher-selected");
    }
  });



  $('#selectSection').on('change', async function () {
    loadTeachers($(this).val());

  });

  $('.select2').select2();


  $("#range_09").ionRangeSlider({
    grid: true,
    from: 0,
    to_fixed: true,
    from_fixed: true,
    values: ["NO CREADO", "CREADO", "EN PROCESO", "TERMINADO", "FINALIZADO"]
  });


  let today = new Date();

  let procesos = await getData(`gestiondocente/procesos/listar?tamanioPag=2000&&tipoProceso=EVALUACION_DOCENTE&idDepartamento=${idDepartamento}`, $jwt.val());
  const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
  const procesosSort = procesos.data.sort((a, b) => (a.fechaFin > b.fechaFin) ? 1 : -1)
  let lastProcess = procesosSort.pop();
  let aboutToDate1, aboutToDate2, beginning, end;
  if (procesoActivo) {
    idProceso = procesoActivo.idProceso;
    if (idSection) loadTeachers(idSection);
    aboutToDate1 = procesoActivo.fechaInicio, aboutToDate2 = procesoActivo.fechaFin;//API
    // aboutToDate1="01/10/2021", aboutToDate2="10/10/2021"; //spanish
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
  } else if (lastProcess) {
    aboutToDate1 = lastProcess.fechaInicio, aboutToDate2 = lastProcess.fechaFin;//API
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2)

    idProceso = lastProcess.idProceso;
  }


  if (procesoActivo && today < beginning) { //CREADO
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 1,
    });
    $('#view-modal').prop('disabled', true);
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
    $('.initp').prop('disabled', true);

  } else if (procesoActivo && today >= beginning && today < end) { //EN PROCESO
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 2,
    });
    $('#view-modal').prop('disabled', true);
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
    $('.initp').prop('disabled', true);
    $('.endp').prop('disabled', true);
  } else if (procesoActivo && today >= end) {//terminado
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 3,
    });
    $('#view-modal').prop('disabled', false);
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('.initp').prop('disabled', true);
    $('.endp').prop('disabled', false);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
  }
  else if (end > new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000))) {

    if (idSection) loadTeachers(idSection);
    $('#beginning').val(aboutToDate1)
    $('#end').val(aboutToDate2)
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 4,
    });
    $('#view-modal').prop('disabled', false);
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
    $('#view-modal').prop('disabled', true);
    $('.endp').prop('disabled', true);
  }



  $(".initp").on("click", async function () {
    let valor = false;
    if (lastProcess) valor = parseInt(lastProcess.idCiclo) === parseInt(idCiclo) && parseInt(lastProcess.idDepartamento) === parseInt(idDepartamento);

    if (valor) {
      showNotification('alert-warning', 'No puede iniciar otro proceso en el mismo ciclo <i class="fas fa-exclamation-triangle pl-2"></i>');
      return false;
    }
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
        "tipoProceso": "EVALUACION_DOCENTE",
        "idDepartamento": idDepartamento,
        "idCiclo": idCiclo
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
      `gestiondocente/procesos/actualizar`, {
      "idProcesos": procesoActivo.idProceso,
      "estado": false,
      "fechaInicio": aboutToDateBe,
      "fechaFin": aboutToDateEnd
    },
      $jwt.val(), user
    );
    $('#view-modal').prop('disabled', false);
    $('.endp').prop('disabled', true);

    $('#success-end-process').trigger('click');

  });

  $('#success-end-process').on('click', function () {
    swal("¡El proceso se ha finalizado correctamente!", "", "success");
  });


  $('#view-modal').on('click', async function () {

    let numFilasTeacher = 0;
    let id = undefined;

    if (idTeacher) id = idTeacher.split('-')[1];
    else {
      var placementFrom = $(this).data('placement-from');
      var placementAlign = $(this).data('placement-align');
      var colorName = $(this).data('color-name');

      showNotification(colorName, 'Usted no ha seleccionado ningún profesor <i class="fas fa-exclamation-triangle pl-2"></i>', placementFrom, placementAlign, '', '');
      return false;
    }
    let evaluacion = undefined;
    let indicatorsTeacher = undefined;

    if (id) {
      evaluacion = await getData(`gestiondocente/evaluaciondocente/buscarpordocente?idDocente=${id}&idCiclo=${idCiclo}&tamanioPag=2000`, $jwt.val());

      if (evaluacion.data.idEvaluacionDocente) {
        indicatorsTeacher = await getData(`gestiondocente/indicador/listar?idEvaluacionDocente=${evaluacion.data.idEvaluacionDocente}&tamanioPag=2000`, $jwt.val());
        //console.log(indicatorsTeacher.data);
        for (var ind of indicatorsTeacher.data) numFilasTeacher++;
      }
    }

    let indicators = await getData(`gestiondocente/indicadorbase/listar?idDepartamento=${idDepartamento}`, $jwt.val());

    var a = 0;
    $('#append-table-tbody').empty();
    for (var indicator of indicators.data) {
      let peso = '';
      if (a < numFilasTeacher) peso = indicatorsTeacher.data[a].peso;
      a++;
      numFilasTeacher++;
      $('#append-table-tbody').append(
        `<tr>
                <td class="row-description">
                    ${indicator.descripcion}
                </td>
                <td class="paperwork-name-td">
                    ${peso}
                </td>
            </tr>`
      );
    }
    $('#viewModal').modal('show');
  });

});

async function loadTeachers(idSeccion) {

  let professors = await getData(`persona/docente/listarseccion?idSeccion=${idSeccion}&tamanioPag=2000&pagina=1`, $jwt.val());

  let evaluationTeacher = await getData(`gestiondocente/evaluaciondocente/listardocentes?idSeccion=${idSeccion}&idCiclo=${idCiclo}&tamanioPag=2000`, $jwt.val());
  //console.log(evaluationTeacher.data);
  var i = 0;
  for (var teacher in evaluationTeacher.data) {
    var k = 0;
    for (var t in professors.data) {
      if (evaluationTeacher.data[i].idPersona == professors.data[k].idPersona) professors.data[k].estadoEvaluacion = evaluationTeacher.data[i].estadoEvaluacion;
      k++;
    }
    i++;
  }



  professors.data = professors.data.map(obj => {
    obj.estadoEvaluacion = obj.estadoEvaluacion ? "Si" : "No";
    return obj;
  });

  professors.data = professors.data.filter((x) => x.estadoEvaluacion === "Si");

  let options = {
    idTable: "teachers-data-table",
    data: professors.data,
    fields: [
      "codigo",
      "nombreCompleto",
      "dedicacion",
      "categoria"
    ],
    name: "Docentes",
    idName: "idPersona",
    className: "teachers-row",
    addButtons: false,
  };
  if (teachersDataTable) teachersDataTable.destroy();
  teachersDataTable = createDataTable(options);
  $('#teachers-data-table_wrapper').children().first().remove();
}
function formattingStringDate(stringDate) {

  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`;

  return new Date(stringDate);
}