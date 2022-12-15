import { createDataTable } from '/utils/data-table.js';
import { getData, deleteData, postData } from '/utils/fetch.js';
import { showNotification } from "/utils/notifications.js";

var fileUploaded = undefined;
let departmentsDataTable = undefined;
var departmentsPreviewDataTable = undefined;
var departmentsPreview = undefined;
var errors = undefined;
let options;

Dropzone.options.uploadWidget = {
    url: "/user/admin/load-file-departments",
    addRemoveLinks: true,
    maxFiles: 1,
    maxFilesize: 20, //MB
    acceptedFiles: '.xlsx,.xls',
    dictDefaultMessage: '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i>Arrastre los archivos aquí <span class="font-xs">para añadirlos</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (O darle Click)</h4></span>',
    dictResponseError: '¡Error al cargar el archivo!',
    headers: {
        'X-CSRF-TOKEN': $('#csrf').val()
    },
    init: function () {
        this.on('success', function (file, res) {
            fileUploaded = res;
        });
    },
};

$(function () {

    //console.log(departments);
    loadDepartments();

    let idDepartment = undefined;
    let nameDepartmentSelected = undefined;

    $(document).on('click', '.departments-row', function () {
        //Deselect department row
        if (idDepartment !== undefined && idDepartment == $(this).attr('id')) {
            $(`#${idDepartment}`).removeClass('department-selected');
            idDepartment = undefined;
        } else {
            //Select department row
            $(`#${idDepartment}`).removeClass('department-selected');
            idDepartment = $(this).attr('id');
            nameDepartmentSelected = $(this).children().eq(1).html();
            $(this).addClass("department-selected");
        }
    });


    //$('#departments-data-table_wrapper').children().first().remove();

    $('#delete-department-modal').on('click', function () {
        let message = undefined;
        if (!idDepartment) {
            message = "Usted no ha seleccionado ninguna sección";
            $('#delete-department').hide();
        } else {
            message = `¿Está seguro de querer eliminar el departamento ${nameDepartmentSelected} del sistema?`;
            $('#delete-department').show();
        }

        $('#deleteDepartmentModal .modal-body').html(`
        <div class="text-center">
            ${message}
        </div>
        <hr class="mt-2 mb-0">
        `);
    });


    $('#delete-department').on('click', async function () {
        if (idDepartment) {
            let id = idDepartment.split('-')[1];
            let data = await deleteData(`universidad/departamento/eliminar?idDepartamento=` + id, jwt);
            //console.log(data);
            if (data.data === 1) {
                departments = await getData(`universidad/departamento/listar?&tamanioPag=100&pagina=1`, jwt);
                departments = departments.data;
                departments.filter(x => x.estado == true);
                console.log(departments);
                loadDepartments();
                $('#close-delete-department-modal').trigger('click');
                $('#success-delete-department').trigger('click');

                idDepartment = undefined;
            } else {
                //console.log('Ocurrió un error');
            }
        } else {
            //console.log('Ocurrió un error');
        }

    });



    $('#success-delete-department').on('click', function () {
        showSuccessMessage();
    });

    function showSuccessMessage() {
        swal("¡El departamento se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
    }

    $('#edit-department-modal').on('click', function () {
        //console.log(idDepartment);
        if (idDepartment) {
            let id = idDepartment.split('-')[1];
            window.location.replace(`/admin/edit-department?idDepartment=${id}`);
        } else {
            showNotification('alert-warning', 'No ha seleccionado ningun departamento <i class="fas fa-exclamation-triangle pl-2"></i>');
            //$('#activate-edit-modal').trigger('click');
            return false;
        }
    });

    $('#load-data-departments').on('click', async function () {
        let response;
        await fetch('/admin/load-data-departments', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('#csrf').val(),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileUploaded
            })
        })
            .then(response => response.json())
            .then(data => {
                response = data;
            })

        if (response.result === 'OK') {
            $('#close-load-massive-modal').trigger('click');
            $('#open-preview-modal').trigger('click');

            departmentsPreview = response.content;
            errors = response.errors;
            loadDataDepartmentsPreview();
            loadErrors();


            $('#table-departments-preview tr td').css("height", "20px");
        } else {
            //console.log('Ocurrió un error en el back');

        }

    });

    $('#load-departments-massive').on('click', async function () {
        if (errors) {
            if (errors.lenght) {
                alert('Resuelva los erorres y cargue de nuevo el archivo');
                return false;
            }
        } else {
            if (!departmentsPreview.lenght) {
                let departmentsMassive = departmentsPreview.map(department => {
                    return {
                        "nombre": department.nombre,
                        "codigo": department.codigo,
                        "descripcion": department.descripcion,
                        "fechaCreacion": department.fechaCreacion,
                    }
                });

                //console.log(departmentsMassive);
                let response = await postData('universidad/departamento/guardarmasivo', departmentsMassive, jwt, user);
                //console.log(response);


                if (response.data) {
                    departments = await getData(`universidad/departamento/listar?tamanioPag=100&pagina=1`, jwt);
                    departments = departments.data;
                    loadDepartments();
                    $('#close-preview-departments-modal').trigger('click');
                    swal("¡Los departamentos se han guardado correctamente!", "", "success");
                    departmentsPreview = [];
                    loadDataDepartmentsPreview();
                } else {
                    alert('Hay departamentos repetidos, cargue de nuevo el archivo');
                    //console.log("ERROR EN API");
                }
            } else {
                alert("No hay departamentos que cargar");
            }
        }
    });

});

async function loadDepartments() {
    departments = departments.filter(x => x.estado == true);
    if (departmentsDataTable) departmentsDataTable.destroy();
    options = {
        idTable: 'departments-data-table',
        data: departments,
        fields: ['codigo', 'nombre', 'fechaCreacion'],
        name: 'Departamentos',
        idName: 'idDepartamento',
        className: 'departments-row',
        addButtons: false
    };
    departmentsDataTable = createDataTable(options);
    $('#departments-data-table_wrapper').children().first().remove();


}

function loadDataDepartmentsPreview() {
    if (departmentsPreviewDataTable) departmentsPreviewDataTable.destroy();
    let options = {
        idTable: 'table-departments-preview',
        data: departmentsPreview,
        fields: ['codigo', 'nombre', 'fechaCreacion'],
        name: 'Departamentos',
        idName: 'idDepartamento',
        className: '',
        addButtons: false
    };

    departmentsPreviewDataTable = createDataTable(options);
}

function loadErrors() {
    let htmlErrors = '';
    if (errors) {
        for (let error of errors) {
            htmlErrors += `<div class="alert alert-danger" role="alert">
                            <div class="container">
                            <div class="alert-icon">
                                <i class="zmdi zmdi-block"></i>
                            </div>
                            <strong>¡Lo sentimos!</strong> ${error}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">
                                <i class="zmdi zmdi-close"></i>
                                </span>
                            </button>
                            </div>
                        </div>`;
        }
    }
    $('#errors').html(htmlErrors);
}