const fs = require('fs');


function populateDictionary(fileName,markovFactor){
    // markovFactor can be 1 - 3
    
    try{
        // Loads the file into array
        var factArray = fs.readFileSync(fileName).toString().split('\n');
        console.log(`Length: ${factArray.length}`)
        factArray = [...new Set(factArray)];
        console.log(`Unique Length: ${factArray.length}`)

        // Add "Start1 Start2 Start3 " to the beginning of every sentence.
        // This gives the markov chain generator context for the start of the sentence in chains using up to 4 previous words
        for(i=0;i<factArray.length;i++){
            factArray[i] =  `Start1 Start2 Start3 ${factArray[i]}`;
        }

        // This dictonary will pair a list containing groups of words with a list of single words likely to follow them
        var dictionary = [];

        //All characters that must preserve their position with the words around them.
        // Items in the matching list are treated as individual words
        const matching = [", "," ,",': ','; ',', ',",'",',"','-',' -','. ',".'",'."','" ',' "',' $','% ','! ','!"',"!'"," a ","?","=","+","'"];
        // Items in the splitting list are removed and used as a place to split words
        const splitting = [' '];

        // Loop through the fact list, process each sentence.
        for(i=0;i<factArray.length;i++){

            var currentSentence = factArray[i];
            // console.log(currentSentence);
            var processedSentence = [];

            // current char position in the sentence
            var pos = 0;
            // char position of last place the sentence was sliced
            var lastSlice = 0;
            
            var isSentenceProcessed = false;
            
            while(!isSentenceProcessed){

                if(pos >= currentSentence.length-2){
                    // Adds the final slice if necessary
                    if(lastSlice<pos){
                        processedSentence.push(currentSentence.slice(lastSlice,currentSentence.length));
                    }
                    //sentence is now processed into the processedSentence array, loop is finished.
                    isSentenceProcessed = true;
                    break;
                }
                
                //matching items in the matching list
                for(j=0;j<matching.length;j++){

                    var restOfSentence = currentSentence.slice(pos,currentSentence.length)
                    // console.log(restOfSentence);
                    if(startsWith(restOfSentence,matching[j])){
                        
                        if(lastSlice<pos-1){
                            processedSentence.push(currentSentence.slice(lastSlice,pos));
                        }
                        var matchLength = matching[j].length;
                        
                        processedSentence.push(currentSentence.slice(pos,pos+matchLength));
                        
                        pos += matchLength;
                        lastSlice = pos;
                        
                        continue;
                    }
                }

                //splitting with items in splitting list
                for(j=0;j<splitting.length;j++){
                    if(currentSentence.charAt(pos) === splitting[j]){
                        // a character from the splitting list has been matched, the pos will be moved forward by one,
                        // effectively splitting the string where the character was matched.
                        // also previous characters in the string up to posare sliced and lastSliceis reset to pos
                        if(lastSlice<pos-1){
                            processedSentence.push(currentSentence.slice(lastSlice,pos))
                        }
                        pos += 1;
                        //the next slice will start after the identified character.
                        lastSlice = pos;
                        // Loop moves to the next position in the currentSentence
                        continue;
                    }
                }
                //if no parts have been sliced yet, iterate:
                pos++;
            }
            //deals with full stops at the very end of the sentence
            // console.log(currentSentence);
            var lastWord = processedSentence.pop();
            if(lastWord.replace(/([.])$/gm,"") != lastWord){
                // remove fullstop from the end
                lastWord = lastWord.replace(/([.])$/gm,"");
                // remove \r from the end
                lastWord = lastWord.replace(/(\r)/gm,"");
                processedSentence.push(lastWord);
                //add an full stop as its own word
                processedSentence.push('.');
            }else{
                processedSentence.push(lastWord);
            }

            // Remove \r from the end of each line
            processedSentence[processedSentence.length-1] = processedSentence[processedSentence.length-1].replace(/(\r)/gm,"");

            // This string will represent a sentence end. once the generator reaches an "End1" it will stop generating
            processedSentence.push("End1");

            // Print the processed sentences
            // console.log(processedSentence);

            // Populate the dictionary
            for(j=markovFactor;j<processedSentence.length;j++){
                var chain = [];
                // Adds the 2 or 3 previous words to chain array (2 or 3 depending on what the markovFactor is) 
                for(k=0;k<markovFactor;k++){
                    chain.push(processedSentence[j-markovFactor+k]);
                }
                // console.log(`chain: ${chain}`);

                // Search the dictionary for an existing key
                var pairLoc = dictionary.findIndex((pair) =>{
                    return compareArrays(pair[0],chain);
                })
                // console.log(`pair location: ${pairLoc}`);
                
                // If key value pair already exists
                if(pairLoc >= 0){
                    // Add to the value array of the existing pair
                    dictionary[pairLoc][1].push(processedSentence[j]);
                }else{
                    // Otherwise, create a new key value pair
                    dictionary.push([chain,[processedSentence[j]]]);
                }
            }
        }
        return dictionary;
        // console.log(dictionary);

    }catch(err){throw err;}
}

function compareArrays(arr1, arr2){
    try{

        return JSON.stringify(arr1) == JSON.stringify(arr2);

    }catch(err){throw err;}
}

//Generate a sentence
function generateSentence(dictionary,markovFactor,factArray){
    try{
            
    // var generateSentence = function(dictionary, markovFactor) {    
        var sentenceFinished = false;
        var constructedSentence = [];
        var currentWords = ['Start3'];

        if(markovFactor == 3){
            currentWords = ['Start1','Start2','Start3'];
        }
        if(markovFactor == 2){
            currentWords = ['Start2','Start3'];
        }

        while(!sentenceFinished){
            // Locate pair, Assuming the key value pair should exist.
            // console.log('adding word');
            var pairLocation = dictionary.findIndex((pair) =>{
                // console.log(`comparing ${pair[0]} with ${currentWords}`);
                return compareArrays(pair[0],currentWords);
            })


            //debugging, surely this should never happen
            if(pairLocation == -1){
                console.log(`Error: can't find match for ${currentWords}`);
            }

            var nextWord = dictionary[pairLocation][1][Math.floor(Math.random()*dictionary[pairLocation][1].length)];

            constructedSentence.push(nextWord);
            // Remove the first element of current words
            currentWords.shift()
            // Add the new word to current words
            currentWords.push(nextWord);

            if(nextWord == 'End1'){
                sentenceFinished = true;
            }
        }
        // remove End1 from the end
        constructedSentence.pop();

        //Print the Array
        // console.log(constructedSentence);

        const noPreceedingSpaces = [", "," ,",': ','; ',', ',",'",',"','-',' -','. ',".'",'."','" ',' "',' $','% ','! ','!"',"!'",' a ',"?",'.',"'"];
        // Characters which will not be allowed to have spaces after them
        const noSucceedingSpaces = [", "," ,",': ','; ',', ','-','. ','" ',' "',' $','% ','! ',' a ','.',"'"];
        // build the sentence correctly using the words in constructedSentence

        // Add first word
        var connectedSentence = constructedSentence[0];
        for(i=1;i<constructedSentence.length;i++){
            //whether or not to add preceeding space
            if(!(noSucceedingSpaces.includes(constructedSentence[i-1]) || noPreceedingSpaces.includes(constructedSentence[i]))){
                connectedSentence += ' ';
            }
            connectedSentence += constructedSentence[i];
        }
        for(i=0;i<factArray.length;i++){
            if(factArray[i].toLowerCase().includes(connectedSentence.toLowerCase())){
                return generateSentence(dictionary,markovFactor,factArray);
            }
        }
        return connectedSentence;

    }catch(err){throw err;}
}


const searchNouns = 2;
function findNouns(nounFile, sentence){
    try{

        // load the dictionary
        var nouns = fs.readFileSync(nounFile).toString().split('\n');
        var possibleNouns = [];
        var sentenceArray = sentence.split(' ');
        if(sentenceArray.length == 0){throw new console.error("Empty Sentence!")}
        for(i=0;i<sentenceArray.length;i++){
            if(nouns.find(function(element) {
                return JSON.stringify(element.trim()) == JSON.stringify(sentenceArray[i].trim());
            })){
                possibleNouns.push(sentenceArray[i]);        
                // console.log('valid: ' + sentenceArray[i]);
            }
        }

        // choose nouns to search with
        var chosenNouns = [];
        while(possibleNouns.length > 0 && chosenNouns.length < searchNouns){
            var nounIndex = Math.floor(Math.random()*possibleNouns.length);
            chosenNouns.push(possibleNouns[nounIndex]);
            // console.log('chosen: ' + possibleNouns[nounIndex]);

            possibleNouns.splice(nounIndex,1);
        }
        // console.log('chosenNouns: ' + chosenNouns);
        if(chosenNouns.length == 0){
            var random = sentenceArray[Math.floor(Math.random()*sentenceArray.length)];
            if(!(random == "") && !(random == undefined) ){
                chosenNouns.push(random)
            }else{
                chosenNouns.push('cats')
            }
        }
        return chosenNouns.join(' ');

    }catch(err){throw err;}
}

function startsWith(str, test){
    if(str.length < test.length){return false;}

    for(k=0;k<test.length;k++){
        if(! (str.charAt(k) == test.charAt(k)) ){return false;}
    }
    return true;
}

module.exports.generateSentence = generateSentence;
module.exports.populateDictionary = populateDictionary;
module.exports.findNouns = findNouns;