console.log("hellooooo")

chrome.runtime.onMessage.addListener(receiveMessage)

function receiveMessage(msg, sender, sendResponse){

    console.log("imaging helper received message!!!!")

    switch(msg.type){
        case "imaging_helper_setup_to_imaging_helper_tab":
            console.log(msg)
            break
    }
}
