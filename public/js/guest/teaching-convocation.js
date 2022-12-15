import { getData, postData, putData } from "/utils/fetch.js";
import { showNotification } from '/utils/notifications.js';

const jwt = 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJBRE1JTklTVFJBRE9SIl0sImlzcyI6InBlYWNlLWFuZC1mbG93ZXJzIiwidXNlciI6ImVsYWRtaW4iLCJpZFBlcnNvbmEiOjF9.jA304nb5OuVnZvShZIE4-8d7prNXmd2TzMtIgDlRVumLhFJoHgpkspGjIydT_X9qXrQGweGZqLRRXOEHLpNxXA';

var filesUploaded = [];
var fileUploaded = "";

function formattingStringDate(stringDate) {
  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`;
  return new Date(stringDate);
}

Dropzone.options.uploadFiles = {
  url: "/guest/load-file-request",
  addRemoveLinks: true,
  maxFiles: 1,
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

  //console.log(idSeccion,idPlazaDocente);

  $("#accept-files-uploaded").on("click", loadDataFiles);

  $('.date').bootstrapMaterialDatePicker({
    format: 'DD/MM/YYYY',
    weekStart: 1,
    time: false,
    cancelText: 'Cancelar',
    okText: 'Elegir',
    nowText: 'Ahora',
    lang: 'es'
  });

  $(document).on("click", ".delete-files", function () {
    let filename = $(this).parent().parent().attr("id");
    filesUploaded = filesUploaded.filter((x) => x.filename !== filename);
    loadDataFiles();
  });

  $("#send-postulation").on("click", async function () {
    let person = {
      nombres: $('#first-name').val(),
      apellidoPaterno: $('#patern-last-name').val(),
      correo: $('#email').val(),
      tipoDocumento: $('#doc-type').val() === '' ? 'DNI' : $('#doc-type').val(),
      numeroDocumento: $('#doc-number').val(),
      celular: $('#phone').val(),
      fechaNacimiento: $('#birthday').val(),
      apellidoMaterno: $('#matern-last-name').val(),
      sexo: ($('#male').is(':checked') ? 'M' : 'F'),
      foto: "",
      direccion: "",
      resenia: ""
    };

    if ($('#first_name').val() === '' ||
      $('#patern_last_name').val() === '' ||
      $('#email').val() === '' ||
      $('#birthday').val() === '' ||
      $('#doc-number').val() === '' ||
      $('#phone').val() === '') {
      showNotification('alert-warning', 'Complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
      return false;
    }

    //console.log("Persona asignada");
    //console.log("Correo de la persona: " + person.correo);

    let response = await getData(`persona/listar?tamanioPag=10000`, jwt);
    let persons = response.data;
    let personFound = persons.find(x => x.correo === person.correo);
    let idPerson;

    if (personFound) {
      //console.log("Persona encontrada");
      idPerson = personFound.idPersona;
      personFound.apellidoPaterno = person.apellidoPaterno;
      personFound.tipoDocumento = person.tipoDocumento;
      personFound.numeroDocumento = person.numeroDocumento;
      personFound.celular = person.celular;
      await putData(`persona/actualizar`, personFound, jwt, user);
      //console.log("Persona actualizada");
    } else {
      //console.log("Persona no encontrada");
      response = await postData('persona/guardar', person, jwt, user);
      idPerson = response.data;

      //console.log("Persona guardada");
    }


    if (filesUploaded.length != 0) {
      let f = filesUploaded.pop();
      fileUploaded = f.filename + "/" + f.originalName + "/" + f.size;
    }

    //console.log("Anexo: " + fileUploaded);

    let request = {
      anexo: fileUploaded,
      esAceptado: 0,
      idPersona: idPerson,
      idSeccion: idSeccion,
      idPlaza: idPlazaDocente
    };

    response = await getData("plazas/postulacion/listar?tamanioPag=2000", jwt);

    //console.log(response.data);

    if (response.data.find(x => x.idPlaza === idPlazaDocente) &&
      response.data.find(x => x.idPersona === idPerson)) {
      showNotification('alert-warning', 'Usted ya se ha registrado a una plaza docente para esta convocatoria <i class="fas fa-exclamation-triangle pl-2"></i>');
    } else {
      response = await postData("plazas/postulacion/guardar", request, jwt, user);

      if (response.data > 0) {
        if (!response.data.length) {
          swal("¡Su postulación a la convocatoria se ha enviado correctamente!", "Presione OK para regresar", "success");
        } else {
          console.log("ERROR EN API");
        }
      } else {
        console.log("ERROR EN API");
      }
    }

  });

  $(document).on('click', '.sweet-alert .confirm', function () {
    window.location.replace("/any-user/requests-sent");
  })
});

function loadDataFiles() {
  let htmlDataFiles = "";
  let length = 0;

  for (let file of filesUploaded) {
    let htmlDataFile = `<tr id="${file.filename}">
                <td>${file.originalName + " (" + (file.size / 1000).toFixed(1) + " KB)"}</td>
                <td class="p-0">
                <button class="btn btn-icon btn-neutral btn-icon-mini delete-files"><i class="zmdi zmdi-delete"></i></button>
                <a class="btn btn-icon btn-neutral btn-icon-mini pt-2" href="/files/requests/visitors/${file.filename}" download="${file.originalName}"><i class="material-icons">file_download</i></a>
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