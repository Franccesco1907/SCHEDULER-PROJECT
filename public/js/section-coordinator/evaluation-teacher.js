import { createDataTable } from "/utils/data-table.js";
import { getData, postData, putData } from "/utils/fetch.js";
import { showNotification } from '/utils/notifications.js';

var numFilas = 0;
var numFilasTeacher = 0;
let indicators;
let indicatorsTeacher;
let evaluacion;
let pesoMaximo;
let idPro = undefined;
let teachersDataTable = undefined;
let edit = undefined;
let idCiclo = undefined;

$(async function () {

    let idTeacher = undefined;
    let nameTeacherSelected = undefined;
    let tipo = undefined;
    let cicloActual = await getData(`universidad/ciclo/actual`, jwt);
    idCiclo = cicloActual.data.idCiclo;

    loadTeachers();
    $('.select2').select2();
    $(document).on('click', '.teachers-row', function () {
        if (idTeacher !== undefined && idTeacher == $(this).attr('id')) {
            $(`#${idTeacher}`).removeClass('teacher-selected');
            idTeacher = undefined;
        } else {
            $(`#${idTeacher}`).removeClass('teacher-selected');
            idTeacher = $(this).attr('id');
            nameTeacherSelected = $(this).children().eq(1).html();
            $(this).addClass("teacher-selected");
        }
    });

    $('#topScore').prop("disabled", true);
    $('#teacher').prop('disabled', true);
    $('#view-modal').hide();

    let today = new Date();

    let aboutToDate1, aboutToDate2, beginning, end;

    let procesos = await getData(`gestiondocente/procesos/listar?tamanioPag=2000&tipoProceso=EVALUACION_DOCENTE&idDepartamento=${idDepartamento}`, jwt);

    const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
    const procesosSort = procesos.data.sort((a, b) => (formattingStringDate(a.fechaFin) > formattingStringDate(b.fechaFin)) ? 1 : -1)
    let lastProcess = undefined;
    if (procesosSort) lastProcess = procesosSort.pop();
    if (procesoActivo) {
        aboutToDate1 = procesoActivo.fechaInicio, aboutToDate2 = procesoActivo.fechaFin;//API
        beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);

        idPro = procesoActivo.idProceso;

    } else if (lastProcess) {
        aboutToDate1 = lastProcess.fechaInicio, aboutToDate2 = lastProcess.fechaFin;//API
        beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2)

        idPro = lastProcess.idProceso;
    }

    $("#range_09").ionRangeSlider({
        grid: true,
        from: 0,
        to_fixed: true,//block the top
        from_fixed: true,//block the from
        values: ["NO INICIADO", "EN PROCESO", "TERMINADO", "FINALIZADO"],
        onUpdate: function (data) {
            // console.log(data);
        },
    });

    $('#beginning').prop('disabled', true);
    $('#end').prop('disabled', true);

    if (procesoActivo) {

        $('#beginning').val(aboutToDate1)
        $('#end').val(aboutToDate2)

        if (today < beginning) {

            let data = $("#range_09").data("ionRangeSlider");
            data.update({
                from: 0,
            });

            $('#register-modal').prop('disabled', true);
            $('#edit-modal').prop('disabled', true);

        } else if (today >= beginning && today < end) {

            let data = $("#range_09").data("ionRangeSlider");
            data.update({
                from: 1,
            });


            $('#register-modal').prop('disabled', false);
            $('#edit-modal').prop('disabled', false);


        } else if (today >= end) {
            let data = $("#range_09").data("ionRangeSlider");
            data.update({
                from: 2,
            });
            $('#view-modal').show();
            $('#register-modal').prop('disabled', true);
            $('#edit-modal').prop('disabled', true);
        }
    } else if (end > new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000))) {


        $('#beginning').val(aboutToDate1)
        $('#end').val(aboutToDate2)
        let data = $("#range_09").data("ionRangeSlider");
        data.update({
            from: 3,
        });
        $('#view-modal').show();
        $('#register-modal').prop('disabled', true);
        $('#edit-modal').prop('disabled', true);

    } else {
        // FIN DE PROCESO HACE TIEMPO
        $('#beginning').prop('placeholder', '--/--/----');
        $('#end').prop('placeholder', '--/--/----');
        let data = $("#range_09").data("ionRangeSlider");
        data.update({
            from: 0,
        });
        $('#view-modal').hide();
        $('#register-modal').prop('disabled', true);
        $('#edit-modal').prop('disabled', true);

    }


    $('#register-modal').on('click', async function () {
        edit = false;

        if (idTeacher) {
            let id = idTeacher.split('-')[1];

            $('#teacher').val(nameTeacherSelected);
            let teacher = professors.find((x) => x.idPersona === +id);
            if (teacher.estadoEvaluacion === "Si") {
                var placementFrom = $(this).data('placement-from');
                var placementAlign = $(this).data('placement-align');
                var colorName = $(this).data('color-name');

                showNotification(colorName, 'El docente ya ha sido evaluado. Seleccione editar evaluación <i class="fas fa-exclamation-triangle pl-2"></i>', placementFrom, placementAlign, '', '');
            } else {
                loadBase(id, tipo, -1);
                //  $('#registerModal').modal('show');
            }
        } else {
            var placementFrom = $(this).data('placement-from');
            var placementAlign = $(this).data('placement-align');
            var colorName = $(this).data('color-name');

            showNotification(colorName, 'Usted no ha seleccionado ningún profesor <i class="fas fa-exclamation-triangle pl-2"></i>', placementFrom, placementAlign, '', '');
        }
    });

    $('#view-modal').on('click', async function () {
        tipo = "view";

        if (idTeacher) {
            let id = idTeacher.split('-')[1];

            $('#teacher').val(nameTeacherSelected);
            let evalYesNo = undefined;
            let teacher = professors.find((x) => x.idPersona === +id);
            if (teacher.estadoEvaluacion === "Si") evalYesNo = 1;
            else evalYesNo = 0;

            loadBase(id, tipo, evalYesNo);
            // $('#registerModal').modal('show');


        } else {
            var placementFrom = $(this).data('placement-from');
            var placementAlign = $(this).data('placement-align');
            var colorName = $(this).data('color-name');

            showNotification(colorName, 'Usted no ha seleccionado ningún profesor <i class="fas fa-exclamation-triangle pl-2"></i>', placementFrom, placementAlign, '', '');
        }
    });

    $('#edit-modal').on('click', async function () {
        edit = true;
        if (idTeacher) {
            let id = idTeacher.split('-')[1];

            $('#teacher').val(nameTeacherSelected);
            let teacher = professors.find((x) => x.idPersona === +id);
            if (teacher.estadoEvaluacion === "No") {
                var placementFrom = $(this).data('placement-from');
                var placementAlign = $(this).data('placement-align');
                var colorName = $(this).data('color-name');

                showNotification(colorName, 'El docente no ha sido evaluado. Seleccione registrar evaluación <i class="fas fa-exclamation-triangle pl-2"></i>', placementFrom, placementAlign, '', '');
            }
            else {
                loadBase(id, tipo, -1);
                //  $('#registerModal').modal('show');
            }
        } else {
            var placementFrom = $(this).data('placement-from');
            var placementAlign = $(this).data('placement-align');
            var colorName = $(this).data('color-name');

            showNotification(colorName, 'Usted no ha seleccionado ningún profesor <i class="fas fa-exclamation-triangle pl-2"></i>', placementFrom, placementAlign, '', '');
        }
    });



    $('#register-evaluation').on('click', async function () {


        if (idTeacher) {
            let id = idTeacher.split('-')[1];
            var puntajes = new Array(numFilas);
            var i = 0;
            var nullRows = false;

            $(".edit-paperwork-name-input").each(function () {
                $(this).closest('tr').find("input").each(function () {
                    if (this.value.length < 1)
                        nullRows = true;
                    puntajes[i] = this.value;
                });
                i++;
            });


            for (var k in puntajes) {
                if (puntajes[k] > indicators.data[0].pesoMaximo) {
                    showNotification('alert-warning', 'El puntaje no puede ser mayor a la calificación máxima <i class="fas fa-exclamation-triangle pl-2"></i>');
                    return false;
                }
            }

            let idEvaluacionDocente;

            if (edit === false) {

                let evaluation = await postData(`gestiondocente/evaluaciondocente/guardar`, {
                    "resultado": 0,
                    "idDocente": id,
                    "idCiclo": idCiclo,
                    "idProcesos": idPro,
                    "estado": true,
                    "idDepartamento": idDepartamento
                }
                    , jwt, user);

                idEvaluacionDocente = evaluation.data;
            } else {
                let evaluation = await getData(`gestiondocente/evaluaciondocente/buscarpordocente?idDocente=${id}&idCiclo=${idCiclo}&tamanioPag=2000`, jwt);
                idEvaluacionDocente = evaluation.data.idEvaluacionDocente;
            }

            if (idEvaluacionDocente) {
                indicators = await getData(`gestiondocente/indicador/listar?idEvaluacionDocente=${idEvaluacionDocente}&tamanioPag=2000`, jwt);

                var puntajes = new Array(numFilas);
                var i = 0;
                var nullRows = false;
                $(".edit-paperwork-name-input").each(function () {
                    $(this).closest('tr').find("input").each(function () {
                        if (this.value.length < 1)
                            nullRows = true;
                        puntajes[i] = this.value;
                    });
                    i++;
                });
                var i = 0;
                let response;
                for (var k in puntajes) {
                    var item = puntajes[k];
                    let newIndicator = {
                        "idIndicador": indicators.data[i].idIndicador,
                        "descripcion": indicators.data[i].descripcion,
                        "peso": item,
                        "pesoMaximo": indicators.data[i].pesoMaximo,
                        "estado": true,
                    };
                    i++;

                    response = await putData("gestiondocente/indicador/actualizar", newIndicator, jwt, user);

                    if (edit === false) {
                        if (response.data) {
                            swal("¡Se ha registrado correctamente la evaluación docente!", "Presione OK para volver al inicio", "success");
                        }
                        else {
                            swal("Ocurrió un error", "Por favor, intente nuevamente.", "error");
                        }
                    }
                    else {
                        if (response.data) {
                            swal("¡Se ha actualizado correctamente la evaluación docente!", "Presione OK para volver al inicio", "success");
                        }
                        else {
                            swal("Ocurrió un error", "Por favor, intente nuevamente.", "error");
                        }
                    }



                };
            }
        } else {
            showNotification('alert-warning', 'No ha seleccionado a ningún docente <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }
    });

    $(document).on('click', '.sweet-alert .confirm', function () {
        window.location.replace("/section-coordinator/evaluation-teacher");
    })

});

async function loadBase(id, type, yesNo) {
    $('#append-table-tbody').empty();
    numFilas = 0;
    numFilasTeacher = 0;

    if ((id != '' && edit === true) || (type === "view" && yesNo === 1)) {
        evaluacion = await getData(`gestiondocente/evaluaciondocente/buscarpordocente?idDocente=${id}&idCiclo=${idCiclo}&tamanioPag=2000`, jwt);

        if (evaluacion.data.idEvaluacionDocente) {
            indicatorsTeacher = await getData(`gestiondocente/indicador/listar?idEvaluacionDocente=${evaluacion.data.idEvaluacionDocente}&tamanioPag=2000`, jwt);

            for (var ind of indicatorsTeacher.data) numFilasTeacher++;
        }

    }

    indicators = await getData(`gestiondocente/indicadorbase/listar?idDepartamento=${idDepartamento}`, jwt);
    pesoMaximo = indicators.data[0].pesoMaximo;
    $('#topScore').val(indicators.data[0].pesoMaximo);

    var a = 0;

    for (var indicator of indicators.data) {
        let peso = '';
        if (a < numFilasTeacher) peso = indicatorsTeacher.data[a].peso;
        if (type != "view") {
            $('#append-table-tbody').append(
                `<tr>
                <td class="row-description">
                    ${indicator.descripcion}
                </td>
                <td class="paperwork-name-td">
                          <input
                          type="text"
                          name="paperwork-name"
                          class="form-control edit-paperwork-name-input"
                          id="paperwork-name"
                          placeholder=""
                          style="background-color: white;"
                          value="${peso}"/>

                </td>
            </tr>`
            );
        }
        else {
            $('#append-table-tbody').append(
                `<tr>
                    <td class="row-description">
                        ${indicator.descripcion}
                    </td>
                    <td class="paperwork-name-td">
                        ${peso}
                    </td>
                </tr>`
            );
        }
        a++;
        numFilas++;
    }
    $('#registerModal').modal('show');
}

async function loadTeachers() {


    if (teachersDataTable) teachersDataTable.destroy();

    let evaluationTeacher = await getData(`gestiondocente/evaluaciondocente/listardocentes?idSeccion=${idSeccion}&idCiclo=${idCiclo}&tamanioPag=2000`, jwt);

    var i = 0;
    for (var teacher in evaluationTeacher.data) {
        var k = 0;
        for (var t in professors) {
            if (evaluationTeacher.data[i].idPersona == professors[k].idPersona) professors[k].estadoEvaluacion = evaluationTeacher.data[i].estadoEvaluacion;
            k++;
        }
        i++;
    }
    professors = professors.map(obj => {
        obj.estadoEvaluacion = obj.estadoEvaluacion ? "Si" : "No";
        return obj;
    });
    let options = {
        idTable: "teachers-data-table",
        data: professors,
        fields: [
            "codigo",
            "nombreCompleto",
            "dedicacion",
            "categoria",
            "estadoEvaluacion"
        ],
        name: "Docentes",
        idName: "idPersona",
        className: "teachers-row",
        addButtons: false,
    };

    teachersDataTable = createDataTable(options);

}


function formattingStringDate(stringDate) {
    const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
    const month = stringDate.slice(3, 6); // month and '/'
    const year = stringDate.slice(6, 10); // year
    stringDate = `${month}${day}${year}`;
    return new Date(stringDate);
}

