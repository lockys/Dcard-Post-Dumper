var request = require('request');
var getUrls = require('get-urls');
var jsonfile = require('jsonfile');
var Dcard = require('dcard');
var fs = require('fs');
var s3Client = require('./lib/aws-s3-client');
var Dcard = new Dcard();
var STOP_POINT;
var STOP_PATH = './stop-point.json';

main();

function getPostContent(index, step) {
  if (STOP_POINT < index) {
    console.log('[!] No new post for now :-)');
    return;
  }

  for (var i = index, len = index + step; i < len; i++) {
    Dcard.getContentByPostID(i, savePost);
  }

  setTimeout(function(_index, _step) {
    console.log('Start At POST ID = ' + _index);
    if (_index <= STOP_POINT) {
      getPostContent(_index, _step);
    }else {
      jsonfile.writeFile(STOP_PATH, {stopPoint: STOP_POINT + 1}, function(err) {
        if (err) {
          console.error(err);
        }
      });
    }
  }, 5000, index + step, step);
}

function savePost(error, post) {
  var rawPost = post.rawObject;
  var category = rawPost.forum_alias;
  var id = post.id;
  var file = './post/' + category + '/' + id + '.json';

  ensureExists('./post/' + category + '/', 0744, function(err) {
    jsonfile.writeFile(file, rawPost, function(err) {
      if (!err) {
        console.log('[*] Save a post');

        var params = {
          localFile: file,
          s3Params: {
            Bucket: 'dcard-posts',
            Key: category + '/' + id + '.json'
          }
        };
        var uploader = s3Client.uploadFile(params);
        uploader.on('error', function(err) {
          console.error('unable to upload:', err.stack);
        });

      }else {
        console.error(err);
      }
    });
  });
}

function ensureExists(path, mask, cb) {
  if (typeof mask == 'function') { // allow the `mask` parameter to be optional
    cb = mask;
    mask = 0777;
  }

  fs.mkdir(path, mask, function(err) {
    if (err) {
      if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
      else cb(err); // something else went wrong
    } else cb(null); // successfully created folder
  });
}

function welcomeMessage() {
  console.log('+-+ +--+-+-+-+-+ +-+-+-+-+-+-+ +-+-+-+-+-+-+ +-+');
  console.log('|=| |狄|c|a|r|d| |I|m|a|g|e|s| |h|e|l|p|e|r| |=|');
  console.log('+-+ +--+-+-+-+-+ +-+-+-+-+-+-+ +-+-+-+-+-+-+ +-+');
  console.log('1.0.0 alpha edition @ 2015/06/25');
  console.log('[!] Please note thar all the images belong to the original author, DO NOT use for illigal purpose.');
}

function startGetPost() {
  Dcard.getPostIdByForum ('all', 1, function(err, postIdArr) {
    if (!err) {
      STOP_POINT = postIdArr[0];
      console.log('[*] I wake up, getting posts now.');
      console.log('[!] Latest Post ID is ' + STOP_POINT);
      jsonfile.readFile(STOP_PATH, {encoding: 'utf-8'}, function(err, stopObj) {
        if (err) {
          getPostContent(383225);
        } else {
          var index = stopObj.stopPoint;
          var step = STOP_POINT - index > 800 ? 800 : STOP_POINT - index;
          getPostContent(index, step);
        }
      });
    } else {
      console.log(err);
    }
  });

  setTimeout(function() {
    startGetPost();
  }, 10000);
}

function main() {
  welcomeMessage();
  startGetPost();
}
