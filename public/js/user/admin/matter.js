import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";
let mattersDataTable = undefined;
let mattersData = undefined;

var fileUploaded = undefined;

$(function () {
  loadMatters();

  let idMatter = undefined;
  let nameMatterSelected = undefined;

  $(document).on("click", ".matters-row", function () {
    if (idMatter !== undefined && idMatter == $(this).attr("id")) {
      $(`#${idMatter}`).removeClass("matter-selected");
      idMatter = undefined;
      nameMatterSelected = undefined;
    } else {
      $(`#${idMatter}`).removeClass("matter-selected");
      idMatter = $(this).attr("id");
      nameMatterSelected = $(this).children().eq(1).html();
      $(this).addClass("matter-selected");
    }
  });

  //Esto sirve para el evento al hacer click en eliminar
  $("#delete-matter").on("click", async function () {
    if (document.getElementsByClassName("matter-selected").length != 0) {
      let nombreAsunto =
        document.getElementsByClassName("matter-selected")[0].children[0]
          .textContent;
      for (let temp of mattersData.data) {
        if (nombreAsunto == temp.nombre) {
          let body = {
            idAsunto: temp.idAsunto,
            nombre: temp.nombre,
            estado: false,
            tipoSolicitud: temp.tipoSolicitud,
          };
          let response = await putData("mesa/asunto/actualizar", body, jwt, user);
          loadMatters();
          $("#close-delete-matter-modal").trigger("click");
          $("#success-delete-matter").trigger("click");
          break;
        }
      }
    }
  });

  $("#delete-matter-modal").on("click", function () {
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    if (nameMatterSelected == undefined)
      showNotification(
        $(this).data("color-name"),
        "Seleccione una fila para eliminar " + message
      );
    if (document.getElementsByClassName("matter-selected").length == 0) {
      $("#close-delete-matter-modal").trigger("click");
    } else if (
      document.getElementsByClassName("matter-selected")[0].children[2]
        .textContent !== "Deshabilitado"
    ) {
      $("#deleteMatterModal").modal("show");
    } else
      showNotification(
        $(this).data("color-name"),
        "El asunto ya está deshabilitado " + message
      );
  });

  //Añadir fila para nuevo trámite para Agregar asunto
  var numFilas = 0;
  $("#new-paperwork-button").on("click", function () {
    $("#paperwork-table-tbody").append(
      `<tr>
             <td class="row-number" style="text-align: center;">
                ${++numFilas}
             </td>
             <td class="paperwork-name-td">
                <input
                type="text"
                name="paperwork-name"
                class="form-control paperwork-name-input"
                id="paperwork-name"
                placeholder=""
                style="background-color: white;"/>
             </td>
             <td style="text-align: center; background-color: white; max-width: 8px;">
                <a id="new-paperwork-plus-button" type="button" class="remove fa fa-trash delete-row-paperwork"
                style="color:#94989b;">
                </a>                       
             </td>
          </tr>`
    );
  });

  //Quitar fila de tabla de trámite
  $("#paperwork-matter-add-data-table").on("click", ".remove", function () {
    $(this).closest("tr").remove(); // Remove row

    var counter = 0; // Re-enumerate table rows
    $("#paperwork-matter-add-data-table td:nth-child(1)").each(function () {
      var currentItem = $(this);
      currentItem
        .closest("tr")
        .find(".row-number")
        .text(++counter);
    });

    numFilas--;
  });

  // Guardar asunto
  $("#save-new-matter-button").on("click", async function () {
    let matterName = $("#matter-name").val();
    // Validación del nombre del asunto
    if (matterName.length < 1) {
      alert("Debe ingresar un nombre de asunto.");
      return false;
    }

    var paperworks = new Array(numFilas);
    var i = 0;
    var nullRows = false;
    $(".paperwork-name-input").each(function () {
      $(this)
        .closest("tr")
        .find("input")
        .each(function () {
          if (this.value.length < 1) nullRows = true;
          paperworks[i] = this.value;
        });
      i++;
    });
    if (nullRows) {
      alert("Atención: No puede haber filas vacías.");
      return false;
    }

    var asuntoAGuardar = {
      nombre: matterName,
      estado: true,
      tipoSolicitud: [],
    };
    for (var k in paperworks) {
      var item = paperworks[k];
      asuntoAGuardar.tipoSolicitud.push({
        descripcion: item,
        estado: true,
        asunto: matterName,
      });
    }

    let response = await postData("mesa/asunto/guardar", asuntoAGuardar, jwt, user);

    let id = response.data;

    if (id > 0) {
      // Clean & close popup
      $("#matter-name").val(""); // Clean matter-name input
      $("#paperwork-matter-add-data-table").empty(); // Clean paperwork-matter-add-data-table
      $("#addMatterModal").modal("toggle"); // Close popup

      // Update table with new matter
      loadMatters();

      swal(
        "¡El asunto se ha registrado correctamente!",
        "Presione OK para volver al inicio",
        "success"
      );
    } else {
      swal("Ocurrió un error", "Por favor, intente nuevamente.", "error");
    }
  });

  // Rellenar popup con datos del asunto a editar
  var numRowsEdit = 0;
  var idAsuntoEditar = 0;
  $("#edit-matter-modal").on("click", function () {
    let matterSelectedforEdit =
      document.getElementsByClassName("matter-selected");
    let message = '<i class="fas fa-exclamation-triangle pl-2"></i>';
    //console.log("matterSelectedforEdit", matterSelectedforEdit);
    if (matterSelectedforEdit == undefined || matterSelectedforEdit.length == 0)
      showNotification(
        $(this).data("color-name"),
        "Seleccione una fila para editar " + message
      );
    if (matterSelectedforEdit.length != 0) {
      $("#editMatterModal").modal("show");
      $("#edit-matter-name").val(
        matterSelectedforEdit[0].children[0].textContent
      );
      $("#switchHabilitado").prop(
        "checked",
        matterSelectedforEdit[0].children[2].textContent == "Habilitado"
      );

      let nombreAsunto = matterSelectedforEdit[0].children[0].textContent;
      $("#edit-paperwork-table-tbody").empty();
      for (let temp of mattersData.data) {
        if (nombreAsunto == temp.nombre) {
          idAsuntoEditar = temp.idAsunto;
          for (var tramite of temp.tipoSolicitud) {
            $("#edit-paperwork-table-tbody").append(
              `<tr>
                          <td class="row-number" style="text-align: center;">
                             ${++numRowsEdit}
                          </td>
                          <td class="paperwork-name-td">
                             <input
                             type="text"
                             name="paperwork-name"
                             class="form-control edit-paperwork-name-input"
                             id="paperwork-name-for-edit"
                             style="background-color: white;"
                             value="${tramite.descripcion}"/>
                          </td>
                          <td style="text-align: center; background-color: white; max-width: 8px;">
                             <a id="new-paperwork-trash-button" type="button" class="remove fa fa-trash delete-row-paperwork"
                             style="color:#94989b;">
                             </a>                       
                          </td>
                       </tr>`
            );
          }
          break;
        }
      }
    } else {
      $("#close-edit-matter-modal").trigger("click");
    }
  });

  //Añadir fila para nuevo trámite en Editar asunto
  $("#edit-matter-new-paperwork-button").on("click", function () {
    $("#edit-paperwork-table-tbody").append(
      `<tr>
             <td class="row-number" style="text-align: center;">
                ${++numRowsEdit}
             </td>
             <td class="paperwork-name-td">
                <input
                type="text"
                name="paperwork-name"
                class="form-control edit-paperwork-name-input"
                id="paperwork-name"
                placeholder=""
                style="background-color: white;"/>
             </td>
             <td style="text-align: center; background-color: white; max-width: 8px;">
                <a id="new-paperwork-plus-button" type="button" class="remove fa fa-trash delete-row-paperwork"
                style="color:#94989b;">
                </a>                       
             </td>
          </tr>`
    );
  });

  //Quitar fila de tabla de trámite
  $("#paperwork-matter-edit-data-table").on("click", ".remove", function () {
    $(this).closest("tr").remove(); // Remove row

    var counter = 0; // Re-enumerate table rows
    $("#paperwork-matter-edit-data-table td:nth-child(1)").each(function () {
      var currentItem = $(this);
      currentItem
        .closest("tr")
        .find(".row-number")
        .text(++counter);
    });

    numRowsEdit--;
  });

  // Guardar asunto
  $("#save-edit-matter-button").on("click", async function () {
    let matterName = $("#edit-matter-name").val();
    // Validación del nombre del asunto
    if (matterName.length < 1) {
      alert("Debe ingresar un nombre de asunto.");
      return false;
    }

    var paperworks = new Array(numFilas);
    var i = 0;
    var nullRows = false;
    $(".edit-paperwork-name-input").each(function () {
      $(this)
        .closest("tr")
        .find("input")
        .each(function () {
          if (this.value.length < 1) nullRows = true;
          paperworks[i] = this.value;
        });
      i++;
    });
    if (nullRows) {
      alert("Atención: No puede haber filas vacías.");
      return false;
    }

    var asuntoAGuardar = {
      idAsunto: idAsuntoEditar,
      nombre: matterName,
      estado: true,
      tipoSolicitud: [],
    };
    for (var k in paperworks) {
      var item = paperworks[k];
      asuntoAGuardar.tipoSolicitud.push({
        descripcion: item,
        estado: true,
        idAsunto: idAsuntoEditar,
      });
    }

    let response = await putData("mesa/asunto/actualizar", asuntoAGuardar, jwt, user);

    let id = response.data;

    if (id > 0) {
      // Clean & close popup
      $("#edit-matter-name").val(""); // Clean matter-name input
      $("#paperwork-matter-edit-data-table").empty(); // Clean paperwork-matter-add-data-table
      $("#editMatterModal").modal("toggle"); // Close popup

      // Update table with new matter
      loadMatters();

      swal(
        "¡El asunto se ha registrado correctamente!",
        "Presione OK para volver al inicio",
        "success"
      );
    } else {
      swal("Ocurrió un error", "Por favor, intente nuevamente.", "error");
    }
  });
});

async function loadMatters() {
  mattersData = await getData("mesa/asunto/listar?tamanioPag=2000", jwt);
  //console.log(mattersData.data);
  mattersData.data = mattersData.data.map((obj) => {
    obj.estado = obj.estado ? "Habilitado" : "Deshabilitado";
    obj.totalTramites = obj.tipoSolicitud.length;
    return obj;
  });
  let options = {
    idTable: "matters-data-table",
    data: mattersData.data,
    fields: ["nombre", "totalTramites", "estado"],
    name: "Asuntos",
    idName: "idAsunto",
    className: "matters-row",
    addButtons: false,
  };
  if (mattersDataTable) mattersDataTable.destroy();

  mattersDataTable = createDataTable(options);
}
