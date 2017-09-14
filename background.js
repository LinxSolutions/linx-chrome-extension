var BASE_URL = 'https://28905a73.ngrok.io';

chrome.runtime.onInstalled.addListener(function (object) {
    if (chrome.runtime.OnInstalledReason.INSTALL === object.reason){
        chrome.tabs.create({url: BASE_URL+"/signup"}, function (tab) {
            console.log("new tab launched");
        });
    }
});
