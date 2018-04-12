var path = require('path');
var webpack = require('webpack');
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'vaderSentiment.bundle.js',
    library: 'SentimentIntensityAnalyzer',
    libraryTarget: 'commonjs',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
         use: {
            loader:'babel-loader',
            options: { presets: ['es2015'] }
         },
         test: /\.js$/,
         exclude: /node_modules/
      }
    ]
  },
  mode: 'production'
};
