
var retwyst = db.getSiblingDB('retwyst');
var cursor = retwyst.users.find({role: 3});
while(cursor.hasNext()) {
  c = cursor.next();
  printjson(c.outlets)
  printjson(c.is_paying)
  if(c.outlets && c.outlets.length) {
  	for (var i = 0; i < c.outlets.length; i++) {
      retwyst.outlets.update(
        {_id: c.outlets[i]},
        {$set: {'is_paying': c.is_paying}}
      );
    }	
  }
  
}

