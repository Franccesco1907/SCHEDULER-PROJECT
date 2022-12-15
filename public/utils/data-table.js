export function createDataTable(options) {

    let { idTable, data, fields, name, idName, className, addButtons } = options;

    let htmlBody = '';
    for (let object of data) {
        htmlBody += `<tr class="${className}" id="${idName + '-' + object[idName]}">`;
        for (let field of fields) htmlBody += `<td>${object[field] }</td>`;
        htmlBody += `</tr>`
    }

    $(`#${idTable} tbody`).html(htmlBody);

    let buttons = [];
    if (addButtons) buttons = ['copy', 'csv', 'excel', 'pdf', 'print'];

    let config = {
        destroy: true,
        buttons: buttons,
        bDestroy: true,
        stateSave: false,
        ordering: true,
        order: [[0, 'desc']],
        //lengthChange: false,
        searching: false,
        language: {
            "copy": "Copiar Datos",
            "print": "Imprimir",
            "decimal": "",
            "emptyTable": `No hay ${name}`,
            "info": `Mostrando _START_ a _END_ de _TOTAL_ ${name}`,
            "infoEmpty": `Mostrando 0 a 0 de 0 ${name}`,
            "infoFiltered": `(Filtrado de _MAX_ total ${name})`,
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": `Mostrar _MENU_ ${name}`,
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "search": "Buscar:",
            "zeroRecords": "Sin resultados encontrados",
            "paginate": {
                "first": "Primero",
                "last": "Ultimo",
                "next": "SIG",
                "previous": "ANT"
            }
        }
    };

    if (addButtons) config.dom = 'Bfrtip';

    let dataTable = $(`#${idTable}`).DataTable(config);

    return dataTable;
}