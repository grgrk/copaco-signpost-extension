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

// todo verander dataflow structuur zodat de serialInfo pas requested wordt wanneer de tab complete is. 
// Nu kan de tab complete event soms eerder klaar zijn dan dat de content script zijn message naar de background 
// heeft gestuurd. Dan krijg je die ene error weer
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
});