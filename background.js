console.log("background script hello")

chrome.runtime.onMessage.addListener(receiveMessage)

function receiveMessage(msg, sender, sendResponse){
    switch(msg.type){
        case "imaging_helper_setup_to_bg":
            setupMsgToImagingHelper(msg)
            break
    }
}

function setupMsgToImagingHelper(msg){
    chrome.tabs.sendMessage(msg.imagingHelperTabData.id, 
        { 
            type: "imaging_helper_setup_to_imaging_helper_tab",
            serialInfo: msg.serialInfo
        }
    )    
}

//hier was ik
chrome.tabs.onUpdated.addListener(function (tabId , info) {
    console.log(info)
    if (info.status === 'complete') {
        console.log("tab:"+tabId+"complete")
    }
});