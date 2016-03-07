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

// var params = {
//   Destination: { /* required */
//     BccAddresses: [
//       'STRING_VALUE',
//       /* more items */
//     ],
//     CcAddresses: [
//       'STRING_VALUE',
//       /* more items */
//     ],
//     ToAddresses: [
//       'STRING_VALUE',
//       /* more items */
//     ]
//   },
//   Message: { /* required */
//     Body: { /* required */
//       Html: {
//         Data: 'STRING_VALUE', /* required */
//         Charset: 'STRING_VALUE'
//       },
//       Text: {
//         Data: 'STRING_VALUE', /* required */
//         Charset: 'STRING_VALUE'
//       }
//     },
//     Subject: { /* required */
//       Data: 'STRING_VALUE', /* required */
//       Charset: 'STRING_VALUE'
//     }
//   },
//   Source: 'STRING_VALUE', /* required */
//   ReplyToAddresses: [
//     'STRING_VALUE',
//     /* more items */
//   ],
//   ReturnPath: 'STRING_VALUE',
//   ReturnPathArn: 'STRING_VALUE',
//   SourceArn: 'STRING_VALUE'
// };
