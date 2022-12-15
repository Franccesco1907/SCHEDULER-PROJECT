import { getData, postData, putData } from '/utils/fetch.js';
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
    $("#department").prop("disabled", true);
}
$(`#department option[value="${section.idDepartamento}"]`).prop('selected', true);
$('#section-name').val(section.nombre);
$('#section-code').val(section.codigo);
$('#description').val(section.resenia);
$('#date-create').val(section.fechaCreacion);
$('.select2').select2();


$('#edit-section').on('click', async () => {
    if ($('#section-name').val() === '' || $('#section-code').val() === '' || $('#date-create').val() === '') {
        showNotification('alert-warning', 'Por favor complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
        return false;
    }
    let newSection = {
        "idSeccion": section.idSeccion,
        "nombre": $('#section-name').val().toUpperCase(),
        "codigo": $('#section-code').val().toUpperCase(),
        "resenia": $('#description').val(),
        "fechaCreacion": $('#date-create').val(),
        "idDepartamento": parseInt($('#department').val()),
    };
    //console.log(newSection);
    let response = await putData('universidad/seccion/actualizar', newSection, jwt, user);
    //console.log(response);
    if (response.data >= 0) {
        swal("¡La sección se ha actualizado correctamente!", "Presione OK para volver a la lista de secciones", "success");
    } else {
        console.log("ERROR EN API");
    }
});

$(document).on('click', '.sweet-alert .confirm', function () {
    window.location.replace("/department-assistant/list-sections");
})

