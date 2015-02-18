What if gulp/vinyl could build assets on the fly?

GET /assets/js/all.js
 -> gulp.run('js', 'all.js');
 -> emit( 'function(){var a,b,c=0;for(a... ' );


Unlike gulp-ondemand-server[1], which kicks off a gulp task after each page load, I want to actually build the requested file on the fly, on demand.
https://github.com/ernestoalejo/gulp-ondemand-server
