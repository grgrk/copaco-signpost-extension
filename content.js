console.log("content script hello")

chrome.runtime.onMessage.addListener(receiveMessage)

function receiveMessage(msg, sender, sendResponse){

    console.log(msg.type)

    switch(msg.type){
        case "paste_model_version":
            pasteModelVersion(msg) 
            break
        case "check_request":
            checkSerialNumbers();    
            break
    }
}

function pasteModelVersion(msg){
    var allElements = document.getElementsByTagName("*")

    for (var i=0, max=allElements.length; i < max; i++) {

        if(allElements[i].id === "model"){
            allElements[i].value = msg.txt
        }
    }
}

function checkSerialNumbers(){
    var allElements = document.getElementsByTagName("*")
    var serialNumbers = []

    for (var i=0, max=allElements.length; i < max; i++) {
        if(allElements[i].id === "serial"){
            serialNumbers.push(allElements[i].value)
        }
    }

    console.log(serialNumbers)

    if(containsDuplicates(serialNumbers)){
        console.log("duplicates found!")
    }  
}

function containsDuplicates(array) {
    const result = array.some(element => {
      if (array.indexOf(element) !== array.lastIndexOf(element) && element !== '') { 
        return true 
      }

      return false
    })
  
    return result
}