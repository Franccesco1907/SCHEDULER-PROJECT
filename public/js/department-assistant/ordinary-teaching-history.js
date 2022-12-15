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
  let placesNewTeachersData;
  placesNewTeachersData= await getData(`plazas/plazaordinaria/listar?idSeccion=${paramArr[2]>=0 && paramArr[2]!==""? paramArr[2]:""}&fechaInicio=${paramArr[0]}&fechaFin=${paramArr[1]}&tamanioPag=2000`,jwt
    );
    if(placesNewTeachersData.data){
      console.log("Data a ingresar en la tabla:");
      console.log(placesNewTeachersData.data);
    }

    let options = {
      idTable: "request-places-new-teachers-data-table", 
      data: placesNewTeachersData.data?placesNewTeachersData.data:[],
      fields: [
        "fechaEnvio",
        "nombreSeccion",
        "cantidadSolicitadas",
        "aprobadasPorDepartamento",
        "aprobadasPorDAP"
      ],
      name: "Plazas Solicitadas",
      idName: "idPlaza",
      className: "requests-places-new-teachers-row",
      addButtons: false,
    };
    if (requestPlacesNewTeachersDataTable) requestPlacesNewTeachersDataTable.destroy();
  
    requestPlacesNewTeachersDataTable = createDataTable(options);
    $("#request-places-new-teachers-data-table_wrapper").children().first().remove();
  }