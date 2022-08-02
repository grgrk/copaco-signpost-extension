var laptopsInfo
var autoUpdate = false
var autoUpdateTimeout
var playBtnActive = false
var intervalMillis = 10000
const minimumInterval = 10

var orderNumber
var orderYear

var startingLaptop
var lastLaptopOnScreen

var maxColumns = 5
var maxRows = 20
var size = 10

var url
var mockUrl = "test files/Imaging Windows 7779/Imaging Windows 7779.html"
//var mockUrl = "test files/Imaging Windows.html"

window.onload = () => {
    loadUserSettings()  
    disableUserInput()
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
    if(event.target.value < minimumInterval){
        document.getElementById("updateIntervalInSecs").style.background = "#ff0000"
        intervalMillis = minimumInterval * 1000
    } else {
        document.getElementById("updateIntervalInSecs").style.background = "#ffffff"
        intervalMillis = event.target.value * 1000
    }

    if(autoUpdate){
        clearTimeout(autoUpdateTimeout)
        setupTimeout()
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

document.getElementById("nextPageBtn").addEventListener("click", () => {
    //TODO bug fix: If trimmed label starts with an 0 the calculation will erase this from the string.
    let potentialNewStartinglaptop = glueSPBPrefix(parseInt(trimSPBPrefix(lastLaptopOnScreen)) + 1)

    console.log(potentialNewStartinglaptop)
    console.log(getLastLaptopLabel())

    if(laptopExists(potentialNewStartinglaptop)) { startingLaptop = potentialNewStartinglaptop }
    else { 
        console.log(parseInt(trimSPBPrefix(getLastLaptopLabel())) - maxColumns * maxRows)
        startingLaptop = glueSPBPrefix(parseInt(trimSPBPrefix(getLastLaptopLabel())) - maxColumns * maxRows + 1)
    }

    document.getElementById("startingLaptop").value = trimSPBPrefix(startingLaptop)
    setupHTML()
})

document.getElementById("prevPageBtn").addEventListener("click", () => {
    //TODO bug fix: If trimmed label starts with an 0 the calculation will erase this from the string.
    let potentialNewStartinglaptop = glueSPBPrefix(parseInt(trimSPBPrefix(startingLaptop)) - maxColumns * maxRows)

    if(laptopExists(potentialNewStartinglaptop)) { startingLaptop = potentialNewStartinglaptop } 
    else                                         { startingLaptop = laptopsInfo[0].signpostLabel }

    document.getElementById("startingLaptop").value = trimSPBPrefix(startingLaptop)
    setupHTML()  
})

function laptopExists(signpostLabel){
    for (var i = 0; i < laptopsInfo.length; i++) {
        if(laptopsInfo[i].signpostLabel === signpostLabel){ return true }
    }

    return false
}

function getLastLaptopLabel(){
    return laptopsInfo[laptopsInfo.length - 1].signpostLabel
}

document.getElementById("orderNumber").addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        orderNumber = document.getElementById("orderNumber").value
        showLoadingAnimation()

        url = "".concat("https://productie.signpost.site/imaging.php?id=",orderNumber,"&edit=true")
        
        setTimeout(() => { 
            httpGet(url, "initialOrderRequest") 
            if(autoUpdate) { stopAutoUpdater() }
        }, 10)
    }
})

document.querySelector('.box').addEventListener('click', (event) => {
    if(!playBtnActive){ return }
    if(autoUpdate){ clearTimeout(autoUpdateTimeout) }
    if(!autoUpdate){ setupTimeout() }

    autoUpdate = !autoUpdate
    event.target.classList.toggle('pause')
})

function stopAutoUpdater(){
    clearTimeout(autoUpdateTimeout)
    autoUpdate = false
    document.querySelector('.box').classList.toggle('pause') 
}

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
            document.getElementById("updateIntervalInSecs").value = intervalMillis / 1000
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

function httpGet(url, context)
{
    try{
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", url, false ); 
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                handleRequestSuccess(xmlHttp.responseText, context)
            } else {
                handleRequestFail(xmlHttp.status)
            }
        }

        xmlHttp.send()
    } catch (error){
        handleRequestFail("unknown")
    }
}

function handleRequestFail(status){

    switch(status){
        case "unknown": showError("Order " + orderNumber + " was not found."); break
        case 500: showError("Error: Signpost internal server error."); break 
        case 403: showError("Error: Requested data is forbidden."); break      
        case 401: showError("Error: You are unauthorized."); break       
        default: showError("Order " + orderNumber + " was not found.")    
    }

    hideLoadingAnimation()
    disableUserInput()
}



function handleRequestSuccess(responseText, context){
    dom = new DOMParser().parseFromString(responseText, "text/html")
    laptopsInfo = scrapeLaptopsInfo(dom)

    if(context === "initialOrderRequest"){ 
        startingLaptop = laptopsInfo[0].signpostLabel 
        orderYear = detectOrderYear(laptopsInfo[0].signpostLabel)
        document.getElementById("startingLaptop").value = trimSPBPrefix(startingLaptop)
    }

    applyItemSettings()
    setupHTML()
    hideLoadingAnimation()
    hideError()
    enableUserInput()
    if(autoUpdate) { setupTimeout() }
}

function disableUserInput(){
    document.getElementById("updateSettings").style.opacity = 0.3
    document.getElementById("updateIntervalInSecs").disabled = true
    document.getElementById("startingLaptop").disabled = true
    document.getElementById("applyBtn").disabled = true
    document.getElementById("nextPageBtn").disabled = true
    document.getElementById("prevPageBtn").disabled = true
    playBtnActive = false
}

function enableUserInput(){
    document.getElementById("updateSettings").style.opacity = 1
    document.getElementById("updateIntervalInSecs").disabled = false
    document.getElementById("startingLaptop").disabled = false
    document.getElementById("applyBtn").disabled = false
    document.getElementById("nextPageBtn").disabled = false
    document.getElementById("prevPageBtn").disabled = false
    playBtnActive = true
}

function setupTimeout(){
    autoUpdateTimeout = setTimeout(() => {
        if(!autoUpdate) { return }
        showLoadingAnimation()

        setTimeout(() => {
            httpGet(url, "autoUpdateRequest")
        }, 10)
    }, intervalMillis)    
}

function setupHTML(){

    console.log("in setup HTML")

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
        lastLaptopOnScreen = laptopsInfo[i].signpostLabel

        laptopInfoDiv.innerHTML += "".concat(
            "<div id='laptopStatus' style='grid-area: ",row," / ",column,"'>",
                "<h2 style='color:",laptopsInfo[i].labelColor,"; font-size:",size * 2.2,"px;'>",trimmedSPBLabel,"</h2>", 
                "<div id='checkmarks'>",
                    // buildCheckmarkDiv(laptopsInfo[i].checkMarks.scriptingData),
                    // buildCheckmarkDiv(laptopsInfo[i].checkMarks.synergyId),
                    // buildCheckmarkDiv(laptopsInfo[i].checkMarks.intune),
                    // buildCheckmarkDiv(laptopsInfo[i].checkMarks.specifications),
                    // buildCheckmarkDiv(laptopsInfo[i].checkMarks.decommisioned),
                "</div>",
            "</div>"    
        )
    }

    if(!startingLaptopFound){
        document.getElementById('startingLaptop').style.background = "#ff0000"
    } else {
        document.getElementById('startingLaptop').style.background = "#ffffff"
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

function showError(msg){
    document.getElementById("requestError").style.display = "block"
    document.getElementById("requestError").innerHTML = msg
}

function hideError(){
    document.getElementById("requestError").style.display = "none"
}

function showLoadingAnimation(){
    document.getElementById("loading_animation").style.display = "inline-block"
}

function hideLoadingAnimation(){
    document.getElementById("loading_animation").style.display = "none"
}