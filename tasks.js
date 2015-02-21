var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-minify-css');


var tasks = {
  'css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(cssmin())
      .pipe(out())
  },

  '*css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(concat('all.js'))
      .pipe(cssmin())
      .pipe(out())
  },

  '**css': function(src, out) {
    gulp.src(src)
      .pipe(sass())
      .pipe(concat('recursive.js'))
      .pipe(cssmin())
      .pipe(out())
  },

  'js': function(src, out) {
    gulp.src(src)
      .pipe(uglify())
      .pipe(out())
  },

  '*js': function(src, out) {
    gulp.src(src)
      .pipe(concat('all.js'))
      .pipe(uglify())
      .pipe(out())
  },

  '**js': function(src, out) {
    gulp.src(src)
      .pipe(concat('recursive.js'))
      .pipe(uglify())
      .pipe(out())
  }
};


module.exports = tasks;
