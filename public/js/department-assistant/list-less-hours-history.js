import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData, postData, putData } from "/utils/fetch.js";
let requestLessHoursDataTable = undefined;
let paramArr = ["","",-1];
$(async function () {   
  $('.date').bootstrapMaterialDatePicker({
    format: 'DD/MM/YYYY',
    //format: 'DD MMMM YYYY',
    //format: 'dd-mmmm-yyyy',
    //clearButton: true,
    weekStart: 1,
    time: false,
    cancelText: 'Cancelar',
    okText: 'Elegir',
    nowText: 'Ahora',
    lang: 'es'
  });
      await loadLessHours();
      $(".select2").select2();
      $('#selectSection').on('change', async function(){
        paramArr[2]=$(this).val();
        await loadLessHours();
      });
      console.log($('#beginning').val()==0);

      $('#beginning').on('change', async function(){
        paramArr[0]=$(this).val();
        await loadLessHours();
      });
      $('#end').on('change', async function(){
        paramArr[1]=$(this).val();
        await loadLessHours();
      });

  });

async function loadLessHours() {
  let lessHoursData;
  lessHoursData= await getData(`gestiondocente/peticiondescarga/listar?idSeccion=${paramArr[2]>=0 && paramArr[2]!==""? paramArr[2]:""}&fechaInicio=${paramArr[0]}&fechaFin=${paramArr[1]}&tamanioPag=2000&pagina=1`,jwt
    );
    console.log("Data a ingresar en la tabla:");
    console.log(lessHoursData.data);
    let options = {
      idTable: "request-less-hours-history-data-table", 
      data: lessHoursData? lessHoursData.data : [],
      fields: [
        "fechaEnvio",
        "nombreDocente",
        "horasSolicitadas",
        "horasAprobadas",
      ],
      name: "Descargas Solicitadas",
      idName: "idPeticionDescarga",
      className: "requests-less-hours-history-row",
      addButtons: false,
    };
    if (requestLessHoursDataTable) requestLessHoursDataTable.destroy();
  
    requestLessHoursDataTable = createDataTable(options);
    $("#request-less-hours-history-data-table_wrapper").children().first().remove();
  }