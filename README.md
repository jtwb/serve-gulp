What if Gulp could build assets on the fly?

`GET /assets/css/homepage.css` triggers task `jit:css` with the source dynamically set to `homepage.scss`.

`GET /assets/css/all.css` triggers task `jit:*css` with the source set to `*.scss`

`GET /assets/css/recursive.css` triggers task `jit:**css` with the source set to `./**/*.scss`

### Is this like Webpack Dev Server?

Yes. Webpack dev server writes to an in-memory FS, while serve-gulp just captures the output of the gulp stream.

### Can I provide my own gulp tasks?

Yes. Serve-gulp will behave reasonably by default.

Default operations:

- SASS -> CSS
- Concatenate CSS in jit:\*css and jit:\*\*css mode
- Reactify JSX -> JS
- Browserify JS
- Concatenate JS in jit:\*js and jit:\*\*js mode

To provide your own, pass `taskfile` to `server.start` or the CLI. Your file will look something like `tasks.js` included in this project.

### Reserved names

`all.css` searches for `*.{scss,css}` in the target directory.

`recursive.css` searches for `./**/*.{scss,css}` in the target directory.

`all.js`, `recursive.js` trigger `*.{js,jsx,coffee}`, `./**/*.{js,jsx,coffee}`, respectively.

### Example

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

* I'd like to cache this stuff, please! In-memory is OK, but please give me an optional Memcached host/port.
   * Invalidate cache on files changed? This requires a watcher, task.
   * Alternatively move to a model like webpack-dev-server where gulp writes to an in-memory FS
* I'd like to provide my own task definitions, although the built-in tasks should be good enough for most uses.
* My server doesn't have hard-to-install tools like Compass and Google Closure. I'd like to compile my assets and make them available to my server when I deploy.
* How do I deploy my assets to production?
   * Solution 1: run your gulpfile directly before build and ship the compiled assets to your production servers or CDN
   * Solution 2: run the asset server in prod. Activate memcached caching. Tools like Google Closure Compiler and Ruby-sass may be difficult or impossible to install on your production environment - if so, consider switching to fully npm-installable options like gulp-uglify (based on Uglify2) and gulp-sass (based on node-sass).

