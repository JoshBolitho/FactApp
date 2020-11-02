const fs = require('fs');

const textFunctions = require('./TextFunctions');
const imageFunctions = require('./imageFunctions');
const postingFunctions = require('./PostingFunctions');


const markovFactor = 3;
const jsonName = `Dict${markovFactor}.json`;

const sourceName = 'NewFacts.txt';
const nounFile = '91K nouns.txt';

const sourceImageName = "sourceImage.png";
const textImageName = "textImage.png";
const finalImageName ='finalImage.png';


function generateDictionaryJson(source, jsonName){
	try{
		var dict = textFunctions.populateDictionary(source,markovFactor);
		var JsonDict = JSON.stringify(dict);
		fs.writeFileSync(jsonName,JsonDict);
	}catch(err){
		console.log(err);
	}
}


function loadDictionaryJson(jsonName){
	try{
		let jsonData = require(`./${jsonName}`);
		return jsonData;

	}catch(err){throw err;}
}

function generateTextFact(jsonName){
	try{
		var factArray = fs.readFileSync(sourceName).toString().split('\n');

		var dict = loadDictionaryJson(jsonName);
		var generatedSentence = textFunctions.generateSentence(dict,markovFactor,factArray);
		return generatedSentence;

	}catch(err){throw err;}
}

async function publishImagePost(jsonName){
	try{
		//Generates a new markov-chain text fact.
		var textFact = generateTextFact(jsonName);
		console.log(`Fact: ${textFact}\r\n`);
		
		//Attempts to retrieve useful image search keywords from generated text fact. 
		var searchTerms = textFunctions.findNouns(nounFile, textFact);
		console.log(`Chosen search terms: ${searchTerms}\r\n`);
		
		//Image search using the Unsplash image search api
		var chosenImageURL = await imageFunctions.searchUnsplash(searchTerms);
		console.log(`Unsplash Image URL: ${chosenImageURL}\r\n`);
		
		//Download and crop image to square.
		await imageFunctions.cropImageToSquare(chosenImageURL,sourceImageName);
		
		//Drawing fact text to a blank image file. 
		imageFunctions.drawTextSentence(textFact, textImageName);

		//Overlay cropped image with text image and save as "finalImage"
		await imageFunctions.combineElements(sourceImageName,textImageName,finalImageName);

		//Upload final image to cloudinary 
		var imageURL = await postingFunctions.uploadCloudinary(`.\\${finalImageName}`);
		console.log(`Cloudinary URL: ${imageURL}\r\n`);

		//Create a caption for the facebook post 
		var caption = postingFunctions.generateCaption(searchTerms);
		console.log(`Caption: ${caption}\r\n`);
		
		//post image using fb api
		return postingFunctions.postImage(imageURL,caption);

	}catch(err){throw err;}
}

//Main 
function main(){
	publishImagePost(jsonName);
}
publishImagePost(jsonName);

// Exports
module.exports.generateDictionaryJson = generateDictionaryJson;
module.exports.loadDictionaryJson = loadDictionaryJson;
module.exports.generateFact = generateTextFact;
module.exports.publishImagePost = publishImagePost;

//Testing
module.exports.main = main;
module.exports.sourceName = sourceName;
module.exports.jsonName = jsonName