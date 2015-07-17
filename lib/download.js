var request = require('request');
var url = require('url');
var fs = require('fs');

module.exports = function(links, cb) {
  var urlObj = url.parse(links);
  var fileName = urlObj.pathname.split('/')[1];
  console.log('[*] Retrieving ' + links + '...');
  var w = fs.createWriteStream('./images/' + fileName);

  request(links, function(error, response, body) {
    if (typeof response !== 'undefined' && !error && response.statusCode === 200) {
      console.log('[*] 200 OK: Downloading image..');
    } else {
      console.log('[x] Error: response is ' + response);
      cb(new Error('Error'));
    }
  }).pipe(w);

  w.on('finish', function() {
    var n = w.path;
    cb(null, n);
  });
};
