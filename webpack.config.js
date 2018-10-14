const path = require('path');

module.exports = {
  entry: {
    'webtreemap.js': './build/src/index.js',
    'demo.js': './build/demo/demo.js',
  },
  output: {
    library: 'webtreemap',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'build'),
    filename: '[name]',
  },
};
