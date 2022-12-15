import { getData, postData, putData } from "/utils/fetch.js";
import { showNotification } from '/utils/notifications.js';
let persona;

$(async function () {
    let idUserSelected = undefined;
    let nameUserSelected = undefined;

    if (requestType == "sent") {
        $("#btn-derivate").hide();
        $("#save-changes").hide();
        $("#status").prop("disabled", true);
        $("#observations").prop("disabled", true);
        $("#observations").css("cursor", "pointer");
    }
    if (requestType == "received") {
        $("#btn-derivate").hide();
    }

    $(`#status option[value="${request.estado}"]`).prop('selected', true);

    $('.select2').select2();

    persona = await getData(`persona/buscar?idPersona=${idPersona}`, jwt);
    console.log(persona.data);

    $('#accept-derivation').on('click', function () {
        if ($('#receiver_user').val() != '') {
            idUserSelected = $('#receiver_user').val();
            nameUserSelected = $('#receiver_user option:selected').text();
        } else if ($('#receiver_department').val() != '') {
            idUserSelected = $('#receiver_department').val();
            nameUserSelected = $('#receiver_department option:selected').text();
        } else if ($('#receiver_email').val() != '') {
            nameUserSelected = $('#receiver_email').val();
        }
        console.log(idUserSelected);
        console.log(nameUserSelected);
        $('#derivated-to').val(nameUserSelected);
        $('#close-derivate-modal').trigger('click');
    });

    $('#save-changes').on('click', async function () {
        if (idUserSelected) {
            let newRequest = {
                idSolicitud: request.idSolicitud,
                estado: $('#status').val(),
                observaciones: $('#observations').val(),
                enviadoA: nameUserSelected
            };

            let response = await putData("mesa/solicitud/actualizar", newRequest, jwt, user);

            if (response.data > 0) {

                response = await postData("mesa/solicitudespersona/guardar", {
                    "fecha": today,
                    "idEmisario": parseInt(idPersona),
                    "idReceptor": parseInt(idUserSelected),
                    "idSolicitud": request.idSolicitud,
                    "estado": true,
                    "enviadoPor": persona.data.nombre + ' ' + persona.data.apellidos,
                }, jwt, user);

                if (!response.data.length) {
                    swal("¡El trámite se ha enviado correctamente!", "Presione OK para ver el Buzón de Trámites", "success");
                } else {
                    console.log("ERROR EN API");
                }
            } else {
                console.log("ERROR EN API");
            }
        } else if (requestType == "received") {
            let newRequest = {
                idSolicitud: request.idSolicitud,
                estado: $('#status').val(),
                observaciones: $('#observations').val(),
                enviadoA: $("#derivated-to").attr("placeholder")
            };

            let response = await putData("mesa/solicitud/actualizar", newRequest, jwt, user);
            if (!response.data.length) {
                swal("¡El trámite se ha enviado correctamente!", "Presione OK para ver el Buzón de Trámites", "success");
            } else {
                console.log("ERROR EN API");
            }
        } else {
            $('#derivated-to').focus();
            $('#btn-derivate').focus();
            showNotification('alert-warning', 'Por favor seleccione a un remitente <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }
    });

    $(document).on('click', '.sweet-alert .confirm', function () {
        if (requestType == "received")
            window.location.replace("/any-user/requests-received");
        else
            if (requestType == "sent")
                window.location.replace("/any-user/requests-sent");
            else
                window.location.replace("/department-secretary/request-list");
    });



});