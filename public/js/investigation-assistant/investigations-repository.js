import { createDataTable } from "/utils/data-table.js";
import { getData, postData, putData } from "/utils/fetch.js";
import { showNotification } from "/utils/notifications.js";

let articlesDataTable = undefined;

$(function () {


    // Se carga el dataTable


    //console.log("articles", articles);
    loadArticles();

    let idArticle = undefined;
    let nameArticleSelected = undefined;

    $(document).on('click', '.articles-row', function () {
        console.log("IMPRIMIENDO EL ARTICULO: ", idArticle);
        if (idArticle !== undefined && idArticle == $(this).attr('id')) {
            $(`#${idArticle}`).removeClass('article-selected');
            idArticle = undefined;
        } else {
            $(`#${idArticle}`).removeClass('article-selected');
            idArticle = $(this).attr('id');
            nameArticleSelected = $(this).children().eq(1).html();
            $(this).addClass("article-selected");
        }
    });

    $('#edit-investigation-modal').on('click', function () {
        if (idArticle) {
            let id = idArticle.split('-')[1];
            window.location.replace(`/investigation-assistant/register-investigation?idArticle=${id}`);
        } else {
            showNotification('alert-warning', 'Necesita seleccionar un artículo <i class="fas fa-exclamation-triangle pl-2"></i>');
        }
    });

    $('#delete-article-modal').on('click', function () {
        //console.log("idArticle", idArticle);
        if (idArticle) {
            $('#deleteArticleModal').modal('show');
        } else {
            showNotification('alert-warning', 'Necesita seleccionar un artículo <i class="fas fa-exclamation-triangle pl-2"></i>');
        }
    });

    $('#delete-article').on('click', async function () {
        if (idArticle) {
            let id = idArticle.split('-')[1];
            let investigation = {
                "estado": false,
                "investigacionIn": {
                    "idInvestigacion": id
                }
            };

            let data = await putData('investigacion/publicacion/actualizar', investigation, jwt, user);
            //console.log("data", data);
            //console.log("id", id);
            if (data.data == id) {
                articles = await getData(`investigacion/publicacion/listar?tamanioPag=1000`, jwt);
                articles = articles.data;
                loadArticles();
                $('#deleteArticleModal').trigger('click');
                swal("¡El artículo se ha eliminado correctamente!", "Te recordamos que es una eliminación lógica", "success");
                idArticle = undefined;
            } else {
                console.log('Ocurrió un error');
            }
        } else {
            console.log('Ocurrió un error');
        }
    });

    $('#nameArticleInput').on('change', async function () {
        let nameArticleInput = $('#nameArticleInput').val();
        //console.log("nameArticleInput", nameArticleInput);
        articles = await getData(`investigacion/publicacion/listar?tamanioPag=1000&nombre=${nameArticleInput}`, jwt);
        articles = articles ? articles.data : [];
        //console.log("articles", articles);
        await loadArticles();
    });
});


async function loadArticles() {
    for (let i = 0; i < articles.length; i++) {
        let autores = "";
        for (let j = 0; j < articles[i].listaAutores.length; j++)
            autores += articles[i].listaAutores[j].nombreCompleto + '\n';
        articles[i].nombres = autores;
    }
    if (articlesDataTable) articlesDataTable.destroy();
    let options = {
        idTable: "articles-data-table",
        data: articles,
        fields: [
            "titulo",
            "nombres",
            "anio",
        ],
        name: "Artículos",
        idName: "idInvestigacion",
        className: "articles-row",
        addButtons: false,
    };
    articlesDataTable = createDataTable(options);
    $("#articles-data-table_wrapper").children().first().remove();
}
