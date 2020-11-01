const fs = require('fs');
const canvas = require('canvas');
const jimp = require('jimp');

const Unsplash = require('unsplash-js').default;
const toJson = require('unsplash-js').toJson;
const fetch = require('node-fetch');
global.fetch = fetch;

const Secrets = require('./Secrets');


const unsplash = new Unsplash({ accessKey: Secrets.UNSPLASH_KEY});

const sideLength = 600;
const myCanvas = canvas.createCanvas(sideLength, sideLength)
const ctx = myCanvas.getContext('2d')


function setTextProperties(){
	try{
		ctx.font = 'italic 40px Arial';
		ctx.fillStyle = 'white';
		ctx.textAlign = "center";
	}catch(err){throw err;}
}

//Render sentence nicely on canvas
const lineHeight = 40;
const firstLineHeight = 50;

const maxTextWidth = sideLength-200;// pixels
const linesAllowed = 14;
var linesFilled = 0;// records number of rows filled, also used to position the yPos of each line when drawing

function drawTextSentence(sentence, textImageName){
	try{
		setTextProperties();

		var splitSentence = sentence.split(" ");
		var arrayLocation = 0;// records what part of the sentence array the renderer is at

		while(arrayLocation < splitSentence.length && linesFilled < linesAllowed){
			var currentLine = '';
			var lineFilled = false;
			while(!lineFilled){
				var currentLineTest = currentLine + ' ' + splitSentence[arrayLocation];
				var textWidth = ctx.measureText(currentLine).width;
				if(textWidth>maxTextWidth){
					drawTextLine(currentLine,linesFilled*lineHeight+firstLineHeight);
					// console.log(`1: ${currentLine}`);
					linesFilled++;
					lineFilled = true;
					}else{
						currentLine = currentLineTest;
						arrayLocation++;
					if(arrayLocation == splitSentence.length){
						drawTextLine(currentLine,linesFilled*lineHeight+firstLineHeight);
						// console.log(`2: ${currentLine}`);
						lineFilled = true;// for the sake of making it work, line is not necesarily filled in this case
						break;
					}
				}
			}
		}

		outputImage(textImageName);

	}catch(err){throw err;}
}

//Used by drawTextSentence, draws a centered sentence
function drawTextLine(textLine, yValue){
	try{

		ctx.globalAlpha = 0.8;
		ctx.beginPath();
		ctx.rect(0,yValue-lineHeight+7, sideLength,lineHeight);
		ctx.fillStyle = 'black';
		ctx.fill();

		ctx.globalAlpha = 1;
		setTextProperties();
		ctx.fillText(textLine, sideLength/2, yValue);

	}catch(err){throw err;}
}


function outputImage(name){
	out = fs.createWriteStream(__dirname + `/${name}`), stream = myCanvas.pngStream();

	stream.on('data', function(chunk){
		out.write(chunk);
	});

	// stream.on('end', function(){
	// 	// console.log(`${name} saved\r\n`);
	// });

}

function searchUnsplash(searchTerms){
	return unsplash.search.photos(searchTerms, 1, 10)
  		.then(toJson)
		.then(json => {
			resultArray = json.results;
			chosenImage = resultArray[Math.floor(Math.random()*resultArray.length)];
			return chosenImage.urls.regular;
		});
}

function cropImageToSquare(source, sourceImageName){

	return jimp.read(source)
	.then(image => {
		var imgWidth = image.getWidth();
		var imgHeight = image.getHeight();

		if(imgHeight>imgWidth){
			var diff = imgHeight-imgWidth;
			image.resize(sideLength,jimp.AUTO).crop(0,diff/2,sideLength,sideLength).write(sourceImageName);
		}else{
			var diff = imgWidth-imgHeight; 
			image.resize(jimp.AUTO,sideLength).crop(diff/2,0,sideLength,sideLength).write(sourceImageName);
		}

	}).catch(function(err){
		console.error(err);
	});

}

async function combineElements(sourceImageName, textImageName, finalImageName) {
	try{

		const image = await jimp.read(sourceImageName).catch(function (err){throw err;})
		const text = await jimp.read(textImageName).catch(function (err){throw err;})
				
		image.blit(text, 0, 0).write(finalImageName);
		
	}catch(err){throw err;}
}


module.exports.drawTextSentence = drawTextSentence;
module.exports.outputImage = outputImage;
module.exports.cropImageToSquare = cropImageToSquare;
module.exports.searchUnsplash = searchUnsplash;
module.exports.combineElements = combineElements;