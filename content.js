console.log("content script hello")

chrome.runtime.onMessage.addListener(receiveMessage)

function receiveMessage(msg, sender, sendResponse){

    console.log(msg)

    switch(msg.type){
        case "paste_model_version":
            pasteModelVersion(msg) 
            break
        case "check_request":
            checkSerialNumbers()
            break
        case "start_reloading":
            timedRefresh(10000)
            break
    }
}

window.onload = () => {
    chrome.runtime.sendMessage({ type: "scanner_mode_request" }, (response) => {
        if(response.scannerMode){ setupScannerMode() } 
    })
}

function setupScannerMode(){
    let laptopsInfo = scrapeLaptopsInfo(document)

    // toggle other divs except found serialnumber + 10
    let laptopDivsWithSerialNumber = $("#serial:not([value|=''])").parent().parent()
    laptopDivsWithSerialNumber.toggle()

    let laptopDivsWithoutSerialNumberExceptFirst10 = $("#serial[value|='']:gt(9)").parent().parent()
    laptopDivsWithoutSerialNumberExceptFirst10.toggle()

    //toggle unneccesary info
    let bullshit = $("form").parent().children().filter(":not(form)")
    //bullshit.toggle()
}

function pasteModelVersion(msg){
    var allElements = document.getElementsByTagName("*")

    for (var i=0, max=allElements.length; i < max; i++) {

        if(allElements[i].id === "model"){
            allElements[i].value = msg.txt
        }
    }
}

function timedRefresh(millis){
    setTimeout("location.reload(true)", millis)
}

function checkSerialNumbers(){
    serialInfo = getSerialInfo()
    console.log(serialInfo)
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

