# serve-gulp

Build and serve bundles or single files on-demand with Gulp. Does not write to disk.

Install: `npm install -g jtwb/serve-gulp`

Run: `PORT=8080 serve-gulp static/`

To try the included example, clone this repo and run the server in the *tests* directory like this: `PORT=8081 serve-gulp assets/`. Then
try: `curl -v localhost:8081/assets/css/site.css`.


```bash
~/src/myapp$ find .
./gulpfile.js
./assets
./assets/css
./assets/css/bootstrap.scss
./assets/css/site.scss
./assets/css/skin.scss
./assets/js
./assets/js/components
./assets/js/components/cart
./assets/js/components/cart/icon.jsx
./assets/js/components/cart/detail.jsx
./assets/js/components/login.jsx
./assets/js/components/billing.jsx
./assets/js/utils.js

~/src/myapp$ npm install -g serve-gulp
~/src/myapp$ sudo serve-gulp assets
[Serve-gulp] listening at { address: '0.0.0.0', family: 'IPv4', port: 63600 }GET /assets/css/all.css 200 ; 43kb
GET /assets/css/site.css 200 ; 5kb
GET /assets/js/components/recursive.js 200 ; 60kb
GET /assets/js/utils.js 200 ; 2kb
^C
~/src/myapp$ 
```

### How do I use it?

**serve-gulp \<directory\>** will act as a transformation proxy for the files in \<directory\>. It will respond to a request like `GET /assets/css/site.css` by searching for */assets/css/site.{css,scss,sass,less}* and converting the file down to css.

| source    | default tasks        | rollup? |
|-----------|----------------------|---------|
| css       | nil                  | yes     |
| scss,sass | gulp-sass            | yes     |
| less      | gulp-less            | yes     |
| js        | browserify           | yes     |
| jsx       | reactify, browserify | yes     |
| html      | html                 | no      |

### How do I provide my own processing rules?

**serve-gulp** will check the current directory for a file named [gulpfile.js](https://github.com/gulpjs/gulp/blob/master/docs/API.md). It will search for special tasks named **jit:sass**, **jit:less**, **jit:js** and **jit:jsx**. You can also override how rollups are processed with **jit:\*sass**, **jit:\*less**, etc.

[Gulpfile documentation](https://github.com/gulpjs/gulp/blob/master/docs/API.md)

You can specify the task file with **--gulpfile**.

### How do I prevent serving files outside the assets tree?

In the example above, **serve-gulp assets** will only serve files from `./assets` relative to the current directory. The first argument to the script specifies the restriction root.

Note that requests paths are still resolved relative to the current directory! In the example, browsers might retrieve `http://example.lol/assets/css/site.css` and the path is resolved relative to the current directory.

Note that relative paths (e.g. **/../../../etc/shadow**) are first resolved against a fake **/** before being resolved from the current directory for safety. Caveat: please use symlinks responsibly.

### How do I run serve-gulp on the same port as my web server?

You could configure [nginx](https://github.com/nginx/nginx) to listen on 0.0.0.0:80, proxy **^/assets** to **serve-gulp** on 127.0.0.1:8081 and proxy everything else to your web server on 127.0.0.1:8080.

Or, you can have your webserver boot up **serve-gulp** via the API, then proxy it in your app (example uses **Express.js**).

```javascript
// [my-server.js]
var serveGulp = require('serve-gulp');

var gulpserver = serveGulp.start({
	port: 0, // random port
	host: 'localhost',
	target: 'assets'
});

app.use('/assets/', function(req, res, next) {
    req.pipe(request(gulpserver.hostname).pipe(res));
});
```

Or, you could do something similar to the above example with a custom middleware for **ExpressJS**, **uWSGI**, **Rack**, etc.

### Is this like Webpack Dev Server?

Yes. Webpack dev server writes to an in-memory FS, while serve-gulp just captures the output of the gulp stream.


### Reserved names

`all.css` searches for `*.{scss,css}` in the target directory.

`recursive.css` searches for `./**/*.{scss,css}` in the target directory.

`all.js`, `recursive.js` trigger `*.{js,jsx,coffee}`, `./**/*.{js,jsx,coffee}`, respectively.

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

In your `server.js` (this example uses ExpressJS):

```javascript
var request = require('request');
var gulpjit = require('serve-gulp');

var gulpport = gulpjit.start({
    port: 0, // random
    basedir: __dirname
});
var gulphost = ['localhost', gulpport].join(':');

app.use('/assets/', function(req, res, next) {
    req.pipe(request(gulphost).pipe(res));
});
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

gulp-ondemand-server[1] kicks off a gulp task after each page load. This tool actually builds the requested file on the fly and returns the very freshest version.

GET /assets/js/all.js
 -> gulp.run('js', 'all.js');
 -> emit( 'function(){var a,b,c=0;for(a... ' );

[1] https://github.com/ernestoalejo/gulp-ondemand-server

*Next steps*

* Gzip
* I'd like to cache this stuff, please! In-memory is OK, but please give me an optional Memcached host/port.
   * Invalidate cache on files changed? This requires a watcher, task.
   * Alternatively move to a model like webpack-dev-server where gulp writes to an in-memory FS
* How do I deploy my assets to production?
   * Solution 1: create your own gulpfile.js and run it directly to create your production assets.
   * Solution 2: run the asset server in prod. Activate memcached caching. Tools like Google Closure Compiler and Ruby-sass may be difficult or impossible to install on your production environment - if so, consider switching to fully npm-installable options like gulp-uglify (based on Uglify2) and gulp-sass (based on node-sass).

