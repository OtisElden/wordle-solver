//JS file for solving the wordle


//Buton listeners for the popup.html page
document.getElementById("solveButton").addEventListener("click", guessThatPokemon);
document.getElementById("newWindowButton").addEventListener("click", makeIntoWindow);

document.getElementById("wordleInputText").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        // Call the guessThatPokemon function when Enter key is pressed
        guessThatPokemon();
    }
});


//Function for getting the worlde input and sending it to other functions, returns those values on and displays on html
function guessThatPokemon(){

    let wordleInput = document.getElementById('wordleInputText').value;

    //Grabs arrays from the breakUpWord function and destructures them into usable variables
    let [wordlePosArray, arrayExtraChar, notLetters, notPositionArray] = breakUpWord(wordleInput);

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
    console.log("fin pos" + posStringRemove);



    //Function here to 
 








    // let positionsString = extraCharPositions.join(', ');

    document.getElementById("wordleSolved").innerHTML = posStringRemove.map(element => jsonData[element]).join("<br>");


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

            for (let i = 0; i < NotPositionData.length; i++){

                //Set active array to position1 if it finds a 1
                if(NotPositionData[i] === "1"){ activeArray = position1; }

                //Set active array to position2 if it finds a 2
                if(NotPositionData[i] === "2"){ activeArray = position2; }

                //Set active array to position3 if it finds a 3
                if(NotPositionData[i] === "3"){ activeArray = position3; }

                //Set active array to position4 if it finds a 4
                if(NotPositionData[i] === "4"){ activeArray = position4; }

                //Set active array to position5 if it finds a 5
                if(NotPositionData[i] === "5"){ activeArray = position5; }

                if(/[a-zA-Z]/.test(NotPositionData[i])){

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
function extrasPossible(matchingPos, extraChars){

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
function lettersNotIncluded(extraCharArray, removeLetters){

    
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



        if(position1.length > 0){
        // Check the first letter for letters in position1 array
        for (let j = 0; j < position1.length; j++) {
            if (jsonWordToStringsArray[0].includes(position1[j])) {
                isMatch = false;
                break;
            }
        }}

        if(position2.length > 0){
        // Check the second letter for letters in position2 array
        for (let j = 0; j < position2.length; j++) {
            if (jsonWordToStringsArray[1].includes(position2[j])) {
                isMatch = false;
                break;
            }
        }}

        if(position3.length > 0){
        // Check the third letter for letters in position3 array
        for (let j = 0; j < position3.length; j++) {
            if (jsonWordToStringsArray[2].includes(position3[j])) {
                isMatch = false;
                break;
            }
        }}

        if(position4.length > 0){
        // Check the fourth letter for letters in position4 array
        for (let j = 0; j < position4.length; j++) {
            if (jsonWordToStringsArray[3].includes(position4[j])) {
                isMatch = false;
                break;
            }
        }}

        if(position5.length > 0){
        // Check the fifth letter for letters in position5 array
        for (let j = 0; j < position5.length; j++) {
            if (jsonWordToStringsArray[4].includes(position5[j])) {
                isMatch = false;
                break;
            }
        }}

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


//Function here to move popup to a window
function makeIntoWindow(){
    
    chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 400,
    height: 400
}, function (window) {
    // window is created
});
}