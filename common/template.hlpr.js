var fs = require('fs');
var hbs = require('handlebars');

var stringifyTemplate = function(template, filler){
  var virtualTemplate = hbs.compile(template);
  return virtualTemplate(filler);
};

module.exports.templateToStr = function(path, filler, callback){
  fs.readFile(path, function(err, data){
    if(!err){
      var handlebars2Str = data.toString();
      var resultStr = stringifyTemplate(handlebars2Str,filler);
      console.log(resultStr);
      callback(resultStr);
    } else {
      console.error(err);
    }
  });
};
