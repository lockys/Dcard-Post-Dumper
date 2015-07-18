/***
Author: Calvin Jeng
***/
var request = require('request');
var getUrls = require('get-urls');
var jsonfile = require('jsonfile');
var Dcard = require('dcard');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var Dcard = new Dcard();
var STOP_POST_ID;
var WAKE_TIMEOUT_NUM = 10000;
var SLOW_WAIT_TIMEOUT = 2000;
var STEP = 300;
var STOP_PATH = './stop-point.json';

if (argv.s) {
  var s3Client = require('./lib/aws-s3-client');

  if (argv.s === true) {
    console.error(new Error('Please specify you bucket name in S3 with -s bucketName'));
    process.exit();
  }
}

main();

function getPostContent(startPostID, step) {
  if (STOP_POST_ID < startPostID) {
    console.log('[!] No new post for now :-)');
    return;
  }

  for (var i = startPostID, len = startPostID + step; i < len; i++) {
    Dcard.getContentByPostID(i, savePost);
  }

  setTimeout(function(_startPostID, _step) {
    console.log('Start At POST ID = ' + _startPostID);
    if (_startPostID <= STOP_POST_ID) {
      getPostContent(_startPostID, _step);
    }else {
      jsonfile.writeFile(STOP_PATH, {stopPoint: STOP_POST_ID + 1}, function(err) {
        if (err) {
          console.error(err);
        }
      });
    }
  }, SLOW_WAIT_TIMEOUT, startPostID + step, step);
}

function savePost(error, post) {
  var rawPost = post.rawObject;
  var category = rawPost.forum_alias;
  var id = post.id;
  var file = './post/' + category + '/' + id + '.json';

  ensureExists('./post/' + category + '/', 0744, function(err) {
    jsonfile.writeFile(file, rawPost, {encoding: 'utf-8'}, function(err) {
      if (!err) {
        console.log('[*] Save a post');

        //Enable S3 Uploader.
        if (argv.s) {
          var params = {
            localFile: file,
            s3Params: {
              Bucket: argv.s,
              Key: category + '/' + id + '.json'
            }
          };
          var uploader = s3Client.uploadFile(params);
          uploader.on('error', function(err) {
            console.error('[x] Unable to upload, Please check your credential is correct.', err.stack);
          });
        }

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
  console.log('Dcard Post Dumper');
  console.log('1.0.0 alpha edition @ 2015/07/17');
}

function startGetPost() {
  Dcard.getPostIdByForum ('all', 1, function(err, postIdArr) {
    if (!err) {
      STOP_POST_ID = postIdArr[0];
      console.log('[*] I wake up, getting posts now.');
      console.log('[!] Latest Post ID is ' + STOP_POST_ID);
      jsonfile.readFile(STOP_PATH, {encoding: 'utf-8'}, function(err, stopObj) {
        if (err) {
          getPostContent(383225);
        } else {
          var startPostID = stopObj.stopPoint;
          var step = STOP_POST_ID - startPostID > STEP ? STEP : STOP_POST_ID - startPostID;
          getPostContent(startPostID, step);
        }
      });
    } else {
      console.log(err);
    }
  });

  setTimeout(function() {
    startGetPost();
  }, WAKE_TIMEOUT_NUM);
}

function main() {
  welcomeMessage();
  ensureExists('./post/', 0744, function(err) {
    if (!err) {
      console.log('[!] Creating post/ folder.');
      startGetPost();
    } else {
      console.error('[x] post/ folder failed to create.');
      process.exit();
    }
  });
}
