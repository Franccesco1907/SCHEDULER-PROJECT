import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData, deleteData } from "/utils/fetch.js";
let facultiesDataTable = undefined;
let facultiesData = undefined;

function validacion(nameObj, codeObj, dateObj) {
  let cicleselectedforEdit = document.getElementsByClassName("faculty-selected");

  //Validaciones 1: campos no vacios
  if (nameObj == "" || codeObj == "" || dateObj == "") {
    showNotification('alert-warning', `Campos no pueden estar vacios <i class="fas fa-exclamation-triangle pl-2"></i>`);
    return 0;
  }
  //Validaciones 2: nombre/codigo repetido
  for (let i of facultiesData.data) {
    //Que no se compare con si mismo si esta editando
    if (cicleselectedforEdit.length != 0) {
      if (i.idFacultad == cicleselectedforEdit[0].id.split("-")[1]) continue;
    }
    //Se verifica que un id diferente del elegido tengo el mismo nombre
    if (i.nombre == nameObj) {
      showNotification('alert-warning', `Nombre ya en uso <i class="fas fa-exclamation-triangle pl-2"></i>`);
      return 0;
    }
    //Se verifica que un id diferente del elegido tengo el mismo codigo
    if (i.codigo == codeObj) {
      showNotification('alert-warning', `Código ya en uso <i class="fas fa-exclamation-triangle pl-2"></i>`);
      return 0;
    }
  }
  return 1;
}


$(async function () {
  await loadfaculties();

  let idMatter = undefined;
  let namefacultieselected = undefined;

  $(document).on("click", ".faculties-row", function () {
    if (idMatter !== undefined && idMatter == $(this).attr("id")) {
      $(`#${idMatter}`).removeClass("faculty-selected");
      idMatter = undefined;
      namefacultieselected = undefined;
    } else {
      $(`#${idMatter}`).removeClass("faculty-selected");
      idMatter = $(this).attr("id");
      namefacultieselected = $(this).children().eq(1).html();
      $(this).addClass("faculty-selected");
    }
  });

  //click en editar
  $("#edit-faculty-modal").on("click", function () {
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    let cicleselectedforEdit = document.getElementsByClassName("faculty-selected");
    if (cicleselectedforEdit == undefined || cicleselectedforEdit.length == 0)
      showNotification('alert-warning', `Seleccione una fila para editar <i class="fas fa-exclamation-triangle pl-2"></i>`);
    if (cicleselectedforEdit.length != 0) {
      $("#editMatterModal").modal("show");
      $("#edit-faculty-name").val(cicleselectedforEdit[0].children[1].textContent);
      $("#edit-faculty-code").val(cicleselectedforEdit[0].children[0].textContent);
      $("#dateEdit").val(cicleselectedforEdit[0].children[2].textContent);
    } else {
      $("#close-edit-faculty-modal").trigger("click");
    }
  });

  //click en editar/guardar
  $("#save-edit-cicle-button").on("click", async function () {
    //Ya se ha seleccionado una fila para acceder a este evento
    let cicleselectedforEdit = document.getElementsByClassName("faculty-selected");

    let idFacu = cicleselectedforEdit[0].id.split("-")[1];
    let nomFacu = $("#edit-faculty-name").val();
    let codFacu = $("#edit-faculty-code").val();
    let dateFacu = $("#dateEdit").val();

    if (validacion(nomFacu, codFacu, dateFacu) == 1) {
      let body = {
        "idFacultad": idFacu,
        "nombre": nomFacu,
        "fechaCreacion": dateFacu,
        "codigo": codFacu
      };
      await putData("universidad/facultad/actualizar", body, jwt, user);
      await loadfaculties();
      $("#close-edit-faculty-modal").trigger("click");
      swal("Facultad editada con éxito!", "Presione OK para continuar", "success");
    }
    else alert("hola");
  });

  //click en agregar/guardar facultad
  $("#save-new-faculty-button").on("click", async function () {
    let nomFacu = $("#add-faculty-name").val();
    let codFacu = $("#add-faculty-code").val();
    let dateFacu = $("#dateAdd").val();

    if (validacion(nomFacu, codFacu, dateFacu) == 1) {
      let body = {
        "idFacultad": 0,
        "nombre": nomFacu,
        "fechaCreacion": dateFacu,
        "codigo": codFacu
      };
      await postData("universidad/facultad/guardar", body, jwt, user);
      await loadfaculties();
      $("#close-add-faculty-modal").trigger("click");
      swal("Facultad creada con éxito!", "Presione OK para continuar", "success");
    }
  });

  //click en eliminar
  $('#delete-faculty-modal').on('click', function () {
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    let cicleselectedforEdit = document.getElementsByClassName("faculty-selected");
    if (cicleselectedforEdit == undefined || cicleselectedforEdit.length == 0)
      showNotification('alert-warning', `Seleccione una fila para editar <i class="fas fa-exclamation-triangle pl-2"></i>`);
    if (cicleselectedforEdit.length != 0) {
      $('#deleteMatterModal').modal('show');
    }
    else {
      $('#close-delete-faculty-modal').trigger('click');
    }
  });

  //click en eliminar/deshabilitar
  $("#delete-faculty").on("click", async function () {
    //Una fila ya esta seleccionada
    let cicleselectedforEdit = document.getElementsByClassName("faculty-selected");
    await deleteData(`universidad/facultad/eliminar?idFacultad=${cicleselectedforEdit[0].id.split("-")[1]}`, jwt);
    await loadfaculties();
    $("#close-delete-faculty-modal").trigger("click");
    swal("Facultad eliminada con éxito!", "Presione OK para continuar", "success");
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

  $('.select2').select2();
});

async function loadfaculties() {
  facultiesData = await getData("universidad/facultad/listar", jwt);
  let options = {
    idTable: "faculties-data-table",
    data: facultiesData.data,
    fields: ["codigo", "nombre", "fechaCreacion"],
    name: "Facultades",
    idName: "idFacultad",
    className: "faculties-row",
    addButtons: false,
  };
  if (facultiesDataTable) facultiesDataTable.destroy();

  facultiesDataTable = createDataTable(options);
  $("#faculties-data-table_wrapper").children().first().remove();
}
