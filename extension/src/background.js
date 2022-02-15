console.log("BACKGROUND LOADED");

//If more context menus need to be created, another JSON key/value pair
//could be used to provide information on which action is expected.
function sendEncodingRequest(info, tab) {
    let dataType = undefined;
    let data = undefined;

    //Process a text.
    if (info.selectionText) {
        dataType = "text"; //enum?
        data = info.selectionText;
    }
    //Process an image (TODO: video).
    else if (info.mediaType) {
        dataType = "image"; //enum?
        data = info.srcUrl;
    }
    //Send captured data.
    chrome.tabs.sendMessage(tab.id, {
        type: dataType,
        selection: data
    });
}

//https://stackoverflow.com/a/61038472
chrome.contextMenus.create({
    title: "Store and encode",
    contexts: ["selection", "image"],
    id: "encode"
});

chrome.contextMenus.onClicked.addListener(sendEncodingRequest);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log("PAGE UPDATED");
    var title = changeInfo.title;

    if (title !== undefined) {
        console.log("REALLY UPDATED");
    }
})
