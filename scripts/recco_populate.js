var db = db.getSiblingDB('retwyst');
var accounts = db.accounts.find();
var outlets = db.outlets.find();
var outlet_array = [];

while(outlets.hasNext()) {
  outlet = outlets.next();
  outlet_array.push(outlet._id);
}

while(accounts.hasNext()) {
  account = accounts.next();
  db.reccos.insert({
    account_id: account._id,
    outlets: outlet_array
  });
}
