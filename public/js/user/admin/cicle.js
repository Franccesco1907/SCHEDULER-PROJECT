import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData, deleteData } from "/utils/fetch.js";
let ciclesDataTable = undefined;
let ciclesData = undefined;

function validacion(dateIniObj, dateFinObj, nameObj) {
  let cicleselectedforEdit = document.getElementsByClassName("matter-selected");
  //Validaciones 1: campos no vacios
  let dateIniArray = dateIniObj.split("/");
  let dateEndArray = dateFinObj.split("/");

  let fechaIniAux = dateIniArray[2] + "-" + dateIniArray[1] + "-" + dateIniArray[0];
  let fechaFinAux = dateEndArray[2] + "-" + dateEndArray[1] + "-" + dateEndArray[0];
  if (dateIniObj == "" || dateFinObj == "" || nameObj == "") {
    showNotification('alert-warning', `Campos no pueden estar vacios <i class="fas fa-exclamation-triangle pl-2"></i>`);
    return 0;
  }
  //Validaciones 2: rango fechas
  else if (Date.parse(fechaIniAux) > Date.parse(fechaFinAux)) {
    showNotification('alert-warning', `Rango de fechas imposible <i class="fas fa-exclamation-triangle pl-2"></i>`);
    return 0;
  }
  //Validaciones 3: nombre repetido
  for (let i of ciclesData.data) {
    //Que no se compare con si mismo si esta editando
    if (cicleselectedforEdit.length != 0) {
      if (i.idCiclo == cicleselectedforEdit[0].id.split("-")[1]) continue;
    }
    //Se verifica que un id diferente del elegido tengo el mismo nombre
    if (i.nombre == nameObj) {
      showNotification('alert-warning', 'Nombre ya en uso <i class="fas fa-exclamation-triangle pl-2"></i>');
    }
    //Validaciones 4: rangos no cruzados con otros ciclos
    //Se verifica que no se cruzen las fechas con otros ciclos
    let fechaIniOther = i.fechaInicio.split("/");
    let fechaFinOther = i.fechaFin.split("/");
    fechaIniOther = fechaIniOther[2] + "-" + fechaIniOther[1] + "-" + fechaIniOther[0];
    fechaFinOther = fechaFinOther[2] + "-" + fechaFinOther[1] + "-" + fechaFinOther[0];
    if ((Date.parse(fechaIniOther) < Date.parse(fechaIniAux) && Date.parse(fechaIniAux) < Date.parse(fechaFinOther)) ||
      (Date.parse(fechaIniOther) < Date.parse(fechaFinAux) && Date.parse(fechaFinAux) < Date.parse(fechaFinOther))) {
      showNotification('alert-warning', `Al menos una de las fechas entra en conflicto con el ciclo: ${i.nombre} <i class="fas fa-exclamation-triangle pl-2"></i>`);
      return 0;
    }
    //Validaciones 5: fecha inicio mayor a todos los fin
    if (Date.parse(fechaFinOther) > Date.parse(fechaIniAux) || Date.parse(fechaFinOther) > Date.parse(fechaFinAux)) {
      showNotification('alert-warning', `El ciclo no puede comenzar antes de la fecha: ${i.fechaFin} <i class="fas fa-exclamation-triangle pl-2"></i>`);
      return 0;
    }

  }
  return 1;
}

$(async function () {
  await loadCicles();

  let idMatter = undefined;
  let idPerson = undefined;
  let namePersonSelected = undefined;
  let namecicleselected = undefined;

  $(document).on('click', '.cicles-row', function () {
    if (idMatter !== undefined && idMatter == $(this).attr('id')) {
      $(`#${idMatter}`).removeClass('matter-selected');
      idMatter = undefined;
      namecicleselected = undefined;
    }
    else {
      $(`#${idMatter}`).removeClass('matter-selected');
      idMatter = $(this).attr('id');
      namecicleselected = $(this).children().eq(1).html();
      $(this).addClass("matter-selected");
    }
  });

  //click en agregar
  $('#add-matter-modal').on('click', async function () {
    $('#addMatterModal').modal('show');
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    $("#add-cicle-name").val("");
    $("#iniDateAdd").val(today);
    $("#endDateAdd").val(today);
  });

  //click en eliminar
  $('#delete-matter-modal').on('click', async function () {
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    let cicleselectedforEdit = document.getElementsByClassName("matter-selected");
    if (cicleselectedforEdit == undefined || cicleselectedforEdit.length == 0)
      showNotification('alert-warning', `Seleccione una fila para eliminar <i class="fas fa-exclamation-triangle pl-2"></i>`);
    if (cicleselectedforEdit.length != 0) {
      //Vrifica que no se pueda eliminar el ciclo actual
      let cicleCurrent = await getData(`universidad/ciclo/actual`, jwt);
      if (cicleCurrent.data.idCiclo == cicleselectedforEdit[0].id.split("-")[1]) {
        showNotification('alert-warning', `No se puede eliminar el ciclo actual <i class="fas fa-exclamation-triangle pl-2"></i>`);
        $('#close-delete-matter-modal').trigger('click');
        return;
      }

      $('#deleteMatterModal').modal('show');
    }
    else {
      $('#close-delete-matter-modal').trigger('click');
    }
  });

  //click en eliminar/deshabilitar
  $('#delete-matter').on('click', async function () {
    //Una fila ya esta elegida para poder acceder al modal donde se encuentra el boton de este evento
    let idCicleDelete = document.getElementsByClassName("matter-selected")[0].id.split("-")[1];
    await deleteData(`universidad/ciclo/eliminar?idCiclo=${idCicleDelete}`, jwt);
    await loadCicles();
    $('#close-delete-matter-modal').trigger('click');
    swal("¡Ciclo eliminado con éxito!", "Presione OK para continuar", "success");
  });

  //click en editar
  $("#edit-matter-modal").on("click", function () {
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    let cicleselectedforEdit = document.getElementsByClassName("matter-selected");
    if (cicleselectedforEdit == undefined || cicleselectedforEdit.length == 0)
      showNotification('alert-warning', `Seleccione una fila para editar <i class="fas fa-exclamation-triangle pl-2"></i>`);
    if (cicleselectedforEdit.length != 0) {
      $("#editMatterModal").modal("show");
      $("#edit-cicle-name").val(cicleselectedforEdit[0].children[0].textContent);
      $("#iniDateEdit").val(cicleselectedforEdit[0].children[1].textContent);
      $("#endDateEdit").val(cicleselectedforEdit[0].children[2].textContent);
    } else {
      $("#close-edit-matter-modal").trigger("click");
    }
  });

  //click en editar/guardar
  $('#save-edit-matter-button').on('click', async function () {
    let cicleselectedforEdit = document.getElementsByClassName("matter-selected");
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    if (cicleselectedforEdit == undefined || cicleselectedforEdit.length == 0) {
      showNotification('alert-warning', `Seleccione un ciclo para editar <i class="fas fa-exclamation-triangle pl-2"></i>`);
      $('#close-edit-matter-modal').trigger('click');
    }
    else if (cicleselectedforEdit.length != 0) {
      if (validacion($("#iniDateEdit").val(), $("#endDateEdit").val(), $("#edit-cicle-name").val()) == 1) {
        let body = {
          "idCiclo": cicleselectedforEdit[0].id.split("-")[1],
          "nombre": $("#edit-cicle-name").val(),
          "fechaInicio": $("#iniDateEdit").val(),
          "fechaFin": $("#endDateEdit").val()
        }
        await putData("universidad/ciclo/actualizar", body, jwt, user);
        await loadCicles();
        $('#close-edit-matter-modal').trigger('click');
        swal("¡Ciclo editado con éxito!", "Presione OK para continuar", "success");
      }
    }
    else {
      $('#close-edit-matter-modal').trigger('click');
    }
  });

  //click en agregar
  $('#add-matter-modal').on('click', async function () {
    $('#addMatterModal').modal('show');
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    $("#add-cicle-name").val("");
    $("#iniDateAdd").val(today);
    $("#endDateAdd").val(today);
  });

  //click en agregar/guardar ciclo
  $('#save-new-cicle-button').on('click', async function () {
    let nomCiclo = $("#add-cicle-name").val();
    if (validacion($("#iniDateAdd").val(), $("#endDateAdd").val(), nomCiclo) == 1) {
      let body = {
        "idCiclo": 0,
        "nombre": nomCiclo,
        "fechaInicio": $("#iniDateAdd").val(),
        "fechaFin": $("#endDateAdd").val()
      }
      await postData("universidad/ciclo/guardar", body, jwt, user);
      await loadCicles();
      $('#close-add-matter-modal').trigger('click');
      swal("¡Ciclo creado con éxito!", "Presione OK para continuar", "success");
    }
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

async function loadCicles() {
  ciclesData = await getData("universidad/ciclo/listar?tamanioPag=2000", jwt);
  let options = {
    idTable: 'cicles-data-table',
    data: ciclesData.data,
    fields: ['nombre', "fechaInicio", "fechaFin"],
    name: 'Ciclos',
    idName: 'idCiclo',
    className: 'cicles-row',
    addButtons: false
  };
  if (ciclesDataTable) ciclesDataTable.destroy();

  ciclesDataTable = createDataTable(options);
  $("#cicles-data-table_wrapper").children().first().remove();
}





