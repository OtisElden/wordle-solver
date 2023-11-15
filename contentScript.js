//ContentScript to used to pass info back and forth to the website and the extension.

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

    wordlePort.postMessage({ message: messagePass, type: typeOfSend, reference: referenceToData});
}






//Takes in the given word from the extension and types it into the wordle
function typeWord(nextWord){

    let inputArray = [];

    //Break string into array
    for (let i = 0; i < nextWord.length; i++) {
        inputArray.push(nextWord[i]);
    }

    //Loop through the input array and click the buttons
    inputArray.forEach(key => {
        clickButton(key);});

    
    function clickButton(key) {

        const button = document.querySelector(`button[data-key="${key}"]`);


        if (button) {
            button.click();
            
        } else {
            console.log(`Button with data-key="${key}" not found`);

        }

    }
    
    
    //<button data-key="↵" class="one-and-a-half">enter</button>
    const enterButton = document.querySelector(`button[data-key="↵"]`);

    enterButton.click();


}






//Fucntion that retireves all of the values and splices them together, then sends them to the extension for processing
function putItAllTogether(givenWord){

    //Send the the recieved word to the keyboard for pressing
    typeWord(givenWord);

    //Wait for a few seconds then proceed



    //retireveUpdatedWord, returns an array with right positions and right letters but wrong position
    let goodletters = retrieveUpdatedWord(givenWord);

    //Destructure the array
    let [rightPosition, wrongPosition] = goodletters;

    //USE LATER
    


    //Grabs notALetter, returns an array of letters that are not used
    let wrongLetters = notALetter();
    
    //Build string based on the arrays

    let formattedString = buildString(rightPosition, wrongPosition, wrongLetters);

    


    //Send string to extension for processing




}



function buildString(rightPosition, wrongPosition, wrongLetters){

    let rightPositionString = rightPosition.join("");

    let wrongPositionString = wrongPosition.join("");

    let wrongLettersString = wrongLetters.join("");

    let finalString = rightPositionString + " " + wrongPositionString + "-" + wrongLettersString + "+";

    return finalString;
}






//Looks for the last given word and returns it based on colors, if green good position if yellow, wrong position.
function retrieveUpdatedWord(givenWord){

    //Grabs the location of the last given word
    let grabLocation = document.getElementsByTagName("game-row").getAttribute("letters").letters = givenWord;

    //Call arrays for gathering info
    let rightPosition = []; //Will always be 5 letters, only place letters that are correct, wildcard elsewhyse
    let wrongPosition = []; //Letters that are right, but not the right position

    //Loop through the letters and find the colors

    let letterString = grabLocation.getAttribute("letters");

    for (let i = 0; i < letterString.length; i++) {

        //If the letter is green, add to rightPosition
        if (letterString[i].getAttribute("evaluation") == "correct") {
            rightPosition.push(letterString[i].getAttribute("letter"));
        }

        //If the letter is yellow, add to wrongPosition
        if (letterString[i].getAttribute("evaluation") == "present") {
            rightPosition.push("*");
            wrongPosition.push(letterString[i].getAttribute("letter"));
        }

        //If the letter is yellow, add to wrongPosition
        if (letterString[i].getAttribute("evaluation") == "absent") {
            rightPosition.push("*");
        }

    }

    let passthroughArrays = [rightPosition, wrongPosition];


    // //THIS IS GREEN, CORRECT POSITION AS SEEN BY evaluation
    // <game-tile letter="t" evaluation="correct" reveal=""></game-tile>

    // //THis is yellow, correct letter, wrong position
    // <game-tile letter="e" evaluation="present" reveal=""></game-tile>



    return passthroughArrays;
}


//Function to look through keyboard and find the letters that are not used
function notALetter(){

    let notLetters = [];

    //Loop through locations and see if states of keys are used, if not used, add to the array

    let allKeys = document.querySelectorAll("button[data-key]");

    //<button data-key="k" data-state="absent" class="fade">k</button>

    for (let i = 0; i < allKeys.length; i++) {
        if (allKeys[i].getAttribute("data-state") == "absent") {
            notLetters.push(keyboard[i].getAttribute("data-key"));
        }
    }

    return notLetters;

}