var getUrls = require('get-urls');
var url = require('url');
var imagesPool = ['imgur.com'];
var imageUrlParser = {};

imageUrlParser.getImageLink = function(content, callback) {
  var links = getUrls(content);
  if (links.length === 0) {
    callback(new Error('Not a valid Link'));
  }

  for (var i = 0, len = links.length; i < len; i++) {
    for (var j = 0, iLen = imagesPool.length; j < iLen; j++) {
      if (links[i].indexOf(imagesPool[j]) > -1) {
        var imgurRex;
        var imageLink;
        var filename;
        switch (imagesPool[j]) {
          case 'imgur.com':
            imageLink = url.parse(links[i]).hostname + url.parse(links[i]).pathname;
            imgurRex = /i\.imgur\.com\/(.*?)\.(jpg|png)/i;
            if (imgurRex.test(imageLink)) {
              callback(null, 'http://' + imageLink);
            }else {
              callback(null, 'http://i.' + imageLink + '.jpg');
            }

            break;
          default:
            callback(new Error('Not a valid Link'));
        }
      }
    }
  }

};

module.exports = imageUrlParser;
