console.log("content script hello")

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
    chrome.runtime.sendMessage({ type: "scanner_mode_request"}, (response) => {
        if(response.scannerMode){ setupScannerMode() }
        setupScannerModeToggleDiv(response.scannerMode)
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

    //let bullshit = $("form").parent().children().filter(":not(form)")
    //bullshit.toggle()

    setupCheckBtn()
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

function setupCheckBtn(){
    let checkBtn = jQuery("<input>", {
        type: "button", class: "btn btn-success",
        id: "check_btn", value: "Check"
    })
    .css("margin-right","10px")
    .on("click", () => {
        var currentSerialBatch = $("[id=serial]")
            .parent().parent()
            .filter((idx, elem) => { return window.getComputedStyle(elem).display !== 'none' })
            .find(".col-sm:lt(1)")
            .find("input")
        
        console.log(currentSerialBatch)

        if(checkForEmptySerials(currentSerialBatch)) 
              $("#save").prop("disabled", false) 
        else  $("#save").prop("disabled", true)

        if(checkForWrongPrefixes(currentSerialBatch))
              $("#save").prop("disabled", false) 
        else  $("#save").prop("disabled", true)
    })

    $("#save").before(checkBtn)
}

function checkForWrongPrefixes(currentSerialBatch){
    let inputsWithSerial  = $("#serial:not([value|=''])")
    let allSerialStrings = inputsWithSerial.map((idx, elem) => { return elem.value }).get()

    let prefix = detectPrefix(allSerialStrings)

    let success = true
    currentSerialBatch.each((idx, elem) => {       
        if(!elem.value.startsWith(prefix)) { errorizeField(elem); success = false }
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

function findDuplicateSerialNumbers(serialInfo){

    //var duplicates = [{ signpostLabels: ["SPB2022-074983","SPB2022-074983"], serialNumber: "xd-2345" }]

    var duplicates = []

    for (var i = 0; i < serialInfo.length-1; i++)
    {
        duplicateObject = { signpostLabels: [] }

        for (var j = i + 1; j < serialInfo.length; j++)
        {
            if (serialInfo[i].serialNumber === serialInfo[j].serialNumber){
                duplicateObject.signpostLabels.push(serialInfo[i].signpostLabel)
                duplicateObject.signpostLabels.push(serialInfo[j].signpostLabel)
                duplicateObject.serialNumber = serialInfo[i].serialNumber
            }
        }

        duplicates.push(duplicateObject)
    }

    return duplicates
}

