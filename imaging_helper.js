var laptopsInfo
var autoUpdate = false
var autoUpdateInterval
var intervalMillis = 10000

var orderNumber
var startingLaptop
var orderYear

var maxColumns = 5
var maxRows = 20
var size = 10

window.onload = () => {
    loadUserSettings()  
}

window.onunload = () => {
    saveUserSettings()
}

document.getElementById("cols").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        maxColumns = document.getElementById("cols").value
        setupHTML()
    }
})

document.getElementById("rows").addEventListener("keyup", ({key}) => {
    if(key === "Enter"){
        maxRows = document.getElementById("rows").value
        setupHTML()
    }
})

document.getElementById("size").addEventListener("keyup", ({key}) => {
    if(key === "Enter"){
        size = document.getElementById("size").value
        setupHTML()
    }
})

document.getElementById("applyBtn").addEventListener("click", () => {
    applyItemSettings()
    setupHTML()
})

document.getElementById("updateIntervalInSecs").addEventListener("input", (event) => {
    intervalMillis = event.target.value * 1000

    if(autoUpdate){
        clearInterval(autoUpdateInterval)
        setupInterval()
    }
})

document.getElementById("startingLaptop").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        laptopNumber = document.getElementById("startingLaptop").value
        startingLaptop = glueSPBPrefix(laptopNumber)
        applyItemSettings()
        setupHTML()
    }
})

document.getElementById("orderNumber").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        orderNumber = document.getElementById("orderNumber").value
        dom = requestImagingPageDOM()
        laptopsInfo = scrapeLaptopsInfo(dom)
        console.log(laptopsInfo)
        startingLaptop = laptopsInfo[0].signpostLabel
        orderYear = detectOrderYear(laptopsInfo[0].signpostLabel)
        document.getElementById("startingLaptop").value = trimSPBPrefix(startingLaptop)
        applyItemSettings()
        setupHTML()
    }
})

function applyItemSettings(){
    maxColumns = document.getElementById("cols").value
    maxRows = document.getElementById("rows").value
    size = document.getElementById("size").value
}

function loadUserSettings(){
    chrome.storage.local.get(["cols", "rows", "size", "updateInterval"], ( result ) => {
        if(result.cols === undefined || result.cols === ""){ 
            document.getElementById("cols").value = maxColumns
        } else {
            document.getElementById("cols").value = result.cols
            maxColumns = result.cols
        }

        if(result.rows === undefined || result.rows === ""){ 
            document.getElementById("rows").value = maxRows
        } else {
            document.getElementById("rows").value = result.rows
            maxRows = result.rows
        }

        if(result.size === undefined || result.size === ""){ 
            document.getElementById("size").value = size
        } else {
            document.getElementById("size").value = result.size
            size = result.size
        }

        if(result.updateInterval === undefined || result.updateInterval === ""){ 
            document.getElementById("updateIntervalInSecs").value = intervalMillis / 10
        } else {
            document.getElementById("updateIntervalInSecs").value = result.updateInterval
            intervalMillis = result.updateInterval * 1000
        }
    })
}

function saveUserSettings(){
    chrome.storage.local.set({
        cols: document.getElementById("cols").value,
        rows: document.getElementById("rows").value,
        size: document.getElementById("size").value,
        updateInterval: document.getElementById("updateIntervalInSecs").value
    })
}

function detectOrderYear(signpostLabel){
    return signpostLabel.substring(3, 7)
}

function trimSPBPrefix(signpostLabel){
    return signpostLabel.substring(8)
}

function glueSPBPrefix(trimmedSignpostLabel){
    return "SPB".concat(orderYear,"-",trimmedSignpostLabel)
}

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
        setupInterval()
    }

    autoUpdate = !autoUpdate
    event.target.classList.toggle('pause')
})

function setupInterval(){
    autoUpdateInterval = setInterval(() => {
        laptopsInfo = scrapeLaptopsInfo(requestImagingPageDOM())
        setupHTML()
    }, intervalMillis)    
}

function updateData(){
    laptopsInfo = scrapeLaptopsInfo(requestImagingPageDOM())
    setupHTML()
}

function setupHTML(){

    console.log("in setup")

    laptopInfoDiv = document.getElementById("laptop-info")
    laptopInfoDiv.innerHTML = ""
    laptopInfoDiv.style.gridTemplateColumns = "repeat("+maxColumns+", 2fr)"
    laptopInfoDiv.style.gridTemplateRows = "repeat("+maxRows+", 1fr)"

    startingLaptopFound = false
    maxItems = maxColumns * maxRows

    for(var i = 0; i < laptopsInfo.length; i++){

        if(laptopsInfo[i].signpostLabel === startingLaptop){ startingLaptopFound = true; var startIndex = i }
        if(!startingLaptopFound){ continue }
        if(i > startIndex + maxItems - 1){ break }

        let divNumber = i + 1 - startIndex;
        let column = Math.ceil(divNumber / maxRows)
        let row = divNumber % maxRows
        if(row == 0) { row = maxRows }

        trimmedSPBLabel = trimSPBPrefix(laptopsInfo[i].signpostLabel)

        laptopInfoDiv.innerHTML += "".concat(
            "<div id='laptopStatus' style='grid-area: ",row," / ",column,"'>",
                "<h2 style='color:",laptopsInfo[i].labelColor,"; font-size:",size * 2.2,"px;'>",trimmedSPBLabel,"</h2>", 
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
                     "' width='",size * 2.5,"' height='",size * 2.5,"' alt='failed to load image'></div>")
}