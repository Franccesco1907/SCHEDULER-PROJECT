async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var fileUploaded = undefined;
/*
Dropzone.options.uploadWidget = {
    url: "/assistant/load-file-courses",
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
*/
function initCoursesDataTable() {
    return $('#courses-data-table').DataTable({
        dom: 'Bfrtip',
        language: {
            "copy": "Copiar Datos",
            "print": "Imprimir",
            "decimal": "",
            "emptyTable": "No hay información",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ cursos",
            "infoEmpty": "Mostrando 0 a 0 de 0 cursos",
            "infoFiltered": "(Filtrado de _MAX_ total cursos)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Mostrar _MENU_ cursos",
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "search": "Código/Nombre de Curso:",
            "zeroRecords": "Sin resultados encontrados",
            "paginate": {
                "first": "Primero",
                "last": "Ultimo",
                "next": "SIG",
                "previous": "ANT"
            }
        },
        responsive: true
    });
}

$(function () {

    let hasClassSchedules = true;
    let hasPracticeSchedules = true;
    let hasLabSchedules = true;
    let hasAdviceSchedules = true;

    if(!hasClassSchedules)
        $('#schedule-subtitle-and-table-class').hide();
    if(!hasPracticeSchedules)
        $('#schedule-subtitle-and-table-practice').hide();
    if(!hasLabSchedules)
        $('#schedule-subtitle-and-table-lab').hide();
    if(!hasAdviceSchedules)
        $('#schedule-subtitle-and-table-advice').hide();


    let coursesDataTable = initCoursesDataTable();

    let idCourse = undefined;
    let nameCourseSelected = undefined;

    $('.courses-row').on('click', function () {

        if (idCourse !== undefined && idCourse == $(this).attr('id')) {
            $(`#${idCourse}`).removeClass('course-selected');
            idCourse = undefined;
        } else {
            $(`#${idCourse}`).removeClass('course-selected');
            idCourse = $(this).attr('id');
            nameCourseSelected = $(this).children().eq(1).html();
            $(this).addClass("course-selected");
        }

    });

    $('#delete-course-modal').on('click', function () {
        let message = undefined;
        if (!idCourse) {
            message = "Usted no ha seleccionado ningún curso";
            $('#delete-course').hide();
        } else {
            message = `¿Está seguro de querer eliminar el curso de ${nameCourseSelected} del sistema?`;
            $('#delete-course').show();
        }

        $('#deleteCourseModal .modal-body').html(`
        <div class="text-center">
            ${message}
        </div>
        <hr class="mt-2 mb-0">
        `);
    });


    $('.dt-buttons').children().each(function () {
        $(this).removeClass('btn-primary');
        $(this).addClass('btn-info');
    });

    $('#delete-course').on('click', async function () {
        if (idCourse) {
            await fetch('http://34.107.140.235/universidad/curso/eliminar?idCourse=' + idCourse, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then((data) => async function () {
                    if (data.data === 1) {
                        //coursesDataTable.row(`#${idCourse}`).remove();
                        $(`#${idCourse}`).remove();
                        //coursesDataTable.destroy();
                        //coursesDataTable = initCoursesDataTable();
                        $('#close-delete-course-modal').trigger('click');
                        $('#success-delete-course').trigger('click');
                        await sleep(1000);
                        location.reload();
                        idCourse = undefined;
                    } else {
                        console.log('Ocurrió un error');
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            console.log('Ocurrió un error');
        }

    });

    $('#load-data-courses').on('click', async function () {
        let dataResponse = undefined;

        await fetch('http://35.221.53.4:8000/assistant/load-data-courses', {
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
                dataResponse = data;
            })

        if (dataResponse.result === 'OK') {
            $('#close-load-massive-modal').trigger('click');
            $('#open-preview-modal').trigger('click');
            let htmlCourses = '';

            for (let course of dataResponse.content) {
                let htmlCourse = `
                <tr>
                    <td>${course.code}</td>
                    <td>${course.name}</td>
                    <td>Ingeniería Informática</td>
                    <td>${course.totalWeeklyHours}</td>
                    <td>${course.credits}</td>
                    <td>GA</td>
                </tr>`;

                htmlCourses += htmlCourse;
            }

            $('#courses-loaded').html(htmlCourses);

            $('.js-basic-example').DataTable({
                "bLengthChange": false,
                "bAutoWidth": false,
                "ordering": false,
                "language": {
                    "emptyTable": "No hay información",
                    "info": "Mostrando _START_ a _END_ de _TOTAL_ cursos",
                    "infoEmpty": "Mostrando 0 to 0 of 0 cursos",
                    "infoFiltered": "(Filtrado de _MAX_ total cursos)",
                    "infoPostFix": "",
                    "thousands": ",",
                    "lengthMenu": "Mostrar _MENU_ cursos",
                    "loadingRecords": "Cargando...",
                    "processing": "Procesando...",
                    "search": "Código/Nombre de Curso:",
                    "zeroRecords": "Sin resultados encontrados",
                    "paginate": {
                        "first": "Primero",
                        "last": "Ultimo",
                        "next": "SIG",
                        "previous": "ANT"
                    }
                }
            });

            $('#table-courses-preview tr td').css("height", "20px");
        } else {
            console.log('Ocurrió un error en el back ga');
        }

    });

    $('#edit-course-modal').on('click', function () {
        if (idCourse) {
            window.location.replace("http://www.appwebsw.online/assistant/register-course?idCourse=1");
        } else {
            $('#activate-edit-modal').trigger('click');
        }
    });

    function showSuccessMessage() {
        swal("¡El curso se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
    }

    $('#success-delete-course').on('click', function () {
        showSuccessMessage();
    });
});