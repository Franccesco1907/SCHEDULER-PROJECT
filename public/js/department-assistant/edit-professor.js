
import { getData, postData, deleteData, putData } from '/utils/fetch.js';
import { showNotification } from '/utils/notifications.js';

$(async function () {
    console.log(typeof (edit));
    if (edit == "false") {

        //.prop("readonly", true);
        $("#cancel").hide();
        $("#save-professor").hide();
        $('#birthday').prop("readonly", true);
        $('#IDdocument').prop("readonly", true);
        $('#name').prop("readonly", true);
        $('#code').prop("readonly", true);
        $('#last-name-1').prop("readonly", true);
        $('#last-name-2').prop("readonly", true);
        $('#email').prop("readonly", true);
        $('#cellphone').prop("readonly", true);
        $('#address').prop("readonly", true);
        $('#documentType').prop("readonly", true);
    }


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

    $('#save-professor').on('click', async () => {



        console.log($('#birthday').val());
        let sex = ($('#male').is(':checked') ? 'M' : 'F');
        var prof = {
            "numeroDocumento": $('#IDdocument').val(),
            "nombres": $('#name').val(),
            "codigo": $('#code').val(),
            "apellidoPaterno": $('#last-name-1').val(),
            "apellidoMaterno": $('#last-name-2').val(),
            "sexo": sex,
            "correo": $('#email').val(),
            "celular": $('#cellphone').val(),
            "direccion": $('#address').val(),
            "fechaNacimiento": $('#birthday').val(),
            "tipoDocumento": $('#documentType').val(),
            "dedicacion": $('#dedication').val(),
            "categoria": $('#category').val(),
            "idDepartamento": usuario.idDepartamento,
            "idSeccion": parseInt($('#section').val())
        };
        var obligatorio = {
            "codigo": $('#code').val(),
            "apellidoPaterno": $('#last-name-1').val(),
            "apellidoMaterno": $('#last-name-2').val(),
            "tipoDocumento": $('#documentType').val(),
            "numeroDocumento": $('#IDdocument').val(),
        }
        console.log(prof);
        if (Object.values(obligatorio).includes("")) {
            showNotification("alert-warning", "Debe llenar los parametros obligatorios");
            return;
        }

        let response = await postData('persona/docente/guardar', prof, jwt, user);
        console.log(response);
        if (!responde.data) {
            swal("¡El docente se ha registrado correctamente!", "Presione OK para volver al inicio", "success");
        }
        else {
            console.log("ERROR EN API");
        }

        /*$(document).on('click', '.sweet-alert .confirm', function () {
            window.location.replace("/department-assistant/list-sections");
        })*/

        $('#edit-section').hide();
    })



});