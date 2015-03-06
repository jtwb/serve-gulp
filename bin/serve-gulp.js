#!/usr/bin/env node

'use strict';
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var server = require('../server/');


var options = {
  port: process.env.PORT || 80,
  host: process.env.HOST || '0.0.0.0',
  basedir: path.resolve(argv['basedir'] || '.'),
  restrict: path.resolve(argv['restrict'] || argv._[0] || argv['basedir'] || '.'),
  gulpfile: path.resolve(argv['gulpfile'] || path.join(__dirname, '../gulpfile.js'))
};

if (argv['v'] || argv['verbose']) {
  console.error('[Serve-gulp] Boot options:', options);
}

server.start(options, function() {
  // runs in HTTP server context
  console.error('[Serve-gulp] listening at', this.address());
});
