  var root = __dirname.split('/');
  root.pop();
  root.push("templates");
  root = root.join('/');

module.exports.byName= function(name) {
  return root + "/" +name;
}
