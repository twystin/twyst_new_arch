var db = db.getSiblingDB('twyst');
var cursor = db.outlets.find();
var retwyst = db.getSiblingDB('retwyst')
while(cursor.hasNext()) {
  o = cursor.next();
  printjson(o.outlet_meta.accounts);
  retwyst.merchants.update({_id:{$in:o.outlet_meta.accounts}},{
    $push: {
      outlets: o._id
    }
  }, {
    multi: true
  });
}
