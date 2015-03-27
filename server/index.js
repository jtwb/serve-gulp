var http = require('http');
var api = require('../api');
var mediatype = require('../lib/mediatype');


function start(options, onBoot) {
  var host = options.host;
  var port = options.port;
  var onBoot = onBoot || function() {};
  var handler = api.handler(options);


  http.createServer(handler.handleRequest).listen(port, host, onBoot);


  return {
    // Caution - with dynamic ports (port=0) this will return 0,
    // not the actual port selected by the OS.
    // In this case, inspect the server in your onBoot callback.
    port: port,
    host: host,
    accepts: handler.accepts.bind(handler)
  }
}


module.exports = {
  start: start
};
