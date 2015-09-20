
var retwyst = db.getSiblingDB('retwyst');
var cursor = retwyst.outlets.find();
while(cursor.hasNext()) {
  c = cursor.next();
  printjson(c)
  if(c.offers) {
  	for (var i = 0; i < c.offers.length; i++) {
    retwyst.outlets.update(
      {_id: c.outlets[i]},
      {$set: {'offers.offer_group': new ObjectId()}}
    );
  }	
  }
  
}

