import $ from "jquery";

const menuElement = document.getElementById("menuContainer");
const deleteButton = document.getElementById("deleteButton");
const editButton = document.getElementById("editButton");

const manageAccessContainer = document.getElementById("manageAccessContainer");
const siteList = document.getElementById("siteList");

const POST_ACL_URL = "http://localhost:5001/updateAcl"

/**
 * Structure of a userdata retrieved from the database.
 * - accessSiteList: All websites where access to the userdata is authorized.
 * - data: URL to the userdata in database, ex.: "http://localhost:5001/query/resource/31d81771-d9fc-4922-87bf-5488fbf2f495"
 * - id: UUID of the data, ex.: "31d81771-d9fc-4922-87bf-5488fbf2f495"
 * - type: type of userdata, either 'image' or 'text'.
 * @typedef {Object} DataStruct
 *  @property {string[]} accessSiteList - All websites where access to the userdata is authorized.
 *  @property {string} data - URL to the userdata in database, 
 *                            ex.: "http://localhost:5001/query/resource/31d81771-d9fc-4922-87bf-5488fbf2f495"
 *  @property {string} id - UUID of the userdata, 
 *                          ex.: "31d81771-d9fc-4922-87bf-5488fbf2f495"
 *  @property {string} type - type of userdata, either 'image' or 'text'.
 */

function execAndClose(execFunction){
    return function(){
        execFunction();
        menuElement.hidden = true;
    };
}

/**
 * 
 * @param {DataStruct} data 
 */
function openAccessList(data){
    const siteFormElem = document.getElementById("siteForm");

    manageAccessContainer.hidden = false;
    
    data.accessSiteList.forEach(function(site){
        let listElem = document.createElement("li");
        listElem.innerText = site;
        siteList.appendChild(listElem);
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
            let listElem = document.createElement("li");
            listElem.innerText = newSite;
            siteList.appendChild(listElem);
        });
}

function showContextMenu(x, y, onDelete, data){
    menuElement.style.position = "absolute";
    menuElement.style.left = `${x}px`;
    menuElement.style.top = `${y}px`;

    deleteButton.onclick = execAndClose(onDelete);
    editButton.onclick = execAndClose(() => openAccessList(data));

    menuElement.hidden = false;
}

export {showContextMenu}