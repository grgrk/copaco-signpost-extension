chrome.runtime.onMessage.addListener(receiveMessage)

var maxColumns = 5
var maxRows = 10

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
        laptopInfoDiv.style.gridTemplateColumns = "repeat("+maxColumns+", 2fr)"
        laptopInfoDiv.style.gridTemplateRows = "repeat("+maxRows+", 1fr)"
        
        let divNumber = i + 1;
        let column = Math.ceil(divNumber / maxRows)
        let row = divNumber % maxRows
        if(row == 0) { row = maxRows }

        laptopInfoDiv.innerHTML += "".concat(
            "<div id='laptopStatus' style='grid-area: ",row," / ",column,"'><h2>",serialInfo[i].signpostLabel,"</h2>", 
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

    return "".concat("<div id='checkmark'><img src='", imagePath,
                     "' width='25' height='25' alt='failed to load image'></div>")
}