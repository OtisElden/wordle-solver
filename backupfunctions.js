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