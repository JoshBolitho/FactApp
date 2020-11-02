const {FB} = require('fb');
const cloudinary = require('cloudinary');
const fetch = require('node-fetch');


const Secrets = require('./Secrets');


const id = Secrets.FACEBOOK_ID;  
const access_token = Secrets.FACEBOOK_ACCESS_TOKEN;
FB.setAccessToken(access_token);


cloudinary.config({ 
    cloud_name: Secrets.CLOUDINARY_NAME, 
    api_key: Secrets.CLOUDINARY_API_KEY, 
    api_secret: Secrets.CLOUDINARY_API_SECRET 
});


// Uploads to cloudinary, then runs postImage() with the image URL returned from cloudinary 
async function uploadCloudinary(imagePath){
    //It appears the best way to test a valid image file exists is to try access it, and handle any errors caused.
    //Therefore, the current solution is to try 5 times. If cloudinary upload fails after 5 attempts, we abort the upload. 

    for(i=1; i<6;i++){
        try{
            var res = await attemptUploadCloudinary(imagePath);
        }catch(e){
            continue;
        }finally{
            console.log(`Cloudinary upload attempt ${i} successful.\r\n`);
            return res;
        }
    }
    //upload has failed 5 times, aborting upload.
    throw new error(`UploadCloudinary() failed 5 times.`);
}

//Attempt an upload, throw any errors. 
//This function is called by uploadCloudinary()
async function attemptUploadCloudinary(imagePath){

    return new Promise((resolve,reject) => {
        cloudinary.v2.uploader.upload(imagePath, (err, res) => {
            if(err) throw err;
            return resolve(res.url);
        });
    })
}

// Uses the FB api to post and image from a cloudinary url, or any other url.  
function postImage(imageUrl, caption){
    try{
        FB.api(`${id}/photos`, "post", {
            url: imageUrl,
            caption: caption
        }, res => {
            if (!res || res.error) {
                console.log(!res ? "Error occurred" : res.error);
                throw new console.error(`${error}`)
            }
            var postID = res.post_id;
            if(!(postID == "")){
                console.log("Success. Post ID: " + postID);
                return true;
            }
            console.log("Failed. Post ID: " + postID);
            return false;
        });

    }catch(err){throw err;}
}

async function generateCaption(inputNouns){
    var sources = "Source(s): "
    for(i=0;i<inputNouns.length;i++){
        var json = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${inputNouns[i]}&namespace=0&limit=10`)
        .then(res => res.json())
        .catch((error) => {
            console.error(error);
        });

        // console.log(json);

        if(json[3].length>0){
            sources += `${json[3][0]}\n`;
        }
    }
    
    return sources;
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

module.exports.postImage = postImage;
module.exports.uploadCloudinary = uploadCloudinary;
module.exports.generateCaption = generateCaption;