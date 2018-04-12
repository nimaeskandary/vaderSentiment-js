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

import {is_upper_python} from '../src/vaderSentiment';
let test = require('tape');

test('is_upper_python is false for empty string', t => {
  const word = '';
  const result = is_upper_python(word);
  t.equal(result, false);
  t.end();
});

test('is_upper_python is true for all caps string', t => {
  const word = 'WORD';
  const result = is_upper_python(word);
  t.equal(result, true);
  t.end();
});

test('is_upper_python is false for only special characters', t => {
  const word = ':)';
  const result = is_upper_python(word);
  t.equal(result, false);
  t.end();
});

test('is_upper_python is true for special characters and all caps characters', t => {
  const word = ':)WORD:(';
  const result = is_upper_python(word);
  t.equal(result, true);
  t.end();
});

test('is_upper_python is false for special characters and lowercase characters', t => {
  const word = ':)word:(';
  const result = is_upper_python(word);
  t.equal(result, false);
  t.end();
});
