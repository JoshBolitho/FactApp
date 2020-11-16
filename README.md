# FactApp
FactApp generates sentences using markov chains, and a long list of facts as a training set, then posts to facebook.

FactApp is now hosted at [facebook.com/FactBotMarkov](https://www.facebook.com/FactBotMarkov)

## Setup
### Install Packages
Clone the repository and install dependencies with npm.
```
git clone https://github.com/JoshBolitho/FactApp.git
cd FactApp
npm install
```

### Acquire API Keys
This project requires a set of access tokens from multiple services. The following keys must be added in place of the default values in ```Secrets.js```:

- Facebook access tokens for posting on the page you wish to automate.
- A cloudinary account, and related access tokens for temporary image storage.
This service is intermediate in the process of posting images to Facebook.
- An Unsplash account and key. This service is used to source stock photographs for image backgrounds.


## Usage
### Command line
There are currently two options for command line usage:

- ```node FactApp.js -post``` or ```node FactApp.js -p```

Run the fact posting script. FactApp will generate a new fact and post it to facebook.


- ```-comment``` or ```-c```

Run the comment manager script. Checks all monitored posts for viable comments which meet the requirements for a reply, generates random replies for them, and posts these to Facebook.  


## How Does it work?
### Text Synthesis with Markov Chains 
### Assembling the Image and Generating a Caption
### Comment Monitoring