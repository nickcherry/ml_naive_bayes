/* Import dependencies */
const natural = require('natural');

class BayesClassifier {

  constructor({ documentCountsByCategory, stemCounts, stemCountsByCategory, stopWords } = {}) {
    /* Create convenient references to our natural language helpers */
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;

    /* Initialize object to track total number of occurrences for stems */
    this.stemCounts = stemCounts || {};
    /* Initialize object to track number of occurrences for stems within each category */
    this.stemCountsByCategory = stemCountsByCategory || {};
    /* Initialize object to track number of documents trained for each category */
    this.documentCountsByCategory = documentCountsByCategory || {};

    /* Convert the stop words array to an object, for faster lookups */
    this.stopWords = (stopWords || []).reduce((words, word) => {
      words[word] = true;
      return words;
    }, {});
  }

  train(category, document) {
    this.extractStems(document).forEach((stem) => {
      /* Increment total stem count */
      this.stemCounts[stem] = (this.stemCounts[stem] || 0) + 1;
      /* Increment the stem count for our category */
      this.stemCountsByCategory[category] = this.stemCountsByCategory[category] || {};
      this.stemCountsByCategory[category][stem] = (this.stemCountsByCategory[category][stem] || 0) + 1;
      /* Increment the document count for our category */
      this.documentCountsByCategory[category] = (this.documentCountsByCategory[category] || 0) + 1;
    });
  }

  classify(document) {
    const totalDocCount = this.getTotalDocumentCount();

    /* Tokenize and stem the document we're about to classify */
    const stems = this.extractStems(document);

    /* Compute probability scores for each category */
    const likelihoods = this.categories.map((category) => {
      const catDocCount = this.documentCountsByCategory[category];
      const inverseCatDocCount = totalDocCount - catDocCount;

      /* Aggregate probability scores from each stem in the document */
      const score = stems.reduce((score, stem) => {
        /* If we've never seen this before, there's no need to go through the motions */
        if (!this.stemCounts[stem]) return score;

        /* Calculate the probability that the stem appears in the current category */
        const stemCount = this.stemCountsByCategory[category][stem] || 0;
        const stemProbability = stemCount / catDocCount;

        /* Calculate the probability that the stem appears in any other category */
        const inverseStemCount = this.stemCounts[stem] - stemCount;
        const inverseStemProbability = inverseStemCount / inverseCatDocCount;

        /* Calculate the probability that the document belongs to the current category */
        /* given that the document contains the current stem */
        const probability = stemProbability / (stemProbability + inverseStemProbability);

        /* Add the probability to the existing score for the category stem */
        return score + probability;
      }, 0);

      return { category: category, score: score };
    });

    /* Sort the likelihoods from highest score to lowest score */
    return likelihoods.sort((a, b) => b.score - a.score);
  }

  get categories() {
    return Object.keys(this.documentCountsByCategory);
  }

  getTotalDocumentCount() {
    return Object.values(this.documentCountsByCategory)
      .reduce((total, catCount) => total + catCount, 0);
  }

  extractStems(document) {
    /* First we'll tokenize the document's text, e.g. "Yes we can" becomes ["Yes", "we", "can"] */
    return this.tokenizer.tokenize(document)
      /* Then remove any stop words from the token array */
      .filter((token) => !this.stopWords[token])
      /* And reduce each word to its downcased stem / root, e.g. "Inspiring" becomes "inspir" */
      .map(this.stemmer.stem)
  }
}

module.exports = BayesClassifier;
