$( document ).ready(function() {

    var qrcode = {};
    $("e-img").each(function() {
        const source = $(this).attr("src");

        $(this).replaceWith(`<img src="${source}" ${getAttributes(this)}>`);
    });

    $("e-vid").each(function() {
        const source = $(this).attr("src");

        $(this).replaceWith(`<video ${getAttributes(this)}><source src="${source}"></video>`);
    });

    $("e-txt").each(function() {
        const source = $(this).attr("src");
        const alternativeText =  $(this).attr("alt");
        const element = this;

        $.get(source, function (data) {
            element.replaceWith(data);
          })
            .fail(function () {
                element.replaceWith(alternativeText);
            });
    });

    $("img").filter(':not([analyzed])').each(async function() {
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
                },500);
            });
        } catch (exception) {
            if (exception.message !== "Not a qrCode") throw exception;
        }
    });

    //Find all URLs leading to a stored text, and replace them by the the text.
    document.body.innerHTML = replace_urls_in_string(document.body.innerHTML, uri_to_text);

    //HTTP request used to get the text from storage.
    function uri_to_text(uri) {
        if (uri === undefined || uri.trim().length == 0) {
            console.error(`URL ${uri} is invalid.`);
            return uri;
        }

        var content;
        $.ajax({
            type: 'get',
            url: uri,
            dataType: 'text',
            async: false,
            success: function (data) {
                content = data;
            }
        });
        return content;
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