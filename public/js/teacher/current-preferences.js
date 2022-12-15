import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData } from "/utils/fetch.js";
let preferencesDataTable = undefined;
let currentCicle;
let preferencesData = undefined;

$(async function () {
    //Se solicita el ciclo actual
    currentCicle=await getData(`universidad/ciclo/actual`,jwt);
    document.getElementById("cicloActual").children[0].textContent=document.getElementById("cicloActual").children[0].textContent.concat(` ${currentCicle.data.nombre}`);

    //LLenar filtros y llenar tabla
    /*
    if($("#selectorEstado").options[$("#selectorEstado").selectedIndex].textContent!="Todos")
      state=$("#selectorEstado").options[$("#selectorEstado").selectedIndex].textContent;
    else state=undefined;*/
    await loadPreferences($("#codigoNombre").val(),undefined,undefined);
    
    //Colocar la cantidad de cursos seleccionados
    document.getElementById("numeroCursos").children[0].textContent=
    document.getElementById("numeroCursos").children[0].textContent.concat(` ${preferencesData.paginacion.totalElementos}`);

    //Calcular cantidad de horas
    let totalHours=0;
    for(let pref of preferencesData.data){
        totalHours+=pref.cargaHoras;
    }
    document.getElementById("cargaHorasTotal").children[0].textContent=
    document.getElementById("cargaHorasTotal").children[0].textContent.concat(` ${totalHours}`);

    //const delay = ms => new Promise(res => setTimeout(res, ms));
    function delay(fn, ms) {
        let timer = 0
        return function() {
          clearTimeout(timer)
          timer = setTimeout(fn.bind(this), ms || 0)
        }
      }
    const searchCodeName=document.getElementById("codigoNombre");
    searchCodeName.addEventListener("keyup",delay(()=>{
      let param2=undefined,param3=undefined;
      if($("#selectorHorario").val()!="Todos")param2=$("#selectorHorario").val().toUpperCase();
      if($("#selectorEstado").val()!="Todos")param3=$("#selectorEstado").val().toUpperCase();
      loadPreferences($("#codigoNombre").val(),param2,param3);
    },0));

    //Evento para cambiar Tipo de Horario
    const filterHorType=document.getElementById("selectorHorario");
    filterHorType.addEventListener("change",()=>{
      let param2=undefined,param3=undefined;
      if($("#selectorHorario").val()!="Todos")param2=$("#selectorHorario").val().toUpperCase();
      if($("#selectorEstado").val()!="Todos")param3=$("#selectorEstado").val().toUpperCase();
      loadPreferences($("#codigoNombre").val(),param2,param3);
    });

    //Evento para filtrar por estado
    const filterStateType=document.getElementById("selectorEstado");
    filterStateType.addEventListener("change",()=>{
      let param2=undefined,param3=undefined;
      if($("#selectorHorario").val()!="Todos")param2=$("#selectorHorario").val().toUpperCase();
      if($("#selectorEstado").val()!="Todos")param3=$("#selectorEstado").val().toUpperCase();
      loadPreferences($("#codigoNombre").val(),param2,param3);
    });


    function showSuccessMessage() {
        swal("¡El curso se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
    }

    $('.select2').select2();
});

async function loadPreferences(nameCodParam,tipoHorParam,estadoParam) {
    if(tipoHorParam==undefined && estadoParam==undefined){
      preferencesData = await getData(`gestiondocente/preferencias/listar?tamanioPag=2000&pagina=1&idDocente=${idDocente}`+
                                      `&idCiclo=${currentCicle.data.idCiclo}&codigoNombre=${nameCodParam}`,jwt);
    }
    else if(tipoHorParam!=undefined && estadoParam!=undefined){
      preferencesData = await getData(`gestiondocente/preferencias/listar?tamanioPag=2000&pagina=1&idDocente=${idDocente}`+
                                      `&idCiclo=${currentCicle.data.idCiclo}&codigoNombre=${nameCodParam}&tipoHorario=${tipoHorParam}&estado=${estadoParam}`,jwt);
    }
    else if(estadoParam==undefined){
      preferencesData = await getData(`gestiondocente/preferencias/listar?tamanioPag=2000&pagina=1&idDocente=${idDocente}`+
                                      `&idCiclo=${currentCicle.data.idCiclo}&codigoNombre=${nameCodParam}&tipoHorario=${tipoHorParam}`,jwt);
    }
    else if(tipoHorParam==undefined){
      preferencesData = await getData(`gestiondocente/preferencias/listar?tamanioPag=2000&pagina=1&idDocente=${idDocente}`+
                                     `&idCiclo=${currentCicle.data.idCiclo}&codigoNombre=${nameCodParam}&estado=${estadoParam}`,jwt);
    }
    
    preferencesData.data=preferencesData.data.map(obj=>{
        if(obj.tipoHorario=="CLASE")obj.cargaHoras=obj.horaClase;
        else if(obj.tipoHorario=="LABORATORIO")obj.cargaHoras=obj.horaLaboratorio;
        else obj.cargaHoras=obj.horaPractica;

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
  }