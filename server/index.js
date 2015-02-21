var http = require('http');
var gulpjit = require('../lib/gulpjit');


var port = process.env.PORT || 80;


function start(options) {
  var port = options.port;
  var builder = gulpjit.configure(options);

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
  }).listen(port);
}


module.exports = {
  start: start
};
