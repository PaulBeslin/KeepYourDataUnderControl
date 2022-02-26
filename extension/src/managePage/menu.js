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
function appendACLItem(site, data){
    const siteList = document.getElementById("siteList");

    const listElem = document.createElement("li");

    //Remove button
    const removeElem = document.createElement("button");
    removeElem.textContent = "×";
    removeElem.onclick = () => onAccessRemoved(data, site, listElem);
    listElem.appendChild(removeElem);
    
    //Domain name
    const nameElem = document.createElement("span");
    nameElem.innerText = site;
    listElem.appendChild(nameElem);

    siteList.appendChild(listElem);
}

/**
 * 
 * @param {DataStruct} data 
 */
function openAccessList(data){
    const siteFormElem = document.getElementById("siteForm");
    
    //Display all sites authorized yet.
    document.getElementById("siteList").innerHTML = "";
    data.accessSiteList.forEach(function(site){
        appendACLItem(site, data);
    })

    //Trigered when a domain is added via the input.
    siteFormElem.addEventListener("submit", (e) => {onAccessGranted(e, data); return false;});

    //Setting up the ACL window as a dialog.
    const modal = document.getElementById("myModal");
    modal.style.display = "block";
    document.getElementById("close-modal").onclick = function(){
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
    }
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
            appendACLItem(newSite, data);
        });
}

/**
 * 
 * @param {DataStruct} data 
 * @param {*} site 
 */
function onAccessRemoved(data, site, container){
    const newACL = data.accessSiteList.filter((value, _) => value !== site);

    const body = JSON.stringify({
        "id": data.id,
        "access_site": newACL
    });
    
    $.ajax({
        type: "POST",
        url: POST_ACL_URL,
        data: body,
        dataType: "json"
      })
        .then(_ => {
            console.log(`Successfully updated ACL for data with ID: ${data.id}`);
            container.remove();
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