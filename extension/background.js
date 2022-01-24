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
        message: "contextMenuClicked",
        type: dataType,
        selection: data
    });
}

function sendInterceptedHttpRequest(details) {
    if(details.url.includes("feedshare-uploadedImage") && details.requestHeaders.find(h => h.name === "doNotBlock") === undefined){
        //Send captured request.
        chrome.tabs.sendMessage(details.tabId, {
            message: "requestIntercepted",
            requestDetails: details
        });
        return {cancel: true};
    }
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
/*
chrome.webRequest.onBeforeRequest.addListener(
    sendInterceptedHttpRequest,
    { urls: ["<all_urls>"] },
    ["requestBody", "blocking"]
);*/

chrome.webRequest.onBeforeSendHeaders.addListener(
    sendInterceptedHttpRequest,
    { urls: ["<all_urls>"] },
    ["requestHeaders", "blocking"]
);
