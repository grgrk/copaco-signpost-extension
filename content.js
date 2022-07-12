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
        case "request_serialInfo":
            sendResponse(scrapeSerialInfo())
            break  
        case "start_reloading":
            timedRefresh(3000)
            break
    }
}

function scrapeSerialInfo(){

    var allElements = document.getElementsByTagName("*")

    infoList = []

    for (var i=0; i < allElements.length; i++) {
        if(allElements[i].nodeName === "FORM"){

            formElement = allElements[i];

            skippedFirstDiv = false

            for(var j=0; j < formElement.children.length; j++){
                if(formElement.children[j].nodeName === "DIV"){
                    
                    if(!skippedFirstDiv){ skippedFirstDiv = true; continue; }

                    divElement = formElement.children[j]

                    infoObject = {}

                    checkMarksObject = {}
                    checkMarkCount = 1

                    signpostLabelSet = false;

                    for(var k=0; k < divElement.children.length; k++){
                        
                        if(divElement.children[k].nodeName === "LABEL"){
                            if(!signpostLabelSet) { infoObject.signpostLabel = divElement.children[k].textContent }
                            else { infoObject.schoolLabel = divElement.children[k].textContent }
                            signpostLabelSet = true;
                        }

                        if(divElement.children[k].nodeName === "DIV"){
                            divInDivElement = divElement.children[k];
                            

                            if(divInDivElement.children[0].nodeName === "INPUT"){
                                inputElement = divInDivElement.children[0]

                                switch(inputElement.id){
                                    case "serial": infoObject.serialNumber = inputElement.value; break;
                                    case "model": infoObject.modelNumber = inputElement.value; break;
                                    case "desc": infoObject.description = inputElement.value; break;
                                }
                            }

                            if(divInDivElement.children[0].nodeName === "A"){
                                linkElement = divInDivElement.children[0]
                                
                                svgELement = linkElement.children[0]

                                switch(checkMarkCount){
                                    case 1: checkMarksObject.scriptingData = svgELement.getAttribute('data-icon'); break;
                                    case 2: checkMarksObject.synergyId = svgELement.getAttribute('data-icon'); break;
                                    case 3: checkMarksObject.intune = svgELement.getAttribute('data-icon'); break;
                                    case 4: checkMarksObject.specifications = svgELement.getAttribute('data-icon'); break;
                                    case 5: checkMarksObject.decommisioned = svgELement.getAttribute('data-icon'); break;        
                                }

                                checkMarkCount++;
                            }    
                        }
                    }

                    infoObject.checkMarks = checkMarksObject
                    infoList.push(infoObject)
                }                
            }
        }
    }

    return infoList
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

