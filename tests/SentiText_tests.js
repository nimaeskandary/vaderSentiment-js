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

import {scalar_inc_dec, SentiText, PUNC_LIST} from '../src/vaderSentiment';
let test = require('tape');

test('SentiText.get_words_plus_punc returns empty dict if given no words', t => {
  const input = '';
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_plus_punc();
  const expected = {};

  t.deepEquals(output, expected);
  t.end();
});

test('SentiText.get_words_plus_punc creates punct dict for word', t => {
  const input = 'word';
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_plus_punc();
  const expected = {
    '.word': 'word',
    'word.': 'word',
    '!word': 'word',
    'word!': 'word',
    '?word': 'word',
    'word?': 'word',
    ',word': 'word',
    'word,': 'word',
    ';word': 'word',
    'word;': 'word',
    ':word': 'word',
    'word:': 'word',
    '-word': 'word',
    'word-': 'word',
    "'word": 'word',
    "word'": 'word',
    '"word': 'word',
    'word"': 'word',
    '!!word': 'word',
    'word!!': 'word',
    '!!!word': 'word',
    'word!!!': 'word',
    '??word': 'word',
    'word??': 'word',
    '???word': 'word',
    'word???': 'word',
    '?!?word': 'word',
    'word?!?': 'word',
    '!?!word': 'word',
    'word!?!': 'word',
    '?!?!word': 'word',
    'word?!?!': 'word',
    '!?!?word': 'word',
    'word!?!?': 'word'
  };
  const expected_num_elements = PUNC_LIST.length * input.split(/\s/).length * 2;

  t.equals(Object.keys(expected).length, expected_num_elements);
  t.equals(Object.keys(output).length, expected_num_elements);

  t.deepEquals(output, expected);
  t.end();
});

test('SentiText.get_words_plus_punc creates right size punct dict for multiple words', t => {
  const input = 'multiple words test';
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_plus_punc();
  const expected_num_elements = PUNC_LIST.length * input.split(/\s/).length * 2;

  t.equals(Object.keys(output).length, expected_num_elements);
  t.end();
});

test('SentiText.get_words_plus_punc removes singletons', t => {
  const input = 'a b c';
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_plus_punc();
  const expected_num_elements = 0;

  t.equals(Object.keys(output).length, expected_num_elements);
  t.end();
});

test('SentiText.get_words_and_emoticons preserves non punctuation emoticons', t => {
  const input = 'an emoticon 8D';
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_and_emoticons();
  const expected = ['an', 'emoticon', '8D'];

  t.deepEquals(output, expected);
  t.end();
});

test('SentiText.get_words_and_emoticons removes trailing punctuation', t => {
  const input = 'some words!!!';
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_and_emoticons();
  const expected = ['some', 'words'];

  t.deepEquals(output, expected);
  t.end();
});

test('SentiText.get_words_and_emoticons removes leading punctuation', t => {
  const input = '??some words';
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_and_emoticons();
  const expected = ['some', 'words'];

  t.deepEquals(output, expected);
  t.end();
});

test('SentiText.get_words_and_emoticons returns empty array when input empty', t => {
  const input = '';
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_and_emoticons();
  const expected = [];

  t.deepEquals(output, expected);
  t.end();
});

test('SentiText.get_words_and_emoticons preserves contractions', t => {
  const input = "this contraction don't";
  const sentiText = new SentiText(input);
  const output = sentiText.get_words_and_emoticons();
  const expected = ['this', 'contraction', "don't"];

  t.deepEquals(output, expected);
  t.end();
});
