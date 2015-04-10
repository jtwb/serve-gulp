var http = require('http');
var path = require('path');
var gulpjit = require('./lib/gulpjit');
var mediatype = require('./lib/mediatype');


function _infill(options) {
  if (!('gulpfile' in options)) {
    options['gulpfile'] = path.resolve([__dirname, 'gulpfile.js'].join('/'));
  }
  return options;
}


function handler(options) {
  options = _infill(options);
  var builder = gulpjit.configure(options);

  function handleRequest(req, res) {
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
  }

  return {
    handleRequest: handleRequest,
    accepts: builder.accepts.bind(builder)
  }
}


module.exports = {
  handler: handler
};
