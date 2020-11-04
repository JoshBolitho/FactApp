const fs = require('fs');

const textFunctions = require('./TextFunctions');
const imageFunctions = require('./imageFunctions');
const postingFunctions = require('./PostingFunctions');
const commentFunctions = require('./CommentFunctions');

//Config
const markovFactor = 3;
const markovjson = `Dict${markovFactor}.json`;
const sentencejson = `SplitSentences.json`;

const sourceFile = 'NewFacts.txt';
const nounFile = '91K nouns.txt';

const croppedImageFile = "croppedImage.png";
const textImageFile = "textImage.png";
const finalImageFile ='finalImage.png';

const recentPostjson = 'RecentPosts.json';


//Generate split sentences .json file and the trained markov .json file
function generateMarkovJsons(){
	try{
		//Split sentence array
		var array = textFunctions.populateSentenceArray(sourceFile);
		var jsonArray = JSON.stringify(array,null,4);
		fs.writeFileSync(sentencejson,jsonArray);

		//Trained markov array
		var dict = textFunctions.populateMarkovDictionary(array,markovFactor);
		var JsonDict = JSON.stringify(dict,null,4);
		fs.writeFileSync(markovjson,JsonDict);

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

async function publishImagePost(){
	try{
		//Generates a new markov-chain text fact.
		var textFact = generateTextFact(markovjson,sentencejson);
		console.log(`Fact: ${textFact}\r\n`);
		
		//Attempts to retrieve useful image search keywords from generated text fact. 
		var searchTerms = textFunctions.findNouns(nounFile, textFact);
		console.log(`Chosen search terms: ${searchTerms}\r\n`);
		
		//Image search using the Unsplash image search api
		var chosenImageURL = await imageFunctions.searchUnsplash(searchTerms);
		console.log(`Unsplash Image URL: ${chosenImageURL}\r\n`);
		
		//Download and crop image to square.
		await imageFunctions.cropImageToSquare(chosenImageURL,croppedImageFile);
		console.log(`Cropped image saved: ${croppedImageFile}\r\n`);

		//Drawing fact text to a blank image file. 
		await imageFunctions.drawTextSentence(textFact, textImageFile);
		console.log(`Text image saved: ${textImageFile}\r\n`);

		//Overlay cropped image with text image and save as "finalImage"
		await imageFunctions.combineElements(croppedImageFile,textImageFile,finalImageFile);
		console.log(`Final image saved: ${finalImageFile}\r\n`);

		//Upload final image to cloudinary 
		var imageURL = await postingFunctions.uploadCloudinary(`.\\${finalImageFile}`);
		console.log(`Cloudinary URL: ${imageURL}\r\n`);

		//Create a caption for the facebook post 
		var caption = await postingFunctions.generateCaption(searchTerms);
		console.log(`Caption: \r\n${caption}\r\n`);
		
		//post image using fb api
		var postID = await postingFunctions.postImage(imageURL,caption);

		//Update recent posts file 
		commentFunctions.updateRecentPostJson(recentPostjson,postID);

		// Optional: Add comment to post
		commentFunctions.writeComment(postID,"bad bad bullshit");

		return postID

	}catch(err){throw err;}
}

async function respondToRecentPosts(){
	commentFunctions.respondToRecentPosts(recentPostjson);
}

if(process.argv.includes("-post") || process.argv.includes("-p")){
	publishImagePost();
}

if(process.argv.includes("-comment") || process.argv.includes("-c")){
	respondToRecentPosts();
}

if(process.argv.includes("-setup") || process.argv.includes("-s")){
	generateMarkovJsons();
}


// Exports
module.exports.generateMarkovJsons = generateMarkovJsons;
module.exports.loadJson = loadJson;
module.exports.generateTextFact = generateTextFact;
module.exports.publishImagePost = publishImagePost;