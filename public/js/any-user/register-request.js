import { getData, postData, putData } from "/utils/fetch.js";
import { showNotification } from '/utils/notifications.js';

var filesUploaded = [];
let $receiver = $('#receiver');
let $category = $('#category');
let $description = $('#description');
let $requestType = $('#request-type');
let idRequestCreated = undefined;

Dropzone.options.uploadFiles = {
  url: "/department-secretary/load-file-request",
  addRemoveLinks: true,
  maxFiles: 10,
  maxFilesize: 40, //MB
  //acceptedFiles: '.xlsx,.xls,.pdf,.word,.jpg,.png,.zip,',
  dictDefaultMessage:
    '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i>Arrastre los archivos aquí <span class="font-xs">para añadirlos</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (O darle Click)</h4></span>',
  dictResponseError: "¡Error al cargar el archivo!",
  headers: {
    "X-CSRF-TOKEN": $("#csrf").val(),
  },
  init: function () {
    this.on("success", function (file, res) {
      filesUploaded.push({
        filename: res.filename,
        originalName: res.originalname,
        size: res.size,
      });
    });
  },
};

$(async function () {

  $(".select2").select2();
  loadDataFiles();
  loadRequestsType($category.val());

  $("#accept-files-uploaded").on("click", loadDataFiles);

  $(document).on("click", ".delete-files", function () {
    let filename = $(this).parent().parent().attr("id");
    filesUploaded = filesUploaded.filter((x) => x.filename !== filename);
    loadDataFiles();
  });

  $(document).on("change", "#category", function () {
    loadRequestsType($(this).val());
  });

  $("#send-request").on("click", async function () {

    if ($receiver.val() === '') checkField($receiver);
    if ($category.val() === '') checkField($category);
    if ($requestType.val() === '') checkField($requestType);
    if ($description.val() === '') checkField($description);

    let idDepartament = +$receiver.val();
    let sender = user.nombre + ' ' + user.apellidos;
    let response;
    let request;
    let receiver = $('#receiver option:selected').text();

    request = {
      descripcion: '',
      idTipoSolicitud: +$requestType.val(),
      estado: 'ENVIADO',
      enviadoA: receiver,
      observacion: {
        observacion: `${$description.val()}/ENVIADO`,
        nombre: `${sender}/${receiver}`,
        fechaHora: moment().unix(),
        estado: 'ENVIADO',
        anexos: filesUploaded
      },
    };

    if (!idRequestCreated) {
      response = await postData("mesa/solicitud/guardar", request, jwt, user);
      if (response.data > 0) idRequestCreated = response.data;
      else console.log("ERORR EN API QUE GUARDA SOLICITUD");
    } else {
      response = await getData(`mesa/solicitud/buscar?idSolicitud=${idRequestCreated}`, jwt);
      let newRequest = {
        ...response.data,
        enviadoA: request.enviadoA
      };

      let idObservation = newRequest.observaciones[0].idObservacion;
      let observation = {
        idObservacion: idObservation,
        ...request.observacion
      };

      response = await putData("mesa/observacion/actualizar", observation, jwt, user);
      if (response.data > 0) idObservation = response.data;
      else console.log("ERORR EN API QUE ACTUALIZA OBSERVACION");

      response = await putData("mesa/solicitud/actualizar", newRequest, jwt, user);
    }

    if (idRequestCreated) {
      response = await postData(`mesa/solicitudespersona/guardarpordepartamento?idDepartamento=${idDepartament}`, {
        fecha: today,
        idEmisario: +user.idPersona,
        idReceptor: idDepartament,
        idSolicitud: +response.data,
        estado: true,
        enviadoPor: sender,
      }, jwt, user);

      if (response.error !== undefined || response.data[0] === -2) {
        showNotification('alert-danger', `El departamento seleccionado no tiene un receptor asociado <i class="fas fa-exclamation pl-2"></i>`);
      } else {
        if (response.data) {
          swal("¡El trámite se ha enviado correctamente!", "Presione OK para ver la lista de trámites enviados", "success");
        } else {
          console.log("ERROR EN API DE GUARDAR SOLICITUD DEPARAMENTO");
        }
      }
    } else {
      console.log("ERROR EN API");
    }
  });

  $(document).on('click', '.sweet-alert .confirm', function () {
    window.location.replace("/any-user/requests-sent");
  })
});

function loadRequestsType(idCategory) {
  if (idCategory === '') {
    return false;
  } else {
    let category = categories.find(x => x.idAsunto === +idCategory);
    let htmlRequests = `<option></option>`;
    for (let typeRequest of category.tipoSolicitud || []) {
      htmlRequests += `<option value="${typeRequest.idTipoSolicitud}">${typeRequest.descripcion}</option>`;
    }
    $requestType.html(htmlRequests);
    $requestType.select2();
  }
}

function loadDataFiles() {
  let htmlDataFiles = "";
  let length = 0;

  for (let file of filesUploaded) {
    let htmlDataFile = `<tr id="${file.filename}">
                <td>${file.originalName + " (" + (file.size / 1000).toFixed(1) + " KB)"}</td>
                <td class="p-0">
                <button class="btn btn-icon btn-neutral btn-icon-mini delete-files"><i class="zmdi zmdi-delete"></i></button>
                <a class="btn btn-icon btn-neutral btn-icon-mini pt-2" href="/files/requests/${file.filename}" download="${file.originalName}"><i class="material-icons">file_download</i></a>
                </td>
            </tr>`;

    htmlDataFiles += htmlDataFile;
    length++;
  }

  if (length) {
    $("#files-uploaded tbody").html(htmlDataFiles);
    $("#message-no-files").hide();
  } else {
    $("#files-uploaded tbody").html("");
    $("#message-no-files").show();
  }
}

function checkField(field) {
  showNotification('alert-warning', `Complete todos los campos obligatorios <i class="fas fa-exclamation pl-2"></i>`);
  field.addClass('is-invalid');
  setTimeout(() => {
    field.removeClass('is-invalid');
  }, 2000);
}
