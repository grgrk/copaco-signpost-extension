console.log("background script hello")

var imagingHelperTabsInfo = []

chrome.runtime.onMessage.addListener(receiveMessage)

function receiveMessage(msg, sender, sendResponse){
    switch(msg.type){
        case "imaging_helper_setup_to_bg":
            setupMsgToImagingHelper(msg)
            break
    }
}

function setupMsgToImagingHelper(msg){
    imagingHelperTabsInfo.push({ tabID: msg.imagingHelperTabData.id, serialInfo: msg.serialInfo })  
}

chrome.tabs.onUpdated.addListener(function (tabId , info) {
    if(info.status !== 'complete'){ return }

    chrome.tabs.query({ title: "Copaco Imaging Helper" }, (tabs) => {
        for(var i = 0; i < tabs.length; i++){
            if(tabs[i].id == tabId){
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "request_serialInfo" }, (response) => {
                        chrome.tabs.sendMessage(tabId, { type: "setup_data", serialInfo: response })
                    })
                })
            }     
        }
    })
});