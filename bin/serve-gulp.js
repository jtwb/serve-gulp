#!/usr/bin/env node

'use strict';
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var server = require('../server/');


server.start({
  port: process.env.PORT || 80,
  basedir: argv['basedir'] || __dirname,
  taskfile: path.resolve(argv['taskfile'] || './tasks.js')
});

