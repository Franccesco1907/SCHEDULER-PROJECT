import { createDataTable } from '/utils/data-table.js';
import { getData, deleteData, postData } from '/utils/fetch.js';
import { showNotification } from "/utils/notifications.js";

var fileUploaded = undefined;
let sectionsDataTable = undefined;
var sectionsPreviewDataTable = undefined;
var sectionsPreview = undefined;
var errors = undefined;
let options;

Dropzone.options.uploadWidget = {
    url: "/department-assistant/load-file-sections",
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

    if (user.rol === "ADMINISTRADOR") {
        $('#listDepartments').show();
        $('#cargaMasiva-admin').show();
        $('#cargaMasiva-dpto').hide();
    } else {
        $('#cargaMasiva-admin').hide();
        $('#cargaMasiva-dpto').show();

    }
    loadSections();

    $('.select2').select2();

    let idSection = undefined;
    let nameSectionSelected = undefined;

    $(document).on('click', '.sections-row', function () {
        if (idSection !== undefined && idSection == $(this).attr('id')) {
            $(`#${idSection}`).removeClass('section-selected');
            idSection = undefined;
        } else {

            $(`#${idSection}`).removeClass('section-selected');
            idSection = $(this).attr('id');
            //console.log(idSection);
            nameSectionSelected = $(this).children().eq(1).html();
            $(this).addClass("section-selected");
        }
    });


    $('#delete-section-modal').on('click', function () {
        let message = undefined;
        if (!idSection) {
            showNotification('alert-warning', 'No ha seleccionado ninguna sección <i class="fas fa-exclamation-triangle pl-2"></i>');
            $('#delete-section').hide();
            return false;

        } else {
            message = `¿Está seguro de querer eliminar la sección de ${nameSectionSelected} del sistema?`;
            $('#delete-section').show();
        }

        $('#deleteSectionModal .modal-body').html(`
        <div class="text-center">
            ${message}
        </div>
        <hr class="mt-2 mb-0">
        `);
    });

    $('#department').on('change', async function () {
        let id = $('#department').val();
        if (id === "Todos") id = '';

        sections = await getData(`universidad/seccion/listar?idDepartamento=${id}&tamanioPag=100&pagina=1`, jwt);

        sections = sections.data;
        //console.log(sections);
        loadSections();
    });

    $('#delete-section').on('click', async function () {
        if (idSection) {
            let id = idSection.split('-')[1];
            let data = await deleteData(`universidad/seccion/eliminar?idSeccion=` + id, jwt);
            //console.log(data);
            if (data.data === 1) {
                if (user.rol != "ADMINISTRADOR") {
                    sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=100&pagina=1`, jwt);
                } else {
                    sections = await getData(`universidad/seccion/listar?tamanioPag=100&pagina=1`, jwt);
                }
                sections = sections.data;
                loadSections();
                $('#close-delete-section-modal').trigger('click');
                $('#success-delete-section').trigger('click');

                idSection = undefined;
            } else {
                console.log('Ocurrió un error');
            }
        } else {
            console.log('Ocurrió un error');
        }

    });



    $('#success-delete-section').on('click', function () {
        showSuccessMessage();
    });

    function showSuccessMessage() {
        swal("¡La sección se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
    }

    $('#edit-section-modal').on('click', function () {
        if (idSection) {
            let id = idSection.split('-')[1];
            window.location.replace(`/department-assistant/edit-section?idSection=${id}`);
        } else {
            showNotification('alert-warning', 'No ha seleccionado ninguna sección <i class="fas fa-exclamation-triangle pl-2"></i>');
            $('#activate-edit-modal').trigger('click');
            return false;
        }
    });

    $('#load-data-sections').on('click', async function () {
        let response;
        await fetch('/department-assistant/load-data-sections', {
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

            sectionsPreview = response.content;
            errors = response.errors;
            loadDataSectionsPreview();
            loadErrors();


            $('#table-sections-preview tr td').css("height", "20px");
        } else {
            console.log('Ocurrió un error en el back');

        }

    });

    $('#load-sections-massive').on('click', async function () {

        if (errors.length) {
            alert('Resuelva los erorres y cargue de nuevo el archivo');
            return false;
        }
        else {
            if (sectionsPreview.length) {
                let sectionsMassive = sectionsPreview.map(section => {
                    return {
                        "nombre": section.nombre,
                        "codigo": section.codigo,
                        "resenia": section.resenia,
                        "fechaCreacion": section.fechaCreacion,
                        "idDepartamento": section.idDepartamento
                    }
                });

                //console.log(sectionsMassive);
                let response = await postData('universidad/seccion/guardarmasivo', sectionsMassive, jwt, user);
                //console.log(response);


                if (response.data) {
                    if (user.rol != "ADMINISTRADOR") {
                        sections = await getData(`universidad/seccion/listar?idDepartamento=${idDepartment}&tamanioPag=100&pagina=1`, jwt);
                    } else {
                        sections = await getData(`universidad/seccion/listar?tamanioPag=100&pagina=1`, jwt);
                    }
                    sections = sections.data;
                    loadSections();
                    $('#close-preview-sections-modal').trigger('click');
                    swal("¡Las secciones se han guardado correctamente!", "", "success");
                    sectionsPreview = [];
                    loadDataSectionsPreview();
                } else {
                    alert('Hay secciones repetidas, cargue de nuevo el archivo');
                    console.log("ERROR EN API");
                }
            } else {
                console.log("No hay secciones que cargar");
            }
        }
    });

});

async function loadSections() {

    if (sectionsDataTable) sectionsDataTable.destroy();
    options = {
        idTable: 'sections-data-table',
        data: sections,
        fields: ['codigo', 'nombre', 'fechaCreacion'],
        name: 'Secciones',
        idName: 'idSeccion',
        className: 'sections-row',
        addButtons: false
    };
    sectionsDataTable = createDataTable(options);
    $('#sections-data-table_wrapper').children().first().remove();
}


function loadDataSectionsPreview() {
    if (sectionsPreviewDataTable) sectionsPreviewDataTable.destroy();
    let idTable = undefined;
    if (user.rol === "ADMINISTRADOR") {
        idTable = 'table-sections-preview-admin'
        $('#table-sections-preview-admin').show();
    } else {
        idTable = 'table-sections-preview'
        $('#table-sections-preview').show();
    }
    let options = {
        idTable: idTable,
        data: sectionsPreview,
        fields: user.rol === "ADMINISTRADOR" ? ['codigo', 'nombre', 'nombreDepartamento', 'fechaCreacion'] : ['codigo', 'nombre', 'fechaCreacion'],
        name: 'Secciones',
        idName: 'idSeccion',
        className: '',
        addButtons: false
    };

    sectionsPreviewDataTable = createDataTable(options);

}

function loadErrors() {
    let htmlErrors = '';
    //console.log(errors);
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