'use strict';

import $ from "jquery";
import QrCode from './QrCode';
import jquery from "jquery";
import { encode_text_url } from "./text_encoding.js";

'use strict';

//Receives messages from the background.js script.
chrome.runtime.onMessage.addListener(
    (request, sender, sendEncodingRequest) => processInput(request)
)

async function processInput(input) {
    //If no data was acquired, something went wrong.
    if (input.type === undefined || input.selection === undefined) {
        console.error("Tried to process an invalid input.");
        return;
    }

    //Store the data, and get the encoded URI.
    let url = await storeData(input.type, input.selection);

    //Encode the URI, get a decorated text or a QR code.
    let encodedData = await encodeUrl(input.type, url);

    //Replace the data in the HTML container by the encoded URI.
    let $container = findContainer(input.type, input.selection);
    replaceInPage(input.type, encodedData, $container);
}

async function storeData(type, data) {
    let blob;
    let metadata;
    let file;
    let responseURL;
    let form = new FormData();

    switch (type) {
        case 'text':
            // We convert our text as a file
            blob = new Blob([data], { type: "text/plain;charset=utf-8" });
            form.append("file", blob, "tmp.txt");
            break;
        case 'image':
            let response = await fetch(data);
            blob = await response.blob();
            file = new File([blob], "tmp.jpg", { type: 'image/jpeg' });
            form.append("file", file, "tmp.jpg");
            break;
        case 'blob':
            metadata = { type: 'image/jpeg' };
            file = new File([data], "tmp.jpg", metadata);
            form.append("file", file, "tmp.jpg");
            break;
        default:
            throw 'Input type is not supported';
    }
    let settings = {
        // This url need to be changed to your own self storage
        "url": "http://localhost:5001/",
        "method": "POST",
        "crossOrigin": true,
        "timeout": 0,
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false,
        "data": form, //????????????????????????????????????????????????
        "async": false
    };
    responseURL = await $.ajax(settings);
    return JSON.parse(responseURL).url;
}

async function encodeUrl(type, url) {
    switch (type) {
        case 'text':
            return encode_text_url(url);
        case 'image':
            let qrCode = new QrCode(url);
            qrCode.encode();
            let img = qrCode.getImage();
            let qrUrl = await storeData('blob', img);
            return qrUrl;
        default:
            throw 'Input type is not supported';
    }
}

function findContainer(type, post) {
    let $baseContainer = $(':focus');
    switch (type) {
        case 'text':
            //The focused element is the correct input element (at least on LinkedIn).
            return $baseContainer;
        case 'image':
            //We need to find an img element with the same source as the selected image.
            return $baseContainer.find("img[src='" + post + "']");
        default:
            throw 'Input type is not supported';
    }
}

function replaceInPage(type, encodedData, $container) {
    switch (type) {
        case 'text':
            $container.text(encodedData);
            break;
        case 'image':
            console.log("IMAGE")
            $container.attr('src', encodedData);
            let item = document.querySelector("#image-sharing-detour-container__file-input");
            if(item){
                item.setAttribute("value",encodedData);
                console.log("FOUND ITEM")
            }
            break;
        default:
            throw 'Input type is not supported';
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
//const linkedinButtonTag = ".share-actions__primary-action";
const linkedinButtonTag = ".artdeco-button--2";
const linkedinTextboxTag = "div.ql-editor";

//Works for standard forms.
$("form").find("*[type=submit]").click(onFormSubmit);

function onFormSubmit(event) {
    event.preventDefault(); //this works for links
    let element = event.target.parentElement;

    while (!(element.nodeName === 'FORM')) {
        element = element.parentElement;
    }
    processForm(element);
}


async function processForm(html_form) {
    let form_data = new FormData();
    await parseForm(html_form, form_data);
    restoreForm(html_form, form_data);
    html_form.submit();
}


async function parseForm(form_html, form_data) {
    // For each input of the form

    $(form_html).find("input").each(async function () {
        // We create a new js form
        let form = new FormData();
        let type;

        // Our following actions depend of the input type
        switch ($(this).attr('type')) {
            case 'text':
                // We convert our text as a file
                let blob = new Blob([this.value], {
                    type: "text/plain;charset=utf-8"
                });
                // We add our text file in our js form
                form.append("file", blob, "tmp.txt");
                type = "text";
                break;

            case 'file':
                // We add the file in our js form with the correct name for the API. File name will always be tmp
                form.append("file", this.files[0], "tmp.jpg");
                type = "image";
                break;

            default:
                throw 'Input type is not supported'
        }

        if (type === "image") {
            const inputName = $(this).attr('name');
            let settings = {
                // This url need to be changed to your own self storage
                "url": "http://localhost:5001/",
                "method": "POST",
                "timeout": 0,
                "processData": false,
                "mimeType": "multipart/form-data",
                "contentType": false,
                "data": form,
                "async": false
            };

            await $.ajax(settings).done(await async function (response) {
                const responseJson = JSON.parse(response);

                let data;
                // If the data self stored was an image we call the QrCode class to generate a qrcode
                // with the link to the ressource
                if (type === "image") {
                    let qrCode = new QrCode(responseJson.url);

                    qrCode.encode();
                    data = qrCode.getImage();
                    console.log("Image Encoded ", data);

                    // We set the form data with the new value generated
                    form_data.set(inputName, data);
                } // If the data self stored was a text we return the decorated url (check text_encoding.js)
                else if (type === "text") {
                    data = responseJson.url;
                    data = encode_text_url(data);
                    form_data.set(inputName, data);
                }

            });
        }
    });

}

// This function will create a new fileList from an array of file
function FileListItems(files) {
    let b = new ClipboardEvent("").clipboardData || new DataTransfer()
    for (let i = 0, len = files.length; i < len; i++) b.items.add(files[i])
    return b.files
}

// For todays date;
Date.prototype.today = function () {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "-" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "-" + this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + "_" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + "_" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}

async function dataUrlToFile(dataUrl, fileName, mimeType) {
    const res = await axios(dataUrl);
    const blob = res.data;
    return new File([blob], fileName, {
        type: mimeType
    });
}

function restoreForm(form, formData) {
    // Here for each element of the form we will replace the current value by the value present in our formData
    $(form).find("input").each(function () {
        const inputName = $(this).attr('name');
        switch ($(this).attr('type')) {
            case 'text':
                //Replace the value in the input by the URL to the stored file.
                let url = formData.get(inputName);
                $(this).val(url);
                break;
            case 'file':
                let newDate = new Date();
                let filename = "selfStored-" + newDate.today() + "-at-" + newDate.timeNow() + ".png";
                var files = [
                    new File([formData.get(inputName)], filename, {
                        type: "img/png",
                    })
                ];
                this.files = new FileListItems(files);
                break;
            default:
                throw 'Input type is not supported'
        }
    });
}