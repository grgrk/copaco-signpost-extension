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

    for(var i = 0; i < imagingHelperTabsInfo.length; i++){
        if(imagingHelperTabsInfo[i].tabID == tabId){
            chrome.tabs.sendMessage(tabId, 
                { 
                    type: "imaging_helper_setup_to_imaging_helper_tab",
                    serialInfo: imagingHelperTabsInfo[i].serialInfo
                }
            )                 
        }
    }   
    // if (info.status === 'complete') {
    //     for(var i = 0; i < queue.length; i++){
    //         if(queue[i].tabID == tabId){
    //             chrome.tabs.sendMessage(tabId, 
    //                 { 
    //                     type: "imaging_helper_setup_to_imaging_helper_tab",
    //                     serialInfo: queue[i].serialInfo
    //                 }
    //             )                 
    //         }
    //     }   
    // }
});