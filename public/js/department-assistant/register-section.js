import { getData, postData } from '/utils/fetch.js';
import { showNotification } from '/utils/notifications.js';

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
});
if (user.rol != "ADMINISTRADOR") {
    $(`#department option[value="${idDepartment}"]`).prop('selected', true);
    $("#department").prop("disabled", true);
}
$('.select2').select2();

$('#register-section').on('click', async () => {
    if ($('#section-name').val() === '' || $('#section-code').val() === '' || $('#date-create').val() === '') {
        showNotification('alert-warning', 'Por favor complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
        return false;
    }
    let section = {
        "nombre": $('#section-name').val().toUpperCase(),
        "codigo": $('#section-code').val().toUpperCase(),
        "resenia": $('#description').val(),
        "fechaCreacion": $('#date-create').val(),
        "idDepartamento": parseInt($('#department').val())
    };
    //console.log(section);
    let response = await postData('universidad/seccion/guardar', section, jwt, user);
    //console.log(response);


    if (response.data >= 0) {
        swal("¡La sección se ha registrado correctamente!", "Presione OK para ver la lista de secciones", "success");
    } else {
        console.log('ERROR DE API');
    }

});

$(document).on('click', '.sweet-alert .confirm', function () {
    window.location.replace("/department-assistant/list-sections");
})

$('#edit-section').hide();
