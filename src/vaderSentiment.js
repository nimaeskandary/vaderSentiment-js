/**
 * Copyright 2018 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
  Javascript port of vader sentiment analysis tool, source:
    Hutto, C.J. & Gilbert, E.E. (2014). VADER: A Parsimonious Rule-based Model for
    Sentiment Analysis of Social Media Text. Eighth International Conference on
    Weblogs and Social Media (ICWSM-14). Ann Arbor, MI, June 2014.
*/

// Constants

const LEXICON = require('./vader_lexicon.js').lexicon;

// (empirically derived mean sentiment intensity rating increase for booster words)
export const B_INCR = 0.293;

export const B_DECR = -0.293;

// (empirically derived mean sentiment intensity rating increase for using
// ALLCAPs to emphasize a word)
export const C_INCR = 0.733;

export const N_SCALAR = -0.74;

export const REGEX_REMOVE_PUNCTUATION = new RegExp(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g);
// ` // <- to fix ide thinking grave accent in regex is starting a template quote

export const PUNC_LIST = [
  '.',
  '!',
  '?',
  ',',
  ';',
  ':',
  '-',
  "'",
  '"',
  '!!',
  '!!!',
  '??',
  '???',
  '?!?',
  '!?!',
  '?!?!',
  '!?!?'
];

export const NEGATE = [
  'aint',
  'arent',
  'cannot',
  'cant',
  'couldnt',
  'darent',
  'didnt',
  'doesnt',
  "ain't",
  "aren't",
  "can't",
  "couldn't",
  "daren't",
  "didn't",
  "doesn't",
  'dont',
  'hadnt',
  'hasnt',
  'havent',
  'isnt',
  'mightnt',
  'mustnt',
  'neither',
  "don't",
  "hadn't",
  "hasn't",
  "haven't",
  "isn't",
  "mightn't",
  "mustn't",
  'neednt',
  "needn't",
  'never',
  'none',
  'nope',
  'nor',
  'not',
  'nothing',
  'nowhere',
  'oughtnt',
  'shant',
  'shouldnt',
  'uhuh',
  'wasnt',
  'werent',
  "oughtn't",
  "shan't",
  "shouldn't",
  'uh-uh',
  "wasn't",
  "weren't",
  'without',
  'wont',
  'wouldnt',
  "won't",
  "wouldn't",
  'rarely',
  'seldom',
  'despite'
];

// booster/dampener 'intensifiers' or 'degree adverbs'
// http://en.wiktionary.org/wiki/Category:English_degree_adverbs

export const BOOSTER_DICT = {
  absolutely: B_INCR,
  amazingly: B_INCR,
  awfully: B_INCR,
  completely: B_INCR,
  considerably: B_INCR,
  decidedly: B_INCR,
  deeply: B_INCR,
  effing: B_INCR,
  enormously: B_INCR,
  entirely: B_INCR,
  especially: B_INCR,
  exceptionally: B_INCR,
  extremely: B_INCR,
  fabulously: B_INCR,
  flipping: B_INCR,
  flippin: B_INCR,
  fricking: B_INCR,
  frickin: B_INCR,
  frigging: B_INCR,
  friggin: B_INCR,
  fully: B_INCR,
  fucking: B_INCR,
  greatly: B_INCR,
  hella: B_INCR,
  highly: B_INCR,
  hugely: B_INCR,
  incredibly: B_INCR,
  intensely: B_INCR,
  majorly: B_INCR,
  more: B_INCR,
  most: B_INCR,
  particularly: B_INCR,
  purely: B_INCR,
  quite: B_INCR,
  really: B_INCR,
  remarkably: B_INCR,
  so: B_INCR,
  substantially: B_INCR,
  thoroughly: B_INCR,
  totally: B_INCR,
  tremendously: B_INCR,
  uber: B_INCR,
  unbelievably: B_INCR,
  unusually: B_INCR,
  utterly: B_INCR,
  very: B_INCR,
  almost: B_DECR,
  barely: B_DECR,
  hardly: B_DECR,
  'just enough': B_DECR,
  'kind of': B_DECR,
  kinda: B_DECR,
  kindof: B_DECR,
  'kind-of': B_DECR,
  less: B_DECR,
  little: B_DECR,
  marginally: B_DECR,
  occasionally: B_DECR,
  partly: B_DECR,
  scarcely: B_DECR,
  slightly: B_DECR,
  somewhat: B_DECR,
  'sort of': B_DECR,
  sorta: B_DECR,
  sortof: B_DECR,
  'sort-of': B_DECR
};

// check for special case idioms using a sentiment-laden keyword known to VADER
export const SPECIAL_CASE_IDIOMS = {
  'the shit': 3,
  'the bomb': 3,
  'bad ass': 1.5,
  'yeah right': -2,
  'cut the mustard': 2,
  'kiss of death': -1.5,
  'hand to mouth': -2
};

// static methods

export const negated = (input_words, include_nt = true) => {
  /**
    Determine if input contains negation words
   */

  let neg_words = [];
  neg_words.push.apply(neg_words, NEGATE);
  for (let i = 0; i < neg_words.length; i++) {
    if (input_words.indexOf(neg_words[i]) >= 0) {
      return true;
    }
  }
  if (include_nt === true) {
    for (let i = 0; i < input_words.length; i++) {
      if (input_words[i].indexOf("n't") >= 0) {
        return true;
      }
    }
  }
  const i = input_words.findIndex(element => {
    return element === 'least';
  });
  return i !== -1 && i > 0 && input_words[i - 1] !== 'at';
};

export const normalize = (score, alpha = 15) => {
  /**
    Normalize the score to be between -1 and 1 using an alpha that
    approximates the max expected value
  */

  const norm_score = score / Math.sqrt(score * score + alpha);
  if (norm_score < -1.0) {
    return -1.0;
  } else if (norm_score > 1.0) {
    return 1.0;
  } else {
    return norm_score;
  }
};

export const allcap_differential = words => {
  /**
    Check whether just some words in the input are ALL CAPS
  */

  let allcap_words = 0;
  for (let i = 0; i < words.length; i++) {
    if (is_upper_python(words[i])) {
      allcap_words += 1;
    }
  }
  const cap_differential = words.length - allcap_words;
  return cap_differential > 0 && cap_differential < words.length;
};

export const scalar_inc_dec = (word, valence, is_cap_diff) => {
  /**
      Check if the preceding words increase, decrease, or negate/nullify the
      valence
    */

  let scalar = 0.0;
  const word_lower = word.toLowerCase();
  if (BOOSTER_DICT.hasOwnProperty(word_lower)) {
    scalar = BOOSTER_DICT[word_lower];
    if (valence < 0) {
      scalar *= -1;
    }
    // check if booster/dampener word is in ALLCAPS (while others aren't)
    if (is_cap_diff && is_upper_python(word)) {
      if (valence > 0) {
        scalar += C_INCR;
      } else {
        scalar -= C_INCR;
      }
    }
  }
  return scalar;
};

export const is_upper_python = word => {
  /**
      Python style "isupper" function. Requirements are that the string is at least one character in length,
      and does not consider an emoticon, e.g. :), as an uppercase word, but a string with special characters and only
      all caps characters is an uppercase word, e.g. ':)WORD' is true
   */
  if (typeof word === 'string' || word instanceof String) {
    if (word.length > 0) {
      return /^[^a-z]*[A-Z]+[^a-z]*$/g.test(word);
    }
  }
  return false;
};

export class SentiText {
  /**
    Identify sentiment-relevant string-level properties of input text
  */
  constructor(text) {
    this.text = text;
    this.words_and_emoticons = this.get_words_and_emoticons();
    // doesn't separate words from adjacent punctuation (keeps emoticons & contractions)
    this.is_cap_diff = allcap_differential(this.words_and_emoticons);
  }

  get_words_plus_punc() {
    /**
        Returns mapping of form:
        {
          'cat,': 'cat',
          ',cat': 'cat'
        }
      */

    // removes punctuation (but loses emoticons & contractions)
    const no_punc_text = this.text.slice(0).replace(REGEX_REMOVE_PUNCTUATION, '');
    const words = no_punc_text.split(/\s/);
    // removes singletons
    const words_only = words.filter(word => {
      return word.length > 1;
    });
    let words_punc_dict = {};
    for (let j = 0; j < PUNC_LIST.length; j++) {
      for (let k = 0; k < words_only.length; k++) {
        let pb = `${PUNC_LIST[j]}${words_only[k]}`;
        let pa = `${words_only[k]}${PUNC_LIST[j]}`;
        words_punc_dict[pb] = words_only[k];
        words_punc_dict[pa] = words_only[k];
      }
    }
    return words_punc_dict;
  }

  get_words_and_emoticons() {
    /**
      Removes leading and trailing puncutation
      Leaves contractions and most emoticons
      Does not preserve punc-plus-letter emoticons (e.g. :D)
    */

    const tokens = this.text.split(/\s/);
    const words_punc_dict = this.get_words_plus_punc();
    let words_only = tokens.filter(token => {
      return token.length > 1;
    });
    for (let i = 0; i < words_only.length; i++) {
      if (words_punc_dict.hasOwnProperty(words_only[i])) {
        words_only[i] = words_punc_dict[words_only[i]];
      }
    }
    return words_only;
  }
}

export class SentimentIntensityAnalyzer {
  /**
    Give a sentiment intensity score to sentences
  */

  static polarity_scores(text) {
    /**
      Return a float for sentiment strength based on the input text.
      Positive values are positive valence, negative value are negative
      valence
    */

    const sentiText = new SentiText(text);
    let sentiments = [];
    const words_and_emoticons = sentiText.words_and_emoticons;
    for (let i = 0; i < words_and_emoticons.length; i++) {
      let valence = 0;
      const item = words_and_emoticons[i];
      if (
        (i < words_and_emoticons.length - 1 &&
          item.toLowerCase() === 'kind' &&
          words_and_emoticons[i + 1].toLowerCase() === 'of') ||
        BOOSTER_DICT.hasOwnProperty(item.toLowerCase())
      ) {
        sentiments.push(valence);
        continue;
      }

      sentiments = SentimentIntensityAnalyzer.sentiment_valence(
        valence,
        sentiText,
        item,
        i,
        sentiments
      );
    }

    sentiments = SentimentIntensityAnalyzer.but_check(words_and_emoticons, sentiments);
    const valence_dict = SentimentIntensityAnalyzer.score_valence(sentiments, text);
    return valence_dict;
  }

  static sentiment_valence(valence, sentiText, item, index, sentiments) {
    const is_cap_diff = sentiText.is_cap_diff;
    const words_and_emoticons = sentiText.words_and_emoticons;
    const item_lowercase = item.toLowerCase();
    if (LEXICON.hasOwnProperty(item_lowercase)) {
      // get the sentiment valence
      valence = LEXICON[item_lowercase];
      // check if sentiment laden word is in ALL CAPS (while others aren't)
      if (is_upper_python(item) && is_cap_diff) {
        if (valence > 0) {
          valence += C_INCR;
        } else {
          valence -= C_INCR;
        }
      }

      for (let start_i = 0; start_i < 3; start_i++) {
        if (
          index > start_i &&
          LEXICON.hasOwnProperty(words_and_emoticons[index - (start_i + 1)].toLowerCase()) === false
        ) {
          // dampen the scalar modifier of preceding words and emoticons
          // (excluding the ones that immediately preceed the item) based
          // on their distance from the current item.
          let s = scalar_inc_dec(words_and_emoticons[index - (start_i + 1)], valence, is_cap_diff);
          if (start_i === 1 && s !== 0) {
            s = s * 0.95;
          } else if (start_i === 2 && s !== 0) {
            s = s * 0.9;
          }
          valence = valence + s;
          valence = this.never_check(valence, words_and_emoticons, start_i, index);
          if (start_i === 2) {
            valence = this.idioms_check(valence, words_and_emoticons, index);
          }
        }
      }

      valence = this.least_check(valence, words_and_emoticons, index);
    }

    sentiments.push(valence);
    return sentiments;
  }

  static least_check(valence, words_and_emoticons, index) {
    /**
      Check for negaion case using "least"
    */

    if (
      index > 1 &&
      words_and_emoticons[index - 1].toLowerCase() === 'least' &&
      LEXICON.hasOwnProperty(words_and_emoticons[index - 1].toLowerCase()) === false
    ) {
      if (
        words_and_emoticons[index - 2].toLowerCase() !== 'at' &&
        words_and_emoticons[index - 2].toLowerCase() !== 'very'
      ) {
        valence = valence * N_SCALAR;
      }
    } else if (
      index > 0 &&
      words_and_emoticons[index - 1].toLowerCase() === 'least' &&
      LEXICON.hasOwnProperty(words_and_emoticons[index - 1].toLowerCase()) === false
    ) {
      valence = valence * N_SCALAR;
    }

    return valence;
  }

  static but_check(words_and_emoticons, sentiments) {
    /**
      Check for modification in sentiment due to contrastive conjunction 'but'
    */
    let but_index = words_and_emoticons.indexOf('but');
    if (but_index === -1) {
      but_index = words_and_emoticons.indexOf('BUT');
    }
    if (but_index !== -1) {
      for (let i = 0; i < sentiments.length; i++) {
        const sentiment_index = i;
        const sentiment = sentiments[sentiment_index];
        if (sentiment_index < but_index) {
          sentiments.splice(sentiment_index, 1);
          sentiments.splice(sentiment_index, 0, sentiment * 0.5);
        } else if (sentiment_index > but_index) {
          sentiments.splice(sentiment_index, 1);
          sentiments.splice(sentiment_index, 0, sentiment * 1.5);
        }
      }
    }
    return sentiments;
  }

  static idioms_check(valence, words_and_emoticons, index) {
    const onezero = `${words_and_emoticons[index - 1]} ${words_and_emoticons[index]}`;
    const twoonezero = `${words_and_emoticons[index - 2]} ${words_and_emoticons[index - 1]} ${
      words_and_emoticons[index]
    }`;
    const twoone = `${words_and_emoticons[index - 2]} ${words_and_emoticons[index - 1]}`;
    const threetwoone = `${words_and_emoticons[index - 3]} ${words_and_emoticons[index - 2]} ${
      words_and_emoticons[index - 1]
    }`;
    const threetwo = `${words_and_emoticons[index - 3]} ${words_and_emoticons[index - 2]}`;

    const sequences = [onezero, twoonezero, twoone, threetwoone, threetwo];

    for (let i = 0; i < sequences.length; i++) {
      if (SPECIAL_CASE_IDIOMS.hasOwnProperty(sequences[i])) {
        valence = SPECIAL_CASE_IDIOMS[sequences[i]];
        break;
      }
    }

    if (words_and_emoticons.length - 1 > index) {
      const zeroone = `${words_and_emoticons[index]} ${words_and_emoticons[index + 1]}`;
      if (SPECIAL_CASE_IDIOMS.hasOwnProperty(zeroone)) {
        valence = SPECIAL_CASE_IDIOMS[zeroone];
      }
    }

    if (words_and_emoticons.length - 1 > index + 1) {
      const zeroonetwo = `${words_and_emoticons[index]} ${words_and_emoticons[index + 1]} ${
        words_and_emoticons[index + 2]
      }`;
      if (SPECIAL_CASE_IDIOMS.hasOwnProperty(zeroonetwo)) {
        valence = SPECIAL_CASE_IDIOMS[zeroonetwo];
      }
    }

    // check for booster/dampener bi-grams such as 'sort of' or 'kind of'
    if (BOOSTER_DICT.hasOwnProperty(threetwo) || BOOSTER_DICT.hasOwnProperty(twoone)) {
      valence = valence + B_DECR;
    }

    return valence;
  }

  static never_check(valence, words_and_emoticons, start_i, index) {
    if (start_i === 0) {
      if (negated([words_and_emoticons[index - 1]])) {
        valence = valence * N_SCALAR;
      }
    }

    if (start_i === 1) {
      if (
        words_and_emoticons[index - 2] === 'never' &&
        (words_and_emoticons[index - 1] === 'so' || words_and_emoticons[index - 1] === 'this')
      ) {
        valence = valence * 1.5;
      } else if (negated([words_and_emoticons[index - (start_i + 1)]])) {
        valence = valence * N_SCALAR;
      }
    }

    if (start_i === 2) {
      if (
        (words_and_emoticons[index - 3] === 'never' &&
          (words_and_emoticons[index - 2] === 'so' || words_and_emoticons[index - 2] === 'this')) ||
        (words_and_emoticons[index - 1] === 'so' || words_and_emoticons[index - 1] === 'this')
      ) {
        valence = valence * 1.25;
      } else if (negated([words_and_emoticons[index - (start_i + 1)]])) {
        valence = valence * N_SCALAR;
      }
    }

    return valence;
  }

  static punctuation_emphasis(sum_s, text) {
    /**
      Add emphasis from exclamation points and question marks
    */

    const ep_amplifier = SentimentIntensityAnalyzer.amplify_ep(text);
    const qm_amplifier = SentimentIntensityAnalyzer.amplify_qm(text);
    const punct_emph_amplifier = ep_amplifier + qm_amplifier;
    return punct_emph_amplifier;
  }

  static amplify_ep(text) {
    /**
      Check for added emphasis resulting from exclamation points (up to 4 of them)
    */

    let ep_count = text.replace(/[^!]/g, '').length;
    if (ep_count > 4) {
      ep_count = 4;
    }
    // empirically derived mean sentiment intensity rating increase for exclamation points
    const ep_amplifier = ep_count * 0.292;
    return ep_amplifier;
  }

  static amplify_qm(text) {
    /**
      Check for added emphasis resulting from question marks (2 or 3+)
    */

    let qm_count = text.replace(/[^?]/g, '').length;
    let qm_amplifier = 0;
    if (qm_count > 1) {
      if (qm_count <= 3) {
        // empirically derived mean sentiment intensity rating increase for question marks
        qm_amplifier = qm_count * 0.18;
      } else {
        qm_amplifier = 0.96;
      }
    }

    return qm_amplifier;
  }

  static sift_sentiment_scores(sentiments) {
    /**
      Want separate positive versus negative sentiment scores
    */

    let pos_sum = 0.0;
    let neg_sum = 0.0;
    let neu_count = 0;

    for (let i = 0; i < sentiments.length; i++) {
      const sentiment_score = sentiments[i];
      if (sentiment_score > 0) {
        pos_sum += sentiment_score + 1; // compensates for neutral words that are counted as 1
      } else if (sentiment_score < 0) {
        neg_sum += sentiment_score - 1; // when used with math.fabs(), compensates for neutrals
      } else {
        neu_count += 1;
      }
    }
    const results = [pos_sum, neg_sum, neu_count];
    return results;
  }

  static score_valence(sentiments, text) {
    if (sentiments && sentiments.length > 0) {
      let sum_s = 0;
      for (let i = 0; i < sentiments.length; i++) {
        sum_s += sentiments[i];
      }
      // compute and add emphasis from punctuation in text
      const punct_emph_amplifier = SentimentIntensityAnalyzer.punctuation_emphasis(sum_s, text);
      if (sum_s > 0) {
        sum_s += punct_emph_amplifier;
      } else if (sum_s < 0) {
        sum_s -= punct_emph_amplifier;
      }

      let compound = normalize(sum_s);
      // discriminate between positive, negative and neutral sentiment scores
      let scores = SentimentIntensityAnalyzer.sift_sentiment_scores(sentiments);
      let pos_sum = scores[0];
      let neg_sum = scores[1];
      let neu_count = scores[2];

      if (pos_sum > Math.abs(neg_sum)) {
        pos_sum += punct_emph_amplifier;
      } else if (pos_sum < Math.abs(neg_sum)) {
        neg_sum -= punct_emph_amplifier;
      }

      const total = pos_sum + Math.abs(neg_sum) + neu_count;
      const pos = Math.abs(pos_sum / total);
      const neg = Math.abs(neg_sum / total);
      const neu = Math.abs(neu_count / total);
      const sentiment_dict = {
        neg: parseFloat(neg.toFixed(3)),
        neu: parseFloat(neu.toFixed(3)),
        pos: parseFloat(pos.toFixed(3)),
        compound: parseFloat(compound.toFixed(4))
      };

      return sentiment_dict;
    } else {
      const sentiment_dict = {
        neg: 0.0,
        neu: 0.0,
        pos: 0.0,
        compound: 0.0
      };

      return sentiment_dict;
    }
  }
}
