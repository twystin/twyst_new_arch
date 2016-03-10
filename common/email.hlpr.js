var arrayMaker = function(str) {
  var arr = [];
  if(!Array.isArray(str)){
    arr.push(str);
    return arr;
  } else {
    arr = str;
    return arr;
  }
};

var payloadDescriptor = function(charset, to, subject, message, sender) {
  to = arrayMaker(to);
  charset = charset || 'utf-8';
  this.Destination = {ToAddresses: to};
  this.Message =
  {
    Body    : {Html: {Data: message, Charset: charset}},
    Subject : {Data: "[TWYST]: "+subject, Charset: charset}
  };

  this.Source = sender;

  return this;
};
module.exports = payloadDescriptor;
