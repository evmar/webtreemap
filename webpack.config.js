const path = require('path');

module.exports = {
  entry: {
    'webtreemap.js': './webtreemap.ts',
    'demo.js': './demo/demo.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    libraryTarget: 'window',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]',
  },
};
