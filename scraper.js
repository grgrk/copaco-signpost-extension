function scrapeLaptopsInfo(dom){

    var allElements = dom.getElementsByTagName("*")

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

                    if(divElement.classList.contains("text-danger")){
                        infoObject.labelColor = "#ec6523"
                    } else {
                        infoObject.labelColor = "#000000"
                    }

                    for(var k=0; k < divElement.children.length; k++){
                        
                        if(divElement.children[k].nodeName === "LABEL"){
                            if(!signpostLabelSet) { 
                                infoObject.signpostLabel = divElement.children[k].textContent 
                                //infoObject.labelColor = window.getComputedStyle(divElement.children[k]).getPropertyValue("color")
                            }
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