'use strict';
import $ from "jquery";
import { replace_urls_async } from "./text_encoding";
const {
  default: Qrcode
} = require("./QrCode");
require("./contentScript_2");

$(window).on("load", function () {


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