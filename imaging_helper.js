var maxColumns = 5
var maxRows = 20
var maxItems = maxColumns * maxRows
var laptopsInfo
var autoUpdate = false
var autoUpdateInterval
var orderNumber
var startingLaptop

document.getElementById("startingLaptop").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        startingLaptop = document.getElementById("startingLaptop").value
        setupHTML()
    }
})

document.getElementById("orderNumber").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        orderNumber = document.getElementById("orderNumber").value
        dom = mockRequestImagingPageDOM()
        laptopsInfo = scrapeLaptopsInfo(dom)
        startingLaptop = laptopsInfo[0].signpostLabel
        console.log(laptopsInfo)
        setupHTML()
    }
})

function requestImagingPageDOM(){
    url = "".concat("https://productie.signpost.site/imaging.php?id=",orderNumber,"&edit=true")
    htmlString = httpGet(url)
    dom = new DOMParser().parseFromString(htmlString, "text/html")
    return dom
}

function mockRequestImagingPageDOM(){
    htmlString = httpGet("test files/Imaging Windows 7779/Imaging Windows 7779.html")
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

document.querySelector('.box').addEventListener('click', (event) => {

    if(autoUpdate){
        clearInterval(autoUpdateInterval)
    }

    if(!autoUpdate){
        autoUpdateInterval = setInterval(() => {
            laptopsInfo = scrapeLaptopsInfo(mockRequestImagingPageDOM())
            setupHTML()
            console.log("update")
        }, 3000)
    }

    autoUpdate = !autoUpdate
    event.target.classList.toggle('pause')
})

function updateData(){
    laptopsInfo = scrapeLaptopsInfo(mockRequestImagingPageDOM())
    setupHTML()
    console.log("update")
}

function setupHTML(){

    console.log("in setup")

    laptopInfoDiv = document.getElementById("laptop-info")
    laptopInfoDiv.style.gridTemplateColumns = "repeat("+maxColumns+", 2fr)"
    laptopInfoDiv.style.gridTemplateRows = "repeat("+maxRows+", 1fr)"

    laptopInfoDiv.innerHTML = ""

    startingLaptopFound = false

    for(var i = 0; i < laptopsInfo.length; i++){

        if(laptopsInfo[i].signpostLabel === startingLaptop){ startingLaptopFound = true; var startIndex = i }
        if(!startingLaptopFound){ continue }
        if(i > startIndex + maxItems - 1){ break }

        let divNumber = i + 1 - startIndex;
        let column = Math.ceil(divNumber / maxRows)
        let row = divNumber % maxRows
        if(row == 0) { row = maxRows }

        laptopInfoDiv.innerHTML += "".concat(
            "<div id='laptopStatus' style='grid-area: ",row," / ",column,"'>",
                "<h2 style='color:",laptopsInfo[i].labelColor,"'>",laptopsInfo[i].signpostLabel,"</h2>", 
                "<div id='checkmarks'>",
                    buildCheckmarkDiv(laptopsInfo[i].checkMarks.scriptingData),
                    buildCheckmarkDiv(laptopsInfo[i].checkMarks.synergyId),
                    buildCheckmarkDiv(laptopsInfo[i].checkMarks.intune),
                    buildCheckmarkDiv(laptopsInfo[i].checkMarks.specifications),
                    buildCheckmarkDiv(laptopsInfo[i].checkMarks.decommisioned),
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