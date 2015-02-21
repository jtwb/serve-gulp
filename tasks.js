var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');


var tasks = {
  'css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(out())
  },

  '*css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(concat('all.js'))
      .pipe(out())
  },

  '**css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(concat('recursive.js'))
      .pipe(out())
  },

  'js': function(src, out) {
    gulp.src(src)
      .pipe(out())
  },

  '*js': function(src, out) {
    gulp.src(src)
      .pipe(concat('all.js'))
      .pipe(out())
  },

  '**js': function(src, out) {
    gulp.src(src)
      .pipe(concat('recursive.js'))
      .pipe(out())
  }
};


module.exports = tasks;
