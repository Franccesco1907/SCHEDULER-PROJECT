import { getData, postData, putData } from '/utils/fetch.js';
import { showNotification } from '/utils/notifications.js';
let indicatorsDataTable = undefined;
let indicators = undefined;
let numFilas = 0;
let edit = false;
let idPro = undefined;

$(async function () {
    let today = new Date();

    let aboutToDate1, aboutToDate2, beginning, end;
    $('#save-indicator').hide();
    $('#edit-indicator-button').hide();
    $('#new-indicator-button').hide();
    $("#topScore").prop("disabled", true);

    let procesos = await getData(`gestiondocente/procesos/listar?tamanioPag=2000&tipoProceso=EVALUACION_DOCENTE&idDepartamento=${idDepartamento}`, jwt);
    const procesoActivo = procesos.data.find(proceso => proceso.estado === true);
    const procesosSort = procesos.data.sort((a, b) => (formattingStringDate(a.fechaFin) > formattingStringDate(b.fechaFin)) ? 1 : -1)
    let lastProcess = undefined;
    if (procesosSort) lastProcess = procesosSort.pop();
    if (procesoActivo) {
        aboutToDate1 = procesoActivo.fechaInicio, aboutToDate2 = procesoActivo.fechaFin;//API
        beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2);
        //console.log(procesoActivo);
        idPro = procesoActivo.idProceso;

    } else if (lastProcess) {
        aboutToDate1 = lastProcess.fechaInicio, aboutToDate2 = lastProcess.fechaFin;//API
        beginning = formattingStringDate(aboutToDate1), end = formattingStringDate(aboutToDate2)
        //console.log(lastProcess);
        idPro = lastProcess.idProceso;
    }

    if (procesoActivo) { //mientras este activo

        $('#save-indicator').hide();
        $('#edit-indicator-button').hide();
        $('#new-indicator-button').hide();


    } else if (end > new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000))) {

        $('#save-indicator').hide();
        $('#edit-indicator-button').hide();
        $('#new-indicator-button').hide();

    } else {
        // NO CREADO
        $("#topScore").prop("disabled", false);
        $('#save-indicator').show();
        $('#edit-indicator-button').show();
        $('#new-indicator-button').show();
    }

    indicators = await getData(`gestiondocente/indicadorbase/listar?idDepartamento=${idDepartamento}`, jwt);

    if (indicators.data.length > 0) {
        $('#edit-indicator-button').prop("disabled", false);

        $('#topScore').val(indicators.data[0].pesoMaximo);
        $("#topScore").prop("disabled", true);
        for (var indicator of indicators.data) {
            $('#append-indicator-table-tbody').append(
                `<tr>
                    <td class="row-number" style="text-align: center;">
                        ${++numFilas}
                    </td>
                    <td class="row-description">
                        ${indicator.descripcion}
                    </td>
                    
                    </tr>`
            );

        }
    } else {
        $('#edit-indicator-button').prop("disabled", true);

    }

    $('#new-indicator-button').on('click', function () {
        $("#borrar").show();
        $("#edit-indicator-button").prop("disabled", true);
        $('#append-indicator-table-tbody').append(
            `<tr>
                <td class="row-number" style="text-align: center;">
                    ${++numFilas}
                </td>
                <td class="paperwork-name-td">
                    <input
                    type="text"
                    name="paperwork-name"
                    class="form-control paperwork-name-input"
                    id="paperwork-name"
                    placeholder=""
                    style="background-color: white;"/>
                </td>
                <td style="text-align: center; background-color: white; max-width: 8px;">
                    <a id="new-paperwork-plus-button" type="button" class="remove fa fa-trash delete-row-paperwork"
                    style="color:#94989b;">
                    </a>                       
                </td>
            </tr>`
        );
    });

    $('#edit-indicator-button').on('click', function () {
        edit = true;
        $("#topScore").prop("disabled", false);
        $("#new-indicator-button").prop("disabled", true);
        numFilas = 0;
        $('#append-indicator-table-tbody').empty();
        for (var indicator of indicators.data) {
            $('#append-indicator-table-tbody').append(
                `<tr>
                    <td class="row-number" style="text-align: center;">
                        ${++numFilas}
                    </td>
                    <td class="paperwork-name-td">
                        <input
                        type="text"
                        name="paperwork-name"
                        class="form-control paperwork-edit-name-input"
                        id="paperwork-name"
                        placeholder=""
                        style="background-color: white;"
                        value="${indicator.descripcion}"/>
                    </td>
                    
                </tr>`
            );
        }


    });

    $('#indicator-add-data-table').on('click', '.remove', function () {

        $(this).closest('tr').remove();     // Remove row

        var counter = 0;                    // Re-enumerate table rows
        $("#indicator-add-data-table td:nth-child(1)").each(function () {
            var currentItem = $(this);
            currentItem.closest("tr").find(".row-number").text(++counter);
        });

        numFilas--;
    });

    $('#save-indicator').on('click', async function () {
        if ($('#topScore').val() === '') {
            showNotification('alert-warning', 'Por favor complete los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }
        var descriptions = new Array(numFilas);
        var i = 0;
        var nullRows = false;

        if (edit === false) {
            $(".paperwork-name-input").each(function () {
                $(this).closest('tr').find("input").each(function () {
                    if (this.value.length < 1)
                        nullRows = true;
                    descriptions[i] = this.value;
                });
                i++;
            });
            var i = 0;
            let response;

            for (var k in descriptions) {
                var item = descriptions[k];
                let newIndicator = {
                    "descripcion": item,
                    "peso": 0,
                    "pesoMaximo": $('#topScore').val(),
                    "estado": true,
                    "idDepartamento": idDepartamento
                };

                if (newIndicator.descripcion != '') {
                    response = await postData("gestiondocente/indicadorbase/guardar", newIndicator, jwt, user);

                    if (response.data) {
                        swal("¡Se ha registrado correctamente el criterio de evaluación docente!", "Presione OK", "success");
                    } else {
                        swal("Ocurrió un error", "Por favor, intente nuevamente.", "error");
                    }
                } else {
                    showNotification('alert-warning', 'No ha completado la descripción del criterio de evaluación <i class="fas fa-exclamation-triangle pl-2"></i>');
                    return false;
                }
            };
        }
        else {//editando

            $(".paperwork-edit-name-input").each(function () {
                $(this).closest('tr').find("input").each(function () {
                    if (this.value.length < 1)
                        nullRows = true;
                    descriptions[i] = this.value;
                });
                i++;
            });
            var i = 0;
            let response;

            for (var k in descriptions) {
                var item = descriptions[k];
                let newIndicator = {
                    "idIndicador": indicators.data[i].idIndicador,
                    "descripcion": item,
                    "peso": 0,
                    "pesoMaximo": $('#topScore').val(),
                    "estado": true,
                    "idDepartamento": idDepartamento
                };

                i++;
                response = await putData("gestiondocente/indicadorbase/actualizar", newIndicator, jwt, user);
                //console.log(response.data);
            };
            if (response.data) {
                swal("¡Se ha actualizado correctamente los criterios de evaluación docente!", "Presione OK", "success");
            } else {
                swal("Ocurrió un error", "Por favor, intente nuevamente.", "error");
            }
        }

    });

    $(document).on('click', '.sweet-alert .confirm', function () {
        window.location.replace("/department-assistant/register-indicator");
    })

});

function formattingStringDate(stringDate) {
    const day = stringDate.slice(0, 3); // day and '/'       28/10/2021
    const month = stringDate.slice(3, 6); // month and '/'
    const year = stringDate.slice(6, 10); // year
    stringDate = `${month}${day}${year}`;
    return new Date(stringDate);
}
