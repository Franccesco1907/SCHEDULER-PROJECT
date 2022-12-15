import { getData, postData } from '/utils/fetch.js';
import { showNotification } from '/utils/notifications.js';

$(async function () {
    $('.date').bootstrapMaterialDatePicker({
        format: 'DD/MM/YYYY',
        weekStart: 1,
        time: false,
        cancelText: 'Cancelar',
        okText: 'Elegir',
        nowText: 'Ahora',
        lang: 'es'
    });

    $('.select2').select2();


    $('#role').on('change', function () {
        if ($("#role option:selected").html().replace(/\s/g, "") === "DOCENTE") {
            $('#divCode').show();
            $('#divDedication').show();
            $('#divCategory').show();
        } else {
            $('#divCode').hide();
            $('#divDedication').hide();
            $('#divCategory').hide();
        }
    });

    $('#register-user').on('click', async () => {

        let $first_name = $('#first-name'),
            $patern_last_name = $('#patern-last-name'),
            $matern_last_name = $('#matern-last-name'),
            $email = $('#email'),
            $birthday = $('#birthday'),
            $phone = $('#phone'),
            $doc_type = $('#doc-type'),
            $doc_number = $('#doc-number'),
            $male = $('#male'),
            $department = $('#department'),
            $section = $('#section'),
            $role = $('#role'),
            $address = $('#address'),
            $code = $('#code'),
            $dedication = $('#dedication'),
            $category = $('#category'),
            $csrf = $('#csrf');

        // Validations

        if ($first_name.val() === '' || $patern_last_name.val() === '' || $email.val() === '' || $department.val() === '' || $role.val() === '' || $section.val() === '') {
            showNotification('alert-warning', 'Complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }
        let $selectedRole = $("#role option:selected").html().replace(/\s/g, "");
        if ($selectedRole === 'DOCENTE' && ($code.val() === '' || $dedication.val() === '' || $category.val() === '')) {
            showNotification('alert-warning', 'Complete todos los campos obligatorios para el docente <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }

        let person = {
            numeroDocumento: $doc_number.val(),
            nombres: $first_name.val(),
            apellidoPaterno: $patern_last_name.val(),
            apellidoMaterno: $matern_last_name.val(),
            sexo: ($male.is(':checked') ? 'M' : 'F'),
            correo: $email.val(),
            celular: $phone.val(),
            foto: '',
            direccion: $address.val(),
            fechaNacimiento: $birthday.val() === '' ? today : $birthday.val(),
            resenia: '',
            idDepartamento: +$department.val(),
            idSeccion: $section.val() === '' ? '' : +$section.val(),
            tipoDocumento: $doc_type.val() === '' ? 0 : +$doc_type.val(),
            estado: true
        };

        let responseRegister = undefined;
        let response = undefined;
        if ($selectedRole === 'DOCENTE') {
            person.codigo = $code.val();
            person.dedicacion = $dedication.val();
            person.categoria = $category.val();
            response = await postData("persona/docente/guardar", person, jwt, user);
        }
        else {
            response = await postData("persona/guardar", person, jwt, user);
        }
        if (response.error === undefined) {
            let id = response.data;

            if (id > 0) {

                responseRegister = await postData('seguridad/usuario/registro', {
                    email: $email.val(),
                    contrasenia: '',
                    idRol: +$role.val(),
                    idPersona: +id
                }, jwt, user);
            }

        } else {
            showNotification('alert-danger', `${response.error} <i class="fas fa-exclamation-triangle pl-2"></i>`);
        }


        if (responseRegister) {

            swal("¡El usuario se ha registrado correctamente!", "Presione OK para ver el Listado de Usuarios", "success");

            await fetch('/admin/successful-register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $csrf.val()
                },
                body: JSON.stringify({ email: $email.val() })
            })
                .then(res => res.json())
                .then(data => {
                    response = data;
                });
        }
    });

    $('#department').on('change', async function () {
        await loadSections($(this).val());
    });

    $(document).on('click', '.sweet-alert .confirm', function () {
        window.location.replace("/admin/list-users");
    })

});

async function loadSections(idDepartment) {
    let sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=2000&pagina=1`, jwt);
    if (sections) {
        let htmlSections = '<option></option>';
        for (let section of sections.data) {
            htmlSections += `<option value="${section.idSeccion}">${section.nombre}</option>`;
        }
        $('#section').html(htmlSections);
        $('#section').select2();
    } else {
        console.log("ERROR EN API");
    }
}