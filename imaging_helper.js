chrome.runtime.onMessage.addListener(receiveMessage)

function receiveMessage(msg, sender, sendResponse){

    switch(msg.type){
        case "setup_data":
            setup(msg.serialInfo)
            console.log(msg.serialInfo)
            break
    }
}

function setup(serialInfo){
    for(var i = 0; i < serialInfo.length; i++){
        laptopInfoDiv = document.getElementById("laptop-info")

        laptopInfoDiv.innerHTML += "".concat(
            "<div>", serialInfo[i].signpostLabel, 
                "<div id='checkmarks'>",
                    buildCheckmarkDiv(serialInfo[i].checkMarks.scriptingData),
                    buildCheckmarkDiv(serialInfo[i].checkMarks.synergyId),
                    buildCheckmarkDiv(serialInfo[i].checkMarks.intune),
                    buildCheckmarkDiv(serialInfo[i].checkMarks.specifications),
                    buildCheckmarkDiv(serialInfo[i].checkMarks.decommisioned),
                "</div>",
            "</div>"    
        )
    }
}

function buildCheckmarkDiv(markStatus){
    var imagePath = ""

    if(markStatus){
        imagePath = "images/checkmark.svg.png"
    } else { 
        imagePath = "images/exclamation_triangle.jpg"
    }

    return "".concat("<div><img src='", imagePath,"' width='25' height='25' alt='failed to load image'></div>")
}