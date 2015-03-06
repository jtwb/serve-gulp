var gulp = require('gulp');
var concat = require('gulp-concat');
var ext = require('gulp-ext-replace');
var sass = require('gulp-sass');


/*
 * When serve-gulp runs your gulpfile.js, it will use
 * rewire[1] to override DYNAMIC_SRC
 */


DYNAMIC_SRC = null;


gulp.task('default', ['jit:css']);


gulp.task('jit:css', function() {
  gulp.src(DYNAMIC_SRC || './assets/css/*.scss')
    .pipe(sass())
    .pipe(concat('all.css'))
    .pipe(gulp.dest('./assets/dist'))
});


gulp.task('jit:*css', function() {
  gulp.src(DYNAMIC_SRC || './assets/css/*.scss')
    .pipe(sass())
    .pipe(concat('all.css'))
    .pipe(gulp.dest('./test/assets'))
});


gulp.task('jit:**css', function() {
  gulp.src(DYNAMIC_SRC || './assets/css/**/*.scss')
    .pipe(sass())
    .pipe(concat('recursive.css'))
    .pipe(gulp.dest('./test/assets'))
});


gulp.task('jit:js', function() {
  gulp.src(DYNAMIC_SRC || './assets/js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./test/assets'))
});


gulp.task('jit:*js', function() {
  gulp.src(DYNAMIC_SRC || './assets/js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./test/assets'))
});


gulp.task('jit:**js', function() {
  gulp.src(DYNAMIC_SRC || './assets/js/**/*.js')
    .pipe(concat('recursive.js'))
    .pipe(gulp.dest('./test/assets'))
});


gulp.task('jit:static', function() {
  gulp.src(DYNAMIC_SRC)
    .pipe(gulp.dest('./test/assets'))
});
