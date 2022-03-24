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

const BASE_URL = "http://localhost:5001/";


$(window).on("load", async function () {

  window.addEventListener("message", (event) => {

    if (event.source != window)
      return;

    if (event.data.type && event.data.type == "Encode_Image") {

      //Preparing Reuest Params
      let form = new FormData();
      form.append("file", event.data.file, "qrCode.jpg");

      //Launching Encoding Reuest
      $.ajax({
          // This url need to be changed to your own self storage
          "url": BASE_URL,
          "method": "POST",
          "timeout": 0,
          "processData": false,
          "mimeType": "multipart/form-data",
          "contentType": false,
          "data": form,
        })
        .done((response) => {

          //Image Encoding
          const responseJson = JSON.parse(response);

          const qrCode = new QrCode(responseJson.url);
          qrCode.encode();

          const data = qrCode.getImage();

          //Image Replacement
          const finalFile = new File([data], 'qrCode.jpg', {
            type: 'image/jpg'
          });

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(finalFile);
          document.querySelector('input[type=file]').files = dataTransfer.files;

        })
        .fail((jqXHR, textStatus, errorThrown) => {
          console.log("Image Encoding Failed");
        })
    }
  }, false);

  async function script() {
    // your main code here
    Element.prototype._addEventListener = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function (a, b, c) {
      if (c == undefined) c = false;

      if (!this.eventListenerList) this.eventListenerList = {};
      if (!this.eventListenerList[a]) this.eventListenerList[a] = [];

      if (a == "change") {

        let eventListener = e => {

          if ((this.nodeName.toLowerCase() == 'input' && this.type.toLowerCase() == "file") || (this.querySelector('input[type=file]'))) {

            window.postMessage({
              type: "Encode_Image",
              file: e.target.files[0]
            }, "*");

            setTimeout(() => {
              this.eventListenerList.change[1].listener(e);
            }, 1000);

          } else {
            this.eventListenerList.change[1].listener(e);
          }
        }

        this._addEventListener(a, eventListener, c);
        this.eventListenerList[a].push({
          listener: eventListener,
          options: c
        });

        this.eventListenerList[a].push({
          listener: b,
          options: c
        });

      } else {
        this._addEventListener(a, b, c);
        this.eventListenerList[a].push({
          listener: b,
          options: c
        });
      }
    };
  }

  function inject(fn) {
    var doc = window.top.document;
    const script = doc.createElement('script');
    script.text = `(${fn.toString()})();`
    doc.documentElement.appendChild(script);
  }

  inject(script);


  //Mutation Observer
  const targetNode = document.body;
  const config = {
    childList: true,
    subtree: true
  };

  let INJECTED = false;
  const callback = function (mutationsList, observer) {

    if (!INJECTED && mutationsList.length > 0 && document.querySelector('input[type=file]')) {
      async function script_3() {
        console.log("INJECTED 3");
        let currentNode = window.top.document.querySelector('input[type=file]');
        let currentListener = document.querySelector('input[type=file]').onchange;
        if (currentListener) {
          currentNode.onchange = null;
          currentNode.addEventListener("change", currentListener, false);
        }
      }

      inject(script_3);
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);



  console.log("BEFORE");

  // Image Handler
  document.querySelectorAll("img:not([analyzed])").forEach(async (node) => {

    var qrCode = new Qrcode(null, node.getAttribute("src"));
    try {
      await qrCode.decode();
      if (qrCode.link) {
        console.log("YOUR CURRENT URL", qrCode.link);
        let accessURL = await tryGetResourceURL(qrCode.link);

        console.log("YOUR CURRENT URL", accessURL);

        node.setAttribute("src", accessURL);
        node.setAttribute("analyzed", '');
        node.addEventListener("click", () => {
          setTimeout(function () {
            //TO REMOVE
            let currentImg = document.querySelector("img:not([analyzed])");
            currentImg.setAttribute("src", accessURL);
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
  /*function uri_to_text(uri) {
    if (uri === undefined || uri.trim().length == 0) {
      console.error(`URL ${uri} is invalid.`);
      return uri;
    }

    var content;
    $.ajax({
      type: 'GET',
      url: accessURL,
      dataType: 'text',
      async: false,
      success: function (data) {
        content = data;
      }
    });
    return content;
  }*/

  //async HTTP request used to get the text from storage.
  async function uri_to_text_async(uri) {
    let accessURL = await tryGetResourceURL(uri);
    let response = await fetch(accessURL);
    let data = await response.text();
    return data;
  }

  async function tryGetResourceURL(url) {
    const body = JSON.stringify({
      "site": location.host
    });

    const result = await $.ajax({
      type: "POST",
      url: url,
      data: body,
      dataType: "json"
    });

    return result.url;
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