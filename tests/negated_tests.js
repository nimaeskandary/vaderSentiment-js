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

import {negated, NEGATE} from '../src/vaderSentiment';
let test = require('tape');

test('negated returns false if no input words', t => {
  const input_words = [];
  const output = negated(input_words);
  t.equal(output, false);
  t.end();
});

test('negated returns false if it contains a non negate input', t => {
  const input_words = ['dummy'];
  const output = negated(input_words);
  t.equal(output, false);
  t.end();
});

test('negated returns false if it contains multiple non negate inputs', t => {
  const input_words = ['dummyone', 'dummytwo', 'dummythree'];
  const output = negated(input_words);
  t.equal(output, false);
  t.end();
});

test('negated returns true if it contains a negate input', t => {
  const input_words = [NEGATE[0]];
  const output = negated(input_words);
  t.equal(output, true);
  t.end();
});

test('negated returns true if it contains multiple negate inputs', t => {
  const input_words = ['cannot', NEGATE[0], NEGATE[1]];
  const output = negated(input_words);
  t.equal(output, true);
  t.end();
});

test('negated returns true if it contains negate and non negate words', t => {
  const input_words = [NEGATE[0], 'dummy'];
  const output = negated(input_words);
  t.equal(output, true);
  t.end();
});

test("negated returns true when include_nt is true and contains a n't", t => {
  const input_words = ['dummyone', "somewordn't", 'dummytwo'];
  const output = negated(input_words);
  t.equal(output, true);
  t.end();
});

test("negated returns false when include_nt is true and doesn't contains a n't", t => {
  const input_words = ['dummyone', "somewordn't", 'dummytwo'];
  const output = negated(input_words, false);
  t.equal(output, false);
  t.end();
});

test('negated returns true if it contains least', t => {
  const input_words = ['dummy', 'dummy', 'least'];
  const output = negated(input_words);
  t.equal(output, true);
  t.end();
});

test('negated returns false if it contains least at index 0', t => {
  const input_words = ['least', 'dummy', 'dummy'];
  const output = negated(input_words);
  t.equal(output, false);
  t.end();
});

test('negated returns false if previous word is at', t => {
  const input_words = ['dummy', 'at', 'least'];
  const output = negated(input_words);
  t.equal(output, false);
  t.end();
});
