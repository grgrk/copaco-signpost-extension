var maxColumns = 5
var maxRows = 20
var maxItems = maxColumns * maxRows
var serialInfo

document.getElementById("startingLaptop").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        inputElement = document.getElementById("startingLaptop")
        setup(inputElement.value)
    }
})

document.getElementById("orderNumber").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        inputElement = document.getElementById("orderNumber")
        dom = mockRequestImagingPageDOM(inputElement.value)
        console.log(dom)
    }
})

function requestImagingPageDOM(orderNumber){
    url = "".concat("https://productie.signpost.site/imaging.php?id=",orderNumber,"&edit=true")
    htmlString = httpGet(url)
    dom = new DOMParser().parseFromString(htmlString, "text/html")
    return dom
}

function mockRequestImagingPageDOM(orderNumber){
    htmlString = httpGet("Imaging Windows.html")
    dom = new DOMParser().parseFromString(htmlString, "text/html")
    return dom    
}

function httpGet(url)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

window.onload = () => {
    console.log("loaded")
}

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
            "<div id='laptopStatus' style='grid-area: ",row," / ",column,"'>",
                "<h2 style='color:",serialInfo[i].labelColor,"'>",serialInfo[i].signpostLabel,"</h2>", 
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

    return "".concat("<div id='checkmark'><img src='", imagePath,
                     "' width='25' height='25' alt='failed to load image'></div>")
}