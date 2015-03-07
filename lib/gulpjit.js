var fs = require('fs');
var path = require('path');
var through = require('through2');
var glob = require('glob');
var rewire = require('rewire');


var OK = 0, ERR_DID_NOT_RUN = 1;


function gettask(req) {
  var basename = path.basename(req.url);
  if (/^recursive\.css$/.test(basename)) {
    return 'jit:**css';
  }
  if (/^recursive\.js$/.test(basename)) {
    return 'jit:**js';
  }
  if (/^all\.css$/.test(basename)) {
    return 'jit:*css';
  }
  if (/^all\.js$/.test(basename)) {
    return 'jit:*js';
  }
  if (/\.css$/.test(basename)) {
    return 'jit:css';
  }
  if (/\.js$/.test(basename)) {
    return 'jit:js';
  }
  return 'jit:static';
}


function getmatcher(task) {
  if (task == 'jit:**css') {
    return '**/*.{css,scss}';
  }
  if (task == 'jit:**js') {
    return '**/*.{js,jsx,coffee}';
  }
  if (task == 'jit:*css') {
    return '*.{css,scss}';
  }
  if (task == 'jit:*js') {
    return '*.{js,jsx,coffee}';
  }
  if (task == 'jit:css') {
    return '{css,scss}';
  }
  if (task == 'jit:js') {
    return '{js,jsx,coffee}';
  }
  return false;
}


/*
 * Resolve twice: once against root for safety
 */
function getsrc(req, task, matcher, basedir) {
  var resolvedpath = path.resolve(req.url);
  var dirname = path.dirname(resolvedpath);
  var basename = path.basename(resolvedpath);
  var name = basename.replace(/\..*$/,'');

  if (/^jit:[*]/.test(task)) {
    return path.resolve(basedir + path.join(dirname, matcher));
  }
  if (/^jit:static/.test(task)) {
    return path.resolve(basedir + resolvedpath);
  }
  return path.resolve(basedir + path.join(dirname, name) + '.' + matcher);
}


function Query(req, basedir) {
  var task, matcher;
  this.basedir = basedir;
  this.dirname = path.dirname(req.url);
  this.task = task = gettask(req);
  this.matcher = matcher = getmatcher(task);
  this.src = getsrc(req, task, matcher, basedir);
}


Query.prototype.glob_allowed = function(restrictdirs) {
  var check = path.resolve(this.basedir + path.resolve(this.dirname));
  var realpath;

  try {
    realpath = fs.realpathSync(check);
  } catch(e) {
    console.error('[Serve-gulp] 403 - invalid path', check);
    return false;
  }

  for (var i = 0, l = restrictdirs.length; i < l; i++) {
    try {
      var restrictpath = fs.realpathSync(restrictdirs[i]);
      if (~realpath.indexOf(restrictpath)) {
        return true;
      }
    } catch(e) { }
  }
  return false;
};


Query.prototype.glob_ok = function() {
  var match = glob.sync(this.src);
  return !!match.length;
};


function GulpJITEngine(options) {
  this.basedir = options.basedir;
  this.restrictdirs = options.restrict;
  this.gulpfile = rewire(options.gulpfile);
  this.sanitycheck();
}


GulpJITEngine.prototype.sanitycheck = function() {
  var restrictdirs = this.restrictdirs;
  for (var i = 0, l = restrictdirs.length; i < l; i++) {
    try {
      fs.realpathSync(restrictdirs[i]);
    } catch(e) {
      console.error('[Serve-gulp] STARTUP WARNING - realpath(' + restrictdirs[i] + ') fails; this will slow down file resolving');
    }
  }
};


function Task(gulpfile, query) {
  this.gulpfile = gulpfile;
  this.taskname = query.task;
}


Task.prototype.run = function(src, serve) {
  var gulpfile = this.gulpfile;
  var gulp = gulpfile.__get__('gulp');

  function withFakeSrc(next) {
    var realsrc = gulp.src;
    function fakesrc() {
      return realsrc.call(gulp, src);
    }
    gulp.src = fakesrc;
    next();
    gulp.src = realsrc;
  }

  gulp.dest = serve;

  return withFakeSrc(function() {
    try {
      gulp.run(this.taskname);
      return OK;
    } catch(e) {
      console.error(e);
      return ERR_DID_NOT_RUN;
    }
  }.bind(this));
}


GulpJITEngine.prototype.get = function(req, cb) {
  var cb = cb || function() {};
  function serve() {
    return through.obj(function(file, enc, next) {
      if (file.isStream()) {
        var message = '[Serve-gulp] Plugin error! Gulp-on-demand expects a buffer';
        console.error(message);
        return cb(null, { code: 500, message: message });
      }
      cb(file);
      next();
    });
  }

  var q = new Query(req, this.basedir);

  // don't serve files outside the restricted zone. Symlink responsibly.
  if (!q.glob_allowed(this.restrictdirs)) {
    cb(null, { code: 403, message: 'Forbidden' });
    return;
  }

  // gulp will fail silently when no source files are found, so we pre-check
  if (!q.glob_ok()) {
    cb(null, { code: 404, message: 'Not Found' });
    return;
  }

  var task = new Task(this.gulpfile, q);

  if (task.run(q.src, serve)) {
    cb(null, { code: 404, message: 'I do not serve that type of file' });
    return;
  }
};


function configure(options) {
  return new GulpJITEngine(options);
}


module.exports = {
  configure: configure
};

