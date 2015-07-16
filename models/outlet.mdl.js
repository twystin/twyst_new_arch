'use strict';
/*jslint node: true */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    hours = require("./partials/hours.mdl");

var OutletSchema = new Schema({
    basics : {
        name: {type: String, trim: true, required: true},
        slug: {type: String, trim: true, required: true, index: true},
        main_type: {type: String, trim: true, required: true, enum:['fnb','spa','retail','other'], default:"other"},
        is_a: {type: String, enum: ['desserts', 'restaurant','biryani','chinese','continental','north_indian','fast_food','burgers','pizza','wraps','pub','beer','bakery','cake','cafe','bistro','takeaway','other']},
        icon: {type: String, enum: ['desserts', 'restaurant','biryani','chinese','continental','north_indian','fast_food','burgers','pizza','wraps','pub','beer','bakery','cake','cafe','bistro','takeaway','other']},
        created_at : {type: Date, default: Date.now},
        modified_at: {type: Date, default: Date.now},
        featured: Boolean
    },
    contact: {
        location: {
            coords: {
                longitude: { type: Number },
                latitude: { type: Number }
            },
            address: {type: String, default: '', trim: true},
            map_url: {type: String, default: '', trim: true},
            landmarks: [{type: String, default: '', trim: true}],
            locality_1: [{type: String, default: '', trim: true}],
            locality_2: [{type: String, default: '', trim: true}],
            city : {type: String, default: '', trim: true},
            pin : {type: String, default: '', trim: true}
        },
        phones: {
            mobile: [{num: {type:String, default: '', trim: true}}],
            reg_mobile: [{num: {type:String, default: '', trim: true}}],
            landline: {type:String, default: '', trim: true},
            type: {type: String, enum: ['landline', 'mobile', 'other']},
            number: {type: String, default: '', trim: true}
        },
        emails: {
            person: {type: String, default: '', trim: true},
            email: {type: String, default: '', trim: true},
            type: {type: String, enum: ['personal', 'work']}
        }
    },
    links: {
        public_url: [{type: String}],
        short_url: [{type: String}],
        website_url: {type: String, default: ''},
        facebook_url: {type: String, default: ''},
        twitter_url: {type: String, default: ''},
        youtube_url: {type: String, default: ''},
        zomato_url: {type: String, default: ''},
        foodpanda_url: {type: String, default: ''},
        other_urls: [{
            link_name: {type: String, default: ''},
            link_url: {type: String, default: ''}
        }]
    },
    business_hours: hours.hours,
    attributes: {
        delivery: {
          delivery_area: String,
          delivery_estimated_time: String,
          delivery_timings: hours.hours,
          delivery_conditions: String
        },
        home_delivery: {type: Boolean},
        dine_in: {type: Boolean},
        veg: {type: Boolean},
        alcohol: {type: Boolean},
        outdoor: {type: Boolean},
        foodcourt: {type: Boolean},
        smoking: {type: Boolean},
        chain: {type: Boolean},
        air_conditioning: {type: String, enum: ["available", "not_available", "partial", "unknown"]},
        parking: {type: String, enum: ["available", "not_available", "valet", "unknown"]},
        reservation: {type: String, enum: ["suggested", "not_required", "unknown"]},
        wifi: {type: String, enum: ["not_available", "free", "paid", "unknown"]},
        cost_for_two: {
            min: Number,
            max: Number
        },
        timings: {type: String, default: '', trim: true},
        cuisines: [String],
        payment_options: [{type: String, enum: ['cash', 'visa', 'master', 'amex', 'sodexho']}],
        tags: [{type: String, default: '', trim: true}]
    },
    photos: {
        logo: {type: String, trim: ''},
        logo_gray: {type: String, trim: ''},
        background: {type: String, trim: ''},
        others:[{
            title: {type: String, default: '', trim: ''},
            image: {
                _th: {type: String, default: '', trim: ''},
                _sm: {type: String, default: '', trim: ''},
                _md: {type: String, default: '', trim: ''},
                _lg: {type: String, default: '', trim: ''}
            },
            approved: {type: Boolean, default: false}
        }]
    },
    outlet_meta: {
        status: {type: String, enum: ['active', 'archived', 'draft'], default: 'draft'},
        links: [{type: Schema.ObjectId, ref: 'Outlet'}],
        featured: {type: Boolean, default: false}
    },
    twyst_meta: {
        rating: {
            count: {type: Number},
            value: {type: Number, min: 0, max: 5}
        },
        reviews: [
            {
                review: {type: String, default: ''}
            }
        ],
        recommend_list: [{type: Schema.ObjectId, ref: 'Outlet'}]
    },
    sms_off: {
        value: {type: Boolean},
        time: {
            start: {type: Number, default: 23},
            end: {type: Number, default: 9}
        }
    },
    analytics: {
      event_analytics: [{
          event_name: {type: String},
          event_count: {type: Number}
      }],
      coupon_analytics: {
        coupons_generated: {type: Number},
        coupons_redeemed: {type: Number},
        coupons_active: {type: Number},
        coupons_expired: {type: Number}
      }
    },
    offers: [{
      offer_status: {type: String}, // active
      offer_type: {type: String}, // job,
      offer_group: {type: String}, // to model the program
      offer_start_date: {type: Date},
      offer_end_date: {type: Date},
      offer_lapse_date: {type: Date},
      offer_likes: [{type: Schema.ObjectId, ref:'User'}],
      offer_source: {type: String},
      rule: {
        event_type: String,
        event_count: Number,
        event_match: String,
        friendly_text: String,
        event_params: {}
      },
      actions: {
        reward: {
          title: {type: String},
          terms: {type: String},
          detail: {type: String},
          expiry: {type: String},
          reward_meta: {}, // the structured rewards
          reward_hours: hours.hours,
          applicability: {},
          valid_days: {type: Number},
          // New fields
          header: {type: String},
          line1: {type: String},
          line2: {type: String}
        },
        message: {
          sms: {type: String},
          email: {type: String},
          push: {type: String}
        },
        points: {type: Number}
      }
    }],
    menu: [{
        status: {type: String},
        name: {type: String},
        last_updated: {type: Date},
        menu_description: {type: String},
        sections: [{
          section_name: {type: String},
          section_description: {type: String},
          items: [
            {
              item_name: {type: String},
              item_description: {type: String},
              item_photo: {type: String},
              item_tags: [{type: String}],
              item_cost: {type: String}
            }
          ]
        }]
    }]
});

OutletSchema.pre('validate', function (next) {
    if (!this.basics.name) next();
    this.basics.slug = slugify(this.basics.name);
    next();
});

function slugify(created_outlet) {
    return created_outlet.toLowerCase().replace(/\s+/g, '').replace(/\W/g, '');
}

module.exports = mongoose.model('Outlet', OutletSchema);
