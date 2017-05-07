/* Import dependencies */
const natural = require('natural');

class TweetClassifier {

  constructor({ documentCountsByCategory, stemCounts, stemCountsByCategory, stopWords }) {
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
    Object.entries(this.reduceStemCounts(document))
      .forEach(([stem, stemCount]) => {
        /* Increment total stem count */
        this.stemCounts[stem] = (this.stemCounts[stem] || 0) + stemCount;
        /* Increment the stem count for our category */
        this.stemCountsByCategory[category] = this.stemCountsByCategory[category] || {};
        this.stemCountsByCategory[category][stem] = (this.stemCountsByCategory[category][stem] || 0) + stemCount;
        /* Increment the document count for our cateogry */
        this.documentCountsByCategory[category] = (this.documentCountsByCategory[category] || 0) + 1;
      });
  }

  classify(document) {
    const totalDocsCount = this.getTotalDocumentCount();
    this.getCategories().reduce((categoryProbabilities, category) => {

    }, {});
  }


  reduceStemCounts(document) {
    /* First we'll tokenize the document's text, e.g. "Yes we can" becomes ["Yes", "we", "can"] */
    return this.tokenizer.tokenize(document)
      /* Then remove any stop words or numbers from the token array */
      .filter((token) => !this.stopWords[token])
      /* And reduce each word to its downcased stem / root, e.g. "Inspiring" becomes "inspir" */
      .map(this.stemmer.stem)
      /* Finally, we'll tally up the number of occurrences for each stemmed token */
      .reduce((counts, token) => {
        counts[token] = (counts[token] || 0) + 1;
        return counts;
      }, {});
  }

  getCategories() {
    return Object.keys(this.documentCountsByCategory);
  }

  getTotalDocumentCount() {
    return this.documentCountsByCategory.reduce((sum, count) => sum + count, 0);
  }

  getInverseDocumentCount(category) {
    /* Sum the document counts for all _other_ categories */
    return Object.entries(this.documentCountsByCategory).reduce((count, [cat, catCount]) => {
      return count + (cat === category ? 0 : catCount);
    }, 0);
  }

  getInverseStemCount(category, stem) {
    /* Sum the stem counts for all _other_ categories */
    return Object.entries(this.stemCountsByCategory).reduce((count, [cat, stemCounts]) => {
      return count + (cat === category ? 0 : stemCounts[stem]);
    }, 0);
  }
}

module.exports = TweetClassifier;
