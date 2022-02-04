'use strict';
var $ = require("jquery")
import {
  replace_urls_async
} from "./text_encoding";
const {
  default: Qrcode
} = require("./QrCode");
import QrCode from './QrCode';
require("./contentScript_2");


$(window).on("load", async function () {

  window.addEventListener("message", (event) => {

    if (event.source != window)
      return;

    if (event.data.type && event.data.type == "Encode_Image") {

      //Preparing Reuest Params
      let form = new FormData();
      form.append("file", event.data.file, "qrCode.jpg");
      let settings = {
        // This url need to be changed to your own self storage
        "url": "http://localhost:5001/",
        "method": "POST",
        "timeout": 0,
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false,
        "data": form,
      };

      //Launching Encoding Reuest
      $.ajax(settings).done(function (response) {

        //Image Encoding
        const responseJson = JSON.parse(response);
        
        const qrCode = new QrCode(responseJson.url);
        qrCode.encode();

        const data = qrCode.getImage();
        
        //Image Replacement
        const finalFile = new File([data], 'qrCode.jpg', {type: 'image/jpg'});
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(finalFile);
        document.querySelector('input[type=file]').files = dataTransfer.files;

      });

    }
  }, false);

  async function script() {

    // your main code here
    Element.prototype._addEventListener = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function (a, b, c) {
      if (c == undefined) c = false;

      if (this.nodeName.toLowerCase() == 'input' && this.type.toLowerCase() == "file" && a == "change" && (!this.eventListenerList || !this.eventListenerList.change)) {

        if (!this.eventListenerList) this.eventListenerList = {};
        this.eventListenerList[a] = [];

        this.addEventListener("change", e => {

          window.postMessage({
            type: "Encode_Image",
            file: e.target.files[0],
          }, "*");

          setTimeout(() => {
            document.querySelector('input[type=file]').eventListenerList.change[1].listener(e);
          }, 1000);

        }, false);

      } else {
        this._addEventListener(a, b, c);
      }

      if (!this.eventListenerList) this.eventListenerList = {};
      if (!this.eventListenerList[a]) this.eventListenerList[a] = [];
      this.eventListenerList[a].push({
        listener: b,
        options: c
      });
    };

  }

  function inject(fn) {
    var doc = window.top.document;
    const script = doc.createElement('script')
    script.text = `(${fn.toString()})();`
    doc.documentElement.appendChild(script);
  }

  inject(script);


  // Image Handler
  document.querySelectorAll("img:not([analyzed])").forEach(async (node) => {

    var qrCode = new Qrcode(null, node.getAttribute("src"));
    try {
      await qrCode.decode();
      if (qrCode.link) {
        node.setAttribute("src", qrCode.link);
        node.setAttribute("analyzed", '');
        node.addEventListener("click", () => {
          setTimeout(function () {
            let currentImg = document.getElementsByClassName("artdeco-modal__content")[0].querySelector("img:not([analyzed])");
            currentImg.setAttribute("src", qrCode.link);
            currentImg.setAttribute("analyzed", '');
          }, 500);
        });
      }
    } catch (exception) {
      if (exception.message !== "Not a qrCode") throw exception;
    }
  });


  // Text Handler
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


function getAttributes(element) {
  const attributes = element.attributes;
  let string = "";

  for (const attr of attributes) {
    if (attr.value) string += `${attr.name}=${attr.value} `;
    else string += `${attr.name} `;
  }
  return string;
}