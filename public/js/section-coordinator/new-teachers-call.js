import { showNotification } from '/utils/notifications.js';
import { getData, postData, putData } from "/utils/fetch.js";
let solicitudesDataTable = undefined;
var size
$(async function () {
  console.log(getData("mesa/anexosSolicitud/listar?tamanioPag=100", jwt));
  let idSectioon = 1;
  await loadLessHours(idSectioon);
  let idRequestLessHours = undefined;
  let selectedRequestDate = undefined;
  let selectedRequestTeacher = undefined;
  let selectedRequestHours = undefined;

  let idCourse = undefined;
  let nameCourseSelected = undefined;

  $(document).on("click", "#btn-add-new-request", async function () {
    let id_docente = $("#input-docente-new-request").val();
    let horas = $("#input-horas-new-request").val();
    if (horas <= 10 && horas > 0) {
      let new_request = {
        "fechaEnvio": "11/10/2021",
        "anexo": "anexo nuevo",
        "motivo": "motivo de prueba",
        "idDocente": id_docente,
        "idCiclo": 1,
        "horasSolicitadas": horas,
        "horasAprobadas": 0,
        "estadoPeticion": "EN_PROCESO"
      }
      let response = await postData(
        `gestiondocente/peticiondescarga/guardar`, new_request, jwt, user
      );
      console.log(response.data);
      if (response.data) {
        await loadLessHours(idSectioon);
        $("#input-docente-new-request").val("");
        $("#input-horas-new-request").val("");
      } else {
        showNotification(
          $(this).data("color-name"),
          'Hubo un problema al editar las horas a aprobar <i class="fas fa-exclamation pl-2"></i>'
        );
      }
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
    onUpdate: function (data) {
      console.log(data);
    },
  });

  $(document).on("click", ".btn-table", function () {

    let id = $(this).attr("id");
    id = id.split("-")[1];
    console.log(id);
    //cargar los criteros de evaluación, estado del criterio y puntuación en el modal
    let datosCriterio = [{
      "id": 1,
      "descripcion": "Clase Maestra",
      "valorMaximo": 3
    },
    {
      "id": 2,
      "descripcion": "CV",
      "valorMaximo": 3
    },
    {
      "id": 3,
      "descripcion": "Entrevista",
      "valorMaximo": 3
    }];
    console.log(datosCriterio);
    size = datosCriterio.length;
    let options = {
      idTable: "criteria-table",
      data: datosCriterio,
      fields: [
        "descripcion",
        "valorMaximo"
      ],
      name: "Candidate",
      idName: "id",
      className: "Candidate-row",
      addButtons: false,
    };
    let tablaCriterios = createDataTableCriterios(options);

  });

  $(document).on("change", ".check", function () {
    let id = $(this).attr("id");
    id = id.split("-")[1];

    if ($(this).is(":checked")) {
      $(`#puntaje-${id}`).prop("disabled", true);
      size--;
    }
    else {
      $(`#puntaje-${id}`).prop("disabled", false);
      size++;
    }
  });


});

async function loadLessHours() {
  //viene de BD
  let solicitantes = {
    id: 1,
    nombre: "Juan",
    apellidoPaterno: "Perez",
    apellidoMaterno: "Lopez",
    correo: "Juan@gmail.com"
  }
  var datos = [{
    idSolicitante: solicitantes.id,
    nombreCompleto: `${solicitantes.nombre} ${solicitantes.apellidoPaterno} ${solicitantes.apellidoMaterno}`,
    correo: solicitantes.correo
  }]
  console.log(datos)
  let options = {
    idTable: "candidates-table",
    data: datos,
    fields: [
      "nombreCompleto",
      "correo",
    ],
    name: "Candidate",
    idName: "idSolicitante",
    className: "Candidate-row",
    addButtons: false,
  };
  if (solicitudesDataTable) solicitudesDataTable.destroy();

  solicitudesDataTable = createDataTable(options);
  $("#candidates-table_wrapper").children().first().remove();
}

function createDataTable(options) {

  let { idTable, data, fields, name, idName, className, addButtons } = options;

  let htmlBody = '';
  for (let object of data) {
    htmlBody += `<tr class="${className}" id="${idName + '-' + object[idName]}">`;
    for (let field of fields) htmlBody += `<td>${object[field]}</td>`;
    htmlBody += `<td align="center"><button id="btn-${object[idName]}" class="btn btn-primary mx-auto btn-table"
        data-toggle="modal" data-target="#derivateModal" >Calificar Postulante</button></td>`
    htmlBody += `<td align="center"><a type="button" class="btn btn-round waves-effect g-bg-cgreen text-white" href="">Ver Detale</td>`
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

function createDataTableCriterios(options) {

  let { idTable, data, fields, name, idName, className, addButtons } = options;

  let htmlBody = '';
  for (let object of data) {
    htmlBody += `<tr class="${className}" id="${idName + '-' + object[idName]}">`;

    htmlBody += `<td align="center"  valign="top" ><div class="checkbox inlineblock mx-auto">
  <input id="check-${object[idName]}" class="check" type="checkbox">
  <label for="check-${object[idName]}"></label>
</div></td>`;


    for (let field of fields) htmlBody += `<td>${object[field]}</td>`;

    htmlBody += `<td align="center" >
      <input type="number" class="form-control" placeholder="20" id="puntaje-${object[idName]}">
      
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

//al guardar si size es <1 entonces no lo dejes guardar, tiene que haber al menos un criterio activado
// tiene que poner el puntaje total