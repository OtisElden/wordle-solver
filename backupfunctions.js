var imgTabID;
var imgPort



//For getting the tabID of contentScript and connecting popup.js to contentScript

chrome.runtime.onMessage.addListener((request, sender) => {

    if (request.message == "GrabTabID") {

        imgTabID = sender.tab.id;
        imgPort = chrome.tabs.connect(imgTabID, { name: "extensionPassthrough" });

        console.log("Connected to content script!")
    }
    }
);



//For opening the port from contentScript and grabbing messages sent from contentScript

chrome.runtime.onConnect.addListener(function (port) {

    port.onMessage.addListener(function (msg) {

    switch (port.name) {

    case "imagetrendPassthrough":

                switch (msg.type) {

                    case "openPort":
                        //console.log("recieved connection from imagetrend")
                        break;

                    case "passthrough":

                        //writeTitleToPlaces(msg.message);
                        //console.log(msg.message);
                        break;

                    default:
                        break;
                }
    default:
        break;
    }

    });
});



//For Sending messages to the contentScript, must have an open port using prepare first! eg. sendToFrontend("whatever", "reload");
function sendToFrontend(messagePass, typeOfSend, referenceToData, HAN, MRN, ERN, mail, Pnumber) {

    imgPort.postMessage({ message: messagePass, type: typeOfSend, reference: referenceToData, HospitalANumber: HAN, MedicalNumber: MRN, EncounterNumber: ERN, Email: mail, Phone: Pnumber });
}

//For moving the popup to the side of the screen, keeps the data connection live after imagetrend reload.
function movetoPopUP() {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.windows.create({
            url: "popup.html",
            type: "popup",
            height: 500,
            width: 400,
            left: currentWindow.left + currentWindow.width,
            top: currentWindow.top
        });
        window.close();
    });
}




//Declares global variables for calling and sending messages to the contentScript

var wordleTabID; //TabID for the contentScript
var wordlePort //Port for the contentScript, this is what you call when you send messages



//For getting the tabID of contentScript and connecting popup.js to contentScript

chrome.runtime.onMessage.addListener((request, sender) => {

    if (request.message == "Connection Request From wordle contentScript") {

        wordleTabID = sender.tab.id;
        wordlePort = chrome.tabs.connect(wordleTabID, { name: "solverPassthrough" });

        console.log("Connected to content script!")
    }
}
);


//Sends massages to the contecstScript. WIll only work if listener has connected.
function sendToFrontend(messagePass, typeOfSend, referenceToData, HAN, MRN, ERN, mail, Pnumber) {

    wordlePort.postMessage({ message: messagePass, type: typeOfSend, reference: referenceToData, HospitalANumber: HAN, MedicalNumber: MRN, EncounterNumber: ERN, Email: mail, Phone: Pnumber });
}



//For opening the port from contentScript and grabbing messages sent from contentScript

chrome.runtime.onConnect.addListener(function (port) {

    port.onMessage.addListener(function (msg) {

        switch (port.name) {

            case "wordlePassthrough":

                switch (msg.type) {

                    case "openPort":
                        console.log("Connection recieved from contentScript!")
                        break;

                    case "returnNewValues":

                        //Takes updated input and calls function to update new wordlist

                        //writeTitleToPlaces(msg.message);
                        //console.log(msg.message);
                        break;

                    default:
                        break;
                }
            default:
                break;
        }

    });
});










//For sending the tab ID to the popup.js
chrome.runtime.sendMessage({ message: "Connection Request From wordle contentScript" });
console.log("Sending out message");


//
port = chrome.runtime.connect({ name: "wordlePassthrough" });
console.log("Connect initiated");


//Recieves messages from the extension. Takes calls and returns values needed for extension to run.
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        switch (port.name) {
            case "solverPassthrough":
                switch (msg.type) {
                    case "passWordList":
                        //Grabs list and from the message and then posts the word



                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    });
});







//For sending data to the extension, specify the message and type of message in the passthrough values! eg. sendToExt("whatever", "reload");

function passToExt(messagePass, typeOfSend, referenceToData) {

    port.postMessage({ message: messagePass, type: typeOfSend, reference: referenceToData });


    port.onMessage.addListener(function (msg) {

    });
}


//Sends massages to the contecstScript. WIll only work if listener has connected.
function sendToFrontend(messagePass, typeOfSend, referenceToData) {

    wordlePort.postMessage({ message: messagePass, type: typeOfSend, reference: referenceToData });
}