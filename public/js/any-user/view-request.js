import { getData, postData, putData } from "/utils/fetch.js";
import { showNotification } from '/utils/notifications.js';

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

var filesUploaded = [];
let idSelected = undefined;
let valueSelected = undefined;
let $derive = $('#derive');
let $noDerive = $('#no-derive');
let $derivationBody = $('#derivation-body');
let $receiver_user = $('#receiver_user');
let $receiver_department = $('#receiver_department');
let $receiver_email = $('#receiver_email');
let $observation = $('#observation');
let $users = $('#users');
let $departments = $('#departments');
let $completed = $('#completed');
let $completedBody = $('#completed-body');
let userName = user.nombre + ' ' + user.apellidos;

Dropzone.options.uploadFiles = {
    url: "/department-secretary/load-file-request",
    addRemoveLinks: true,
    maxFiles: 10,
    maxFilesize: 40, //MB
    //acceptedFiles: '.xlsx,.xls,.pdf,.word,.jpg,.png,.zip,',
    dictDefaultMessage:
        '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i>Arrastre los archivos aquí <span class="font-xs">para añadirlos</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (O darle Click)</h4></span>',
    dictResponseError: "¡Error al cargar el archivo!",
    headers: {
        "X-CSRF-TOKEN": $("#csrf").val(),
    },
    init: function () {
        this.on("success", function (file, res) {
            filesUploaded.push({
                filename: res.filename,
                originalName: res.originalname,
                size: res.size,
            });
        });
    },
};

$(async function () {
    let observations = request.observaciones;
    $('.select2').select2();
    filterResponse(observations);
    loadObservations(observations);

    $('#add-observation').on('click', async () => {

        let observation = {
            observacion: $observation.val(),
            idSolicitud: request.idSolicitud,
            fechaHora: moment().unix(),
            anexos: filesUploaded
        };

        let newRequest,
            response;

        let usersClasses = $users.attr('class').split(/\s+/);
        let departmentsClasses = $departments.attr('class').split(/\s+/);

        let requestPerson = {
            "fecha": today,
            "idEmisario": +user.idPersona,
            "idReceptor": +idSelected,
            //"idReceptor": $derive.is(':checked') ? idSelected : +user.idPersona,
            "idSolicitud": request.idSolicitud,
            "estado": true,
            "enviadoPor": userName,
        };

        if ($derive.is(':checked')) {

            if (usersClasses.includes('active')) {
                checkField($receiver_user, 'usuario');
                idSelected = +$receiver_user.val();
                valueSelected = $('#receiver_user option:selected').text();
            } else if (departmentsClasses.includes('active')) {
                checkField($receiver_department, 'departamento');
                idSelected = +$receiver_department.val();
                valueSelected = $('#receiver_department option:selected').text();
            } else {
                checkField($receiver_email, 'departamento');
                idSelected = +$receiver_email.val();
                valueSelected = $('#receiver_email option:selected').text();
            }

            observation.nombre = `${userName}/${valueSelected}`;
            observation.estado = 'DELEGADO';
            observation.observacion = `${observation.observacion}/${observation.estado}`;
        } else {
            observation.nombre = `${userName}/${userName}`;
            if ($completed.is(':checked')) {
                observation.estado = 'ATENDIDO';
            } else {
                observation.estado = 'EN_PROCESO';
            }
            observation.observacion = `${observation.observacion}/${observation.estado}`;
        }

        if (!$derive.is(':checked')) {
            requestPerson.idReceptor = +user.idPersona;
            response = await postData("mesa/solicitudespersona/guardar", requestPerson, jwt, user);
        } else if (usersClasses.includes('active')) {
            response = await postData("mesa/solicitudespersona/guardar", requestPerson, jwt, user);
        } else if (departmentsClasses.includes('active')) {
            response = await postData(`mesa/solicitudespersona/guardarpordepartamento?idDepartamento=${idSelected}`, requestPerson, jwt, user);
        } else {
            response = await postData(`mesa/solicitudespersona/guardarporcorreo?correo=${valueSelected}`, requestPerson, jwt, user);
        }

        if (response.data[0] === -2) {
            showNotification('alert-danger', `El departamento seleccionado no tiene un receptor asociado <i class="fas fa-exclamation pl-2"></i>`);
            setTimeout(() => {
                $('#addObservationModal').modal('show');
            }, 1500);
        } else {
            if (response.data) {

                response = await postData('mesa/observacion/guardar', observation, jwt, user);

                response = await getData(`mesa/solicitud/buscar?idSolicitud=${request.idSolicitud}`, jwt);

                newRequest = response.data;

                newRequest.estado = observation.estado;
                if ($derive.is(':checked')) newRequest.enviadoA = valueSelected;
                delete newRequest.observaciones;

                response = await putData('mesa/solicitud/actualizar', newRequest, jwt, user);

                setTimeout(() => {
                    $('#addObservationModal').modal('hide');
                }, 1500);

                swal("¡El trámite se ha enviado correctamente!", "Presione OK para ver la lista de trámites enviados", "success");
            } else {
                showNotification('alert-danger', `No se pudo responder el trámite, comuníquese con Soporte del Sistema <i class="fas fa-exclamation pl-2"></i>`);
            }
        }
    });

    $(document).on('click', '.sweet-alert .confirm', () => {
        window.location.replace("/any-user/requests-sent")
    });

    $('.add-observation-modal').on('click', () => {
        $('#addObservationModal').modal('show');
    });

    loadObservationsBody();
    $derive.on('change', loadObservationsBody);
    $noDerive.on('change', loadObservationsBody);
});

function checkField(field, target) {
    if (field.val() === '') {
        showNotification('alert-warning', `No ha seleccionado un ${target} <i class="fas fa-exclamation pl-2"></i>`);
        field.addClass('is-invalid');
        setTimeout(() => {
            field.removeClass('is-invalid');
            $('#addObservationModal').modal('show');
        }, 2000);
    }
    $('#addObservationModal').modal('hide');
}

function loadObservationsBody() {
    if ($derive.is(':checked')) {
        $derivationBody.show();
        $completedBody.hide();
    } else {
        $derivationBody.hide();
        $completedBody.show();
    };
}

function filterResponse(observations) {
    let state = request.estado;
    let originalSender = observations[0].nombre.split('/')[0];
    let [lastUserName, lastDelegated] = observations[observations.length - 1].nombre.split('/');

    if (
        userName === originalSender ||
        state === 'ATENDIDO' ||
        (userName === lastUserName && lastUserName !== lastDelegated)
    ) {
        $('.add-observation-modal').hide();
    }
}

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