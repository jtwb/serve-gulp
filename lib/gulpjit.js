var path = require('path');
var through = require('through2');
var glob = require('glob');


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
  var task = this.task = gettask(req);
  var matcher = this.matcher = getmatcher(task);
  this.src = getsrc(req, task, matcher, basedir);
}


Query.prototype.precheck_ok = function() {
  var match = glob.sync(this.src);
  return !!match.length;
};


function GulpJITEngine(options) {
  this.basedir = options.basedir;
  this.tasks = require(options.taskfile);
}


function Task(tasks, query) {
  var taskname = query.task;
  if (taskname in tasks) {
    this.task = tasks[taskname];
  }
}


Task.prototype.isValid = function() {
  return !!this.task;
}


Task.prototype.run = function(src, serve) {
  return this.task(src, serve);
}

GulpJITEngine.prototype.get = function(req, cb) {
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

  var q = new Query(req, this.basedir);

  // gulp will fail silently, so we must verify that some files are matched
  if (!q.precheck_ok()) {
    cb(null, { code: 404, message: 'Not Found' });
    return;
  }

  var task = new Task(this.tasks, q);
  if (!task.isValid()) {
    cb(null, { code: 404, message: 'I do not serve that type of file' });
    return;
  }
  return task.run(q.src, serve);
};


function configure(options) {
  return new GulpJITEngine(options);
}


module.exports = {
  configure: configure
};

