var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');


var tasks = {
  'jit:css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(out())
  },

  'jit:*css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(concat('all.js'))
      .pipe(out())
  },

  'jit:**css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(concat('recursive.js'))
      .pipe(out())
  },

  'jit:js': function(src, out) {
    gulp.src(src)
      .pipe(out())
  },

  'jit:*js': function(src, out) {
    gulp.src(src)
      .pipe(concat('all.js'))
      .pipe(out())
  },

  'jit:**js': function(src, out) {
    gulp.src(src)
      .pipe(concat('recursive.js'))
      .pipe(out())
  },

  'jit:static': function(src, out) {
    gulp.src(src)
      .pipe(out())
  }
};


module.exports = tasks;
