//Content Script for wordleUnlimited. Desgined as a standalone to the main extension so that it can run word solving functions without sending tons of messages


//Global Variables
let shadowRootKeys
let lastWordUsed
let yellowPositionArray = [];

//Starts the searching function
elementWatcher();


//Searching function, takes in the instructions div and then adds a button above it
function elementWatcher() {

    //This is the checker, looks for the element and then starts addButton.
    function checkForElement() {
        const instructionsDiv = document.querySelector(".instructions");

        if (instructionsDiv) {
            console.log("Element with class 'instructions' found");
            addButton(instructionsDiv);
            clearInterval(intervalID); // Stop the interval once the element is found
        }
    }

    //Set up the interval to check every 1 second
    const intervalID = setInterval(checkForElement, 1000);
}

//Function to add a button just above the instructions div
function addButton(instructionsDiv) {
    if (instructionsDiv) {
        const button = document.createElement("button");
        button.innerHTML = "Solve Wordle";
        button.id = "solveButton";
        button.className = "button";
        button.style.marginTop = "10px"; // Use style property individually
        button.style.marginBottom = "10px"; // Use style property individually

        instructionsDiv.insertAdjacentElement("beforebegin", button);

        //Add listenr to button, activates startItOff function
        document.getElementById("solveButton").addEventListener("click", startItOff);
        startItOff();
    }
}


//Let's get this party started!
function startItOff() {

    const startingWord = "arise"

    lastWordUsed = startingWord;

    //To query shadow and then passs through, so no need to read it multiple times

    //Grab the first layer of shadow root, default area
    shadowRootKeys = document.querySelector('game-app').shadowRoot;

    //Second lay for the keyboard
    shadowRootKeys = shadowRootKeys.querySelector('game-keyboard').shadowRoot;

    typeWord(startingWord);
}




//Takes in a word and types it out, presses enter, then waits for the word to be evaluated
function typeWord(nextWord) {

    lastWordUsed = nextWord;

    let inputArray = nextWord.split('');

    console.log("Broken down array: ", inputArray);

    //Loop through the input array and click the buttons
    inputArray.forEach(key => {
        clickButton(key);
    });

    // Click the enter button after typing all letters
    clickEnter();

    //Waits for wordle cards to flip, then runs the next function, putItAllTogether
    setTimeout(putItAllTogether, 2000);
}


//Subsection of typeWord, clicks the buttons
function clickButton(key) {

    //Actual query inside the shadowRootKeys for the button
    const button = shadowRootKeys.querySelector(`button[data-key="${key.toLowerCase()}"]`);

    //Click the buttons!
    if (button) {
        button.click();
    } else {
        console.error(`Button with data-key="${key}" not found`);
    }
}


//Subsection of typeWord, clicks the enter button
function clickEnter() {

    // Now query inside the last shadowRootKeys for the enter button
    const enterButton = shadowRootKeys.querySelector('button[data-key="↵"]');

    if (enterButton) {
        enterButton.click();
    } else {
        console.error('Enter button not found');
    }
}



//Fucntion that retireves all of the values and splices them together, then sends them to the extension for processing
function putItAllTogether() {

    console.log("The last word used was: " + lastWordUsed);


    //retireveUpdatedWord, returns an array with right positions and right letters but wrong position
    let [rightPosition, wrongPosition] = retrieveUpdatedWord();

    console.log(rightPosition);

    console.log(wrongPosition);

    //Grabs notALetter, returns an array of letters that are not used
    let wrongLetters = notALetter();

    console.log(wrongLetters);

    //Build string based on the arrays
    let formattedString = buildString(rightPosition, wrongPosition, wrongLetters);

    console.log(formattedString); //All working to here

    //Send to processing
    let nextWord = guessThatPokemon(formattedString);

    console.log("The next word to check: " + nextWord);





    //Grabs 1st layer again, default area
    shadowRootGameSpaces = document.querySelector('game-app').shadowRoot;

    //Check if the modal is open, if so, refresh the page
    let reloadModal = shadowRootGameSpaces.querySelector('game-modal[open]');
    

    
    

    if (reloadModal) {

        console.log("Found stats page, beginning reload");

        statScreen = shadowRootGameSpaces.querySelector('game-stats').shadowRoot;

        const refreshButton = statScreen.querySelector('#refresh-button');


        if (refreshButton) {
            console.log("Refresh button found, reloading webpage");

            refreshButton.click();
        }
    }
    

    typeWord(nextWord);

}







//Looks for the last given word and returns it based on colors, if green good position if yellow, wrong position. Each row needs to open shadowRoot and then look for the class row. Each letter will be under game-tile as a letter with evaluation property.
function retrieveUpdatedWord() {

    //Call arrays for gathering info
    let rightPosition = []; //Will always be 5 letters, only place letters that are correct, wildcard elsewhyse
    let wrongPosition = []; //Letters that are right, but not the right position
    let notPosition = []; //Yellows


    //Grabs 1st layer again, default area
    shadowRootGameSpaces = document.querySelector('game-app').shadowRoot;

    //let currentRow = shadowRootGameSpaces.querySelector('game-row').getElementsByTagName("game-row").getAttribute("letters").letters = lastWordUsed;

    let currentRow = Array.from(shadowRootGameSpaces.querySelectorAll('game-row')).find(row => row.getAttribute("letters") === lastWordUsed);

    //Grab the shadowRoot for the row
    let shadowLocation = currentRow.shadowRoot;

    //Loop through shadowRoot and find attributes of letter, if green, add to rightPosition, if yellow, add to wrongPosition

    //yellowPositionArray, global variable, push number followed by letter to it

    let tiles = shadowLocation.querySelectorAll('game-tile');


    //Checks tiles for the evaluation attribute and then adds to the right array
    for (let i = 0; i < 5; i++) {

        //If the letter is green, add to rightPosition
        if (tiles[i].getAttribute("evaluation") == "correct") {
            rightPosition.push(tiles[i].getAttribute("letter"));
        }

        //If the letter is yellow, add to wrongPosition
        if (tiles[i].getAttribute("evaluation") == "present") {
            rightPosition.push("*");
            wrongPosition.push(tiles[i].getAttribute("letter"));
            yellowPositionArray.push(i + 1)
            yellowPositionArray.push(tiles[i].getAttribute("letter"))
        }

        //If the letter is yellow, add to wrongPosition
        if (tiles[i].getAttribute("evaluation") == "absent") {
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


    const allKeys = shadowRootKeys.querySelectorAll("button[data-key]");

    for (let i = 0; i < allKeys.length; i++) {
        if (allKeys[i].getAttribute("data-state") == "absent") {
            notLetters.push(allKeys[i].getAttribute("data-key"));
        }
    }

    return notLetters;

}


//Takes the values returned and builds a string for evaluation
function buildString(rightPosition, wrongPosition, wrongLetters, ) {

    let rightPositionString = rightPosition.join("");

    let wrongPositionString = wrongPosition.join("");

    let wrongLettersString = wrongLetters.join("");

    let finalString = rightPositionString + " " + wrongPositionString + "-" + wrongLettersString + "+" + yellowPositionArray;

    return finalString;
}







//Function for getting the worlde input and sending it to other functions, returns those values on and displays on html
function guessThatPokemon(passedString) {

    //let wordleInput = document.getElementById('wordleInputText').value;

    //Grabs arrays from the breakUpWord function and destructures them into usable variables
    let [wordlePosArray, arrayExtraChar, notLetters, notPositionArray] = breakUpWord(passedString);

    console.log("wordlePosArray: " + wordlePosArray);
    console.log("arrayExtraChar: " + arrayExtraChar);
    console.log("notLetters: " + notLetters);
    console.log("notPositionArray: " + notPositionArray);

    //Checks wordlePosArray against the json data and returns positions of possible slutions
    let possiblePositions = checkIfPossible(wordlePosArray);

    //Checks if the possiblePositions array incldues valeus from arrayExtraChar, returns array of positions
    let extraCharPositions = extrasPossible(possiblePositions, arrayExtraChar);

    //Removes positions that contain the notLetters and returns the position array again
    let removedCharPositions = lettersNotIncluded(extraCharPositions, notLetters);
    console.log("starting pos" + removedCharPositions);

    //Removes positions that contain data that is not in certain positions, returns position array again
    let posStringRemove = letterPosition(removedCharPositions, notPositionArray);
    console.log("fin pos: " + posStringRemove);

    let finalChoice = posStringRemove[0];

    let returnedWord = jsonData[finalChoice];

    return returnedWord;
}


//Function to break down word into specific letters
function breakUpWord(passthroughInputString) {

    let workingString = passthroughInputString;


    //Splits the wordle into an array of 5 letters
    let firstFive = workingString.slice(0, 5);

    let positionWordle = firstFive.split('');

    //Calls optional variables
    let possibleCharacters = [];
    let wrongCharacters = [];
    let positionArray = [];

    // Checks if the wordle is longer than 5 letters
    if (workingString.length > 5) {
        let afterFive = workingString.slice(5);

        //Initialize both arrays
        possibleCharacters = [];
        wrongCharacters = [];

        // Check if there is a hyphen in the remaining string
        if (/-/.test(afterFive)) {
            let parts = afterFive.split('-');

            // Characters before hyphen are considered possible characters
            possibleCharacters = parts[0].split(/\s+/).join('').split('');

            // Characters between hyphen and plus sign are considered wrong characters
            let betweenHyphenAndPlus = parts[1].split(/\+/)[0];
            wrongCharacters = betweenHyphenAndPlus.split(/\s+/).join('').split('');


            let NotPositionData = parts[1].split(/\+/)[1];

            let position1 = [];
            let position2 = [];
            let position3 = [];
            let position4 = [];
            let position5 = [];

            for (let i = 0; i < NotPositionData.length; i++) {

                //Set active array to position1 if it finds a 1
                if (NotPositionData[i] === "1") { activeArray = position1; }

                //Set active array to position2 if it finds a 2
                if (NotPositionData[i] === "2") { activeArray = position2; }

                //Set active array to position3 if it finds a 3
                if (NotPositionData[i] === "3") { activeArray = position3; }

                //Set active array to position4 if it finds a 4
                if (NotPositionData[i] === "4") { activeArray = position4; }

                //Set active array to position5 if it finds a 5
                if (NotPositionData[i] === "5") { activeArray = position5; }

                if (/[a-zA-Z]/.test(NotPositionData[i])) {

                    activeArray.push(NotPositionData[i]);
                }
            }

            positionArray = [position1, position2, position3, position4, position5];



        } else {
            //If there is no hyphen, consider all characters as possible characters
            possibleCharacters = afterFive.split(/\s+/).join('').split('');
        }
    }

    return [positionWordle, possibleCharacters, wrongCharacters, positionArray];
}


//Takes array of letters and checks against global jsonData variable
function checkIfPossible(passthroughArray) {

    let positionArray = [];


    //For loop for the entire jsonData length
    for (let i = 0; i < jsonData.length; i++) {

        //Split the word into an array of letters
        let jsonWordToStringsArray = jsonData[i].split('');

        //Preset value
        let isMatch = true;

        //For loop for the length of the passthroughArray
        for (let j = 0; j < passthroughArray.length; j++) {

            //Checks if the letter is not a wildcard and if the letter is not equal to the jsonWordToStringsArray
            if (passthroughArray[j] !== "*" && passthroughArray[j] !== jsonWordToStringsArray[j]) {

                //Set the isMatch value to false
                isMatch = false;
                break; // Exit the loop if a non-wildcard letter doesn't match
            }
        }

        if (isMatch) {
            positionArray.push(i);
        }
    }

    return positionArray;
}


//Takes input array and possible positions and determines if the words include the extra characters, returns position array
function extrasPossible(matchingPos, extraChars) {

    //Check if the extraChars array is empty

    // if (extraChars.length === 0) {
    //     return [];
    // }


    //Checks if th extraChars elements are in the matchingPos array

    let extraCharPositionsArray = [];

    for (let i = 0; i < matchingPos.length; i++) {

        let jsonWordToStringsArray = jsonData[matchingPos[i]].split(''); //Breaks down the json data into an array of letters

        let isMatch = true;

        for (let j = 0; j < extraChars.length; j++) {

            if (!jsonWordToStringsArray.includes(extraChars[j])) {

                isMatch = false;
                break;
            }
        }

        if (isMatch) {
            extraCharPositionsArray.push(matchingPos[i]);
        }
    }

    return extraCharPositionsArray;
}


//Takes postions refined from extrasPossible and checks if the supplied letters are in the word, if so tosses them from suggestions
function lettersNotIncluded(extraCharArray, removeLetters) {


    //THIS IS FLIPPED< SO IT"LL ONLY ACCEPT REMOVED LETTERS, NEED TO FLIP THE STATEMENTS, just added a !to ismtach if statement

    let removedArray = [];

    for (let i = 0; i < extraCharArray.length; i++) {

        let jsonWordToStringsArray = jsonData[extraCharArray[i]].split(''); //Breaks down the json data into an array of letters

        let isMatch = true;

        for (let j = 0; j < removeLetters.length; j++) {

            if (jsonWordToStringsArray.includes(removeLetters[j])) {

                isMatch = false;
                break;
            }
        }

        if (isMatch) {
            removedArray.push(extraCharArray[i]);
        }
    }

    return removedArray;

}


//Defines where letters are not, and then reruns the lookthorugh based on those vales.
function letterPosition(positionsArray, notPositionArray) {
    // Deconstructs the 2d array into 5 arrays
    let [position1, position2, position3, position4, position5] = notPositionArray;

    console.log(position1);
    console.log(position2);
    console.log(position3);
    console.log(position4);
    console.log(position5);

    let matchedPositionPositionsArray = [];

    for (let i = 0; i < positionsArray.length; i++) {
        let jsonWordToStringsArray = jsonData[positionsArray[i]].split(''); // Breaks down the json data into an array of letters
        let isMatch = true;



        if (position1.length > 0) {
            // Check the first letter for letters in position1 array
            for (let j = 0; j < position1.length; j++) {
                if (jsonWordToStringsArray[0].includes(position1[j])) {
                    isMatch = false;
                    break;
                }
            }
        }

        if (position2.length > 0) {
            // Check the second letter for letters in position2 array
            for (let j = 0; j < position2.length; j++) {
                if (jsonWordToStringsArray[1].includes(position2[j])) {
                    isMatch = false;
                    break;
                }
            }
        }

        if (position3.length > 0) {
            // Check the third letter for letters in position3 array
            for (let j = 0; j < position3.length; j++) {
                if (jsonWordToStringsArray[2].includes(position3[j])) {
                    isMatch = false;
                    break;
                }
            }
        }

        if (position4.length > 0) {
            // Check the fourth letter for letters in position4 array
            for (let j = 0; j < position4.length; j++) {
                if (jsonWordToStringsArray[3].includes(position4[j])) {
                    isMatch = false;
                    break;
                }
            }
        }

        if (position5.length > 0) {
            // Check the fifth letter for letters in position5 array
            for (let j = 0; j < position5.length; j++) {
                if (jsonWordToStringsArray[4].includes(position5[j])) {
                    isMatch = false;
                    break;
                }
            }
        }

        if (isMatch) {
            matchedPositionPositionsArray.push(positionsArray[i]);
        }
    }

    return matchedPositionPositionsArray;
}


//Calls the variable for the suggestions to be loaded into as a global variable
var jsonData = [];

//Fetchs and updates the global jsonData variable
fetch(chrome.runtime.getURL('words.json'))
    .then(response => response.json())
    .then(data => {
        jsonData = data;
        console.log(jsonData);
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
    });