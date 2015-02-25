var http = require('http');
var gulpjit = require('../lib/gulpjit');


function start(options, onBoot) {
  var host = options.host;
  var port = options.port;
  var builder = gulpjit.configure(options);
  var onBoot = onBoot || function() {};

  http.createServer(function(req, res) {
    builder.get(req, function(content, error) {
      if (error) {
        console.log('GET', req.url, error.code);
        res.writeHead(error.code);
        res.end(error.message);
        return;
      }
      console.log('GET', req.url, 200, ',', content.length + ' bytes');
      res.writeHead(200, { 'Content-Length': content.length });
      res.end(content);
    });
  }).listen(port, host, onBoot);
}


module.exports = {
  start: start
};
