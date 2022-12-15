import { getData } from '/utils/fetch.js';
import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';

let docente = undefined;
var idDocenteParam = undefined;
var queriedSemesters = [];
var queriedDataSchedules = [];
let schedulesHoursDataTable = undefined;
var degrees = undefined;
var researchProjects = undefined;
var publications = undefined;
var posts = undefined;
var evaluations = undefined;
var paperwork_sent = undefined;
var paperwork_received = undefined;
var paperwork_total = undefined;
var paperworkDataTable = undefined;
var indicators = {};
var baseIndicators = {};

$(function () {
    // Set color for selected nav tab
    $('.nav-item').on('click',function(){
        $('.nav-item').css('color','#414141');
        $(this).css('color','#167bc3');
    });

    // Setting nav tab shown by default
    $('#nav-hours-tab').trigger('click');

    // Getting parameters (id)
    if(idDocente > 0) {                                 // Si el usuario tiene rol DOCENTE
        if(window.location.search.length > 0){          //    Si agregase parámetros a través del URL (no debería ocurrir)
            window.location.href = "/teacher/record";   //    Redirigir para mostrar el URL sin parámetros
        }                                               //
        idDocenteParam = idDocente;                     // El expediente a mostrar será del usuario (rol DOCENTE)
        changeOptonLeftSideBar('sb-record');
    }
    else {                                              // Si el usuario tiene otro rol
        idDocenteParam = getUrlParameter('id');         // El expediente a mostrar será del docente seleccionado (parámetro del URL)
        if(!(idDocenteParam > 0)){                      //    Si no encuentra un id de docente dado como parámetro
            idDocenteParam = Math.abs(idDocente);       //    El expediente a mostrar será del usuario (rol NO docente)
            changeOptonLeftSideBar('sb-record');
        }
        else{
            if(idDocenteParam == Math.abs(idDocente)){
                changeOptonLeftSideBar('sb-record');
            }
            else{
                $(async function(){
                    let userToFindRole = await getData(`persona/buscar?idPersona=${Math.abs(idDocente)}`, jwt);
                    if(!userToFindRole || !userToFindRole.data){
                        alert('Error del sistema. No existe rol del usuario.');
                    }
                    else{
                        if(['ASISTENTE_SECCION','COORDINADOR_SECCION'].includes(userToFindRole.data.rol)){
                            changeOptonLeftSideBar('sb-list-teachers');
                        }
                        else {
                            changeOptonLeftSideBar('sb-list-professor');
                        }
                    }
                });
                
            }
        }
    }
    
    // Loading semesters
    $(async function () {
        
        if(!semesters || !semesters.data || semesters.data.length == 0){
            $('#nav-hours').html(`
            <p style="padding-top:2%; text-align: center;">
              <b>No existen ciclos registrados.</b>
            </p>
            `);
            $('#nav-evaluations').html(`
            <p style="padding-top:2%; text-align: center;">
              <b>No existen ciclos registrados.</b>
            </p>
            `);
            return false;
        }


        for (let semester of semesters.data) {
            $('#semester-select-hours').append($('<option>', {value: semester.idCiclo, text: semester.nombre}));
            $('#semester-select-evaluations').append($('<option>', {value: semester.idCiclo, text: semester.nombre}));
        }        
        $("#semester-select-hours").html($("#semester-select-hours option").sort(function (a, b) {
            return a.text == b.text ? 0 : a.text > b.text ? -1 : 1;   // sorts descending
        }));
        $("#semester-select-evaluations").html($("#semester-select-evaluations option").sort(function (a, b) {
            return a.text == b.text ? 0 : a.text > b.text ? -1 : 1;   // sorts descending
        }));
        $("#semester-select-hours").val(currentSemester.data.idCiclo);          // sets current semester as selected
        $("#semester-select-evaluations").val(currentSemester.data.idCiclo);
        $("#semester-select-hours").trigger("change");                          // initialize data with current semester
        $("#semester-select-evaluations").trigger("change");
    });

    // Loading schedules according to selected semester
    $('#semester-select-hours').on('change', async function () {
        if(queriedSemesters.includes($("#semester-select-hours").val())) {
            var indexSemester = queriedSemesters.indexOf($("#semester-select-hours").val());
            loadDataSemesterSchedules(queriedDataSchedules[indexSemester]);
        }
        else {
            var dataSchedulesForSelectedSemester = await getData(`universidad/horario/listarhorariodocente?idDocente=${idDocenteParam}&idCiclo=${$("#semester-select-hours").val()}&tamanioPag=1000`, jwt);
            loadDataSemesterSchedules(dataSchedulesForSelectedSemester.data);
            queriedSemesters.push($("#semester-select-hours").val());
            queriedDataSchedules.push(dataSchedulesForSelectedSemester.data);
        }
    });

    // Getting and displaying main information
    $(async function () {
        docente = await getData(`persona/docente/buscar?idDocente=${idDocenteParam}`, jwt);
        $('#teacher-name-record').text(docente.data.nombreCompleto.toUpperCase());
        $('#teacher-code-record').text('(' + docente.data.codigo + ')');
        $('#img-teacher').attr("src",docente.data.foto ? docente.data.foto : "https://cdn.pixabay.com/photo/2017/06/22/02/16/computer-icon-2429310_1280.png");
        $('#teacher-email-link-record').attr("href","https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=" + docente.data.correo);
        $('#teacher-email-link-record').text(docente.data.correo);
        $('#teacher-category-record').text(categoryToString(docente.data.categoria));
        $('#teacher-dedication-record').text(dedicationToString(docente.data.dedicacion));
        $('#teacher-department-section-record').text(
            'Departamento de ' + docente.data.departamento.toLowerCase().trim().split(' ').map(function(v){return v[0].toUpperCase()+v.substr(1);}).join(' ') 
            + (docente.data.seccion != null ? 
                (' - Sección ' + docente.data.seccion.toLowerCase().trim().split(' ').map(function(v){return v[0].toUpperCase()+v.substr(1);}).join(' '))
                : ''));
        
        loadEvaluations();
    });

    // Loading academic degrees and professional titles
    $(async function(){
        if($('#nav-summary-tab').css('display') != 'none'){
            degrees = await getData(`persona/gradoacademico/listargradoacademico?idPersona=${idDocenteParam}&tamanioPag=100`, jwt);
            if(!degrees || !degrees.data || degrees.data.length == 0)
                $('#degrees-list').append(`
                <p style="padding-top:2%; text-align: center;">
                <b>No existen grados académicos o títulos profesionales registrados.</b>
                </p>
                `);
            else{
                for(let i=0; i < degrees.data.length; i++){
                    $('#degrees-list').append(
                        `<li style="margin-bottom: 1%;">
                            <span class="degree-name">${(degrees.data[i].titulo ? degrees.data[i].titulo.toUpperCase() : `Grado Académico ${i+1}`)}</span><br/>
                            <span style="display:${(degrees.data[i].universidad ? "inline" : "none")};">${(degrees.data[i].universidad ? degrees.data[i].universidad.toUpperCase() : `Universidad ${i+1}`)}</span>&nbsp;
                            <span style="display:${(degrees.data[i].paisUniversidad ? "inline" : "none")};">(${(degrees.data[i].paisUniversidad ? degrees.data[i].paisUniversidad.toUpperCase() : `País ${i+1}`)})<br/></span>
                        </li>`
                    );
                }
                $("#degrees-list").html($("#degrees-list > li ").sort(function (a, b) {
                    return degreePriority(a.textContent) - degreePriority(b.textContent);   // sorts descending
                }));
            }
        }
    });

    // Loading research projects and publications
    $(async function(){
        researchProjects = await getData(`investigacion/proyectoinvestigacion/listar?idDocente=${idDocenteParam}&tamanioPag=1000`, jwt);
        if(!researchProjects || !researchProjects.data || researchProjects.data.length == 0)
            $('#research-projects-list').append(`
            <p style="padding-top:2%; text-align: center;">
              <b>No existen proyectos de investigación para mostrar.</b>
            </p>
            `);
        else
            for(let i=0; i < researchProjects.data.length; i++){
            $('#research-projects-list').append(
                `<li style="margin-bottom: 1%;">
                    <span class="research-project-name">${(researchProjects.data[i].titulo ? researchProjects.data[i].titulo.toUpperCase() : `Proyecto de Investigación ${i+1}`)}</span><br/>
                    <span>${(researchProjects.data[i].fechaInicio ? researchProjects.data[i].fechaInicio.toUpperCase() : `Fecha Inicio ${i+1}`)}</span>&nbsp;-&nbsp;
                    <span>${(researchProjects.data[i].fechaFin ? researchProjects.data[i].fechaFin.toUpperCase() : `Fecha Fin ${i+1}`)}</span><br/>
                    <span>${(researchProjects.data[i].descripcion ? researchProjects.data[i].descripcion : `Descripción ${i+1}`)}</span><br/>
                    <span style="display:${(researchProjects.data[i].link ? "inline" : "none")};"><a href="${(researchProjects.data[i].link ? researchProjects.data[i].link : ``)}" style="color:#167bc3;">${(researchProjects.data[i].link ? researchProjects.data[i].link : ``)}<a><br/></span>
                </li>`
            );
        }
        publications = await getData(`investigacion/publicacion/listar?idDocente=${idDocenteParam}&tamanioPag=1000`, jwt);
        if(!publications || !publications.data || publications.data.length == 0)
            $('#publications-list').append(`
            <p style="padding-top:2%; text-align: center;">
              <b>No existen publicaciones para mostrar.</b>
            </p>
            `);
        else{
            for(let i=0; i < publications.data.length; i++){
                $('#publications-list').append(
                    `<li style="margin-bottom: 1%;">
                        <span>${(publications.data[i].tipoPublicacion ? publications.data[i].tipoPublicacion.toUpperCase().replace('_',' ') : `Tipo Publicación ${i+1}`)}</span><br/>
                        <span class="publications-name">${(publications.data[i].titulo ? publications.data[i].titulo.toUpperCase() : `Publicación ${i+1}`)}</span>&nbsp;
                        <span>(${(publications.data[i].anio ? publications.data[i].anio : `Año ${i+1}`)}).</span>
                        <span style="display:${(publications.data[i].revista ? `inline` : `none`)};">${(publications.data[i].revista ? publications.data[i].revista : `Revista ${i+1}`)}.</span><br/>
                        <span style="display:${(publications.data[i].congreso ? `inline` : `none`)};">${(publications.data[i].congreso ? publications.data[i].congreso : `Congreso ${i+1}`)}</span><br/>
                        <span style="display:${(publications.data[i].link ? `inline` : `none`)};"><a href="${(publications.data[i].link ? publications.data[i].link : ``)}" style="color:#167bc3;">${(publications.data[i].link ? publications.data[i].link : ``)}<a><br/></span>
                    </li>`
                );
            }
        }
    });

    // Loading evaluations according to selected semester
    $('#semester-select-evaluations').on('change', function () {
        let selectedSemesterId = $('#semester-select-evaluations').val();
        let selectedSemesterEvaluation = indicators[selectedSemesterId];
        if(selectedSemesterEvaluation){
            $('#no-evaluations-found').css('display','none');
            $('#evaluations-record-data-table').show();
            $('#evaluations-record-table-tbody').html('');
            for(let indic of selectedSemesterEvaluation){
                $('#evaluations-record-table-tbody').append(
                    `<tr>
                        <td>${indic.descripcion}</td>
                        <td>${indic.peso}</td>
                        <td>${baseIndicators[indic.descripcion].pesoMaximo}</td>
                    </tr>`
                );
            }
        }
        else {
            $('#no-evaluations-found').css('display','block');
            $('#evaluations-record-data-table').hide();
        }
    });

    // Loading posts
    $(async function(){
        if($('#nav-posts-tab').css('display') != 'none'){
            posts = await getData(`persona/cargopersona/listarcargopersona?idPersona=${idDocenteParam}&tamanioPag=1000`, jwt);
            if(!posts || !posts.data || posts.data.length == 0)
                $('#div-posts').html(`
                <p style="padding-top:2%; text-align: center;">
                <b>No existen cargos ocupados por el docente.</b>
                </p>
                `);
            else
                for(let i=0; i < posts.data.length; i++){
                    $('#posts-record-table-tbody').append(
                        `<tr>
                            <td>${posts.data[i].nombre}</td>
                            <td>${posts.data[i].fechaInicio}</td>
                            <td>${posts.data[i].fechaFin}</td>
                        </tr>`
                    );
                }
        }
    });

    // Loading paperwork
    $(async function() {
        paperwork_sent = await getData(`mesa/solicitudespersona/listarenviados?idPersona=${idDocenteParam}&tamanioPag=2000`, jwt);
        paperwork_received = await getData(`mesa/solicitudespersona/listarrecibidos?idPersona=${idDocenteParam}&tamanioPag=2000`, jwt);
        paperwork_total = (paperwork_sent.data ? paperwork_sent.data : []).concat(paperwork_received.data ? paperwork_received.data : []);
        
        paperwork_total=paperwork_total.map(obj=>{
            obj.fecha = obj.fecha;
            obj.nombreEmisor = obj.nombreEmisor;
            obj.derivadoA = obj.derivadoA;
            obj.asunto = obj.asunto;
            obj.tramite = obj.tipoSolicitud;
            obj.recibidoEnviado = obj.tipoSolicitudPersona;
            obj.estadoSolicitud = obj.estadoSolicitud;
            return obj;
        });
        let options = {
            idTable: 'paperwork-data-table-record',
            data: paperwork_total,
            fields: ['fecha','nombreEmisor','derivadoA','asunto','tramite','recibidoEnviado','estadoSolicitud'],
            name: 'Trámites',
            idName: 'idTramite',
            className: 'paperwork-record-row',
            addButtons: false
        };
        if (paperworkDataTable) paperworkDataTable.destroy();
      
        paperworkDataTable = createDataTable(options);        
    });
});

// Loading evaluations
async function loadEvaluations(){
    try{
        evaluations = await getData(`gestiondocente/evaluaciondocente/listar?idDocente=${idDocenteParam}&tamanioPag=1000`, jwt);
        if(!evaluations || !evaluations.data || evaluations.data.length == 0)
            $('#div-evaluations').html(`
            <p style="padding-top:2%; text-align: center;">
            <b>No existen evaluaciones registradas para el docente en el ciclo seleccionado.</b>
            </p>
            `);
        else{
            let auxBaseInd = await getData(`gestiondocente/indicadorbase/listar?idDepartamento=${docente.data.idDepartamento}`, jwt);
            auxBaseInd = auxBaseInd.data ? auxBaseInd.data : {};
            for(let bI of auxBaseInd){
                baseIndicators[bI.descripcion] = bI;
            }
            for(let ev of evaluations.data){
                let ind = await getData(`gestiondocente/indicador/listar?idEvaluacionDocente=${ev.idEvaluacionDocente}&tamanioPag=1000`, jwt);
                if(ind.data){
                    indicators[ev.idCiclo] = ind.data;
                }
            }
            $("#semester-select-evaluations").trigger("change");
        }
    }
    catch(e){
        $('#div-evaluations').html(`
            <p style="padding-top:2%; text-align: center;">
            <b>No existen registros de evaluaciones para el docente.</b>
            </p>
            `);
    }
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
}

function loadDataSemesterSchedules(data) {
    if(Number(data.deuda.toFixed(2)) < 0){
        $('#label-debt-hours').text('Horas de exceso:');
        $("#debt-hours-record").text(Math.abs(Number(data.deuda.toFixed(2))) + " horas");
    }
    else{
        $('#label-debt-hours').text('Horas de deuda:');
        $("#debt-hours-record").text(Number(data.deuda.toFixed(2)) + " horas");
    }
    $("#total-hours-record").text(Number(data.totalCarga.toFixed(2)) + " horas");

    $("#hours-record-data-table > tbody").html("");
    for(let i=0; i < data.listaHorarios.length; i++){
        $('#hours-record-table-tbody').append(
            `<tr>
                <td>${data.listaHorarios[i].codigoCurso}</td>
                <td>${data.listaHorarios[i].nombreCurso.toUpperCase()}</td>
                <td>${data.listaHorarios[i].tipoHorario}</td>
                <td>${data.listaHorarios[i].codigo}</td>
                <td>${data.listaHorarios[i].tipoDictado}</td>
                <td>${Number((data.listaHorarios[i].horas).toFixed(2))} horas</td>
            </tr>`
        );
    }
}

function categoryToString(category){
    if(category.toLowerCase().includes('contratado'))
        return "Docente Contratado";

    if(category.toLowerCase().includes('principal'))
        return "Docente Ordinario - Principal";
    if(category.toLowerCase().includes('asociado'))
        return "Docente Ordinario - Asociado";
    if(category.toLowerCase().includes('auxiliar'))
        return "Docente Ordinario - Auxiliar";

    if(category.toLowerCase().includes('extraordinario'))
        return "Docente Extraordinario";
    if(category.toLowerCase().includes('em') && category.toLowerCase().includes('rito'))
        return "Docente Extraordinario - Emérito";
    if(category.toLowerCase().includes('visitante'))
        return "Docente Extraordinario - Visitante";
    if(category.toLowerCase().includes('honorario'))
        return "Docente Extraordinario - Honorario";

    return "Categoría No Definida";
}

function dedicationToString(dedication){
    if(dedication == "TC") return "Docente a Tiempo Completo (DTC)";
    if(dedication == "TPC") return "Tiempo Parcial Convencional (TPC)";
    if(dedication == "TPA") return "Tiempo Parcial por Asignaturas (TPA)";
    return "Dedicación No Definida";
}

function degreePriority(a){
    if(["doctor","doktor","doutor","phd","ph.d"].some(x => a.toLowerCase().includes(x)))
        return 1;
    if(["master","magist","magíst","mestre","msc","m.sc"].some(x => a.toLowerCase().includes(x)))
        return 2;
    if(["bach","bacc","b.a","b.sc"].some(x => a.toLowerCase().includes(x)))
        return 4;
    return 3;
}

function nameOfSemester(idSemester){
    for (let semester of semesters.data) {
        if(semester.idCiclo == idSemester)
            return semester.nombre;
    }
    return "CICLO NULL";
}

function changeOptonLeftSideBar(view){
    $('.menu-toggle').on('click', function() {
        var $this = $(this);
        $this.toggleClass('toggled');
    });

    if (view != "") {
        $(`#${view}`).addClass("active");
        $(`#${view}`).find('a').addClass("toggled");
        $(`#${view}`).parent().parent().find('.menu-toggle').click();
        $(`#${view}`).parent().parent().addClass("active");
    }
}
