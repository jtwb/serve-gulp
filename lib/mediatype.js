var path = require('path');

// BOOKMARK a community-maintained list would be better
function mediatype(filename) {
  var ext = path.extname(filename);
  if (!ext) return;
  ext = ext.slice(1);
  switch (ext) {
    case 'css':
    case 'html':
      return ['text', ext].join('/');
    case 'json':
    case 'xml':
      return ['application', ext].join('/');
    case 'js':
      return ['application', 'javascript'].join('/');
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return ['image', ext].join('/');
  }
}

module.exports = mediatype;
