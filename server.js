var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var server = require('./server/');


server.start({
  port: process.env.PORT || 80,
  basedir: argv['basedir'] || __dirname,
  taskfile: path.resolve(argv['taskfile'] || './tasks.js')
});
