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

import {SentimentIntensityAnalyzer} from '../src/vaderSentiment';
let test = require('tape');

test('SentimentIntensityAnalyzer.polarity_scores match original demo output', t => {
  const expectedResults = [
    {
      text: 'VADER is smart, handsome, and funny.',
      scores: {neg: 0.0, neu: 0.254, pos: 0.746, compound: 0.8316}
    },
    {
      text: 'VADER is not smart, handsome, nor funny.',
      scores: {neg: 0.646, neu: 0.354, pos: 0.0, compound: -0.7424}
    },
    {
      text: 'VADER is smart, handsome, and funny!',
      scores: {neg: 0.0, neu: 0.248, pos: 0.752, compound: 0.8439}
    },
    {
      text: 'VADER is very smart, handsome, and funny.',
      scores: {neg: 0.0, neu: 0.299, pos: 0.701, compound: 0.8545}
    },
    {
      text: 'VADER is VERY SMART, handsome, and FUNNY.',
      scores: {neg: 0.0, neu: 0.246, pos: 0.754, compound: 0.9227}
    },
    {
      text: 'VADER is VERY SMART, handsome, and FUNNY!!!',
      scores: {neg: 0.0, neu: 0.233, pos: 0.767, compound: 0.9342}
    },
    {
      text: 'VADER is VERY SMART, uber handsome, and FRIGGIN FUNNY!!!',
      scores: {neg: 0.0, neu: 0.294, pos: 0.706, compound: 0.9469}
    },
    {
      text: 'The book was good.',
      scores: {neg: 0.0, neu: 0.508, pos: 0.492, compound: 0.4404}
    },
    {
      text: 'The book was kind of good.',
      scores: {neg: 0.0, neu: 0.657, pos: 0.343, compound: 0.3832}
    },
    {
      text: 'The plot was good, but the characters are uncompelling and the dialog is not great.',
      scores: {neg: 0.327, neu: 0.579, pos: 0.094, compound: -0.7042}
    },
    {
      text: "At least it isn't a horrible book.",
      scores: {neg: 0.0, neu: 0.637, pos: 0.363, compound: 0.431}
    },
    {
      text: 'Make sure you :) or :D today!',
      scores: {neg: 0.0, neu: 0.294, pos: 0.706, compound: 0.8633}
    },
    {
      text: 'Today SUX!',
      scores: {neg: 0.779, neu: 0.221, pos: 0.0, compound: -0.5461}
    },
    {
      text: "Today only kinda sux! But I'll get by, lol",
      scores: {neg: 0.179, neu: 0.569, pos: 0.251, compound: 0.2228}
    }
  ];

  for (let i = 0; i < expectedResults.length; i++) {
    const input = expectedResults[i].text;
    const expectedOutput = expectedResults[i].scores;
    const result = SentimentIntensityAnalyzer.polarity_scores(input);
    t.deepEqual(result, expectedOutput, input);
  }

  t.end();
});
