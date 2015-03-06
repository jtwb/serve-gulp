var gulp = require('gulp');
var concat = require('gulp-concat');
var ext = require('gulp-ext-replace');
var sass = require('gulp-sass');


/*
 * A note on rewire:
 *
 * When serve-gulp runs your gulpfile.js, it will use
 * rewire[1] to override the following:
 *
 * *  GLOB_CSS_SRC
 * *  GLOB_CSS_SRC_RECURSIVE
 * *  gulp.dest
 *
 * [1] http://github.com/?/rewire
 */


GLOB_CSS_SRC = './test/*.scss'
GLOB_CSS_SRC_RECURSIVE = './test/**/*.scss'


gulp.task('default', ['jit:css']);


gulp.task('jit:css', function() {
  gulp.src(GLOB_CSS_SRC)
    .pipe(sass())
    .pipe(concat('all.css'))
    .pipe(gulp.dest('./test/assets'))
});


gulp.task('jit:*css', function() {
  gulp.src(GLOB_CSS_SRC)
    .pipe(sass())
    .pipe(concat('all.css'))
    .pipe(gulp.dest('./test/assets'))
});


gulp.task('jit:**css', function() {
  gulp.src(GLOB_CSS_SRC_RECURSIVE)
    .pipe(sass())
    .pipe(concat('recursive.css'))
    .pipe(gulp.dest('./test/assets'))
});
