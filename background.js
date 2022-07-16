console.log("background script hello")

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




