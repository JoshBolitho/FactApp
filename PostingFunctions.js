const {FB} = require('fb');
const cloudinary = require('cloudinary');

const Secrets = require('./Secrets');


const id = Secrets.FACEBOOK_ID;  
const access_token = Secrets.FACEBOOK_ACCESS_TOKEN;
FB.setAccessToken(access_token);


cloudinary.config({ 
    cloud_name: Secrets.CLOUDINARY_NAME, 
    api_key: Secrets.CLOUDINARY_API_KEY, 
    api_secret: Secrets.CLOUDINARY_API_SECRET 
});

// uploads to cloudinary, then runs postImage() with the image URL returned from cloudinary 
function uploadCloudinary(imagePath){
    return new Promise((resolve,reject) => {
        cloudinary.v2.uploader.upload(imagePath, (err, res) => {
            if(err) throw new console.error(`${err}`);
            console.log(res);
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

function generateCaption(inputNouns){
    // Insert Custom Caption Generation Here!
    return "Caption this!"
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