chrome.runtime.onMessage.addListener(receiveMessage)

var maxColumns = 5
var maxRows = 20
var maxItems = maxColumns * maxRows
var serialInfo

function receiveMessage(msg, sender, sendResponse){

    switch(msg.type){
        case "setup_data":
            serialInfo = msg.serialInfo
            setup(serialInfo[0].signpostLabel)
            break
    }
}

document.getElementById("startingLaptop").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        inputElement = document.getElementById("startingLaptop")
        setup(inputElement.value)
    }
})

function setup(startingLaptop){
    laptopInfoDiv = document.getElementById("laptop-info")
    laptopInfoDiv.style.gridTemplateColumns = "repeat("+maxColumns+", 2fr)"
    laptopInfoDiv.style.gridTemplateRows = "repeat("+maxRows+", 1fr)"

    laptopInfoDiv.innerHTML = ""

    startingLaptopFound = false

    for(var i = 0; i < serialInfo.length; i++){

        if(serialInfo[i].signpostLabel === startingLaptop){ startingLaptopFound = true; var startIndex = i }
        if(!startingLaptopFound){ continue }
        if(i > startIndex + maxItems - 1){ break }

        let divNumber = i + 1 - startIndex;
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

    if(markStatus === "check-circle"){
        imagePath = "images/checkmark.svg.png"
    } else if(markStatus === "exclamation-triangle"){ 
        imagePath = "images/exclamation_triangle.jpg"
    } else if(markStatus === "error-warning"){
        imagePath = "images/question_mark.png"
    }
    //todo wat als de status questionmark is.

    return "".concat("<div id='checkmark'><img src='", imagePath,
                     "' width='25' height='25' alt='failed to load image'></div>")
}