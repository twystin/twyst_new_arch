var basicCSV = require("basic-csv");
basicCSV.readCSV("./offers.csv",  {
    dropHeader: true
}, function (error, rows) {
    var i = 0;

    for (i =0; i < rows.length; i++) {
        if (rows[i][2] !== 'coupon' && rows[i][2] !== 'pool')
        console.log(
            "db.outlets.update({\n\t_id: ObjectId('" + rows[i][7] + "')\n}, {" + "\n\t" +
            "$push:{\n\t\toffers: {" + "\n\t\t\t" +
            "_id: new ObjectId()," + "\n\t\t\t" +
            "offer_status: 'active'," + "\n\t\t\t" +
            "offer_type: '" + deal_type(rows[i][2]) + "'," + "\n\t\t\t" +
            "offer_group: 'test_offer'," + "\n\t\t\t" +
            "actions: {\n\t\t\t\t reward: {" + "\n\t\t\t\t\t" +
            "_id: new ObjectId()," + "\n\t\t\t\t\t" +
            "expiry: new Date('" + get_date(rows[i][16]) + "')," + "\n\t\t\t\t\t" +
            "reward_hours:" + reward_hours() +  "\n\t\t\t\t\t" +
            "reward_meta: { reward_type:'" + rows[i][9] + "'}," + "\n\t\t\t\t\t" +
            "header:'" + fixup(rows[i][10]) + "'," + "\n\t\t\t\t\t" +
            "line1:'" + fixup(rows[i][11]) + "'," + "\n\t\t\t\t\t" +
            "line2:'" + fixup(rows[i][12]) + "'" + "\n\t\t\t\t" +
            "}\n\t\t\t}\n\t\t}\n\t}\n});\n"
        );
    }
});

function reward_hours() {
    return "    {sunday: {\
        closed: true,\
            timings: []\
    },\
    monday: {\
        closed: false,\
            timings: [{\
            open: {\
                hr: 18,\
                min: 00\
            },\
            close: {\
                hr: 22,\
                min: 00\
            }\
        }]\
    },\
    tuesday: {\
        closed: false,\
            timings: [{\
            open: {\
                hr: 18,\
                min: 00\
            },\
            close: {\
                hr: 22,\
                min: 00\
            }\
        }]\
    },\
    wednesday: {\
        closed: false,\
            timings: [{\
            open: {\
                hr: 18,\
                min: 00\
            },\
            close: {\
                hr: 22,\
                min: 00\
            }\
        }]\
    },\
    thursday: {\
        closed: false,\
            timings: [{\
            open: {\
                hr: 18,\
                min: 00\
            },\
            close: {\
                hr: 22,\
                min: 00\
            }\
        }]\
    },\
    friday: {\
        closed: true,\
            timings: []\
    },\
    saturday: {\
        closed: true,\
            timings: []\
    }\
},";
}



function fixup(str) {
    return str.replace(/'/g, '\\\'');

}

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