import { getData, postData, putData } from "/utils/fetch.js";
import { showNotification } from '/utils/notifications.js';

const jwt = 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJBRE1JTklTVFJBRE9SIl0sImlzcyI6InBlYWNlLWFuZC1mbG93ZXJzIiwidXNlciI6ImVsYWRtaW4iLCJpZFBlcnNvbmEiOjF9.jA304nb5OuVnZvShZIE4-8d7prNXmd2TzMtIgDlRVumLhFJoHgpkspGjIydT_X9qXrQGweGZqLRRXOEHLpNxXA';

var idSeccion = undefined;
var idPlazaDocente = undefined;

function formattingStringDate(stringDate){
  const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
  const month = stringDate.slice(3, 6); // month and '/'
  const year = stringDate.slice(6, 10); // year
  stringDate = `${month}${day}${year}`; 
  return new Date(stringDate);
}

$(async function () {

    $(".select2").select2();
    
    
    

    let idDepartamento = $('#department').val();
    //console.log(idDepartamento);
    loadListings(idDepartamento);
    

    $(document).on("change", "#department", function () {
      idDepartamento = $('#department').val();
      //console.log(idDepartamento);
        loadListings($(this).val());
    });

});

async function loadListings(idDepartamento) {
    if (idDepartamento === '') {
      return false;
    } else {
      let processes = await getData(`plazas/procesosplazas/listar?tamanioPag=2000&tipoProcesoPlaza=NUEVO_DOCENTE&idDepartamento=${idDepartamento}`, jwt);
      
      processes.data = processes.data.filter((x) => x.estado == false);
      processes.data = processes.data.sort((a, b) => (formattingStringDate(a.fechaFin) > formattingStringDate(b.fechaFin)) ? 1 : -1);
      if(processes.data.length != 0){
        let activeProcess = processes.data.pop();
        let idProcesosPlazas = activeProcess.idProcesosPlazas;
        let pq = await getData(`plazas/plazadocentecontratado/listar?tamanioPag=2000&&idProcesoPlaza=${parseInt(idProcesosPlazas)}`, jwt);
        pq.data = pq.data.filter((x) => x.estadoPostulacion == true);
        pq.data = pq.data.filter((x) => x.aprobadasPorDAP > 0);
        //console.log(pq);
        
        buildListings(pq);
      }
      else{
        $("#listing-body").html("");
        $("#no-listings").show();
      }     
    }
  }

  async function buildListings(pq){
    let htmlListings = "";
    let length = 0;
    let endDate;
    for (let p of pq.data) {
      endDate = formatTextDate(p.fechaFin);


      idSeccion = p.idSeccion;
      idPlazaDocente = p.idPlazaDocente;

      //console.log(idSeccion, idPlazaDocente);

      let htmlListing = 
      `
      <div class="ml-4 mt-1">
        <div class= "pt-1" style="background-color: #cacac8; width: 400px">
          <label class="mb-1 ml-2" for="listings">${p.nombreSeccion}</label>
        </div>
      `
      htmlListing += p.area?
      `
        <div>
          <label class="mb-1" for="listings" style="max-width: 800px; word-wrap=break-word;">${p.area}</label>
        </div>
      `:``
      htmlListing += 
      ` 
        <div>
          <label class="mb-1" for="listings">${p.aprobadasPorDAP} plazas disponibles</label>
        </div>
        <div>
          <label class="mb-1" for="listings">Plazo para postular: ${endDate}</label>
        </div>
        <div>
        <a type="button" class="btn btn-primary" 
        href="/guest/teaching-convocation?idSeccion=${idSeccion}&idPlazaDocente=${idPlazaDocente}">
          Seleccionar
        </a>
        </div>
      </div>
      `     
      htmlListings += htmlListing;
      length++;


    }

    if (length) {
      $("#listing-body").html(htmlListings);
      $("#no-listings").hide();
    } else {
      $("#listing-body").html("");
      $("#no-listings").show();
    }
  }

  function formatTextDate(stringDate){
    let textDate = "";
    const day = stringDate.slice(0, 2); // day and '/'       28/10/2021
    const month = stringDate.slice(3, 5); // month and '/'
    const year = stringDate.slice(6, 10); // year
    let textMonth;

    //console.log(month);

    textMonth = (month == "01"? "enero" : textMonth);
    textMonth = (month == "02"? "febrero" : textMonth);
    textMonth = (month == "03"? "marzo" : textMonth);
    textMonth = (month == "04"? "abril" : textMonth);
    textMonth = (month == "05"? "mayo" : textMonth);
    textMonth = (month == "06"? "junio" : textMonth);
    textMonth = (month == "07"? "julio" : textMonth);
    textMonth = (month == "08"? "agosto" : textMonth);
    textMonth = (month == "09"? "setiembre" : textMonth);
    textMonth = (month == "10"? "octubre" : textMonth);
    textMonth = (month == "11"? "noviembre" : textMonth);
    textMonth = (month == "12"? "diciembre" : textMonth);

    textDate += day + " de " + textMonth + " del " + year;
    return textDate;
  }