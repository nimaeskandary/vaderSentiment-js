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

import {scalar_inc_dec, BOOSTER_DICT, C_INCR} from '../src/vaderSentiment';
let test = require('tape');

test('scalar_inc_dec returns 0 if word is not a booster word', t => {
  const input = 'xxnotawordxx';
  const output = scalar_inc_dec(input, 1, false);
  t.equal(output, 0);
  t.end();
});

test('scalar_inc_dec returns BOOSTER_DICT val if word is a booster word', t => {
  const keys = Object.keys(BOOSTER_DICT);
  const key = keys[0];
  const output = scalar_inc_dec(key, 1, false);
  const expected = BOOSTER_DICT[key];
  t.equal(output, expected);
  t.end();
});

test('scalar_inc_dec increments scalar if is_cap_diff is true', t => {
  const keys = Object.keys(BOOSTER_DICT);
  const key = keys[0];
  const input = key.toUpperCase();
  const output = scalar_inc_dec(input, 1, true);
  const expected = BOOSTER_DICT[key] + C_INCR;
  t.equal(output, expected);
  t.end();
});
