var basicCSV = require("basic-csv");
basicCSV.readCSV("./offers.csv",  {
    dropHeader: true
}, function (error, rows) {
    var i = 0;

    for (i =0; i < rows.length; i++) {
        console.log(
            "db.outlets.update({_id: ObjectId('" + rows[i][7] + "')}," +
            "{$push: {offers: {" +
            "_id: new ObjectId()," +
            "offer_status: 'active'," +
            "offer_type: '" + deal_type(rows[i][0]) + "'," +
            "offer_group: 'test_offer'," +
            "actions: { reward: {" +
            "_id: new ObjectId()," +
            "expiry: new Date('" + get_date(rows[i][16]) + "')," +
            "reward_hours:null," +
            "reward_meta: { reward_type:'" + rows[i][8] + "'}," +
            "header:'" + rows[i][9] + "'," +
            "line1:'" + rows[i][10] + "'," +
            "line2:'" + rows[i][11] + "'" +
                "}}}}});"
        );
    }
});

function deal_type(i) {
    return i;
}

function get_date(i) {
    if (i == null) {
        return null;
    } else {
        return i;
    }
}