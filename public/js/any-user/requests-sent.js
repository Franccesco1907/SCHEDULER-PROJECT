import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
import { getData } from "/utils/fetch.js";
import { statusMap } from "/utils/statusRequestMap.js";
let requestDataTable = undefined;
let idRequest = undefined;
let requests = [];

$(async function () {
    $('#from-date').hide();
    $('#to-date').hide();
    $('.select2').select2();
    await loadRequests(idPersona);

    $(document).on('click', '.requests-row', function () {
        if (idRequest !== undefined && idRequest == $(this).attr('id')) {
            $(`#${idRequest}`).removeClass('request-selected');
            idRequest = undefined;
        } else {
            $(`#${idRequest}`).removeClass('request-selected');
            idRequest = $(this).attr('id');
            $(this).addClass("request-selected");
        }
    });

    $('#apply-filters').on('click', async function () {
        let status = $('#status').val();
        let asunto = $('#matter option:selected').text();
        let remitente = $('#receiver').val();
        let tipo_fecha = $('#date-select').val();
        let fechaInicio;
        let fechaFin;

        if (status === 'TODOS') status = '';
        if (asunto === 'Todos') asunto = '';

        if (tipo_fecha == 0) {
            fechaInicio = '';
            fechaFin = '';
        } else if (tipo_fecha == 1) {
            var today = moment(new Date()).format("DD/MM/YYYY");
            fechaInicio = today;
            fechaFin = today;
        } else if (tipo_fecha == 2) {
            fechaInicio = new moment().startOf('week').format("DD/MM/YYYY");
            fechaFin = new moment().endOf("week").format("DD/MM/YYYY");
        } else if (tipo_fecha == 3) {
            fechaInicio = new moment().startOf('month').format("DD/MM/YYYY");
            fechaFin = new moment().endOf("month").format("DD/MM/YYYY");
        } else if (tipo_fecha == 4) {
            fechaInicio = new moment().startOf('year').format("DD/MM/YYYY");
            fechaFin = new moment().endOf("year").format("DD/MM/YYYY");
        } else if (tipo_fecha == 5) {
            fechaInicio = $('#from').val();
            fechaFin = $('#to').val();
        }

        await loadRequestsFilters(idPersona, status, asunto, remitente, fechaFin, fechaInicio);
    });

    $('#date-select').on('change', function () {
        if ($(this).val() === '5') {
            $('#from-date').show();
            $('#to-date').show();
        } else {
            $('#from-date').hide();
            $('#to-date').hide();
        }
    });

    $('#view-request').on('click', function () {
        if (idRequest) {
            let id = idRequest.split('-')[1];
            let requestSelect = requests.find(x => x.idSolicitud === +id);
            window.location.replace(`/any-user/view-request?idRequest=${requestSelect.idSolicitud}&idRequestPerson=${requestSelect.idSolicitudesPersona}`);
        } else {
            showNotification('alert-warning', 'Usted no ha seleccionado ningún trámite <i class="fas fa-exclamation-triangle pl-2"></i>');
        }
    });

});

async function loadRequests(idPersona) {
    let requestData = await getData(`mesa/solicitudespersona/listarenviados?idPersona=${idPersona}&tamanioPag=2000`, jwt);
    requests = requestData.data;

    var newRequests = [];
    for (let request of requests) {
        let indexRequest = newRequests.findIndex(x => x.idSolicitud === request.idSolicitud);
        if (indexRequest !== -1) {
            if (newRequests[indexRequest].tipoSolicitudPersona === 'RECIBIDO' && request.tipoSolicitudPersona === 'ENVIADO') {
                newRequests[indexRequest] = request;
            }
        } else {
            newRequests.push(request);
        }
    }

    requests = newRequests;

    requests = requests.map(req => {
        req.estadoSolicitud = `<span class="badge badge-${statusMap[req.estadoSolicitud].color}">${req.estadoSolicitud.replace('_', ' ')} ${statusMap[req.estadoSolicitud].icon} </span>`;
        return req;
    });

    let options = {
        idTable: "request-data-table",
        data: requests,
        fields: [
            "derivadoA",
            "asunto",
            "tipoSolicitud",
            "fecha",
            "estadoSolicitud"
        ],
        name: "Solicitudes",
        idName: "idSolicitud",
        className: "requests-row",
        addButtons: false,
    };

    if (requestDataTable) requestDataTable.destroy();
    requestDataTable = createDataTable(options);
    $("#request-data-table_wrapper").children().first().remove();
}

async function loadRequestsFilters(idPersona, status, asunto, remitente, fechaFin, fechaInicio) {
    let requestData;

    if (fechaFin === '' && fechaInicio === '') requestData = await getData(`mesa/solicitudespersona/listarenviadosfiltros?idPersona=${idPersona}&tamanioPag=2000&estado=${status}&asuntoOsolicitud=${asunto}&remitente=${remitente}`, jwt);
    else requestData = await getData(`mesa/solicitudespersona/listarenviadosfiltros?idPersona=${idPersona}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&tamanioPag=2000&estado=${status}&asuntoOsolicitud=${asunto}&remitente=${remitente}`, jwt);

    requests = requestData.data;

    var newRequests = [];
    for (let request of requests) {
        let indexRequest = newRequests.findIndex(x => x.idSolicitud === request.idSolicitud);
        if (indexRequest !== -1) {
            if (newRequests[indexRequest].tipoSolicitudPersona === 'RECIBIDO' && request.tipoSolicitudPersona === 'ENVIADO') {
                newRequests[indexRequest] = request;
            }
        } else {
            newRequests.push(request);
        }
    }

    requests = newRequests;

    requests = requests.map(req => {
        req.estadoSolicitud = `<span class="badge badge-${statusMap[req.estadoSolicitud].color}">${req.estadoSolicitud.replace('_', ' ')} ${statusMap[req.estadoSolicitud].icon} </span>`;
        return req;
    });

    let options = {
        idTable: "request-data-table",
        data: requests,
        fields: [
            "derivadoA",
            "asunto",
            "tipoSolicitud",
            "fecha",
            "estadoSolicitud"
        ],
        name: "Solicitudes",
        idName: "idSolicitud",
        className: "requests-row",
        addButtons: false,
    };

    if (requestDataTable) requestDataTable.destroy();
    requestDataTable = createDataTable(options);
    $("#request-data-table_wrapper").children().first().remove();
}