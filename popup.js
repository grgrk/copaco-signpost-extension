document.getElementById("button").addEventListener("click", () => {

    let input = document.getElementById("input_num").value

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "paste_model_version", txt: input})
    })
})

document.getElementById("check_button").addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "check_request"})
    })
})

document.getElementById("imaging_btn_open").addEventListener("click", () => {
    chrome.tabs.create({ url: "imaging_helper.html", active: true, index: 0 }, (tab) => {
     
    })        
})


