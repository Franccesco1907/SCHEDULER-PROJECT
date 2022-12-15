
import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";
let coursesAssignDataTable = undefined;
let paramArr = ["", -1];
let coursesToAssign = undefined;
let today = new Date();
let todayString = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
let idProcesosCarga = undefined;

let duration = currentSemester.data.fechaFin

$(async function () {
  // all related to rangeSlider
  $("#range_09").ionRangeSlider({
    grid: true,
    from: 0,
    to_fixed: true,//block the top
    from_fixed: true,//block the from
    values: ["NO CREADO", "CREADO", "INICIADO", "REVISIÓN", "FINALIZADO"]
  });

  let procesos = await getData(`gestiondocente/procesoscarga/listar?tamanioPag=2000&idDepartamento=${idDepartamento}&idCiclo=${currentSemester.data.idCiclo}`, jwt);
  const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
  const procesosSort = procesos.data.sort((a, b) => (a.fechaFin > b.fechaFin) ? 1 : -1)
  let lastProcess = procesosSort.pop();
  let aboutToDate1, aboutToDate2, beginning, end;
  if (procesoActivo) {
    idProcesosCarga = procesoActivo.idProcesosCarga;
    aboutToDate1 = procesoActivo.fechaAsignacion, aboutToDate2 = procesoActivo.fechaFin;
    // aboutToDate1="01/10/2021", aboutToDate2="10/10/2021"; //spanish
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
  } else if (lastProcess) {
    idProcesosCarga = lastProcess.idProcesosCarga;
    aboutToDate1 = lastProcess.fechaAsignacion, aboutToDate2 = lastProcess.fechaFin;
    // aboutToDate1="01/10/2021", aboutToDate2="10/10/2021"; //spanish
    beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
  }


  if (procesoActivo && today < beginning) { //CREADO
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 1,
    });
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
    $('.initp').prop('disabled', true);
  } else if (procesoActivo && today > beginning && today < end) { //INICIADO 
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    let data = $("#range_09").data("ionRangeSlider");
    $('#end').prop('disabled', true); // missing sm
    data.update({
      from: 2,
    });

    $('.initp').prop('disabled', true);

    $("#assigning").show();
    await loadCoursesToAssign();
    $(".select2").select2();


  } else if (procesoActivo && today > end) { //EN REVISIÓN 
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 3,
    });
    $('#beginning').prop('disabled', true);
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', false);

    $("#assigning").show();

    await loadCoursesToAssign();
    $(".select2").select2();
    $("#assigningButton").show();

    $('.initp').prop('disabled', true);
    $('.endp').prop('disabled', false);
  } else if (today > end && currentSemester.data.idCiclo === lastProcess.idCiclo) {
    // FIN DE PROCESO PERO AUN NO DESAPARECE LA FECHA
    $('#beginning').val(aboutToDate1);
    $('#end').val(aboutToDate2);
    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 4,
    });

    $('.initp').prop('disabled', true);
    $('.endp').prop('disabled', true);

    $("#assigning").show();
    await loadCoursesToAssign();
    $(".select2").select2();

  } else { // NO CREADO
    // $('#beginning').prop('disabled', false);
    // $('#end').prop('disabled', false);
    // $('.initp').prop('disabled',false);
    // $('.endp').prop('disabled',true);
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 0,
    });

  }

  let idCourseToAssign = undefined;
  let codeCourse = undefined;
  let nameCourseToAssignSelected = undefined;
  let typeSchedule = undefined;
  let codeSchedule = undefined;
  let chargeHours = undefined;
  let dictation = undefined;
  let state = undefined;
  $(document).on('click', '.courses-to-assign-row', function () {
    if (idCourseToAssign !== undefined && idCourseToAssign == $(this).attr('id')) {
      $(`#${idCourseToAssign}`).removeClass('course-to-assign-selected');
      idCourseToAssign = undefined;
    } else {
      $(`#${idCourseToAssign}`).removeClass('course-to-assign-selected');
      idCourseToAssign = $(this).attr('id');
      codeCourse = $(this).children().eq(0).html();
      nameCourseToAssignSelected = $(this).children().eq(1).html();
      typeSchedule = $(this).children().eq(2).html();
      codeSchedule = $(this).children().eq(3).html();
      chargeHours = $(this).children().eq(4).html();
      dictation = $(this).children().eq(5).html();
      state = $(this).children().eq(6).html();
      $(this).addClass("course-to-assign-selected");
    }
  });

  $('#codigoNombre').on('keyup', function () {
    paramArr[0] = $(this).val();
    loadCoursesToAssign();
  });

  $('#selectSection').on('change', function () {
    paramArr[1] = $(this).val();
    loadCoursesToAssign();
  });

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
      `gestiondocente/procesoscarga/guardar`,
      {
        "fechaTentativa": "03/03/2022",
        "fechaAsignacion": "03/03/2022", //Aragon rules...
        "fechaHorarios": "03/03/2022",
        "fechaCarga": aboutToDateBe,
        "fechaFin": aboutToDateEnd,
        "estado": true,
        "idDepartamento": idDepartamento,
        "idCiclo": currentSemester.data.idCiclo
      },
      jwt, user);
    location.reload();
  });

  $("#assigningButton").on("click", async function () { //EDITAR FECHA FIN
    let aboutToDateBe = $('#beginning').val(), aboutToDateEnd = $('#end').val();
    let response = await putData(
      `gestiondocente/procesoscarga/actualizar`,
      {
        "idProcesosCarga": +procesoActivo.idProcesosCarga,
        "fechaFin": aboutToDateEnd
      },
      jwt, user);
    location.reload();
  });
  $(".endp").on("click", async function () { //FINALIZAR
    let aboutToDateBe = $('#beginning').val(), aboutToDateEnd = $('#end').val();
    let data = $("#range_09").data("ionRangeSlider");
    data.update({
      from: 5,
    });
    let response = await putData(
      `gestiondocente/procesoscarga/actualizar`,
      {
        "idProcesosCarga": +procesoActivo.idProcesosCarga,
        "estado": false//  following... next backend

      },
      jwt, user);
    $('.endp').prop('disabled', true);
    location.reload();
  });

  $('.date').bootstrapMaterialDatePicker({
    format: 'DD/MM/YYYY',
    weekStart: 1,
    time: false,
    cancelText: 'Cancelar',
    okText: 'Elegir',
    nowText: 'Ahora',
    lang: 'es'
  });





});


async function loadCoursesToAssign() {
  coursesToAssign = await getData(`universidad/horario/listarespecial?idDepartamento=${idDepartamento}&idSeccion=${paramArr[1] >= 0 && paramArr[1] !== "" ? paramArr[1] : ""}&codigoOnombre=${paramArr[0]}&estadoHorario=ASIGNADO&idCiclo=${currentSemester.data.idCiclo}`, jwt);
  coursesToAssign = coursesToAssign.data;
  for (let obj of coursesToAssign) {
    obj.profes = "";
    let teachers = await getData(`gestiondocente/cargadocente/listarcargaseccion?idHorario=${obj.idHorario}&idSeccion=${paramArr[1]}&tamanioPag=2000&pagina=1`, jwt);
    obj.listaDocente = teachers.docentesAsignados;
    obj.listaDocente.forEach(teacher => {
      obj.profes += teacher.nombre + "<br>";
    })
  }

  let options = {
    idTable: 'courses-to-assign-data-table',
    data: coursesToAssign,
    fields: [
      'codigoCurso',
      'nombreCurso',
      'codigo',
      'tipoHorario',
      'profes'
    ],
    name: 'Cursos asignados',
    idName: 'idHorario',
    className: 'courses-to-assign-row',
    addButtons: false
  };
  if (coursesAssignDataTable) coursesAssignDataTable.destroy();
  coursesAssignDataTable = createDataTable(options);
  $("#courses-to-assign-data-table_wrapper").children().first().remove();
}

function formattingStringDate(stringDate) {
  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`;
  return new Date(stringDate);
}

