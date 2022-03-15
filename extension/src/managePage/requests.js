import $ from "jquery";

const DB_URL = "http://localhost:5001/";

const DELETE_RESOURCE_URL = DB_URL + "remove/";
const GET_ALL_RESOURCES_URL = DB_URL + "all";
const ADD_ACL_URL = DB_URL + "addAcl";
const REMOVE_ACL_URL = DB_URL + "removeAcl";
const GET_RESOURCE_URL = DB_URL + "query/resource/";

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
 * Removes the userdata from the database.
 * 
 * @param {string} id ID of the userdata to remove
 * @returns Result of the '$.ajax()' call
 */
function removeDataFromDB(id){
    let body = JSON.stringify({"id": id});

    return $.ajax({
        type: "DELETE",
        url: DELETE_RESOURCE_URL,
        data: body,
        dataType: "json"
    });
}

/**
 * Gets all stored userdata.
 * 
 * @returns Result of the '$.ajax()' call
 */
function getAllDataFromDB(){
    return $.ajax({
        type: "GET",
        url: GET_ALL_RESOURCES_URL,
        dataType: "json"
    });
}

/**
 * Adds a new site to the ACL of the given userdata.
 * 
 * @param {string} id ID of the userdata to edit.
 * @param {string} site New site to add
 * @returns Result of the '$.ajax()' call
 */
function addAccessInDB(id, site){
    const body = JSON.stringify({
        "id": id,
        "access_site": site
    });
    
    return $.ajax({
        type: "POST",
        url: ADD_ACL_URL,
        data: body,
        dataType: "json"
    });
}

/**
 * Removes a site from the ACL of the given userdata.
 * 
 * @param {string} id ID of the userdata to edit.
 * @param {string} site Site to remove
 * @returns Result of the '$.ajax()' call
 */
function removeAccessInDB(id, site){
    const body = JSON.stringify({
        "id": id,
        "access_site": site
    });
    
    return $.ajax({
        type: "DELETE",
        url: REMOVE_ACL_URL,
        data: body,
        dataType: "json"
    });
}

/**
 * Returns all sites that have access to the given userdata.
 * 
 * @param {string} id ID of the userdata to edit.
 * @returns {string[]} List of access granted to the userdata.
 */
function getDataACLFromDB(id){
    return getAllDataFromDB()
        .then(dataList => dataList.find(data => data.id === id))
        .then(data => {return data.accessSiteList; });
}

export {removeDataFromDB, getAllDataFromDB, addAccessInDB, removeAccessInDB, getDataACLFromDB}
export{GET_RESOURCE_URL};