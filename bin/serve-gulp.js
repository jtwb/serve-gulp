#!/usr/bin/env node

'use strict';
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var server = require('../server/');


var options = {
  port: process.env.PORT || 80,
  host: process.env.HOST || '0.0.0.0',
  restrict: argv['restrict'] || argv._[0] || '.',
  basedir: argv['basedir'] || __dirname,
  taskfile: path.resolve(argv['taskfile'] || './tasks.js')
};
console.error(options);

server.start(options, function() {
  // runs in HTTP server context
  console.error('[Serve-gulp] listening at', this.address());
});
