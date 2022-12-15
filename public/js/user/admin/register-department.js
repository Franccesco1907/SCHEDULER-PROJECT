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

$('#register-department').on('click', async () => {
    if ($('#department-name').val() === '' || $('#department-code').val() === '' || $('#date-create').val() === '') {
        showNotification('alert-warning', 'Por favor complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
        return false;
    }
    let department = {
        "nombre": $('#department-name').val().toUpperCase(),
        "codigo": $('#department-code').val(),
        "descripcion": $('#description').val(),
        "fechaCreacion": $('#date-create').val(),
    };
    //console.log(department);
    let response = await postData('universidad/departamento/guardar', department, jwt, user);
    //console.log(response);


    if (response.data >= 0) {
        swal("¡El departamento se ha registrado correctamente!", "Presione OK para ver la lista de departamentos", "success");
    } else {
        console.log('ERROR DE API');
    }

});

$(document).on('click', '.sweet-alert .confirm', function () {
    window.location.replace("/admin/list-departments");
})

$('#edit-department').hide();