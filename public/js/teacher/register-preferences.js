import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData, postData, putData } from "/utils/fetch.js";
let preferencesDataTable = undefined;
let numeroCursosSeleccionados, cargaTotalSeleccionada;
let preferencesData = undefined;
let currentCicle;
let listaCambios = [];

function reemplazarCheckBox() {
  //return;
  //Reemplazar checkboxes
  let tableTempRows=$(".preferences-data-table-row");
  for (let i of tableTempRows) {
    //alert("hola");

    let checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.classList.add("overwatch_check");
    if (i.children[5].textContent != "NO_PREFERIDO")
      checkBox.checked = true;
    else checkBox.checked = false;
    i.children[5].innerHTML = "";
    i.children[5].appendChild(checkBox);

    for(let j of listaCambios){
      if(j[0]==i.id.split("-")[1]){
        if(j[1]==true)i.children[5].children[0].checked=true;
        else i.children[5].children[0].checked=false;
        break;
      }
    }
  }
}


$(async function () {
  //Se solicita el ciclo actual
  //alert(`id ${idDocente}`);
  currentCicle = await getData(`universidad/ciclo/actual`, jwt);
  document.getElementById("cicloActual").children[0].textContent = document.getElementById("cicloActual").children[0].textContent.concat(` ${currentCicle.data.nombre}`);

  await loadPreferences($("#codigoNombre").val(), 2, undefined);

  //Colocar la cantidad de cursos seleccionados y cantidad de horas
  cargaTotalSeleccionada = 0;
  numeroCursosSeleccionados = 0;
  for (let pref of preferencesData.data) {
    if (pref.estado != "NO_PREFERIDO") {
      cargaTotalSeleccionada += pref.cargaHoras;
      numeroCursosSeleccionados++;
    }

  }
  document.getElementById("numeroCursos").children[0].textContent =
    document.getElementById("numeroCursos").children[0].textContent.concat(` ${numeroCursosSeleccionados}`);

  document.getElementById("cargaHorasTotal").children[0].textContent =
    document.getElementById("cargaHorasTotal").children[0].textContent.concat(` ${cargaTotalSeleccionada}`);

  reemplazarCheckBox();

  //Evento de click paginación
  $(".paginate_button").on("click", () => {
    reemplazarCheckBox();
  });
  document.getElementById("numeroCursos")

  //Evento de click checkBox
  $("#preferences-data-table").on("click", ".overwatch_check", function (event) {
    let eventRow = event.target.parentElement.parentElement;
    let idHor = eventRow.id.split('-')[1];
    if (event.target.checked) {//Si antes estaba en false y se cambio a true
      cargaTotalSeleccionada += parseFloat(eventRow.children[4].textContent);
      numeroCursosSeleccionados++;
    }
    else {//Si antes estaba en true y se cambio a false
      if (cargaTotalSeleccionada > 0 && numeroCursosSeleccionados > 0) {
        cargaTotalSeleccionada -= parseFloat(eventRow.children[4].textContent);
        numeroCursosSeleccionados--;
      }
    }
    document.getElementById("numeroCursos").children[0].textContent =
      document.getElementById("numeroCursos").children[0].textContent.split(':')[0].concat(`: ${numeroCursosSeleccionados}`);

    document.getElementById("cargaHorasTotal").children[0].textContent =
      document.getElementById("cargaHorasTotal").children[0].textContent.split(':')[0].concat(`: ${cargaTotalSeleccionada}`);
    //Busca el indice del idHorario
    let index;
    if (listaCambios.length == 0) {
      index = -1;
    }
    else {
      index = listaCambios.findIndex(element => element[0] == idHor)
    }
    //Si esta en la lista de cambios
    if (index != -1) {
      listaCambios[index][1] = event.target.checked;
    }
    //Si no esta en la lista de cambios
    else {
      listaCambios.push([idHor, event.target.checked]);
    }
    //alert(`${eventRow.children[1].textContent},${event.target.checked}`);
  });


  //Evento de cambio en codigo nombre
  function delay(fn, ms) {
    let timer = 0
    return function () {
      clearTimeout(timer)
      timer = setTimeout(fn.bind(this), ms || 0)
    }
  }
  const searchCodeName = document.getElementById("codigoNombre");
  searchCodeName.addEventListener("keyup", async () => {
    let param2 = 2, param3 = undefined;//2: preferidos y no preferidos
    if ($("#selectorPreferido").val() != "Todos") {
      if ($("#selectorPreferido").val() != "No preferido") param2 = 1;
      else param2 = 0;
    }
    if ($("#department :selected").text().trim() != "Todos") param3 = $("#department :selected").val();
    await loadPreferences($("#codigoNombre").val(), param2, param3);
    reemplazarCheckBox();
  });

  //Evento para filtrar por si preferido o no
  const filterIsPrefType = document.getElementById("selectorPreferido");
  filterIsPrefType.addEventListener("change", async () => {
    let param2 = 2, param3 = undefined;//2: preferidos y no preferidos
    if ($("#selectorPreferido").val() != "Todos") {
      if ($("#selectorPreferido").val() != "No preferido") param2 = 1;
      else param2 = 0;
    }
    if ($("#department option:selected").text().trim() != "Todos") param3 = $("#department option:selected").val();
    await loadPreferences($("#codigoNombre").val(), param2, param3);
    reemplazarCheckBox();
  });

  //Evento para filtrar por departamento
  $(document).ready(async function () {
    $('#department').change(async function () {
      let param2 = 2, param3 = undefined;//2: preferidos y no preferidos
      if ($("#selectorPreferido").val() != "Todos") {
        if ($("#selectorPreferido").val() != "No preferido") param2 = 1;
        else param2 = 0;
      }
      if ($("#department option:selected").text().trim() != "Todos") param3 = $("#department option:selected").val();
      await loadPreferences($("#codigoNombre").val(), param2, param3);
      reemplazarCheckBox();
    });
  });

  //Evento para guardar preferencias
  document.getElementById("guardarPreferencias").addEventListener("click", async function () {
    let pref, estado, pendiente;
    for (let temp of listaCambios) {//temp es un arreglo [idHorario,siPreferido]
      estado = temp[1];
      pendiente = estado ? "PENDIENTE" : "NO_PREFERIDO";
      pref = {
        "idDocente": idDocente,
        "idHorario": temp[0]
      };
      await postData(`gestiondocente/preferencias/guardar?Authorization=${jwt}`, pref, jwt, user);
      pref = {
        "idDocente": idDocente,
        "idHorario": temp[0],
        "estado": pendiente,
        "activo": estado
      };
      await putData(`gestiondocente/preferencias/actualizar`, pref, jwt, user);
    }
    swal("Preferencias actualizadas con éxito!", "Presione OK para continuar", "success");
    window.location.href = "/teacher/current-preferences";
  });

  function showSuccessMessage() {
    swal("¡El curso se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
  }

  $('.select2').select2();
});


async function loadPreferences(nameCodParam, IsPrefParam, DepParam) {
  if (DepParam == undefined) {
    preferencesData = await getData(`gestiondocente/preferencias/listarOpciones?tamanioPag=2000&pagina=1` +
      `&idCiclo=${currentCicle.data.idCiclo}&idDocente=${idDocente}&codigoNombre=${nameCodParam}`, jwt);
  }
  else {
    preferencesData = await getData(`gestiondocente/preferencias/listarOpciones?tamanioPag=2000&pagina=1` +
      `&idCiclo=${currentCicle.data.idCiclo}&idDocente=${idDocente}&codigoNombre=${nameCodParam}&idDepartamento=${DepParam}`, jwt);
  }
  //Se filtran los preferidos y no preferdidos
  if (IsPrefParam == 0) {//0:No pref, 1:Pref, 2:todos
    let aux = [];
    for (let row of preferencesData.data) {
      if (row.estado == "NO_PREFERIDO") aux.push(row);
    }
    preferencesData.data = aux;
  }
  else if (IsPrefParam == 1) {
    let aux = [];
    for (let row of preferencesData.data) {
      if (row.estado != "NO_PREFERIDO") aux.push(row);
    }
    preferencesData.data = aux;
  }

  preferencesData.data = preferencesData.data.map(obj => {
    if (obj.tipoHorario == "CLASE") obj.cargaHoras = obj.horaClase;
    else if (obj.tipoHorario == "LABORATORIO") obj.cargaHoras = obj.horaLaboratorio;
    else obj.cargaHoras = obj.horaPractica;
    return obj;
  });
  let options = {
    idTable: "preferences-data-table",
    data: preferencesData.data,
    fields: [
      "codigoCurso",
      "nombreCurso",
      "tipoHorario",
      "codigoHorario",
      "cargaHoras",
      "estado"
    ],
    name: "preferencias",
    idName: "idHorario",
    className: "preferences-data-table-row",
    addButtons: false,
  };
  if (preferencesDataTable) preferencesDataTable.destroy();

  preferencesDataTable = createDataTable(options);
  $("#preferences-data-table_wrapper").children().first().remove();

  let paginados = $(".paginate_button");
  let count = 0;
  let unique;
  for (let i of paginados) {
    if (i.classList.contains("disabled")) count++;
    else unique = i;
  }
  if (count > 1)
    for (let i of paginados) i.remove();
}