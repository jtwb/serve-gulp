var gulp = require('gulp');
var sass = require('gulp-sass');


// BOOKMARK - rollups
var tasks = {
  'css': function(src, out) {
    // BOOKMARK - minify
    gulp.src(src)
      .pipe(sass())
      .pipe(out())
  },

  'js': function(src, out) {
    // BOOKMARK - minify
    gulp.src(src)
      .pipe(out())
  }
};


module.exports = tasks;
