import $ from "jquery";
import './manage.css';

const exampleImgSrc = "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png";
const DB_URL = "http://localhost:5001/";
const DELETE_URL = DB_URL + "remove";
const GET_ALL_URL = DB_URL + "all";

/*
		<div class="data-container">
				<div class="data">
					 <img class="limit-size" src="https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png">
				</div>
				<div class="data-menu">
						<button type="button" class="limit-size">X</button>
				</div> 
		</div>
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

function createDataFrame(dataId, imgSrc){
    imgSrc = exampleImgSrc //TEMP

    //Data+button frame
    let container = document.createElement('div');
    container.className = "data-container";

    //Data frame
    let dataDiv = document.createElement('div');
    dataDiv.className = "data";
    let img = document.createElement('img');
    img.className = "limit-size";
    img.src = imgSrc;
    dataDiv.appendChild(img);
    container.appendChild(dataDiv);

    //Button frame
    let menuDiv = document.createElement('div');
    menuDiv.className = "data-menu";
    let button = document.createElement('button');
    button.type = "button";
    button.className = "limit-size";
    button.textContent = 'X';
    button.onclick = () => removeData(dataId, container)
    menuDiv.appendChild(button);
    container.appendChild(menuDiv);

    return container;
}

$.ajax({
    type: "GET",
    url: GET_ALL_URL,
    dataType: "json"
})
    .then(dataList => {
        dataList.forEach(data => {
            document.body.appendChild(createDataFrame(data.id, data.data));
        })
    });

