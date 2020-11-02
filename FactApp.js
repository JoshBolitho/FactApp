const fs = require('fs');

const textFunctions = require('./TextFunctions');
const imageFunctions = require('./imageFunctions');
const postingFunctions = require('./PostingFunctions');


const markovFactor = 3;
const markovjson = `Dict${markovFactor}.json`;
const sentencejson = `SplitSentences.json`;

const sourceName = 'NewFacts.txt';
const nounFile = '91K nouns.txt';

const sourceImageName = "sourceImage.png";
const textImageName = "textImage.png";
const finalImageName ='finalImage.png';

//Generate split sentences .json file and the trained markov .json file
function generateMarkovJsons(source,sentenceName,markovName){
	try{
		//Split sentence array
		var array = textFunctions.populateSentenceArray(source);
		var jsonArray = JSON.stringify(array,null,4);
		fs.writeFileSync(sentenceName,jsonArray);

		//Trained markov array
		var dict = textFunctions.populateMarkovDictionary(array,markovFactor);
		var JsonDict = JSON.stringify(dict,null,4);
		fs.writeFileSync(markovName,JsonDict);

	}catch(err){
		console.log(err);
	}
}

function loadJson(jsonName){
	try{
		let jsonData = require(`./${jsonName}`);
		return jsonData;

	}catch(err){throw err;}
}

function generateTextFact(markovName, sentenceName){
	try{
		var dict = loadJson(markovName);
		var array = loadJson(sentenceName);
		var generatedSentence = textFunctions.generateSentence(dict,markovFactor,array);
		return generatedSentence;

	}catch(err){throw err;}
}

async function publishImagePost(markovName, sentenceName){
	try{
		//Generates a new markov-chain text fact.
		var textFact = generateTextFact(markovName,sentenceName);
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
		var caption = await postingFunctions.generateCaption(searchTerms);
		console.log(`Caption: \r\n${caption}\r\n`);
		
		//post image using fb api
		return postingFunctions.postImage(imageURL,caption);

	}catch(err){throw err;}
}

publishImagePost(markovjson, sentencejson);

// Exports
module.exports.generateMarkovJsons = generateMarkovJsons;
module.exports.loadJson = loadJson;
module.exports.generateTextFact = generateTextFact;
module.exports.publishImagePost = publishImagePost;

module.exports.sourceName = sourceName;
module.exports.markovjson = markovjson;
module.exports.sentencejson = sentencejson;