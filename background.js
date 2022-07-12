console.log("background script hello")

var pairs = []

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch(msg.type){
        case "register_pair":
            pairs.push(msg.pair)
            console.log(pairs)
            break
    }
})

chrome.tabs.onUpdated.addListener(function (tabId , info) {
    if(info.status !== 'complete'){ return }

    if(tabInPairAndIsHelper(tabId)){
        helperTabId = tabId
        console.log("helperTabId: " + helperTabId)

        sourceTabId = getHelperCounterpartInPair(helperTabId)
        console.log("sourceTabId: " + sourceTabId)

        sendSerialInfoFromSourceToHelper(sourceTabId, helperTabId)
    } else if(tabInPairAndIsSource(tabId)){
        relevantPairs = findAllPairsBySourceTab(tabId)
        console.log("relevantPairs: " + relevantPairs)

        relevantPairs.forEach(element => { 
            sendSerialInfoFromSourceToHelper(element.sourceTab, element.helperTab) 
        })
    } else {
        if(tabNotInPairAndIsHelper(tabId)){
            chrome.tabs.reload(tabId)
        }
    }
})

function sendSerialInfoFromSourceToHelper(sourceTabId, helperTabId){
    chrome.tabs.sendMessage(sourceTabId, { type: "request_serialInfo" }, (response) => {
        console.log("serialInfo: " + response)
        chrome.tabs.sendMessage(helperTabId, { type: "setup_data", serialInfo: response })
    })
}

function findAllPairsBySourceTab(sourceTabId){
    foundPairs = []

    for(var i = 0; i < pairs.length; i++){
        if(pairs[i].sourceTab == sourceTabId){
            foundPairs.push(pairs[i])
        }
    }

    return foundPairs
}

function tabNotInPairAndIsHelper(unknownTabId){
    chrome.tabs.query({ title: "Copaco Imaging Helper" }, (tabs) => {
        for(var i = 0; i < tabs.length; i++){
            if(tabs[i].id == unknownTabId){
                return true
            }
        }
        return false
    })
}

function getHelperCounterpartInPair(helperTabId){
    for(var i = 0; i < pairs.length; i++){
        if(pairs[i].helperTab == helperTabId) {
            return pairs[i].sourceTab
        }
    }
}

function tabInPairAndIsHelper(tabId){
    for(var i = 0; i < pairs.length; i++){
        if(pairs[i].helperTab == tabId){
            return true
        } else {
            return false
        }
    }
}

function tabInPairAndIsSource(tabId){
    for(var i = 0; i < pairs.length; i++){
        if(pairs[i].sourceTab == tabId){
            return true
        } else {
            return false
        }
    }
}

