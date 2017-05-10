/* Import dependencies */
const fs = require('fs');
const readline = require('readline');
const BayesClassifier = require('./bayes_classifier');


/* Load and parse our tweets */
const tweets = JSON.parse(fs.readFileSync('./tweets.json', 'utf8'));


/* Instantiate and train our classifier */
console.log('Hang on a sec, we\'ve gotta train our classifier…\n');
const classifier = new BayesClassifier();
tweets.forEach((tweet) => {
  classifier.train(tweet.user, tweet.text);
});

console.log('It now knows about the following Twitter users:');
classifier.categories.sort().forEach((category) => {
  console.log('-', category);
});


/* Initialize our I/O stream */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/* Prompt user for tweets */
const EXIT_CMD = 'exit'
const PROMPT = [
  '\nEnter a tweet below, then our classifier will try to guess who wrote it.',
  `(Or type "${ EXIT_CMD }" to leave.)\n`
].join(' ');

const promptForTweet = () => {
  rl.question(PROMPT, (res) => {
    if (res.trim().toLowerCase() === EXIT_CMD) process.exit();
    const likelihoods = classifier.classify(res);
    console.log(`\nThe classifier's best guess is ${ likelihoods[0].category }.\n`);
    console.log('Below are the scores for each user.')
    likelihoods.forEach((likelihood) => {
      console.log(`- ${ likelihood.category }: ${ likelihood.score }`);
    });
    promptForTweet();
  });
};
promptForTweet();
