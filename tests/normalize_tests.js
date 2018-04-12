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

import {normalize} from '../src/vaderSentiment';
let test = require('tape');

test('normalize returns score that is bounded by -1 and 1', t => {
  const inputs = [-1000, -100, -10, -5, -1, -0.5, 0, 0.5, 1, 5, 10, 100, 1000];
  for (let i = 0; i < inputs.length; i++) {
    const output = normalize(inputs[i]);
    const lowerBounded = output >= -1.0;
    const upperBounded = output <= 1.0;
    t.equal(lowerBounded, true);
    t.equal(upperBounded, true);
  }
  t.end();
});
