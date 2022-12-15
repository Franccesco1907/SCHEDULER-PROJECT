import { getData, postData, putData } from '/utils/fetch.js';
import { showNotification } from '/utils/notifications.js';


let $firstname = $('#first-name');
let $paternlastname = $('#patern-last-name');
let $maternlastname = $('#matern-last-name');
let $email = $('#email');
let $birthday = $('#birthday');
let $docnumber = $('#doc-number');
let $phone = $('#phone');
let $address = $('#address');
let $code = $('#code');
let $dedication = $('#dedication');
let $doc_type = $('#doc-type');
let $category = $('#category');
let rolcito = $('#role').val();
let dpto = $('#department').val();
let nom = $('#first-name').val();


let usersData = await getData(`persona/listarfiltros?tamanioPag=2000&rol=${rolcito}&idDepartamento=${dpto}&nombre=${nom}`, jwt);
let idU = usersData.data.find(u => u.idPersona == persona.idPersona).idUsuario;    
let idRD = roles.find(r => r.nombre == "DOCENTE").idRol;   

$(async function () {


    $firstname.val(persona.nombre);
    $paternlastname.val(persona.apellidoPaterno);
    $maternlastname.val(persona.apellidoMaterno);
    $email.val(persona.correo);
    $address.val(persona.direccion);
    $phone.val(persona.celular);
    $birthday.val(persona.fechaNacimiento);
    $docnumber.val(persona.numeroDocumento);
    $doc_type.val(persona.tipoDocumento);

    if (persona.sexo == "M") $("#male").prop("checked", true);
    if (persona.sexo == "F") $("#female").prop("checked", true);

    if (persona.rol == "DOCENTE") {
        $('#divCode').show();
        $('#divDedication').show();
        $('#divCategory').show();
        let doc = await getData(`persona/docente/buscar?idDocente=${persona.idPersona}`, jwt);
        $code.val(doc.data.codigo);
        $dedication.val(doc.data.dedicacion);
        $category.val(doc.data.categoria);
    }
    else {
        $('#divCode').hide();
        $('#divDedication').hide();
        $('#divCategory').hide();
    }

    $(`#department option[value="${persona.idDepartamento}"]`).prop('selected', true);

    let rr = roles.find(rol => rol.nombre == persona.rol);
    $(`#role option[value="${rr.idRol}"]`).prop('selected', true);

    $('.select2').select2();
    await loadSections(persona.idDepartamento);
    $(`#section`).val(persona.idSeccion).select2();

    if (persona.tipoDocumento == "DNI") $(`#doc-type`).val(0).select2();
    if (persona.tipoDocumento == "PASAPORTE") $(`#doc-type`).val(1).select2();



    $('.date').bootstrapMaterialDatePicker({
        format: 'DD/MM/YYYY',
        weekStart: 1,
        time: false,
        cancelText: 'Cancelar',
        okText: 'Elegir',
        nowText: 'Ahora',
        lang: 'es'
    });

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

        // Hacer validaciones

        if ($first_name.val() === '' ||
            $patern_last_name.val() === '' ||
            $email.val() === '' ||
            $department.val() === '' ||
            $role.val() === '') {
            showNotification('alert-warning', 'Complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }

        let $selectedRole = $("#role option:selected").html().replace(/\s/g, "");
        if ($selectedRole === 'DOCENTE' && ($code.val() === '' || $dedication.val() === '' || $category.val() === '')) {
            showNotification('alert-warning', 'Complete todos los campos obligatorios para el docente <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }


        //ACTUALIZA PERSONA

        let person = {
            idPersona: persona.idPersona,
            numeroDocumento: $doc_number.val(),
            nombres: $first_name.val(),
            apellidoPaterno: $patern_last_name.val(),
            apellidoMaterno: $matern_last_name.val(),
            sexo: ($male.is(':checked') ? 'M' : 'F'),
            correo: $email.val(),
            celular: $phone.val(),
            direccion: $address.val(),
            fechaNacimiento: $birthday.val() === '' ? today : $birthday.val(),
            idDepartamento: +$department.val(),
            idSeccion: parseInt($section.val() === '' ? '0' : $section.val()),
            tipoDocumento: $doc_type.val() === '' ? 'DNI' : $doc_type.val(),
        };

        let responseP = await putData('persona/actualizar', person, jwt, user);
        let okP = true;
        if ((responseP.error !== undefined && responseP.error !== '')) {
            showNotification('alert-danger', `${responseP.error} <i class="fas fa-exclamation pl-2"></i>`);
            okP = false;
        } else {
            if (responseP.data >= 0) {
                //swal("¡El usuario se ha actualizado correctamente!", "Presione OK para ver la lista de cursos registrados", "success");
                okP = true;
            } else {
                console.log('ERROR DE API');
                okP = false;
            }
        }

        //ACTUALIZA DOCENTE

        let docente = {
            idPersona: person.idPersona,
            codigo: $code.val(),
            dedicacion: $dedication.val(),
            categoria: $category.val(),
        };
        let okD = true;
        
        if ($role.val() == idRD) {
            let responseD = await putData('persona/docente/actualizar', docente, jwt, user);
            if ((responseD.error !== undefined && responseD.error !== '')) {
                showNotification('alert-danger', `${responseD.error} <i class="fas fa-exclamation pl-2"></i>`);
                okD = false;
            } else {
                if (responseD.data >= 0) {
                    //swal("¡El usuario se ha actualizado correctamente!", "Presione OK para ver la lista de cursos registrados", "success");
                    okD = true;
                } else {
                    console.log('ERROR DE API');
                    okP = false;
                }
            }
        }

        //ACTUALIZAR USUARIO

        let ir = roles.find(r => r.nombre == persona.rol).idRol;
        let usuarion = {
            email: $email.val(),
            idUsuario: idU,
            idRol: ir
        };
        let okU = true;

        if (idU != null) {
            let responseU = await putData('seguridad/usuario/actualizar', usuarion, jwt, user);
            if (responseU == idU) {
                okU = true;
            } else {
                showNotification(
                    $(this).data("color-name"),
                    'Hubo un problema al editar el rol <i class="fas fa-exclamation pl-2"></i>'
                );
                okU = false;
            }
        }


        //ACTUALIZA ROL


        let okR = true;
        if ($role.val() != ir) {
            let rolS = parseInt($("#role").val());
            let responseR = await putData(`seguridad/usuario/actualizarol?idUsuario=${idU}&idRol=${rolS}`, {}, jwt, user);
            if (responseR > 1) {
                okR = true;
            } else {
                showNotification(
                    $(this).data("color-name"),
                    'Hubo un problema al editar el rol <i class="fas fa-exclamation pl-2"></i>'
                );
                okR = false;
            }
        }



        if (okP && okD && okR && okU) {
            swal("¡El usuario se ha modificado correctamente!", "Presione OK para ver el Listado de Usuarios", "success");
        }
        else {
            console.log("Ha fallado la edición del usuario");
        }


    });

    $('#department').on('change', async function () {
        await loadSections($(this).val());
    });

    $(document).on('click', '.sweet-alert .confirm', function () {
        window.location.replace("/admin/list-users");
    })

    //await loadSections(1);
});

async function loadSections(idDepartment) {
    let sections1 = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=2000&pagina=1`, jwt);
    if (sections1) {
        let htmlSections = '<option></option>';
        for (let section of sections1.data) {
            htmlSections += `<option value="${section.idSeccion}">${section.nombre}</option>`;
        }
        $('#section').html(htmlSections);
        $('#section').select2();
    } else {
        console.log("ERROR EN API");
    }
}