$(window).on("load", function () {
    //$(document).ready(function () {

    var qrcode = {};
    $("e-img").each(function () {
        const source = $(this).attr("src");

        $(this).replaceWith(`<img src="${source}" ${getAttributes(this)}>`);
    });

    $("e-vid").each(function () {
        const source = $(this).attr("src");

        $(this).replaceWith(`<video ${getAttributes(this)}><source src="${source}"></video>`);
    });

    $("e-txt").each(function () {
        const source = $(this).attr("src");
        const alternativeText = $(this).attr("alt");
        const element = this;

        $.get(source, function (data) {
            element.replaceWith(data);
        })
            .fail(function () {
                element.replaceWith(alternativeText);
            });
    });

    $("img").filter(':not([analyzed])').each(async function () {
        const source = $(this).attr("src");

        let qrCode = new QrCode(undefined, source);

        try {
            //Check If Image URL exists
            $(this).fadeTo("fast", 0, () => {

                qrCode.decode();
                setTimeout(() => {
                    const newSource = qrCode.getLink();
                    if (newSource) {
                        $(this).attr("src", newSource);
                        $(this).attr("analyzed", '');
                        $(this).fadeTo("fast", 1);
                    }
                }, 500);
            });
        } catch (exception) {
            if (exception.message !== "Not a qrCode") throw exception;
        }
    });
    
    //Find all URLs leading to a stored text, and replace them by the the text.
    //TODO: Test with $(":contains(...)")
    $("span").each(async function () {
        replace_urls_async($(this).text(), uri_to_text_async)
            .then((newText) => {
                if ($(this).text() != newText) {
                    $(this).text(newText);
                }
            });
    })
    
    /*replace_urls_async(document.body.innerHTML, uri_to_text_async)
        .then((newText) => {
            document.body.innerHTML = newText;
            console.log("Avant: " + document.body.innerHTML);
            console.log("Apres: " + newText);
        });*/
    
    //sync HTTP request used to get the text from storage.
    function uri_to_text(uri) {
        if (uri === undefined || uri.trim().length == 0) {
            console.error(`URL ${uri} is invalid.`);
            return uri;
        }

        var content;
        $.ajax({
            type: 'GET',
            url: uri,
            dataType: 'text',
            async: false,
            success: function (data) {
                content = data;
            }
        });
        return content;
    }

    //async HTTP request used to get the text from storage.
    async function uri_to_text_async(uri) {
        let response = await fetch(uri);
        let data = await response.text();
        return data;
    }
});


function getAttributes ( element ) {
    const attributes = element.attributes;
    let string = "";

    for (const attr of attributes) {
        if (attr.value) string += `${attr.name}=${attr.value} `;
        else string += `${attr.name} `;
    }
    return string;
}