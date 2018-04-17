# vaderSentiment-js

Javascript port of the [VADER sentiment analysis tool](https://github.com/cjhutto/vaderSentiment).
Sentiment from text can be determined in-browser or in a Node.js app.

Source:

> Hutto, C.J. & Gilbert, E.E. (2014). VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text. Eighth International Conference on Weblogs and Social Media (ICWSM-14). Ann Arbor, MI, June 2014.


## License

This JavaScript port of VADER is licensed under the terms of the [Apache-2.0 License](http://www.apache.org/licenses/LICENSE-2.0)

## Usage

install via npm

```
npm install --save vader-sentiment
```

Example use:

```
const vader = require('vader-sentiment');
const input = 'VADER is very smart, handsome, and funny';
const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(input);
console.log(intensity);
// {neg: 0.0, neu: 0.299, pos: 0.701, compound: 0.8545}
```

#### About the Scoring

* The ``compound`` score is computed by summing the valence scores of each word in the lexicon, adjusted according to the rules, and then normalized to be between -1 (most extreme negative) and +1 (most extreme positive). This is the most useful metric if you want a single unidimensional measure of sentiment for a given sentence. Calling it a 'normalized, weighted composite score' is accurate.

  It is also useful for researchers who would like to set standardized thresholds for classifying sentences as either positive, neutral, or negative.  
  Typical threshold values (used in the literature cited on this page) are:

 #. **positive sentiment**: ``compound`` score >=  0.05
 #. **neutral  sentiment**: (``compound`` score > -0.05) and (``compound`` score < 0.05)
 #. **negative sentiment**: ``compound`` score <= -0.05

* The ``pos``, ``neu``, and ``neg`` scores are ratios for proportions of text that fall in each category (so these should all add up to be 1... or close to it with float operation).  These are the most useful metrics if you want multidimensional measures of sentiment for a given sentence.

## Development

Install dependencies by running

```
npm install
```

To make code consistent

```
npm run prettier
```

For tests

```
npm run tests
```
