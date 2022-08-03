window.onload = () => {
    chrome.runtime.sendMessage({ type: "scanner_mode_request" }, (response) => {
        document.getElementById("scanner_mode_checkbox").checked = response.scannerMode
    })
}

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
    chrome.tabs.create({ url: "imaging_helper.html", active: true, index: 0 }, (tab) => {})        
})

document.getElementById("scanner_mode_checkbox").addEventListener("change", (event) => {

    let scannerMode = event.currentTarget.checked

    chrome.runtime.sendMessage({ type: "toggle_scanner_mode", scannerMode: scannerMode })
})
