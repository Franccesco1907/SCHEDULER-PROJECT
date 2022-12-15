
import { getData, postData, deleteData, putData } from '/utils/fetch.js';
import { showNotification } from '/utils/notifications.js';

$(async function () {
    $('.select2').select2();
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

        var hoy = new Date();
        hoy = hoy.getDate() + "/" + (hoy.getMonth() + 1) + "/" + hoy.getFullYear();
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
            "fechaNacimiento": $('#birthday').val() === "" ? hoy : $('#birthday').val(),
            "tipoDocumento": $('#documentType').val(),
            "dedicacion": $('#dedication').val(),
            "categoria": $('#category').val(),
            "idDepartamento": usuario.idDepartamento,
            "idSeccion": parseInt($('#section').val())
        };
        var obligatorio = {
            "codigo": $('#code').val(),
            "apellidoPaterno": $('#last-name-1').val(),
            "name": $('#name').val(),
            "tipoDocumento": $('#documentType').val(),
            "numeroDocumento": $('#IDdocument').val(),
        }
        if (Object.values(obligatorio).includes("")) {
            showNotification("alert-warning", "Debe llenar los parametros obligatorios");
            return;
        }
        //console.log(prof);
        if (Object.values(obligatorio).includes("")) {
            showNotification("alert-warning", "Debe llenar los parametros obligatorios");
            return;
        }

        let response = await postData('persona/docente/guardar', prof, jwt, user);


        if (response.data) {

            swal("¡El usuario se ha registrado correctamente!", "Presione OK para ver el Listado de Usuarios", "success");
            let responseRegister = await postData('seguridad/usuario/registro', {
                email: prof.correo,
                contrasenia: '',
                idRol: 2,
                idPersona: response.data
            }, jwt, user);


            if (responseRegister) {
                await fetch('/department-assistant/successful-register', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({ email: $("email").val() })
                })
                    .then(res => res.json())
                    .then(data => {
                        response = data;
                    });
            }

        }
        else {
            showNotification("alert-warning","Ha habido un error en el registro");
            console.log("ERROR EN API");
        }

        /*$(document).on('click', '.sweet-alert .confirm', function () {
            window.location.replace("/department-assistant/list-sections");
        })*/

        $('#edit-section').hide();
    })



});