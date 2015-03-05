var http = require('http');
var gulpjit = require('../lib/gulpjit');
var mediatype = require('../lib/mediatype');


function start(options, onBoot) {
  var host = options.host;
  var port = options.port;
  var builder = gulpjit.configure(options);
  var onBoot = onBoot || function() {};

  http.createServer(function(req, res) {
    builder.get(req, function(file, error) {
      if (!file || !file.contents) {
        error = {
          code: 404,
          message: 'Not Found'
        };
      }
      if (error) {
        console.log('GET', req.url, error.code);
        res.writeHead(error.code);
        res.end(error.message);
        return;
      }
      var content = file.contents.toString();
      var type = mediatype(file.relative);
      console.log('GET', req.url, 200, ',', content.length + ' bytes');
      res.writeHead(200, {
        'Content-Length': content.length,
        'Content-Type': type
      });
      res.end(content);
    });
  }).listen(port, host, onBoot);
}


module.exports = {
  start: start
};
