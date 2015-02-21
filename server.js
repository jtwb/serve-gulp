var server = require('./server/');

var port = process.env.PORT || 80;
var basedir = process.argv[2] || __dirname;


server.start({
  port: port,
  basedir: basedir
});
