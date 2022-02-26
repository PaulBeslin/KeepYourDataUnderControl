import $ from "jquery";

/**
 * @typedef {import('./manage.js').DataStruct} DataStruct
 */

const menuElement = document.getElementById("menuContainer");

const POST_ACL_URL = "http://localhost:5001/updateAcl"

function execAndClose(execFunction){
    return function(){
        execFunction();
        menuElement.hidden = true;
    };
}

/**
 * Appends a new row to the <ul> element containing all access granted to the userdata.
 * @param {string} site Domain from where the userdata can be accessed - ex: www.google.com
 */
function appendACLItem(site){
    const siteList = document.getElementById("siteList");

    let listElem = document.createElement("li");
    listElem.innerText = site;
    siteList.appendChild(listElem);
}

/**
 * 
 * @param {DataStruct} data 
 */
function openAccessList(data){
    const siteFormElem = document.getElementById("siteForm");

    document.getElementById("manageAccessContainer").hidden = false;
    
    document.getElementById("siteList").innerHTML = "";
    data.accessSiteList.forEach(function(site){
        appendACLItem(site);
    })

    siteFormElem.addEventListener("submit", (e) => {onAccessGranted(e, data); return false;});
}

/**
 * 
 * @param {DataStruct} data 
 */
function onAccessGranted(e, data){
    e.preventDefault();

    const siteInputElem = document.getElementById("siteInput");
    const newSite = siteInputElem.value;

    const body = JSON.stringify({
        "id": data.id,
        "access_site": [
            ...data.accessSiteList,
            newSite
        ]
    });
    
    $.ajax({
        type: "POST",
        url: POST_ACL_URL,
        data: body,
        dataType: "json"
      })
        .then(_ => {
            console.log(`Successfully updated ACL for data with ID: ${data.id}`);
            appendACLItem(newSite);
        });
}

function showContextMenu(x, y, onDelete, data){
    menuElement.style.position = "absolute";
    menuElement.style.left = `${x}px`;
    menuElement.style.top = `${y}px`;

    document.getElementById("deleteButton").onclick = execAndClose(onDelete);
    document.getElementById("editButton").onclick = execAndClose(() => openAccessList(data));

    menuElement.hidden = false;
}

export {showContextMenu}