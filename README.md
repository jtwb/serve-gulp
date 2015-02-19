What if gulp/vinyl could build assets on the fly?

GET /assets/js/all.js
 -> gulp.run('js', 'all.js');
 -> emit( 'function(){var a,b,c=0;for(a... ' );


Unlike gulp-ondemand-server[1], which kicks off a gulp task after each page load, I want to actually build the requested file on the fly, on demand.
https://github.com/ernestoalejo/gulp-ondemand-server

*Next steps*

* I'd like to cache this stuff, please! In-memory is OK, but please give me an optional Memcached host/port.
   * Invalidate cache on files changed? This requires a watcher, task.
* I'd like to provide my own task definitions, although the built-in tasks should be good enough for most uses.
* My server doesn't have hard-to-install tools like Compass and Google Closure. I'd like to compile my assets and make them available to my server when I deploy.
   * Solution: just install those tools in prod. Consider containerizing Java and Ruby tools.
