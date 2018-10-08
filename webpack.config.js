const path = require('path');

module.exports = {
  entry: {
    'webtreemap.js': './build/src/webtreemap.js',
    //'demo.js': './demo/demo.ts',
  },
  output: {
    library: 'webtreemap',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'build'),
    filename: '[name]',
  },
};
