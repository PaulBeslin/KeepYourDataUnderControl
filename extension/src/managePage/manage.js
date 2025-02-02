import $ from "jquery";
import './manage.css';
import { showContextMenu } from "./menu.js";
import { removeDataFromDB, getAllDataFromDB } from "./requests.js";
import {GET_RESOURCE_URL} from './requests.js';

/**
 * @typedef {import('./requests.js').DataStruct} DataStruct
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
    removeDataFromDB(dataId).then(_ => {console.log(`Successfully deleted data with ID: ${dataId}`)});
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
            dataElem.src =  GET_RESOURCE_URL + data.id;
            break;
        case "text":
            dataElem = document.createElement('p');
            $.ajax({
                type: "GET",
                url: GET_RESOURCE_URL + data.id
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
 * @param {DataStruct} data Information about the selected data.
 * @param {HTMLDivElement} container The data container, which should be removed 
*                       by clicking the Delete button.
 * @returns {HTMLDivElement} A div containing the menu options
 */
function createMenuButton(data, container){
    //Menu div
    let menuDiv = document.createElement('div');
    menuDiv.className = "data-menu";

    //Button
    let button = document.createElement('button');
    button.type = "button";
    button.className = "limit-size";
    button.textContent = '...';
    button.onclick = (event) => showContextMenu(event.clientX, event.clientY,
        function(){removeData(data.id, container); },
        data.id
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
    container.appendChild(createMenuButton(data, container));

    return container;
}

const gridElement = document.getElementById("dataGrid");

getAllDataFromDB().then(
    dataList => {
        dataList.forEach(data => {
            gridElement.appendChild(createDataContainer(data));
        })
    }
);

