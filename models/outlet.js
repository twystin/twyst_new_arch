'use strict';
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OutletSchema = new Schema({
  name: {type: String},
  is_a: {type: String},
  publicUrl: {type: String},
  shortUrl: {type: String},
  brand: {type: String},
  created_at: {type: Date, default: Date.now},
  modified_at: {type: Date, default: Date.now},
  location: {
      coords: {
          longitude: { type: Number },
          latitude: { type: Number }
      },
      address: {type: String, default: '', unique: true, trim: true},
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
  },
  links: {
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
  attributes: {
      home_delivery: {type: Boolean},
      dine_in: {type: Boolean},
      veg: {type: Boolean},
      alcohol: {type: Boolean},
      outdoor: {type: Boolean},
      foodcourt: {type: Boolean},
      smoking: {type: Boolean},
      chain: {type: Boolean},
      air_conditioning: {type: String, enum: ["Available", "Not Available", "Partial"]},
      parking: {type: String, enum: ["Available", "Not Available", "Valet"]},
      reservation: {type: String, enum: ["Recommended", "Not Required"]},
      wifi: {type: String, enum: ["Not Available", "Free", "Paid"]},
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
  rules: [
    {
      status: {type: String},
      program: {type: String},
      tier: {type: String},
      event_clause: {type: String}, //or, and
      events: [
        {
          event_type: {type: String},
          criteria: {
            condition: {type: String}, // <, ==, > etc.
            value: {type: String}
          }
        }
      ],
      reward: {
        title: {type: String},
        terms: {type: String},
        detail: {type: String},
        expiry: {type: String},
        reward_meta: {} // the structured rewards
      },
      message: {
        sms: {type: String},
        email: {type: String},
        push: {type: String}
      },
      points: {type: Number}
    }
  ],
  jobs: [
    {
      job_name: {type: String},
      job_parameters: {}, // depends on the job, leaving it open
      reward: {
        title: {type: String},
        terms: {type: String},
        detail: {type: String},
        expiry: {type: String},
        reward_meta: {} // the structured rewards
      }
    }
  ],
  menu: {
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
  },
  hours: {
      su: {
          closed: {type: Boolean, default: false},
          timings: [{
              open: {
                  hr: {type: Number},
                  min: {type: Number}
              },
              close: {
                  hr: {type: Number},
                  min: {type: Number}
              }
          }]
      },
      mo: {
          closed: {type: Boolean, default: false},
          timings: [{
              open: {
                  hr: {type: Number},
                  min: {type: Number}
              },
              close: {
                  hr: {type: Number},
                  min: {type: Number}
              }
          }]
      },
      tu: {
          closed: {type: Boolean, default: false},
          timings: [{
              open: {
                  hr: {type: Number},
                  min: {type: Number}
              },
              close: {
                  hr: {type: Number},
                  min: {type: Number}
              }
          }]
      },
      we: {
          closed: {type: Boolean, default: false},
          timings: [{
              open: {
                  hr: {type: Number},
                  min: {type: Number}
              },
              close: {
                  hr: {type: Number},
                  min: {type: Number}
              }
          }]
      },
      th: {
          closed: {type: Boolean, default: false},
          timings: [{
              open: {
                  hr: {type: Number},
                  min: {type: Number}
              },
              close: {
                  hr: {type: Number},
                  min: {type: Number}
              }
          }]
      },
      fr: {
          closed: {type: Boolean, default: false},
          timings: [{
              open: {
                  hr: {type: Number},
                  min: {type: Number}
              },
              close: {
                  hr: {type: Number},
                  min: {type: Number}
              }
          }]
      },
      sa: {
          closed: {type: Boolean, default: false},
          timings: [{
              open: {
                  hr: {type: Number},
                  min: {type: Number}
              },
              close: {
                  hr: {type: Number},
                  min: {type: Number}
              }
          }]
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
  }
});

module.exports = mongoose.model('Outlet', OutletSchema);
