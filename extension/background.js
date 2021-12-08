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

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(null, { file: "jquery-3.5.1.min.js" }, function() {
        chrome.tabs.executeScript(null, { file: "qr.min.js" }, function() {
                chrome.tabs.executeScript({file: 'content_script-2.js'});
        });
    });
});