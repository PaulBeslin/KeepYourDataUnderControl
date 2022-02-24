const menuElement = document.getElementById("menuContainer");
const deleteButton = document.getElementById("deleteButton");

function execAndClose(execFunction){
    return function(){
        execFunction();
        menuElement.hidden = true;
    };
}

function showContextMenu(x, y, onDelete){
    menuElement.style.position = "absolute";
    menuElement.style.left = `${x}px`;
    menuElement.style.top = `${y}px`;

    deleteButton.onclick = execAndClose(onDelete);

    menuElement.hidden = false;
}

export {showContextMenu}