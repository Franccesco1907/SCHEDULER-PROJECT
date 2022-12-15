import { getData, postData, deleteData, putData } from '/utils/fetch.js';
import { createDataTable } from '/utils/data-table.js';
import { showNotification } from '/utils/notifications.js';
var idSection = undefined;
var fileUploaded = undefined;
var professorPreviewDataTable = undefined;
var professorPreview = undefined;
var teachersData = undefined;
var error = undefined;
var tableSection = undefined;
Dropzone.options.uploadWidget = {
    url: "/department-assistant/load-file-professor",
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

    $('.select2').select2();
    //////console.lo(usuario);
    let options = {
        idTable: 'professor-data-table',
        data: professors, // API data must be here
        fields: ['codigo', 'nombreCompleto', 'dedicacion', 'categoria'],
        name: 'Docentes',
        idName: 'idPersona',
        className: 'professor-row',
        addButtons: false
    };

    idSection = $("#select-section").val();
    let professorDataTable = createDataTable(options);

    let idProfessor = undefined;
    let nameProfessorSelected = undefined;
    //cargarSecciones(idPersona);
    $(document).on('click', '.professor-row', function () {

        if (idProfessor !== undefined && idProfessor == $(this).attr('id')) {
            //////console.lo(idProfessor);
            $(`#${idProfessor}`).removeClass('professor-selected');
            idProfessor = undefined;
            $("#btn-view-detail-professor").removeAttr("href");
        } else {

            $(`#${idProfessor}`).removeClass('professor-selected');
            idProfessor = $(this).attr('id');
            nameProfessorSelected = $(this).children().eq(1).html();
            $(this).addClass("professor-selected");
            $("#btn-view-detail-professor").attr("href", `/teacher/record?id=${idProfessor.replace('idPersona-', '')}`);
        }
    });
    $('#professor-data-table_wrapper').children().first().remove();

    $('#load-data-professor').on('click', async function () {

        let dataResponse = undefined;

        await fetch('/department-assistant/load-data-professor', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('#csrf').val(),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileUploaded
            }),
            idDepartamento: usuario.idDepartamento
        })
            .then(response => response.json())
            .then(data => {
                dataResponse = data;
            })


        //console.lo(dataResponse);

        if (dataResponse.result === 'OK') {
            if (dataResponse.content.length == 0) {
                showNotification("alert-danger", "Todos los datos docentes presentan errores, verificar las tildes en la sección");
                return;
            }
            $("#error-alert").hide();
            $("#error-alert-lines").hide();
            $('#close-load-massive-modal').trigger('click');
            $('#open-preview-modal').trigger('click');
            
            professorPreview=dataResponse.content;
            error=dataResponse.error;
            //console.log(dataResponse);
            
            loadDataProfessorPreview();

            if(error.length!=0){
                $("#error-alert-lines").text("Existen errores en la sección de la linea "+error + " del excel");
                $("#error-alert-lines").show();
            }
            $('#table-professor-preview tr td').css("height", "20px");
        } else {
            ////console.lo('Ocurrió un error en el back ga');

        }

    });

    $('#edit-professor-modal').on('click', function () {

        if (idProfessor) {
            let id = idProfessor.split('-')[1];
            window.location.replace(`/department-assistant/edit-professor?idProfessor=${id}&edit=${true}`);
        } else {
            $('#activate-edit-modal').trigger('click');
        }
    });



    $('#details').on('click', function () {

        if (idProfessor) {
            let id = idProfessor.split('-')[1];
            window.location.replace(`/department-assistant/edit-professor?idProfessor=${id}&edit=${false}`);
        } else {
            $('#activate-edit-modal').trigger('click');
        }
    });

    $("#delete-professor-modal").hide();
    $("#edit-professor-modal").hide();
    $('#details').hide();

    $('#delete-professor-modal').on('click', function () {
        let message = undefined;
        if (!idProfessor) {
            message = "Usted no ha seleccionado ningún profesor";
            $('#delete-professor').hide();
        } else {
            message = `¿Está seguro de querer eliminar el profesor  ${nameProfessorSelected} del sistema?`;
            $('#delete-professor').show();
        }

        $('#deleteProfessorModal .modal-body').html(`
        <div class="text-center">
            ${message}
        </div>
        <hr class="mt-2 mb-0">
        `);
    });

$('#load-data-professor-bd').on('click', async function () {
    
    
    if(error.length!=0)return;
        if (professorPreview.length) {
            let professorMassive = professorPreview.map(prof => {
                return {
                    "numeroDocumento": prof.numeroDocumento.toString(),
                    "nombres": prof.nombres,
                    "codigo": prof.codigo.toString(),
                    "apellidoPaterno": prof.apellidoPaterno,
                    "apellidoMaterno": prof.apellidoMaterno,
                    "sexo": prof.sexo,
                    "correo": prof.correo,
                    "celular": prof.celular.toString(),
                    "direccion": prof.direccion,
                    "fechaNacimiento": prof.fechaNacimiento,
                    "tipoDocumento": prof.tipoDocumento,
                    "dedicacion": prof.dedicacion,
                    "categoria": prof.categoria,
                    "idDepartamento": prof.idDepartamento,
                    "idSeccion": prof.idSeccion
                }
            });
            var response = undefined;
            let correctRegister=true;
            let counter=0;
            let insertError=0;
            for(let aux of professorMassive){
                
                response=await postData("persona/docente/guardar", aux, jwt, user);
                
                let idPerson=response.data;
                if(idPerson===null){
                    correctRegister=false;
                    insertError=counter;    
                    break;
                }else{
                    response=await postData('seguridad/usuario/registro', {
                        email: aux.correo,
                        contrasenia: '',
                        idRol: 2,
                        idPersona: idPerson
                      }, jwt, user);
                      
                      if(response.error){
                          correctRegister=false;
                          insertError=counter;
                          break;
                      }

                }
                counter+=1;
            }

            if(correctRegister){
                $('#close-preview-professor-modal').trigger('click');
                swal("¡Los Docentes se han guardado correctamente!", ":)", "success");
                $("#select-section").val("0");
                $("#select-section").trigger("change");
                professorPreview = [];

            }
            else{
                $("#error-alert").text(`Existen errores en los usuarios a partir de la fila ${insertError+1}, verifique y vuelva a insertar desde ahí`);
                    $("#error-alert").show();
                }
            }

    });

    $("#loadSeccion").on("click", async () => {
        let optionsSection = {
            idTable: 'table-sections',
            data: sections, // API data must be here
            fields: ['idSeccion', 'nombre'],
            name: 'Seccion',
            idName: 'idSeccion',
            className: 'seccion-row',
            addButtons: false
        }
        if (tableSection) tableSection.destroy();
        tableSection = createDataTable(optionsSection);
        $('#table-sections_wrapper').children().first().remove();
    });



    $('#select-section').on('change', function () {
        idSection = $("#select-section").val();
        if (idSection != 0)
            cargarData(idSection);
        else cargarTodos();


        //teachersData=teachersData.data;

    });

    async function cargarData(idSection) {
        teachersData = await getData(`persona/docente/listarseccion?idSeccion=${idSection}&tamanioPag=2000&pagina=1`, jwt);
        options.data = teachersData.data;
        ////console.lo(options.data);
        professorDataTable.destroy();
        professorDataTable = createDataTable(options);
        $('#professor-data-table_wrapper').children().first().remove();
    }

    async function cargarTodos() {
        teachersData = await getData(`persona/docente/listar?tamanioPag=2000&pagina=1&idDepartamento=` + usuario.idDepartamento, jwt);
        options.data = teachersData.data;
        ////console.lo(options.data);
        professorDataTable.destroy();
        professorDataTable = createDataTable(options);
        $('#professor-data-table_wrapper').children().first().remove();
    }

    function loadDataProfessorPreview() {

        if (professorPreviewDataTable) professorPreviewDataTable.destroy();
        let optionsPreview = {
            idTable: 'table-professor-preview',
            data: professorPreview,
            fields: ['codigo', 'nombres', 'correo', 'dedicacion', 'categoria'],
            name: 'Docentes',
            idName: 'idPersona',
            className: '',
            addButtons: false
        };

        professorPreviewDataTable = createDataTable(optionsPreview);

    }

    $('#code-name-input').on('keyup', function () {
        let inputText = $('#code-name-input').val().toLowerCase();
        let filteredProfessors = teachersData.data.filter(x => x.codigo.toLowerCase().includes(inputText) || x.nombreCompleto.toLowerCase().includes(inputText));

        if (professorDataTable) professorDataTable.destroy();
        let optionsFilter = {
            idTable: 'professor-data-table',
            data: filteredProfessors,
            fields: ['codigo', 'nombreCompleto', 'dedicacion', 'categoria'],
            name: 'Docentes',
            idName: 'idPersona',
            className: 'professor-row',
            addButtons: false
        };

        professorDataTable = createDataTable(optionsFilter);
    });

});

