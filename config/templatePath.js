var root = __dirname.split('/');
root.pop();
root = root.join('/');
root += '/templates/';


module.exports.of = function(name) {
  var path = root+name;
  console.log(root);
  return path;
};
