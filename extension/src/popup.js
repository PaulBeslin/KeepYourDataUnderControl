'use strict';

import './popup.css';
import $ from 'jquery';
import QrCode from './QrCode';
import { saveAs } from 'file-saver';

function launch(){
    let currentFile = null;
    
    $("#pickedFile").html("No File Picked");
    $("#encodeFile").attr("disabled",true);


    $("#uploadFile").on("click",e=>{
        $("#filePicker").click();
    })


    $("#filePicker").on("change", e => {
        console.log("BEFORE Data Transfer",e.target.files)

        e.target.files = new DataTransfer().files;
        
        console.log("AFTER Data Transfer",e.target.files)
        currentFile = e.target.files[0];
        $("#pickedFile").html(currentFile.name);
        $("#encodeFile").attr("disabled",false);
    });


    $("#encodeFile").on("click",e=>{
        if(currentFile){

            let form = new FormData();
            form.append("file",  currentFile, "qrCode.jpg");

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

            $.ajax(settings).done(function (response) {
                const responseJson = JSON.parse(response);

                let qrCode = new QrCode(responseJson.url);
                qrCode.encode();

                let data = qrCode.getImage();

                saveAs(data, "qrCode.jpg");
            });
        }

    })
};

launch();



console.log("POPUP LOADED");
//let qrCode = new QrCode(responseJson.url);
