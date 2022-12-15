export const statusMap = {
    'ENVIADO': {
        color: 'info',
        icon: `<i class="fas fa-paper-plane pr-1" style="color: white !important;"></i>`,
        iconStatus: `<i class="fas fa-paper-plane"></i>`
    },
    'EN_PROCESO': {
        color: 'warning',
        icon: `<i class="fas fa-clock pr-0" style="color: white !important;"></i>`,
        iconStatus: `<i class="fas fa-clock pl-2"></i>`,
    },
    'DELEGADO': {
        color: 'primary',
        icon: `<i class="fas fa-people-arrows" style="color: white !important;"></i>`,
        iconStatus: `<i class="fas fa-people-arrows pl-2"></i>`,
    },
    'ATENDIDO': {
        color: 'success',
        icon: `<i class="fas fa-check pr-0" style="color: white !important;"></i>`,
        iconStatus: `<i class="fas fa-check pl-2"></i>`,
    }
};

let $completedBody = $('#completed-body');
let sender = user.nombre + ' ' + user.apellidos;

$(async function () {

    loadObservations(request.observaciones);
});

function loadObservations(observations) {
    $('#tracking').html('');
    for (let i = 0; i < observations.length; i++) {
        let htmlObservation;
        if (i === 0) htmlObservation = generateFirstObservationCard(observations[i]);
        else htmlObservation = generateObservationCard(observations[i]);
        $('#tracking').append(htmlObservation);
    }
}

function generateFirstObservationCard(observation) {
    let [sender, receiver] = observation.nombre.split('/');
    let [observacion, status] = observation.observacion.split('/');
    let htmlCard =
        `
    <li>
        <time class="cbp_tmtime" datetime="2017-11-04T18:30"><span class="hidden pr-2">${getDate(observation.fechaHora)}</span> <span class="large pr-2">${getTime(observation.fechaHora)}</span></time>
        <div class="cbp_tmicon bg-info"><i class="fas fa-paper-plane pr-1" style="color: white !important;"></i></div>
        <div class="cbp_tmlabel">
        <div class="row clearfix">
            <div class="col-lg-10">
            <h2><a href="javascript:void(0);">${sender}</a><span> envió un trámite al departamento de <a href="javascript:void(0);">${receiver}</a> sobre:</span></h2>
            </div>
            <div class="col-lg-2">
            <div class="float-right">
                <span class="badge badge-info">${status.replace('_', ' ')}<i class="fas fa-paper-plane pl-2"></i></span>
            </div>
            </div>
        </div>
        <p><strong>${request.asunto}</strong> (${request.tipoSolicitud})</p>
        <blockquote>
            <p class="blockquote blockquote-primary">
            "${observacion}"
            </p>
        </blockquote>
        <div class="row clearfix">
            <div class="col-lg-2 text">Archivos Adjuntos:</div>
            <div class="col-lg-10">
            <div class="float-left">
                ${observation.anexosSolicitud.map(file => `<a class="btn btn-info" href="/files/requests/${file.filename}" download="${file.originalName}">${file.originalName}<i class="fas fa-file pl-2"></i></a>`).join('')}
            </div>
            </div>
        </div>
        </div>
    </li>
    `;

    return htmlCard;
}

function generateObservationCard(observation) {
    let [sender, receiver] = observation.nombre.split('/');
    let [observacion, status] = observation.observacion.split('/');
    console.log(observation.observacion);
    let statusData = statusMap[status];
    let color = statusData.color;
    let icon = statusData.icon;
    let iconStatus = statusData.iconStatus;
    let htmlCard =
        `
    <li>
        <time class="cbp_tmtime" datetime="2017-11-04T18:30"><span class="hidden pr-2">${getDate(observation.fechaHora)}</span> <span class="large pr-2">${getTime(observation.fechaHora)}</span></time>
        <div class="cbp_tmicon bg-${color}">${icon}</div>
        <div class="cbp_tmlabel">
            <div class="row clearfix">
            <div class="col-lg-10">
                <h2><a href="javascript:void(0);">${sender} </a><span>${sender === receiver ? 'respondió el trámite' : 'delegó el trámite a '}<a href="javascript:void(0);">${sender === receiver ? '' : receiver}</a></span></h2>
            </div>
            <div class="col-lg-2">
                <div class="float-right">
                <span class="badge badge-${color}">${status.replace('_', ' ')}${iconStatus}</span>
                </div>
            </div>
            </div>
            <blockquote>
            <p class="blockquote blockquote-primary">
                "${observacion}"
            </p>
            </blockquote>
            <div class="row clearfix">
            <div class="col-lg-2 text">Archivos Adjuntos:</div>
            <div class="col-lg-10">
                <div class="float-left">
                ${observation.anexosSolicitud.map(file => `<a class="btn btn-info" href="/files/requests/${file.filename}" download="${file.originalName}">${file.originalName}<i class="fas fa-file pl-2"></i></a>`).join('')}
                </div>
            </div>
            </div>
        </div>
    </li>
    `

    return htmlCard;
}

function getDate(timeStamp) {
    return moment.unix(timeStamp).format('DD/MM/YYYY');
}

function getTime(timeStamp) {
    return moment.unix(timeStamp).format('h:mm:ss a');
}