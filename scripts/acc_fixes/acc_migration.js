var db = db.getSiblingDB('retwyst_dummy');
var cursor = db.accounts.find({role: 3});
var retwyst = db.getSiblingDB('retwyst');
while(cursor.hasNext()) {
  a = cursor.next();
  acc = retwyst.accounts.find({'username': a.username});
  if(!acc) {
  	printjson('inserted');
  	retwyst.accounts.insert(a);	
  }
  
}
