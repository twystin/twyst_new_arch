var twyst = db.getSiblingDB('twyst');
var retwyst = db.getSiblingDB('retwyst');
var qrs = twyst.qrs.find();
while(qrs.hasNext()) {
    qr = qrs.next();
    retwyst.qrs.insert(qr);
}
