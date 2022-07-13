console.log("background script hello")

var pairs = []

var sourceReloaders = []

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch(msg.type){
        case "register_pair":
            onRegisterPairMsg(msg)
            break
        case "new_starting_laptop":
            console.log(sender)
            onNewStartingLaptop(msg, sender)
            break    
    }
})

chrome.tabs.onUpdated.addListener(function (tabId , info) {
    if(info.status !== 'complete'){ return }

    if(tabInPairAndIsHelper(tabId)){
        helperTabId = tabId

        sourceTabId = getHelperCounterpartInPair(helperTabId)

        sendSerialInfoFromSourceToHelper(sourceTabId, helperTabId)

        let sourceReloader = getSourceReloader(sourceTabId)

        if(!sourceReloader.active){
            sourceReloader.active = true
            chrome.tabs.sendMessage(sourceTabId, { type: "start_reloading" })
        }
    } else if(tabInPairAndIsSource(tabId)){
        relevantPairs = findAllPairsBySourceTab(tabId)

        relevantPairs.forEach(element => { 
            sendSerialInfoFromSourceToHelper(element.sourceTab, element.helperTab) 
        })

        let sourceReloader = getSourceReloader(tabId)
        if(sourceReloader.active){
             chrome.tabs.sendMessage(sourceTabId, { type: "start_reloading" }) 
        }
    } else {
        if(tabNotInPairAndIsHelper(tabId)){
            chrome.tabs.reload(tabId)
        }
    }
})

function onRegisterPairMsg(msg){
    initializedPair = msg.pair
    initializedPair.startingLaptop = "not_set"
    pairs.push(initializedPair)

    if(!reloaderExists(msg.pair.sourceTab)){
        sourceReloaders.push({ sourceTabId: msg.pair.sourceTab, active: false })
    }

    console.log(sourceReloaders)
}

function onNewStartingLaptop(msg, sender){
    helperTabId = sender.tab.id
    regardingPair = getPairByHelperTabID(helperTabId)
    regardingPair.startingLaptop = msg.startingLaptop
}

function reloaderExists(sourceTabId){
    sourceReloaders.forEach(element => {
        if(element.sourceTabId == sourceTabId){ return true }
    })

    return false
}

function getSourceReloader(sourceTabId){
    for(var i = 0; i < sourceReloaders.length; i++){
        if(sourceReloaders[i].sourceTabId == sourceTabId){ 
            return sourceReloaders[i] 
        }
    }
}

function sendSerialInfoFromSourceToHelper(sourceTabId, helperTabId){
    chrome.tabs.sendMessage(sourceTabId, { type: "request_serialInfo" }, (response) => {
        console.log("serialInfo: " + response)

        regardingPair = getPairByHelperTabID(helperTabId)

        if(regardingPair.startingLaptop === "not_set") {
            regardingPair.startingLaptop = response[0].signpostLabel
        }
                
        chrome.tabs.sendMessage(helperTabId, { type: "setup_data", serialInfo: response, startingLaptop: regardingPair.startingLaptop })
    })
}

function getPairByHelperTabID(helperTabId){
    for(var i = 0; i < pairs.length; i++){
        if(pairs[i].helperTab == helperTabId){ return pairs[i] }
    }
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

