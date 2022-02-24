import $ from "jquery";
import './manage.css';
import { showContextMenu } from "./menu.js";

const exampleImgSrc = "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png";
const DB_URL = "http://localhost:5001/";
const DELETE_URL = DB_URL + "remove/";
const GET_ALL_URL = DB_URL + "all";

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

/**
 * Deletes the selected data from the database,
 * and updates the view.
 * 
 * @param {number} dataId The ID in database for the data to remove
 * @param {HTMLDivElement} htmlFrame The HTML node containing the displayed data.
 */
function removeData(dataId, htmlFrame){
    //Remove the data from the view, without refreshing the whole page.
    htmlFrame.remove();

    //Remove the data from the database.
    let body = JSON.stringify({"id": dataId});
    $.ajax({
        type: "DELETE",
        url: DELETE_URL,
        data: body,
        dataType: "json"
      })
        .then(_ => {console.log(`Successfully deleted data with ID: ${dataId}`)});
}

/**
 * Data part of the data container (see createDataContainer)
 * 
 * @param {DataStruct} data The database URL from where to get the data.
 * @returns {HTMLDivElement} A div containing the data to display.
 */
function createDataFrame(data){
    //Data div
    let dataDiv = document.createElement('div');
    dataDiv.className = "data";

    let dataElem;
    switch(data.type){
        //Image data
        case "image":
            dataElem = document.createElement('img');
            dataElem.className = "limit-size";
            dataElem.src = data.data;
            break;
        case "text":
            dataElem = document.createElement('p');
            $.ajax({
                type: "GET",
                url: data.data
            })
                .then(text => {dataElem.innerText = text});
            break;
        default:
            console.error(`Could not display data type: ${data.type}`);
            dataElem = document.createElement('div');
    }

    dataDiv.appendChild(dataElem);

    return dataDiv;
}

/**
 * Menu part of the data container (see createDataContainer)
 * 
 * @param {number} dataId The ID in database for the data to display.
 *                        Used when interacting with the data.
 * @param {HTMLDivElement} container The data container, which should be removed 
*                       by clicking the Delete button.
 * @returns {HTMLDivElement} A div containing the menu options
 */
function createMenuButton(dataId, container){
    //Menu div
    let menuDiv = document.createElement('div');
    menuDiv.className = "data-menu";

    //Button
    let button = document.createElement('button');
    button.type = "button";
    button.className = "limit-size";
    button.textContent = '...';
    //button.onclick = () => removeData(dataId, container)
    button.onclick = (event) => showContextMenu(event.clientX, event.clientY,
        function(){removeData(dataId, container); }
    );

    menuDiv.appendChild(button);

    return menuDiv;
}

/**
 * Creates an HTML node to display the provided data.
 * 
 * @param {DataStruct} data Information about the data to display. 'data.id' allows to interact with the data,
 *                        and 'data.data' to get the data itself.
 * @returns {HTMLDivElement} An HTML node representing the data and options to interact with it.
 */
function createDataContainer(data){
    //Data+button frame
    let container = document.createElement('div');
    container.className = "data-container";

    //Data frame
    container.appendChild(createDataFrame(data));

    //Button frame
    container.appendChild(createMenuButton(data.id, container));

    return container;
}

const gridElement = document.getElementById("dataGrid");

$.ajax({
    type: "GET",
    url: GET_ALL_URL,
    dataType: "json"
})
    .then(dataList => {
        dataList.forEach(data => {
            gridElement.appendChild(createDataContainer(data));
        })
    });

