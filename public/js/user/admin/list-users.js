import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData, deleteData, postData, putData } from "/utils/fetch.js";

let usersDataTable = undefined;
let rolesDataTable = undefined;
let usersData = users;

var fileUsers = undefined;
var usersPreviewDataTable = undefined;
var usersPreview = undefined;
var errors = undefined;


Dropzone.options.uploadUsers = {
  url: "/admin/load-file",
  addRemoveLinks: true,
  maxFiles: 1,
  maxFilesize: 20, //MB
  acceptedFiles: '.xlsx,.xls',
  dictDefaultMessage: '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i>Arrastre los archivos aquí <span class="font-xs">para añadirlos</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (O darle Click)</h4></span>',
  dictResponseError: '¡Error al cargar el archivo!',
  headers: {
    'X-CSRF-TOKEN': $('#csrf').val()
  },
  init: function () {
    this.on('success', function (file, res) {
      fileUsers = res;
    });
  },
};

$(async function () {

  let options = {
    idTable: "users-data-table",
    data: users,
    fields: [
      "nombreCompleto",
      "correo",
      "rol",
      "departamento",
      "seccion",
    ],
    name: "Usuarios",
    idName: "idUsuario",
    className: "users-data-table-row",
    addButtons: false,
  };

  if (usersDataTable) usersDataTable.destroy();

  usersDataTable = createDataTable(options);
  $("#users-data-table_wrapper").children().first().remove();

  //await loadUsers();
  await loadRoles();

  let idPerson = undefined;
  let namePersonSelected = undefined;
  let idU = undefined;
  let idPP = undefined;

  $(document).on('click', '.users-data-table-row', function () {
    if (idPerson !== undefined && idPerson == $(this).attr('id')) {
      $(`#${idPerson}`).removeClass('person-selected');
      idPerson = undefined;
    } else {
      $(`#${idPerson}`).removeClass('person-selected');
      idPerson = $(this).attr('id');
      namePersonSelected = $(this).children().eq(0).html();
      idPP = $(this).children().eq(5).html();
      $(this).addClass("person-selected");
    }
  });

  $('#edit-user-modal').on('click', function () {
    let idUser = parseInt(idPerson.split('-')[1]);
    let per = -1;
    per = usersData.find(persona => persona.idUsuario == idUser);
    let idPSelected = per.idPersona;

    if (idPSelected) {
      window.location.replace(`/admin/edit-user?idPerson=${idPSelected}`);
    } else {
      showNotification('alert-warning', 'Necesita seleccionar un usuario <i class="fas fa-exclamation-triangle pl-2"></i>');
    }
  });

  $('#delete-user-modal').on('click', function () {
    if (idPerson) {
      //let id = idRequestLessHours.split('-')[1];
      //window.location.replace(`/department-secretary/view-request?idRequestLessHours=${id}`);
      $("#activate-delete-modal").trigger("click");
    } else {
      var placementFrom = $(this).data("placement-from");
      var placementAlign = $(this).data("placement-align");
      var colorName = $(this).data("color-name");
      showNotification(
        colorName,
        'Usted no ha seleccionado ninguna usuario <i class="fas fa-exclamation-triangle pl-2"></i>'
      );
    }
  });

  $("#delete-request").on("click", async function () {
    let idUser = parseInt(idPerson.split('-')[1]);
    let per = -1;
    per = usersData.find(persona => persona.idUsuario == idUser);
    let id = per.idPersona;

    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    let newE = false;
    let response = await putData(`persona/actualizar`, { "idPersona": id, "estado": newE }, jwt, user);
    if (response) {
      usersPreview = [];
      swal("¡El usuario ha sido eliminado correctamente!", "", "success");
      loadUsers();
      $('#deleteUserModal .close-selected').trigger('click');
    } else {
      showNotification(
        $(this).data("color-name"),
        'Hubo un problema al editar las plazas a aprobar <i class="fas fa-exclamation pl-2"></i>'
      );
    }

  });

  //Evento para cambiar de sección
  $('#selectDepartment').on('change', function () {
    loadUsers($("#selectDepartment").val());
  });

  $('#selecRole').on('change', function () {
    loadUsers($("#selectRole").val());
  });

  function showSuccessMessage() {
    swal("¡El curso se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
  }

  $('#success-delete-course').on('click', function () {
    showSuccessMessage();
  });

  $('.select2').select2();

  /****** CARGA MASIVA DE USUARIOS ******/

  $('#load-data-users').on('click', async function () {
    let response;

    await fetch('/admin/load-data-users', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': $('#csrf').val(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileUsers
      })
    })
      .then(response => response.json())
      .then(data => {
        response = data;
      })

    if (response.result === 'OK') {
      $('#close-load-massive-modal').trigger('click');
      $('#open-preview-modal').trigger('click');

      usersPreview = response.content;
      errors = response.errors;

      loadDataUsersPreview();
      loadErrors();

      $('#table-users-preview tr td').css("height", "20px");
    } else {
      console.log('Ocurrió un error en la lectura de archivo');
    }

  });

  $('#load-users-massive').on('click', async function () {
    $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...').prop('disabled', true);
    if (usersPreview.length > 0) {
      let correctRegister = true;

      for (let userData of usersPreview) {
        let idRole = userData.idRol;
        let response, idPerson;

        delete userData.nombreCompleto;
        delete userData.departamento;
        delete userData.rol;
        delete userData.idRol;

        if (userData.rol !== 'DOCENTE') {
          response = await postData("persona/guardar", userData, jwt, user);
        } else {
          response = await postData("persona/docente/guardar", userData, jwt, user);
        }

        idPerson = response.data;

        if (idPerson === null) {
          correctRegister = false;
          break;
        } else {
          response = await postData('seguridad/usuario/registro', {
            email: userData.correo,
            contrasenia: '',
            idRol: idRole,
            idPersona: idPerson
          }, jwt, user);

          if (response.data === null) {
            correctRegister = false;
            console.log('ERROR EN API DE GUARDAR USUARIO');
            break;
          }
        }
      }

      if (correctRegister) {
        usersPreview = [];
        loadDataUsersPreview();
        loadUsers();
        $('#close-preview-users-modal').trigger('click');
        swal("¡Los usuarios se han guardado correctamente!", "", "success");
      } else {
        console.log("ERROR EN API DE CARGA MASIVA");
      }

      $(this).html(`Cargar usuarios <i class="fas fa-file-upload pl-2"></i>`).prop('disabled', false);
      
    } else {
      console.log("No hay usuario que cargar");
    }
  });

  //MODIFICANDO EL ROL

  $('#edit-roles-modal').on('click', function () {
    if (idPerson) {
      //let id = idRequestLessHours.split('-')[1];
      //window.location.replace(`/department-secretary/view-request?idRequestLessHours=${id}`);
      $("#activate-editRol-modal").trigger("click");
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

  $('#edit-roles-modal').on('click', function () {

    let message = undefined;
    if (!idPerson) {
      $('#user-selected').hide();
      $('#user-no-selected').show();
      $('#edit-roles').hide();
    } else {
      $('#user-selected').show();
      $('#user-no-selected').hide();
      $('#edit-roles').show();
    }
  });

  $('#edit-roles').on('click', async function () {
    if (idPerson) {
      idU = parseInt(idPerson.split('-')[1]);
      let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
      let rolS = parseInt($("#rolSelected").val());
      if (!rolS) {
        showNotification('alert-warning', 'Por favor seleccione un rol <i class="fas fa-exclamation-triangle pl-2"></i>');
        return false;
      }

      let response = await putData(`seguridad/usuario/actualizarol?idUsuario=${idU}&idRol=${rolS}`, {}, jwt, user);

      //console.log("RESPUESTA: ", response);

      if (response > 1) {
        $('#close-edit-roles-modal').trigger('click');
        swal("¡Se ha modificado el rol correctamente!", "", "success");
        usersPreview = [];
        loadUsers();
      } else {
        showNotification(
          $(this).data("color-name"),
          'Hubo un problema al editar el rol <i class="fas fa-exclamation pl-2"></i>'
        );
      }
    } else {
      console.log('Ocurrió un error');
    }
  });

  $('#role').on('change', async function () {
    await loadUsers();
    //console.log("cambio en rol");
  });

  $('#department').on('change', async function () {
    await loadUsers();
    //console.log("cambio en departamento");
  });

  $('#nombre').on('change', async function () {
    await loadUsers();
    //console.log("cambio en nombre");
  });

});

async function loadUsers() {
  let rolesData = await getData(`seguridad/rol/listar`, jwt);
  let rolcito = "";
  if ($('#role').val() != "TODOS") rolcito = rolesData.find(r => r.idRol == $('#role').val()).nombre;
  let dpto = "";
  if ($('#department').val() != "TODOS") dpto = $('#department').val();
  let nom = $('#nombre').val();
  //console.log(rolcito, dpto, nom);
  usersData = await getData(`persona/listarfiltros?tamanioPag=2000&rol=${rolcito}&idDepartamento=${dpto}&nombre=${nom}&nombreSeccion=`, jwt);
  //console.log(usersData);
  let ss;
  for (let i of usersData.data) {
    i.nombreCompleto = i.nombre + " " + i.apellidos;
  }
  usersData = usersData.data;

  //let usersData = await getData(`persona/listar?tamanioPag=2000`,jwt);
  let options = {
    idTable: "users-data-table",
    data: usersData,
    fields: [
      "nombreCompleto",
      "correo",
      "rol",
      "departamento",
      "seccion",
    ],
    name: "usuarios",
    idName: "idUsuario",
    className: "users-data-table-row",
    addButtons: false,
  };

  if (usersDataTable) usersDataTable.destroy();

  usersDataTable = createDataTable(options);
  $("#users-data-table_wrapper").children().first().remove();
}

async function loadRoles() {
  let rolesData = await getData(`seguridad/rol/listar`, jwt);
  let options = {
    idTable: "roles-data-table",
    data: rolesData,
    fields: [
      "nombre"
    ],
    name: "roles",
    idName: "idRol",
    className: "roles-data-table-row",
    addButtons: false,
  };
  if (rolesDataTable) rolesDataTable.destroy();

  rolesDataTable = createDataTable(options);
  $("#roles-data-table_wrapper").children().first().remove();
}

function loadDataUsersPreview() {

  if (usersPreviewDataTable) usersPreviewDataTable.destroy();

  let options = {
    idTable: 'table-users-preview',
    data: usersPreview,
    fields: ['departamento', 'nombreCompleto', 'sexo', 'correo', 'rol'],
    name: 'Usuarios',
    idName: 'idUsuario',
    className: 'users-data-table-row',
    addButtons: false
  };

  usersPreviewDataTable = createDataTable(options);
}

function loadErrors() {
  let htmlErrors = '';
  if (errors) {
    for (let error of errors) {
      htmlErrors += `<div class="alert alert-danger" role="alert">
                            <div class="container">
                            <div class="alert-icon">
                                <i class="zmdi zmdi-block"></i>
                            </div>
                            <strong>¡Lo sentimos!</strong> ${error}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">
                                <i class="zmdi zmdi-close"></i>
                                </span>
                            </button>
                            </div>
                        </div>`;
    }
  }
  $('#errors').html(htmlErrors);
}
