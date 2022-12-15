import { createDataTable } from "/utils/data-table.js";
import { showNotification } from "/utils/notifications.js";
import { getData, postData, putData } from "/utils/fetch.js";


let $articleName = $('#article-name');
let $idAutor = $('#autor-name');
let $description = $('#description');
let $year = $('#year');
let $place = $('#place');
let $link = $('#link');
let $coautors = $('#coautors');

let listaIdDocente = [];
let investigationEdit;

let paramArr = ["", "", -1];

if (article) $idAutor.val(article.listaAutores[0].idPersona);

$(function () {

    $(".select2").select2();
    $('#selectTeacher').on('change', async function () {
        paramArr[2] = $(this).val();
    });

    if (article) {
        console.log("article", article);

        $articleName.val(article.titulo);
        $idAutor.val(article.listaAutores[0].idPersona);
        $description.val(article.descripcion);
        $year.val(article.anio);
        $place.val(article.congreso);
        $link.val(article.link);
        $coautors.val(article.coautores);
    }


    $('#btn-save-changes').on('click', async function () {

        if ($articleName.val() === '' || $idAutor.val() === '' || $description.val() === '' ||
            $year.val() === '' || $place.val() === '' ) {
            showNotification('alert-warning', 'Por favor complete todos los campos obligatorios <i class="fas fa-exclamation-triangle pl-2"></i>');
            return false;
        }
        //console.log("$idAutor", $idAutor.val());

        listaIdDocente.push(parseInt($idAutor.val()));

        //console.log("listaIdDocente", listaIdDocente);
        let investigation = {
            "anio": $year.val(),
            "congreso": $place.val(),
            "investigacionIn": {
                "descripcion": $description.val(),
                "link": $link.val(),
                "titulo": $articleName.val(),
                "coautores": $coautors.val(),
                "listaidDocente": listaIdDocente
            }
        };


        //console.log("investigation", investigation);



        //console.log("listTeachers", teachers);
        let response;

        if (article) {
            listaIdDocente = [];
            listaIdDocente.push(parseInt($idAutor.val()));
            //console.log("listaIdDocente", listaIdDocente);
           //console.log("listaIdDocente", listaIdDocente);
            investigationEdit = {
                "anio": $year.val(),
                "congreso": $place.val(),
                "investigacionIn": {
                    "idInvestigacion": article.idInvestigacion,
                    "descripcion": $description.val(),
                    "link": $link.val(),
                    "titulo": $articleName.val(),
                    "coautores": $coautors.val(),
                    "listaidDocente": listaIdDocente
                }
            };

            //console.log("investigationEdit", investigationEdit);
            response = await putData('investigacion/publicacion/actualizar', investigationEdit, jwt, user);
        } else {
            response = await postData(`investigacion/publicacion/guardar`, investigation, jwt, user);
            console.log("response", response);
        }

        if (response.error !== undefined && response.error !== '') {
            showNotification('alert-danger', `${response.error} <i class="fas fa-exclamation pl-2"></i>`);
        } else {
            if (response.data >= 0) {
                swal("La investigación se ha guardado correctamente!", "Presione OK para ver la lista de investigaciones registradas", "success");
            } else {
                console.log('ERROR DE API');
            }
        }

    });

    $(document).on('click', '.sweet-alert .confirm', function () {
        window.location.replace("/investigation-assistant/investigations-repository");
    })

});
