'use strict';

const {
  merge
} = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) => merge(common, {
  entry: {
    manage: PATHS.src + '/managePage/manage.js',
    menu: PATHS.src + '/managePage/menu.js',
    contentScript: PATHS.src + '/contentScript.js',
    background: PATHS.src + '/background.js'
  },
  devtool: argv.mode === 'production' ? false : 'source-map'
});

module.exports = config;