import { addAccessInDB, removeAccessInDB, getDataACLFromDB } from "./requests.js";

/**
 * @typedef {import('./requests.js').DataStruct} DataStruct
 */

const menuElement = document.getElementById("menuContainer");

/**
 * Provides a quick way to append menu hiding to a handler.
 * 
 * @param {() => void} execFunction 
 * @returns {() => void} A new handler, which includes the given handler first.
 */
function execAndClose(execFunction){
    return function(){
        execFunction();
        menuElement.hidden = true;
    };
}

/**
 * Appends a new row to the <ul> element containing all access granted to the userdata.
 * 
 * @param {string} site Domain from where the userdata can be accessed - ex: www.google.com
 */
function appendACLItem(site, dataId){
    const siteList = document.getElementById("siteList");
    const listElem = document.createElement("li");

    //Remove button
    const removeElem = document.createElement("button");
    removeElem.textContent = "×";
    removeElem.onclick = () => onAccessRemoved(dataId, site, listElem);
    listElem.appendChild(removeElem);
    
    //Domain name
    const nameElem = document.createElement("span");
    nameElem.innerText = site;
    listElem.appendChild(nameElem);

    siteList.appendChild(listElem);
}

/**
 * Opens a window displaying all sites that have access to the selected userdata.
 * It allows the user to add or remove sites.
 * 
 * @param {string} dataId ID of the edited userdata.
 */
function openAccessList(dataId){
    const siteFormElem = document.getElementById("siteForm");
    
    //Display all sites authorized yet.
    document.getElementById("siteList").innerHTML = "";
    getDataACLFromDB(dataId).then(accessSiteList => {
        accessSiteList.forEach(function(site){
            appendACLItem(site, dataId);
        })
    });

    //Trigered when a domain is added via the input.
    siteFormElem.addEventListener("submit", (e) => {
        e.preventDefault();
        onAccessGranted(dataId); 
        return false;
    });

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
 * Called when the user wants to grant access to a site for one of the userdata.
 * It edits the ACL in the database and updates the display.
 * 
 * @param {string} dataId ID of the edited userdata.
 */
function onAccessGranted(dataId){
    //Retrieve the site typed in the input bar and reset it.
    const siteInputElem = document.getElementById("siteInput");
    const siteFormElem = document.getElementById("siteForm");

    const newSite = siteInputElem.value;
    siteFormElem.reset();

    addAccessInDB(dataId, newSite).then(_ => {
        console.log(`Successfully updated ACL for data with ID: ${dataId}`);
        appendACLItem(newSite, dataId);
    });
}

/**
 * Called when the user wants to remove access to a site for one of the userdata.
 * It edits the ACL in the database and updates the display.
 * 
 * @param {string} dataId ID of the edited userdata.
 * @param {string} site Site to remove from the ACL.
 * @param {HTMLElement} container Corresponding DOM element which should be removed.
 */
function onAccessRemoved(dataId, site, container){
    removeAccessInDB(dataId, site).then(_ => {
        console.log(`Successfully updated ACL for data with ID: ${dataId}`);
        container.remove();
    });
}

function showContextMenu(x, y, onDelete, dataId){
    //Opens the menu at the click position.
    menuElement.style.position = "absolute";
    menuElement.style.left = `${x}px`;
    menuElement.style.top = `${y}px`;

    //Feel free to add options here (corresponding DOM elements must be created first in manage.html).
    document.getElementById("deleteButton").onclick = execAndClose(onDelete);
    document.getElementById("editButton").onclick = execAndClose(() => openAccessList(dataId));

    menuElement.hidden = false;
}

export {showContextMenu}