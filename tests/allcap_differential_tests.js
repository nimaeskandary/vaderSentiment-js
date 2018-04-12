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

import {allcap_differential} from '../src/vaderSentiment';
let test = require('tape');

test('allcap_differential returns false for empty array', t => {
  const input = [];
  const output = allcap_differential(input);
  t.equal(output, false);
  t.end();
});

test('allcap_differential returns false if no caps', t => {
  const input = ['some', 'dummy', 'words'];
  const output = allcap_differential(input);
  t.equal(output, false);
  t.end();
});

test('allcap_differential returns false if all caps', t => {
  const input = ['SOME', 'DUMMY', 'WORDS'];
  const output = allcap_differential(input);
  t.equal(output, false);
  t.end();
});

test('allcap_differential returns true if some caps', t => {
  const input = ['SOME', 'DUMMY', 'words'];
  const output = allcap_differential(input);
  t.equal(output, true);
  t.end();
});
