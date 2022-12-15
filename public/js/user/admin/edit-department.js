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

//console.log(department);
$('#department-name').val(department.nombre);
$('#department-code').val(department.codigo);
$('#description').val(department.descripcion);
$('#date-create').val(department.fechaCreacion);
$('.select2').select2();

$('#edit-department').on('click', async () => {
    if ($('#department-name').val() === '' || $('#department-code').val() === '' || $('#date-create').val() === '') {
        showNotification('alert-warning', 'Por favor complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
        return false;
    }
    let newDepartment = {
        "idDepartamento": department.idDepartamento,
        "nombre": $('#department-name').val().toUpperCase(),
        "codigo": $('#department-code').val().toUpperCase(),
        "descripcion": $('#description').val(),
        "fechaCreacion": $('#date-create').val(),
    };
    //console.log(newDepartment);
    let response = await putData('universidad/departamento/actualizar', newDepartment, jwt, user);
    //console.log(response);
    if (response.data >= 0) {
        swal("¡El departamento se ha actualizado correctamente!", "Presione OK para volver a la lista de departamentos", "success");
    } else {
        console.log("ERROR EN API");
    }
});

$(document).on('click', '.sweet-alert .confirm', function () {
    window.location.replace("/admin/list-departments");
})

