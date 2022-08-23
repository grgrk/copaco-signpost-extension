console.log("Content script is running on this page.")

chrome.runtime.onMessage.addListener(receiveMessage)

function receiveMessage(msg, sender, sendResponse){
    switch(msg.type){
        case "paste_model_version":
            pasteModelVersion(msg) 
            break
        case "check_request":
            checkSerialNumbers()
            break
    }
}

window.onload = () => {
    markEvery84thLaptop()

    chrome.runtime.sendMessage({ type: "scanner_mode_request"}, (response) => {
        if(response.scannerMode){ setupScannerMode() }
        setupScannerModeToggleDiv(response.scannerMode)
    })
}

function markEvery84thLaptop(){
    let allLaptopDivs = $("[id=serial]").parent().parent()

    allLaptopDivs.each((idx, elem) => {
        if(idx % 84 == 0 && idx != 0) {
            elem.style.backgroundColor = "#ffff66"
        }
    })
}

function setupScannerModeToggleDiv(scannerMode){
    let div = jQuery("<div>", { id: "scanner_mode"})

    jQuery("<label>", {value: "checkbox", for: "checkbox_scanner_mode"})
        .text("Scanner Mode")
        .css("color", "white")
        .css("margin-right", "20px")
        .css("margin-left", "20px")
        .appendTo(div)   

    jQuery("<input>", {type: "checkbox", id: "checkbox_scanner_mode", checked: scannerMode})
        .on("change", (event) => { 
            chrome.runtime.sendMessage({ 
                type: "toggle_scanner_mode", scannerMode: event.currentTarget.checked
            })

            if(event.currentTarget.checked) setupScannerMode() 
            else                            removeScannerMode()
        })
        .appendTo(div)  

    $(".fixed-top nav #navbarSupportedContent").after(div)
}

function setupScannerMode(){
    let laptopsInfo = scrapeLaptopsInfo(document)

    // toggle other laptop divs except the current batch to scan.
    let divsWithSerial = $("#serial:not([value|=''])").parent().parent().toggle()
    let divsWithEmptySerialsExceptFirst10 = $("#serial[value|='']:gt(9)").parent().parent().toggle()

    var currentSerialBatch = $("[id=serial]")
        .parent().parent()
        .filter((idx, elem) => { return window.getComputedStyle(elem).display !== 'none' })
        .find(".col-sm:lt(1)")
        .find("input")

    setupErrorDiv()

    setupCheckBtn(currentSerialBatch)
    $("#save").prop("disabled", true)
}

function removeScannerMode(){
    // toggle other laptop divs except the current batch to scan.
    let divsWithSerial = $("#serial:not([value|=''])").parent().parent().toggle()
    let divsWithEmptySerialsExceptFirst10 = $("#serial[value|='']:gt(9)").parent().parent().toggle()

    // Clear errorization
    $('[id=serial]').each((idx, elem) => { clearErrorization(elem) })

    $("#check_btn").remove()

    $("#save").prop("disabled", true)
}

function setupErrorDiv(){
    let errorDiv = $('<div>', { id: "error_div" }) 

    $("<span>",{ id: "err_empty" })
        .append("Error: Empty serial numbers detected.")
        .css("color","red").css("display","block")
        .appendTo(errorDiv).toggle()
    $("<span>",{ id: "err_prefix" })
        .append("Error: Prefixes of serial numbers dont match up.")
        .css("color","red").css("display","block")
        .appendTo(errorDiv).toggle()
    $("<span>",{ id: "err_duplicate" })
        .append("Error: Duplicate serial numbers found.")
        .css("color","red").css("display","block")
        .appendTo(errorDiv).toggle()
    
    $("form").append(errorDiv)
}

function setupCheckBtn(currentSerialBatch){
    let checkBtn = jQuery("<input>", {
        type: "button", class: "btn btn-success",
        id: "check_btn", value: "Check"
    })
    .css("margin-right","10px")
    .on("click", () => {
        let inputsWithSerial  = $("#serial:not([value|=''])")
        let allSavedSerials = inputsWithSerial.map((idx, elem) => { return elem.value }).get()

        let noEmptySerials = checkForEmptySerials(currentSerialBatch)
        let noWrongPrefixes = checkForWrongPrefixes(currentSerialBatch, allSavedSerials)
        let noDuplicates = checkForDuplicates(currentSerialBatch, allSavedSerials)

        if(noEmptySerials){
            $("#err_empty").css("display", "none") 
        } else { 
            $("#save").prop("disabled", true)
            $("#err_empty").css("display", "block")  
        }

        if(noWrongPrefixes){
            $("#err_prefix").css("display", "none")
        } else { 
            $("#save").prop("disabled", true) 
            $("#err_prefix").css("display", "block")
        }

        if(noDuplicates){
            $("#err_duplicate").css("display", "none")
        } else {
            $("#save").prop("disabled", true)    
            $("#err_duplicate").css("display", "block")  
        }   
        
        if(noEmptySerials && noWrongPrefixes && noDuplicates){
            $("#save").prop("disabled", false) 
        }
    })

    $("#save").before(checkBtn)
}

function checkForWrongPrefixes(currentSerialBatch, allSavedSerials){
    let prefix = detectPrefix(allSavedSerials)

    let success = true
    currentSerialBatch.each((idx, elem) => {      
        if(!elem.value.startsWith(prefix) && elem.value != ''){ 
            errorizeField(elem) 
            success = false 
        }
    })

    return success
}

function checkForEmptySerials(currentSerialBatch){
    let success = true
    currentSerialBatch.each((idx, elem) => {
        if(elem.value === '') { errorizeField(elem); success = false; }
        else                  { clearErrorization(elem) }
    })

    return success
}

function checkForDuplicates(currentSerialBatch, allSavedSerials){
    let allSerials = allSavedSerials
        .concat(currentSerialBatch.map((idx, elem) => { return elem.value }).get())

    let success = true
    currentSerialBatch.each((idx, elem) => {
        if(countOccurences(allSerials, elem.value) > 1){
            errorizeField(elem)
            success = false
        }
    })

    return success
}

function detectPrefix(words){
    // check border cases size 1 array and empty first word)
    if (!words[0] || words.length ==  1) return words[0] || "";
    let i = 0;
    // while all words have the same character at position i, increment i
    while(words[0][i] && words.every(w => w[i] === words[0][i]))
      i++;
    
    // prefix is the substring from the beginning to the last successfully checked i
    return words[0].substr(0, i);
}

function countOccurences(arr, val){
    if(val == '') return 0
    return arr.reduce((a, v) => (v === val ? a + 1 : a), 0)
}

function errorizeField(elem){
    elem.style.backgroundColor = "#ff0000"
    elem.style.color = "#ffffff"
}

function clearErrorization(elem){
    elem.style.backgroundColor = "#ffffff"
    elem.style.color = "#000000"
}

function pasteModelVersion(msg){
    var allElements = document.getElementsByTagName("*")

    for (var i=0, max=allElements.length; i < max; i++) {

        if(allElements[i].id === "model"){
            allElements[i].value = msg.txt
        }
    }
}

