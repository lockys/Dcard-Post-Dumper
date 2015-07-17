var validator = {};
var forumArray = ['funny', 'bg', 'trending', 'talk', 'girl', 'boy', 'mood', 'music', 'movie', 'literature', 'sport',
                  'pet', 'food', 'job', 'studyabroad', 'marvel', 'sex', 'dcard', 'whysoserious', 'delete'];

validator.isValidInput = function(userInput) {

  if (userInput.length < 2) {
    console.log('[!] input is insufficient.');
    return false;
  }

  if (forumArray.indexOf(userInput[0]) <= -1) {
    console.log('[!] Please make sure that your forum name is correct.');
    return false;
  }

  return true;
};

module.exports = validator;
