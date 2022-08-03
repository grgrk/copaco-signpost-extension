console.log("background script hello")

var scannerMode = false

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    console.log(msg)

    switch(msg.type){
        case "toggle_scanner_mode":
            scannerMode = msg.scannerMode
            console.log(scannerMode)
            break
        case "scanner_mode_request":
            sendResponse({ scannerMode: scannerMode })
            break    
    }
})




