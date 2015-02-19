var path = require('path');
var through = require('through2');
var glob = require('glob');
var tasks = require('../tasks.js');


function getmode(req) {
  var basename = path.basename(req.url);
  if (/^all\.css$/.test(basename)) {
    return '*.{css,scss}';
  }
  if (/^all\.js$/.test(basename)) {
    return '*.{js,jsx,coffee}';
  }
  if (/\.css$/.test(basename)) {
    return '{css,scss}';
  }
  if (/\.js$/.test(basename)) {
    return '{js,jsx,coffee}';
  }
  return false;
}


/*
 * Resolve twice: once against root for safety
 */
function getsrc(req, mode) {
  var resolvedpath = path.resolve(req.url);
  var dirname = path.dirname(resolvedpath);
  var basename = path.basename(resolvedpath);
  var name = basename.replace(/\..*$/,'');

  if (/^[*]/.test(mode)) {
    return path.resolve('.' + [dirname, mode].join('/'));
  }
  return path.resolve('.' + path.join(dirname, name) + '.' + mode);
}


function get(req, cb) {
  var cb = cb || function() {};
  function serve() {
    return through.obj(function(file, enc, next) {
      if (file.isStream()) {
        var message = 'Plugin error! Gulp-on-demand expects a buffer';
        console.error(message);
        return cb(null, { code: 500, message: message });
      }
      var output = file.contents.toString();
      cb(output);
      next();
    });
  }

  var mode = getmode(req);
  var src = getsrc(req, mode);

  // gulp will fail silently. pre-check for absent files.
  var match = glob.sync(src);
  if (!match.length) {
    cb(null, { code: 404, message: 'Not Found' });
  }

  if (/css/.test(mode)) {
    return tasks['css'](src, serve);
  }
  if (/js/.test(mode)) {
    return tasks['js'](src, serve);
  }
}


module.exports = {
  get: get
};

