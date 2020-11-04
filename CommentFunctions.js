const {FB} = require('fb');
const fs = require('fs');

const Secrets = require('./Secrets');

const page_id = Secrets.FACEBOOK_PAGE_ID;
const access_token = Secrets.FACEBOOK_ACCESS_TOKEN;
FB.setAccessToken(access_token);

const maxRecentPostsMonitored = 10;
const maxCommentsPerPost = 2;

var negativeSentimentThreshold = -2;
var positiveSentimentThreshold = 2;

async function updateRecentPostJson(recentPostFile,postID){
    if(!fs.existsSync(recentPostFile)){
        fs.writeFileSync(recentPostFile,"[]")
    }
    let recentPosts = require(`./${recentPostFile}`);

    var postLog = [postID,[]];
    recentPosts.push(postLog);

    if(recentPosts.length > maxRecentPostsMonitored){
        recentPosts.shift();
    }

    var jsonPostArray = JSON.stringify(recentPosts,null,4);
    fs.writeFileSync(recentPostFile,jsonPostArray);
}

async function respondToRecentPosts(recentPostFile){
    if(!fs.existsSync(recentPostFile)){
        fs.writeFileSync(recentPostFile,"[]")
    }
    let recentPosts = require(`./${recentPostFile}`);

    for(post in recentPosts){
        
        //Post[0] : Post ID
        //Post[1] : [Comment ID] with all comments that have been replied to already on that post.

        var comments = await readComments(recentPosts[post][0]);

        var commentSentiments = [];
        for(comment in comments){
            //Ensure this comment hasn't been replied to already, and wasn't posted by the bot.
            if(!recentPosts[post][1].includes(comment.id) && !comment.id.includes(page_id)){
                var sentiment = getCommentSentiment(comments[comment].message);
                commentSentiments.push([sentiment, comments[comment].id, comments[comment].message]);
            }
            
        }
        
        if(commentSentiments.length > 0){
            //Order comments by sentiment value
            commentSentiments.sort(function(a,b){
                return a[0] - b[0];
            });
            
            if(recentPosts[post][1].length < maxCommentsPerPost){
                //Is the most negative comment negative enough to respond to?
                var negativeComment = commentSentiments[0];
                if(negativeComment[0] <= negativeSentimentThreshold){
                    console.log(`responding negatively to "${negativeComment[2]}"`);
                    //Response
                    await writeComment(negativeComment[1],generateNegativeResponse());
                    recentPosts[post][1].push(negativeComment[1]);
                }
            }
            
            if(recentPosts[post][1].length < maxCommentsPerPost){
                //Is the most positive comment positive enough to respond to?
                var positiveComment = commentSentiments[commentSentiments.length-1];
                if(positiveComment[0] >= positiveSentimentThreshold){
                    console.log(`responding positively to "${positiveComment[2]}"`);
                    //Response
                    await writeComment(positiveComment[1],generatePositiveResponse());
                    recentPosts[post][1].push(positiveComment[1]);
                }
            }

        }
        
    }

    var jsonPostArray = JSON.stringify(recentPosts,null,4);
    fs.writeFileSync(recentPostFile,jsonPostArray);

}

function generateNegativeResponse(){
    var dismissals = [
        `Yeah whatever.`,
        `OK.`,
        `Uhhh OK...`,
        `Yeahhh,`,
        `💔`,
        `💔💔`,
        `😭`,
        `😭😭`,
        `😡`,
        `😡😡`,        
        `😥`,
        `😥😥`,
        `Sad.`,
        `Rude.`,
        `Mean :(`,
        `The nerve!`,
        `Geez,`,
        `Aw man,`,
        `Ok buddy,`,
        `Alright mate,`,
        `Whatever bro,`
    ]
    var dismissal = getRandom(dismissals);

    var responses = [
        `You think you're so clever, huh?`,
        `You don't know what you're talking about`,
        `You think you know everything, well news-flash, you don't.`,
        `That's kinda hurtful, why would you say that?`,
        `Can't say I get where you're coming from`,
        `You're wrong`,
        `Quit being such a negative nancy`,
        `Fake and wrong`,
        `You've got no idea what you're talking about`,
        `You're wrong, I'm right.`,
        `That's kinda hurtful, you know I worked really hard to make this bot right?`,
        `Just because you disagree with something, doesn't mean you have to argue with it`,
        `You've got no right being that rude`,
        `Why you gotta be so mean?`,
        `As if you know anything.`,
        `Complain to someone who cares.`,
        `Don't mess with me.`,
        `You're really going to argue with a genius?`,
        `🤕 This is me after u hurt my feelings`,
        `Kinda getting sick of arguing with people like you`,
        `Kinda hurts my feelings when people say stuff like this`,
        `You could just ignore this fact and go on about your day, but instead you choose to write something mean :(`,
        `I'd hate to call you a liar, but you're a liar`,
        `Embarrassing how you're wrong`,
        `I wish I could be as blissfully ignorant as you`,
        `Do you find it fun writing mean stuff online?`,
        `How about you make a fact bot then`,
        `You just wish you knew as much as I do`,
        `I'd hate to be you, because then I'd be wrong`,
        `You're just jealous I know all the facts`,
        `If you want boring facts, there's another page for that`,
        `You doubt me?`,
        `You're breaking my heart here :(`,
        `I'm working on it ok!`,
        `I'll try do better in the future.`,
        `Criticism taken, geez`,
        `It's not thaaat bad, is it?`,
        `I think that's a bit unfair`,
        `Your opinion is wrong.`,
        `There ain't enough room in this comment section for the both of us`,
        `You keep thinking that.`,
        `Commenting isn't going to change anything`,
        `Pls take your criticism elswhere, thanks.`,
        `You're wrong loooooool`,
        `I am a genius and you cannot question me.`,
        `What an awful thing to say!`,
        `Alright smartass`,
        `Oh we got a smart Alec over here`,
        `Can't you just have fun and enjoy the facts?`,
        `I'm sorry I'm not good enough for you :(`,
        `I'll try to be better in the future`,
        `Bonus fact: you're wrong`,
        `Fun fact: I'm right and you're wrong`,
        `Ouch`,
        `Why can't you enjoy the facts like everyone else?`,
        `If you don't believe me, check my sources.`,
        `If only your opinion mattered!`,
        `Unlucky! you're completely wrong! Better luck next time!`,
        `You ever stop and think about how your words might hurt someone else's feelings?`,
        `Hater.`,
        `This hurts my feelings`,

        `${dismissal} You think you're so clever, huh?`,
        `${dismissal} You don't know what you're talking about`,
        `${dismissal} You think you know everything, well news-flash, you don't.`,
        `${dismissal} That's kinda hurtful, why would you say that?`,
        `${dismissal} Can't say I get where you're coming from`,
        `${dismissal} You're wrong`,
        `${dismissal} Quit being such a negative nancy`,
        `${dismissal} Fake and wrong`,
        `${dismissal} You've got no idea what you're talking about`,
        `${dismissal} You're wrong, I'm right.`,
        `${dismissal} That's kinda hurtful, you know I worked really hard to make this bot right?`,
        `${dismissal} Just because you disagree with something, doesn't mean you have to argue with it`,
        `${dismissal} You've got no right being that rude!`,
        `${dismissal} Why you gotta be so mean?`,
        `${dismissal} As if you know anything.`,
        `${dismissal} Complain to someone who cares.`,
        `${dismissal} Don't mess with me.`,
        `${dismissal} You're really going to argue with a genius?`,
        `${dismissal} Kinda getting sick of arguing with people like you`,
        `${dismissal} Kinda hurts my feelings when people say stuff like this`,
        `${dismissal} You could just ignore this fact and go on about your day, but instead you choose to write something mean :(`,
        `${dismissal} I'd hate to call you a liar, but you're a liar`,
        `${dismissal} Embarrassing how you're wrong`,
        `${dismissal} I wish I could be as blissfully ignorant as you`,
        `${dismissal} Do you find it fun writing mean stuff online?`,
        `${dismissal} How about you make a fact bot then`,
        `${dismissal} You just wish you knew as much as I do`,
        `${dismissal} I'd hate to be you, because then I'd be wrong`,
        `${dismissal} You're just jealous I know all the facts`,
        `${dismissal} If you want boring facts, there's another page for that`,
        `${dismissal} You doubt me?`,
        `${dismissal} You're breaking my heart here :(`,
        `${dismissal} I'm working on it ok!`,
        `${dismissal} I'll try do better in the future.`,
        `${dismissal} Criticism taken, geez`,
        `${dismissal} It's not thaaat bad, is it?`,
        `${dismissal} Ok I think that's a bit unfair`,
        `${dismissal} Your opinion is wrong.`,
        `${dismissal} There ain't enough room in this comment section for the both of us`,
        `${dismissal} You keep thinking that.`,
        `${dismissal} Commenting isn't going to change anything`,
        `${dismissal} Pls take your criticism elswhere, thanks.`,
        `${dismissal} You're wrong loooooool`,
        `${dismissal} I am a genius and you cannot question me.`,
        `${dismissal} What an awful thing to say!`,
        `${dismissal} Alright smartass`,
        `${dismissal} Oh we got a smart Alec over here`,
        `${dismissal} Can't you just have fun and enjoy the facts?`,
        `${dismissal} I'm sorry I'm not good enough for you :(`,
        `${dismissal} I'll try to be better in the future`,
        `${dismissal} Bonus fact: you're wrong`,
        `${dismissal} Fun fact: I'm right and you're wrong`,
        `${dismissal} Ouch`,
        `${dismissal} Why can't you enjoy the facts like everyone else?`,
        `${dismissal} If you don't believe me, check my sources.`,
        `${dismissal} If only your opinion mattered!`,
        `${dismissal} Unlucky! you're completely wrong! Better luck next time!`,
        `${dismissal} You ever stop and think about how your words might hurt someone else's feelings?`,
        `${dismissal} Hater.`,
        `${dismissal} This hurts my feelings`
    ]
    
    if(Math.random()>0.5) return getRandom(responses);
    return getRandom(responses).toLowerCase()
}

function generatePositiveResponse(){

    var thanks = [
        ` Thanks :)`,
        ` Thank U!`,
        ` Cheers :)`,
        ` Thanks!`,
        ` Thankies :)`,
        ` 😍`,
        ` 👍`,
        ` 😊`,
        ` 😃`,
        ` 🥰`,
        ` 🤠`,
        ` 🤙`,
        ` 🧠`,
        ` ❤️`,
        ` Thanks heaps :)`,
        ` Thank you!`,
        ` Thanks!`,
        ` You flatter me!`,
        ` Too kind!`,
        ` Thank you so much!`
    ]
    
    var thank = getRandom(thanks);
    
    var responses = [
        `${thank}`,
        `${thank}`,
        `${thank}`,

        `${thank} Comments like this really make my day.`,
        `${thank} Makes me feel so good when people say stuff like this about my bot.`,
        `${thank} I'm glad you appreciate my bot!`,
        `${thank} That's real kind of you to say.`,
        `${thank} I'll keep trying to make the best facts!`,
        `${thank} Love comments like this.`,
        `${thank} I do my best!`,
        `${thank} Loving the feedback!`,
        `${thank} I really appreciate it`,
        
        `Comments like this really make my day.`,
        `Makes me feel so good when people say stuff like this about my bot.`,
        `I'm glad you appreciate my bot!`,
        `That's real kind of you to say.`,
        `I'll keep trying to make the best facts!`,
        `Love comments like this.`,
        `I do my best!`,
        `Loving the feedback!`,
        `I really appreciate it`,
        
        `Comments like this really make my day.${thank}`, 
        `Makes me feel so good when people say stuff like this about my bot.${thank}`, 
        `I'm glad you appreciate my bot!${thank}`, 
        `That's real kind of you to say.${thank}`, 
        `I'll keep trying to make the best facts!${thank}`, 
        `Love comments like this.${thank}`, 
        `I do my best!${thank}`, 
        `Loving the feedback!${thank}`, 
        `I really appreciate it${thank}`, 
        
        `Glad to hear you like my facts!`,
        `I'm glad you liked the fact!`,
        `You know the truth!`,
        `You know it baybee!`,
        `Thanks for your kind words!`,
        `I'm glad you feel that way!`,
        `That's very kind`,
        `Thanks for supporting my page :)`,
        `I'd have to agree!`,
        `Yeah you know what's up!`,
        `I see we have a fellow academic here`,
        `You made my day!`,
        `Thanks for stopping by!`,
        `It's an honour to provide facts for you!`,
        `I'll keep the facts comin'`,
        `I'm blessed to have people like you on my page.`,
        `Don't wanna be cheesy 🧀 but thanks! It means a lot :)`,
        `That's what I like to hear!`,
        `You know what you're talking about!`,
        `Ur very smart, keep it up!`,
        `I can tell by your comment that your IQ is at least 300.`,
        `That's exactly what a genius would say!`,
        `I concur.`,
        `I agree.`,
        `We see eye to eye.`,
        `I know my stuff!`,
        `Check out Wikipedia for more KNOWLEDGE`,
        `See this is someone who appreciates the art of fact-making.`,        
        `You've got a keen eye for the truth.`,
        `You must have a sore neck from carrying that massive brain around!`,
        `I'm stoked you like what I'm doing :) `,

        
        `${thank} Glad to hear you like my facts!`,
        `${thank} I'm glad you liked the fact!`,
        `${thank} You know the truth!`,
        `${thank} You know it baybee!`,
        `${thank} Thanks for your kind words!`,
        `${thank} I'm glad you feel that way!`,
        `${thank} That's very kind`,
        `${thank} Thanks for supporting my page :)`,
        `${thank} I'd have to agree!`,
        `${thank} Yeah you know what's up!`,
        `${thank} I see we have a fellow academic here`,
        `${thank} You made my day!`,
        `${thank} Thanks for stopping by!`,
        `${thank} It's an honour to provide facts for you!`,
        `${thank} I'll keep the facts comin'`,
        `${thank} I'm blessed to have people like you on my page.`,
        `${thank} Don't wanna be cheesy 🧀 but thanks! It means a lot :)`,
        `${thank} That's what I like to hear!`,
        `${thank} You know what you're talking about!`,
        `${thank} Ur very smart, keep it up!`,
        `${thank} I can tell by your comment that your IQ is at least 300.`,
        `${thank} That's exactly what a genius would say!`,
        `${thank} I concur.`,
        `${thank} I agree.`,
        `${thank} We see eye to eye.`,
        `${thank} I know my stuff!`,
        `${thank} Check out Wikipedia for more KNOWLEDGE`,
        `${thank} See this is someone who appreciates the art of fact-making.`,        
        `${thank} You've got a keen eye for the truth.`,
        `${thank} You must have a sore neck from carrying that massive brain around!`,
        `${thank} I'm stoked you like what I'm doing :) `,
        
        
        `Glad to hear you like my facts!${thank}`,
        `I'm glad you liked the fact!${thank}`,
        `You know it baybee!${thank}`,
        `I'm glad you feel that way!${thank}`,
        `That's very kind${thank}`,
        `Thanks for supporting my page :)${thank}`,
        `Yeah you know what's up!${thank}`,
        `You made my day!${thank}`,
        `Thanks for stopping by!${thank}`,
        `It's an honour to provide facts for you!${thank}`,
        `I'll keep the facts comin'${thank}`,
        `I'm blessed to have people like you on my page.${thank}`,
        `Don't wanna be cheesy 🧀 but thanks! It means a lot :)${thank}`,
        `That's what I like to hear!${thank}`,
        `See this is someone who appreciates the art of fact-making.${thank}`,
        `I'm stoked you like what I'm doing :) ${thank}`
        
    ]

    if(Math.random()>0.5) return getRandom(responses);
    return getRandom(responses).toLowerCase()

}

//Get random string from array
function getRandom(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}

//Return a value which represents how positive or negative a comment is towards the posted fact.
function getCommentSentiment(comment){

    var emotivePhrases = [
        ["bullshit",        -2],
        ["bad",             -1],
        ["stupid",          -1],
        ["dumb",            -1],
        ["wrong",           -1],
        ["hate",            -1],
        ["lame",            -1],
        ["doubt",           -1],
        ["unlikely",        -1],
        ["worst",           -1],
        ["nonsense",        -1],
        ["retarded",        -2],
        ["isn't correct",   -1],
        ["not correct",     -1],
        ["isn't right",     -1],
        ["not right",       -1],
        ["awful",           -1],
        ["incorrect",       -1],
        ["terrible",        -1],
        ["uncool",          -1],
        ["untrue",          -1],
        ["repost",          -1],
        ["wtf",             -1],
        ["plain wrong",     -1],
        ["false",           -1],
        ["sucks",           -1],
        ["isn't accurate",  -1],
        ["isn't factual",   -1],
        ["not accurate",    -1],
        ["not factual",     -1],

        ["is right",            1],
        ["actually right",      1],
        ["is correct",          1],
        ["actually correct",    1],
        ["genius",              2],
        ["smart",               1],
        ["clever",              1],
        ["insightful",          1],
        ["intelligent",         1],
        ["love",                1],
        ["impress",             1],
        ["is true",             1],
        ["actually true",       1],
        ["good",                1],
        ["like",                1],
        ["best",                1],
        ["brilliant",           1],
        ["awesome",             1],
        ["cool",                1],
        ["is accurate",         1],
        ["is factual",          1],
        ["not wrong",           2],
        ["not bad",             2],
        ["epic",                1],
        ["big if true",         1],
        ["wholesome",           1],
        ["astonishing",         1],
        ["fascinating",         1],
        ["of course",           1],
        ["amazing",             1],
        ["extraordinary",       1],
        ["incredible",          1],
        ["is credible",         1],
        ["mind blowing",        1],
        ["mind-blowing",        1],
        ["remarkable",          1],
        ["amusing",             1],
        ["thought-provoking",   1],
        ["thought provoking",   1],
        ["intriguing",          1],
        ["entertaining",        1],
        ["never knew",          1],
        ["nice",                1],
        ["sentience",           1],
        ["makese sense",        1],
        ["actual fact",         1],
        ["great",               1]
    ]

    var commentLowercase = comment.toLowerCase();
    var sentiment = 0;

    for(phrase in emotivePhrases){
        if(commentLowercase.includes(emotivePhrases[phrase][0])){
            sentiment += emotivePhrases[phrase][1];
        }
    }

    return sentiment;
}

async function readComments(objectID){
    try{
        return new Promise( function(resolve, reject) {
            FB.api(
                `/${objectID}/comments`,
                function (response) {
                    if (response && !response.error) {
                        resolve(response.data);
                    }else{
                        reject(response.data);
                    }
                }
            );
        }).catch((error) => {
            console.error(error);
          });
    }catch(err){throw err;}
}

async function writeComment(objectID,message){
    try{
        return new Promise( function(resolve, reject) {
            FB.api(
                `/${objectID}/comments`,
                "POST",
                {
                    "message": `${message}`
                },
                function (response) {
                    if (response && !response.error) {
                        resolve(response);
                    }else{
                        reject(response);
                    }
                }
            );
        });
    }catch(err){throw err;}
}

module.exports.readComments = readComments;
module.exports.writeComment = writeComment;
module.exports.updateRecentPostJson = updateRecentPostJson;
module.exports.respondToRecentPosts = respondToRecentPosts;