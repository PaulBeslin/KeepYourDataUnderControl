import $ from "jquery";
import './manage.css';

const exampleImgSrc = "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png";
const DB_URL = "http://localhost:5001/";
const DELETE_URL = DB_URL + "remove";
const GET_ALL_URL = DB_URL + "all";


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
    let body = new FormData();
    body.append("id", dataId);
    $.ajax({
        type: "DELETE",
        url: DELETE_URL,
        data: body,
        processData: false
      })
        .then(res => {console.log("SUCCESS")});
}

/**
 * Data part of the data container (see createDataContainer)
 * 
 * @param {string} imgSrc The database URL from where to get the data.
 * @returns {HTMLDivElement} A div containing the data to display.
 */
function createDataFrame(imgSrc){
    imgSrc = exampleImgSrc //TEMP

    //Data div
    let dataDiv = document.createElement('div');
    dataDiv.className = "data";

    //Image data
    let img = document.createElement('img');
    img.className = "limit-size";
    img.src = imgSrc;

    dataDiv.appendChild(img);

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
    button.textContent = 'X';
    button.onclick = () => removeData(dataId, container)

    menuDiv.appendChild(button);

    return menuDiv;
}

/**
 * Creates an HTML node to display the provided data.
 * 
 * @param {number} dataId The ID in database for the data to display.
 *                        Used when interacting with the data.
 * @param {string} imgSrc The database URL from where to get the data.
 * @returns {HTMLDivElement} An HTML node representing the data and options to interact with it.
 */
function createDataContainer(dataId, imgSrc){
    //Data+button frame
    let container = document.createElement('div');
    container.className = "data-container";

    //Data frame
    container.appendChild(createDataFrame(imgSrc));

    //Button frame
    container.appendChild(createMenuButton(dataId, container));

    return container;
}




$.ajax({
    type: "GET",
    url: GET_ALL_URL,
    dataType: "json"
})
    .then(dataList => {
        dataList.forEach(data => {
            document.body.appendChild(createDataContainer(data.id, data.data));
        })
    });

