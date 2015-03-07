# serve-gulp

Build and serve bundles or single files on-demand with Gulp.

### Usage

`serve-gulp [-v] [--gulpfile gulpfile] [path ...]`

Environment variables: `PORT`, `HOST`

**serve-gulp** will serve files at `http://0.0.0.0:80` (configurable) according to the rules in your gulpfile. Only files residing in the paths given are allowed. If no paths are given, it will serve files from the current directory. See [Options](#options) and [How Requests Are Handled](#how-requests-are-handled).

If you did not specify a gulpfile with `--gulpfile` and there is a file named `gulpfile.js` in the current directory, that will be used as your gulpfile. If neither is found, **serve-gulp** has a default internal gulpfile. See [Bring Your Own Gulpfile](#bring-your-own-gulpfile) and [Default Gulpfile](#default-gulpfile).

Requests with filename `all.js`, `recursive.js`, `all.css` or `recursive.css` will activate rollup mode. See [How Requests Are Handled](#how-requests-are-handled).


More details:

*   [Options](#options)
*   [Default Gulpfile](#default-gulpfile)
*   [Bring Your Own Gulpfile](#bring-your-own-gulpfile)
*   [How Requests Are Handled](#how-requests-are-handled)
*   [Server Integrations and NodeJS API](#server-integrations-and-nodejs-api)


### Install

`npm install -g jtwb/serve-gulp`


### Example

To try the included example, clone this repo and run the server in [example/](example) directory like this: `PORT=8081 serve-gulp assets/`. Then
try: `curl -v localhost:8081/assets/css/site.css`.


```bash
~/src/myapp$ npm install -g serve-gulp
~/src/myapp$ sudo serve-gulp assets
[Serve-gulp] listening at { address: '0.0.0.0', family: 'IPv4', port: 80 }
GET /assets/css/all.css 200 ; 43kb
GET /assets/css/site.css 200 ; 5kb
GET /assets/js/components/recursive.js 200 ; 60kb
GET /assets/js/utils.js 200 ; 2kb
```


### Options

CLI Arguments

`serve-gulp [-v] [--gulpfile gulpfile] [path ...]`

*  `-v, --verbose` yeah
*  `--gulpfile gulpfile` specify a custom gulpfile. If no custom gulpfile is given and `gulpfile.js` is present in the current directory, that file will be selected implicitly.
*  `--basedir path` resolve request paths against this path. Default is `.`, the current directory.
*  `[path ...]` Incoming requests must refer to directories which contain one or more of these whitelist paths as a prefix. Example: if I run `cd /var/www/myapp; serve-gulp assets` then my whitelist paths are `[ /var/www/myapp/assets/ ]`. A request to `GET /assets/css/site.css` will resolve to `/var/www/myapp/assets/css/`, which does contain `/var/www/myapp/assets/` as a prefix.

Environment arguments

*  `HOST` listen IP. `127.0.0.1` will restrict the server to local requests. `0.0.0.0` has no restrictions. Default is `0.0.0.0`
*  `PORT` listen port. Default is `80`. Note that `0` will choose a random port which on some operating systems is guaranteed to be unused.

Implicit arguments

*  If `gulpfile.js` is present in the current directory and `--gulpfile` is not set, the local gulpfile will be used as a custom gulpfile. See [Bring Your Own Gulpfile](#bring-your-own-gulpfile).



### Default Gulpfile

The default gulpfile applies these steps

| taskname   | rollup? | steps |
|------------|---------|-------|
| jit:css    | no      | gulp-sass |
| jit:\*css  | yes     | gulp-sass \| concat |
| jit:\*\*css | yes    | gulp-sass \| concat |
| jit:js     | no      | none |
| jit:\*js   | yes     | concat |
| jit:\*\*js | yes     | concat |
| jit:static | no      | none |


### Bring Your Own Gulpfile

If you already use Gulp, and you have a `gulpfile.js` in the current directory, **serve-gulp** can use that file.

**Criteria** Your gulpfile must define all of the tasks shown above in [Default Gulpfile](#default-gulpfile). See [example/gulpfile.js](example/gulpfile.js).

If you can, try aliasing the `jit:` tasks to your existing tasks like this:

```javascript
gulp.task('jit:css', ['css']);
```

**serve-gulp** will run your gulp tasks with `gulp.src` and `gulp.dest` replaced with special just-in-time tools.



### How Requests Are Handled


| request extension | search               | taskname   | rollup? |
|-------------------|----------------------|------------|---------|
| file.css          | file.{css,scss,sass} | jit:css    | no      |
| all.css           | \*.{css,scss,sass}   | jit:\*css  | yes     |
| recursive.css     | \*\*/\*.{css,scss,sass} | jit:\*\*css | yes |
| file.js           | file.js              | jit:js     | no      |
| all.js            | \*.js                | jit:\*js   | yes     |
| recursive.js      | \*\*/\*.js           | jit:\*\*js | yes     |
| file.html         | file.html            | jit:static |         |

`cd /var/www/myapp; serve-gulp assets`

##### Example 1: `GET /assets/css/site.css`

0.  Verify request path is contained in at least one allowed path
   1. `allowed_paths := [ /var/www/myapp/assets/ ]`
   1. `request_path := /var/www/myapp/assets/css/`
   2. `-> OK`
1.  Convert filename to glob
   2. `extension == .css`
   3. 	`name ∉ [ all, recursive ]`
   3. `-> /var/www/myapp/assets/css/site.{css,scss,sass}`
2.  Select gulp task
	3. `extension == .css`
	4. `name ∉ [ all, recursive ]`
	4. `-> jit:css`
3.  Run gulp task with `gulp.src(...)` overriden to the glob above and `gulp.dest(...)` overriden to serve the result

```javascript
gulp.task('jit:css', function() {
	gulp.src()
		.pipe(gulp-sass())
		.pipe(gulp.dest())
});
```


##### Example 2: `GET /assets/../../../../etc/passwd`

0.  Verify request path is contained in at least one allowed path
   1. `allowed_paths := [ /var/www/myapp/assets/ ]`
   1. `request_path := /var/www/myapp/etc/passwd`
	   2. Relative paths are resolved against a false root first
   2. `-> Forbidden`


##### Example 3: `GET /assets/css/recursive.css`

0.  Verify request path is contained in at least one allowed path
   1. `allowed_paths := [ /var/www/myapp/assets/ ]`
   1. `request_path := /var/www/myapp/assets/css/`
   2. `-> OK`
1.  Convert filename to glob
   2. `extension == .css`
   3. `name == recursive`
   3. `-> /var/www/myapp/assets/css/**/*.{css,scss,sass}`
2.  Select gulp task
	3. `extension == .css`
	4. `name == recursive`
	4. `-> jit:**css`
3.  Run gulp task with `gulp.src(...)` overriden to the glob above and `gulp.dest(...)` overriden to serve the result

```javascript
gulp.task('jit:**css', function() {
	gulp.src()
		.pipe(gulp-sass())
		.pipe(concat())
		.pipe(gulp.dest())
});
```


### How does serve-gulp prevent serving files outside the assets tree?

In the example above, **serve-gulp assets** will only serve files from `./assets` relative to the current directory. The first argument to the script specifies the restriction path. Multiple restriction paths are allowed and combined via union.

**Relative paths** (e.g. **/../../../etc/shadow**) are first resolved against a fake **/** before being resolved from the current directory for safety.

**Symlinks** are handled like so: the `realpath` of the request path must contain the `realpath` of one or more restriction paths.


### Server Integrations and NodeJS API


#### How do I run serve-gulp on the same port as my web server?

You could configure [nginx](https://github.com/nginx/nginx) to listen on 0.0.0.0:80, proxy **^/assets** to **serve-gulp** on 127.0.0.1:8081 and proxy everything else to your web server on 127.0.0.1:8080.

Or, you can have your webserver boot up **serve-gulp** via the API, then proxy it in your app (example uses **Express.js**).

```javascript
// [my-server.js]
var serveGulp = require('serve-gulp');

var serveGulpConf = {
	port: 0, // random port
	host: 'localhost',
	target: 'assets'
};

var GULP_PORT;


app.use('/assets/', function(req, res, next) {
    req.pipe(request(GULP_PORT).pipe(res));
});


serveGulp.start(serveGulpConf, function() {
	GULP_PORT = this.address();
	app.start();
});
```

Or, you could do something similar to the above example with a custom middleware for **ExpressJS**, **uWSGI**, **Rack**, etc.



### Is this like Webpack Dev Server?

Yes. Serve-gulp runs one file at a time and captures the output that would be written to disk. Webpack Dev Server runs your whole build in an in-memory FS and serves files from the in-memory FS.



### Is this like Gulp OnDemand Server?

No. [Gulp OnDemand Server](https://github.com/ernestoalejo/gulp-ondemand-server) triggers a full gulp build on each request and does not necessarily serve the latest version of the file. This tool builds the requested file on the fly and returns the very freshest version.

```
GET /assets/js/all.js
 -> gulp.run('js', 'all.js');
 -> emit( 'function(){var a,b,c=0;for(a... ' );
```


### Another Example

Your project:
```
assets/
├─┬ js/
│ ├─┬ components/
│ │ ├── menu.jsx
│ │ ├── media.jsx
│ | └─┬ shoppingcart/
│ |   ├── full.jsx
│ │   └── tiny.jsx
│ └─┬ utils/
│   ├── urls.js
│   └── util.js
└─┬ css/
  ├── homepage.scss
  └── checkout.scss
```

In your HTML:

```html
<link rel="stylesheet" href="/assets/css/all.css" />
<!--
    Includes homepage.scss, checkout.scss compiled to css
-->

<script type="text/javascript" src="/assets/js/components/recursive.js"></script>
<!--
    Includes menu.jsx, media.jsx, shoppingcart/full.jsx, shoppingcart/tiny.jsx
    compiled to js with browserify and reactify
-->

<script type="text/javascript" src="/assets/js/utils/urls.js"></script>
<script type="text/javascript" src="/assets/js/utils/util.js"></script>
```



### Other notes

gulp-ondemand-server[1] kicks off a gulp task after each page load. This tool builds the requested file on the fly and returns the very freshest version.

```
GET /assets/js/all.js
 -> gulp.run('js', 'all.js');
 -> emit( 'function(){var a,b,c=0;for(a... ' );
```

[1] https://github.com/ernestoalejo/gulp-ondemand-server


### *Enhancement Proposals*

* Support a list of whitelisted paths as command line arguments, e.g.
    $ serve-gulp assets/bodies assets/components assets/layouts
* In "watch mode", (eventually the default for systems with that capability), cache results in-memory and invalidate when any target inode changes.
* Accept fingerprints in filenames and query strings, e.g. file.css?b57b91e893fd6d68ce and file___909fe4bc7387f31fa24a8f.css are the same as file.css
* Send cache-control headers
* Gzip
* Etag
* I'd like to cache this stuff, please! In-memory is OK, but please give me an optional Memcached host/port.
   * Invalidate cache on files changed? This requires a watcher, task.
   * Alternatively move to a model like webpack-dev-server where gulp writes to an in-memory FS
* How do I deploy my assets to production?
   * Solution 1: create your own gulpfile.js and run it directly to create your production assets.
   * Solution 2: run the asset server in prod. Activate memcached caching. Tools like Google Closure Compiler and Ruby-sass may be difficult or impossible to install on your production environment - if so, consider switching to fully npm-installable options like gulp-uglify (based on Uglify2) and gulp-sass (based on node-sass).

