import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData, postData, putData } from "/utils/fetch.js";
let requestLessHoursDataTable = undefined;
let paramArr = ["","",-1];
$(async function () {   
  
    new Chart(document.getElementById("bar_chart").getContext("2d"), getChartJs('bar'));

});


  
function getChartJs(type) {
    var config = null;

    if (type === 'line') {
        config = {
            type: 'line',
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "My First dataset",
                    data: [28, 58, 39, 45, 30, 55, 68],
                    borderColor: 'rgba(241,95,121, 0.2)',
                    backgroundColor: 'rgba(241,95,121, 0.5)',
                    pointBorderColor: 'rgba(241,95,121, 0.3)',
                    pointBackgroundColor: 'rgba(241,95,121, 0.2)',
                    pointBorderWidth: 1
                }, {
                    label: "My Second dataset",
                    data: [40, 28, 50, 48, 63, 39, 41],                    
                    borderColor: 'rgba(140,147,154, 0.2)',
                    backgroundColor: 'rgba(140,147,154, 0.2)',
                    pointBorderColor: 'rgba(140,147,154, 0)',
                    pointBackgroundColor: 'rgba(140,147,154, 0.9)',
                    pointBorderWidth: 1
                }]
            },
            options: {
                responsive: true,
                legend: false,
                
            }
        }
    }
    else if (type === 'bar') {
        let labelss=[];
        for( let section of sections){
            labelss.push(section.nombre);
        }
        console.log(labelss);
        config = {
            type: 'bar',
            data: {
                labels: labelss,
                datasets: [{
                    label: "Cantidad de investigaciones",
                    data: [10,20,30,40,50,60,70,80,90,100,110],
                    backgroundColor: '#167bc3',
                    strokeColor: "rgba(255,118,118,0.1)",
                }]
            },
            options: {
                responsive: true,
                legend: false
            }
        }
    }
    else if (type === 'radar') {
        config = {
            type: 'radar',
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "My First dataset",
                    data: [65, 25, 90, 81, 56, 55, 40],
                    borderColor: 'rgba(241,95,121, 0.8)',
                    backgroundColor: 'rgba(241,95,121, 0.5)',
                    pointBorderColor: 'rgba(241,95,121, 0)',
                    pointBackgroundColor: 'rgba(241,95,121, 0.8)',
                    pointBorderWidth: 1
                }, {
                        label: "My Second dataset",
                        data: [72, 48, 40, 19, 96, 27, 100],
                        borderColor: 'rgba(140,147,154, 0.8)',
                        backgroundColor: 'rgba(140,147,154, 0.5)',
                        pointBorderColor: 'rgba(140,147,154, 0)',
                        pointBackgroundColor: 'rgba(140,147,154, 0.8)',
                        pointBorderWidth: 1
                    }]
            },
            options: {
                responsive: true,
                legend: false
            }
        }
    }
    else if (type === 'pie') {
        config = {
            type: 'pie',
            data: {
                datasets: [{
                    data: [150, 53, 121, 87, 45],
                    backgroundColor: [
                        "#2a8ceb",
                        "#58a3eb",
                        "#6fa6db",
                        "#86b8e8",
                        "#9dc7f0"
                    ],
                }],
                labels: [
                    "Pia A",
                    "Pia B",
                    "Pia C",
                    "Pia D",
                    "Pia E"
                ]
            },
            options: {
                responsive: true,
                legend: false
            }
        }
    }   
    return config;
}

async function loadLessHours() {
  let lessHoursData;
  lessHoursData= await getData(`gestiondocente/peticiondescarga/listar?idSeccion=${idSeccion}&fechaInicio=${paramArr[0]}&fechaFin=${paramArr[1]}&idDocente=${paramArr[2]>=0 && paramArr[2]!==""? paramArr[2]:""}&tamanioPag=2000&pagina=1`,jwt
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