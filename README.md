# FactApp
FactApp learns from a list of facts, and generates unique new facts using markov chains, then posts them to Facebook.

FactApp is now hosted at [facebook.com/FactBotMarkov](https://www.facebook.com/FactBotMarkov)

## Setup
### Install Packages
Clone the repository and install dependencies with npm.
```
git clone https://github.com/JoshBolitho/FactApp.git
cd FactApp
npm install
```
Note (2023): I had trouble when installing this project on a later version of NodeJS than it was developed on (unknown version ~2018). I managed to get it to install by deleting the package-lock.json file and allowing npm to work out the dependencies.

### Acquire API Keys
This project requires a set of access tokens from multiple services. The following keys must be added in place of the default values in ```Secrets.js```:

- Facebook access tokens for posting on the page you wish to automate.
- A cloudinary account, and related access tokens for temporary image storage.
This service is intermediate in the process of posting images to Facebook.
- An Unsplash account and key. This service is used to source stock photographs for image backgrounds.

### Train Markov Chain Text Generator
Before FactApp is ready to generate text, ```Dict3.json``` and ```SplitSentences.json``` must be generated using the setup command ```node FactApp.js -setup```. The supplied source text file has a small list of facts, but you should add many more if you want interesting output. Tips for customising FactApp are [below](#Tips). 


## Usage
The FactApp project is intended to be used as a standalone application, but all other .js code files are independent from FactApp.js, and can be repurposed. FactApp.js provides config values and useful scripts for interfacing with the project in the intended way.

### Command Line
Run ```node FactApp.js``` with one of the following command line arguments: 

- ```-post``` or ```-p```: 

Run the fact posting script. FactApp will generate a new fact and post it to facebook.


- ```-comment``` or ```-c```: 

Run the comment manager script. Checks all monitored posts for viable comments which meet the requirements for a reply, generates random replies for them, and posts these to Facebook.  


- ```-setup``` or ```-s```

Train the markov network from the source text, initialising ```Dict3.json``` and ```SplitSentences.json```. This step is required for correct setup.


## How Does it work?
### Text Synthesis with Markov Chains 
coming soon
### Assembling the Image and Generating a Caption
coming soon
### Comment Monitoring
coming soon


## Tips
### Adding more facts to source file
Adding your own sentences to the source text file is highly recommended, and is essential for customising the markov sentence generator to your own style. Most importantly, you aren't limited to just training the generator with facts. Markov sentence generation works best with a large collection of sentences, ideally thousands of lines.

Here are some simple guidelines:
- Each line of the source text file must be a separate sentence. Ensure there are no empty lines.
- Stick to simple ASCII characters for sentences, replacing special characters if you must. For example, The text rendering code will not display ```“curved quote marks”``` correctly. These should be replaced with ```"boring quote marks"```.
- The generator will treat different spellings of the same word as entirely separate, so consistent spelling will improve generation. Ideally, you should ensure all sentences conform to either British or American spelling. Microsoft Word can help here.
