'use strict';
/*jslint node: true */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types,ObjectId,
  hours = require("./partials/hours.mdl")
    , textSearch = require('mongoose-search-plugin');

var OutletSchema = new Schema({

  basics: {
    name: {
      type: String,
      trim: true,
      required: true
    },
    slug: {
      type: String,
      trim: true,
      required: true,
      index: true
    },
    main_type: {
      type: String,
      trim: true,
      required: true,
      //enum: ['fnb', 'spa', 'retail', 'other'],
      default: "other"
    },
    is_a: {
      type: String,
      //enum: ['desserts', 'restaurant', 'biryani', 'chinese', 'continental', 'north_indian', 'fast_food', 'burgers', 'pizza', 'wraps', 'pub', 'beer', 'bakery', 'cake', 'cafe', 'bistro', 'takeaway', 'other']
    },
    icon: {
      type: String,
      //enum: ['desserts', 'restaurant', 'biryani', 'chinese', 'continental', 'north_indian', 'fast_food', 'burgers', 'pizza', 'wraps', 'pub', 'beer', 'bakery', 'cake', 'cafe', 'bistro', 'takeaway', 'other']
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    modified_at: {
      type: Date,
      default: Date.now
    },
    modified_by: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    live_at: {
      type: Date,
      default: Date.now
    },
    archived_at: {
      type: Date,
      default: Date.now
    },

    featured: Boolean,
    is_paying: {type: Boolean, required: true, default: false },
    account_mgr_email: {type: String},
    account_mgr_phone: {type: Number},
    cod: {type: Boolean, default: false}
  },
  contact: {
    location: {
      coords: {
        longitude: {
          type: Number
        },
        latitude: {
          type: Number
        }
      },
      address: {
        type: String,
        default: '',
        trim: true
      },
      map_url: {
        type: String,
        default: '',
        trim: true
      },
      landmarks: [{
        type: String,
        default: '',
        trim: true
      }],
      locality_1: [{
        type: String,
        default: '',
        trim: true
      }],
      locality_2: [{
        type: String,
        default: '',
        trim: true
      }],
      city: {
        type: String,
        default: '',
        trim: true
      },
      pin: {
        type: String,
        default: '',
        trim: true
      }
    },
    phones: {
      mobile: [{
        num_type: {
          type: String,
          default: ''
        },
        num: {
          type: String,
          default: '',
          trim: true
        }
      }],
      reg_mobile: [{
        num: {
          type: String,
          default: '',
          trim: true
        }
      }],
      landline: {
        type: String,
        default: '',
        trim: true
      },
      type: {
        type: String,
        //enum: ['landline', 'mobile', 'other']
      },
      number: {
        type: String,
        default: '',
        trim: true
      }
    },
    emails: {
      person: {
        type: String,
        default: '',
        trim: true
      },
      email: {
        type: String,
        default: '',
        trim: true
      },
      type: {
        type: String,
        //enum: ['personal', 'work']
      }
    }
  },
  links: {
    public_url: [{
      type: String
    }],
    short_url: [{
      type: String
    }],
    website_url: {
      type: String,
      default: ''
    },
    facebook_url: {
      type: String,
      default: ''
    },
    twitter_url: {
      type: String,
      default: ''
    },
    youtube_url: {
      type: String,
      default: ''
    },
    zomato_url: {
      type: String,
      default: ''
    },
    foodpanda_url: {
      type: String,
      default: ''
    },
    other_urls: [{
      link_name: {
        type: String,
        default: ''
      },
      link_url: {
        type: String,
        default: ''
      }
    }]
  },
  business_hours: hours.hours,
  attributes: {
    delivery: {
      delivery_zone: [{
        zone_name: String,
        zone_type: Number,
        coord: [],
        delivery_estimated_time: Number,  
        delivery_timings: hours.hours,
        delivery_conditions: String,  
        min_amt_for_delivery: Number,
        free_delivery_amt: Number,
        delivery_charge: Number,
        has_packaging_charge: {
          type: Boolean,
          default: false,
          required: true
        },
        packaging_charge: {
          is_fixed: Boolean,
          value: Number,
          charges: [{
            start: Number,
            end: Number,
            value: Number
          }]
        },
        order_accepts_till: {
          hr: {type: Number},
          min: {type: Number}
        },
        payment_options: [{
          type: String,
          enum: ['cod', 'inapp']
        }],
      }],  
    },
    home_delivery: {
      type: Boolean
    },
    dine_in: {
      type: Boolean
    },
    veg: {
      type: Boolean
    },
    alcohol: {
      type: Boolean
    },
    outdoor: {
      type: Boolean
    },
    foodcourt: {
      type: Boolean
    },
    smoking: {
      type: Boolean
    },
    chain: {
      type: Boolean
    },
    air_conditioning: {
      type: String,
      //enum: ["available", "not_available", "partial", "unknown"]
    },
    parking: {
      type: String,
      //enum: ["available", "not_available", "valet", "unknown"]
    },
    reservation: {
      type: String,
      //enum: ["suggested", "not_required", "unknown"]
    },
    wifi: {
      type: String,
      //enum: ["not_available", "free", "paid", "unknown"]
    },
    cost_for_two: {
      min: Number,
      max: Number
    },
    cuisines: [String],
    payment_options: [{
      type: String,
      //enum: ['cash', 'visa', 'master', 'amex', 'sodexho']
    }],
    tags: [{
      type: String,
      default: '',
      trim: true
    }]
  },
  photos: {
    logo: {
      type: String,
      trim: ''
    },
    logo_gray: {
      type: String,
      trim: ''
    },
    background: {
      type: String,
      trim: ''
    },
    others: [{
      title: {
        type: String,
        default: '',
        trim: ''
      },
      image: {
        _th: {
          type: String,
          default: '',
          trim: ''
        },
        _sm: {
          type: String,
          default: '',
          trim: ''
        },
        _md: {
          type: String,
          default: '',
          trim: ''
        },
        _lg: {
          type: String,
          default: '',
          trim: ''
        }
      },
      approved: {
        type: Boolean,
        default: false
      }
    }]
  },
  outlet_meta: {
    status: {
      type: String,
      //enum: ['active', 'archived', 'draft'],
      default: 'draft'
    },
    links: [{
      type: Schema.ObjectId,
      ref: 'Outlet'
    }],
    featured: {
      type: Boolean,
      default: false
    }
  },
  twyst_meta: {
    twyst_commission: {
      is_fixed: {
        type: Boolean,
        default: true
      },
      value: {
        type: Number
      },
      commission_slab: [{
        start: {type: Number},
        end: {type: Number},
        value: {type: Number}
      }]
    },
    cashback_info: {
      base_cashback: {
        type: Number
      },
      in_app_ratio: {
        type: Number,
        default: 1
      },
      cod_ratio: {
        type: Number,
        default: 1
      },
      order_amount_slab: [{
        start: {type: Number},
        end: {type: Number},
        ratio: {type: Number}
      }],
      max_cashback: {
        type: Number
      }
    },
    rating: {
      count: {
        type: Number
      },
      value: {
        type: Number,
        min: 0,
        max: 5
      }
    },
    reviews: [{
      review: {
        type: String,
        default: ''
      }
    }],
    recommend_list: [{
      type: Schema.ObjectId,
      ref: 'Outlet'
    }],
  },
  sms_off: {
    value: {
      type: Boolean
    },
    time: {
      start: {
        hr: {
          type: Number,
          default: 23
        },
        min: {
          type: Number,
          default: 0
        }
      },
      end: {
        hr: {
          type: Number,
          default: 9
        },
        min: {
          type: Number,
          default: 0
        }
      }
    }
  },
  analytics: {
    event_analytics: {},
    coupon_analytics: {
      coupons_generated: {
        type: Number
      },
      coupons_redeemed: {
        type: Number
      },
      coupons_active: {
        type: Number
      },
      coupons_expired: {
        type: Number
      }
    }
  },
  offers: [{
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      default: new mongoose.Types.ObjectId()
    },
    offer_status: {
      type: String
    }, // active
    offer_type: {
      type: String
    }, // job,
    
    offer_start_date: {
      type: Date
    },
    offer_end_date: {
      type: Date
    },
    offer_lapse_days: {
      type: Number
    },
    offer_valid_days: {
      type: Number
    },
    offer_likes: [{
      type: Schema.ObjectId,
      ref: 'User'
    }],
    offer_source: {
      type: String
    },
    user_sourced: {
      type: Boolean
    },
    offer_user_source: {
      type: ObjectId
    },
    offer_cost:{
      type: Number
    },
    minimum_bill_value: {
      type: Number
    },
    rule: {
      _id: {
        type: Schema.Types.ObjectId
      },
      event_type: String,
      event_count: Number,
      event_start: Number,
      event_end: Number,
      event_match: String,
      friendly_text: String,
      event_params: {}
    },
    actions: {
      reward: {
        _id: {
          type: Schema.Types.ObjectId
        }, 
        reward_meta: {}, // the structured rewards
        reward_hours: hours.hours,
        applicability: {},
        valid_days: {
          type: Number
        },
        // New fields
        header: {
          type: String
        },
        line1: {
          type: String
        },
        line2: {
          type: String
        },
        description: {
          type: String
        },
        terms: {
          type: String
        }
      },
      message: {
        sms: {
          type: String
        },
        email: {
          type: String
        },
        push: {
          type: String
        }
      }
    },
    offer_outlets: [{
      type: Schema.Types.ObjectId,
      ref: 'Outlet'
    }],
    offer_items: {
      all: {type: Boolean},
      menus: [Schema.Types.ObjectId],
      categories: [Schema.Types.ObjectId],
      sub_categories: [Schema.Types.ObjectId],
      items: [Schema.Types.ObjectId],
      options: [Schema.Types.ObjectId],
      sub_options: [Schema.Types.ObjectId],
      addons: [Schema.Types.ObjectId]
    }
  }],
  orders: [{
    type: Schema.ObjectId,
    ref: 'Order'
  }],
  menus: [{
    status: {
      type: String
    },
    //name: {
      //type: String
    //},
    menu_item_type: {
      type: String,
      default: 'type_1',
      required: true,
      enum: ['type_1, type_2', 'type_3']
    },
    menu_type: {
      type: String// Dine-in / Takeaway / Delivery / Weekend / Dinner / All
    },
    last_updated: {
      type: Date
    },
    menu_categories: [{
      category_name: {
        type: String//Indian / Desserts / Cakes / Chinese / Soup
      },
      sub_categories: [{
        sub_category_name: { //veg starters/no veg starters /veg_main course /non veg main course
          type: String
        },
        sub_category_description: {
          type: String
        },
        items: [{
          item_name: {
            type: String
          },
          item_type: {
            type: String,
            enum: ['type_1', 'type_2', 'type_3']
          },
          item_description: {
            type: String
          },
          is_available: {
            type: Boolean,
            default: true
          },
          is_recommended: {
            type: Boolean,
            default: false,
            required: true
          },
          item_photo: {
            type: String
          },
          item_tags: [{
            type: String
          }],
          is_vegetarian: {
            type: Boolean,
            default: true
          },
          item_cost: {     //base price or lowest option price
            type: Number
          },
          item_availability: {
            regular_item: {
              type: Boolean,
              default: true
            },
            start_date: {
              type: Date
            },
            end_date: {
              type: Date
            },
            available_hours: hours.hours,
            days_of_the_week: [{
              type: String,
              enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            }]
          },          
          option_title: {
            type: String
          },
          option_price_is_additive: {
            type: Boolean,
            default: false,
          },
          
          option_is_addon: {
            type: Boolean,
            default: false,
          },
          options: [{
            is_available: {
              type: Boolean,
              default: true
            },
            is_vegetarian: {
              type: Boolean,
              default: true
            },
            option_value: {
              type: String
            },
            option_cost: {
              type: Number
            },
            sub_options: [{
              sub_option_title: {
                type: String,
              },
              sub_option_set: [{
                sub_option_value: {
                  type: String,
                },
                is_available: {
                  type: Boolean,
                  default: true
                },
                is_vegetarian: {
                  type: Boolean,
                  default: true
                },
                sub_option_cost: {
                  type: Number
                }
              }]
            }],
            addons: [{
              addon_title: {
                type: String,
              },
              addon_set: [{
                addon_value: {
                  type: String,
                },
                is_available: {
                  type: Boolean,
                  default: true
                },
                is_vegetarian: {
                  type: Boolean,
                  default: true
                },
                addon_cost: {
                  type: Number
                }
              }]
            }]
          }]
        }]
      }]  
    }]
  }]
});

OutletSchema.pre('validate', function(next) {
  if (!this.basics.name) next();
  this.basics.slug = slugify(this.basics.name);
  next();
});

OutletSchema.plugin(textSearch, {
    fields: ['basics.name', 'basics.slug', 'basics.main_type', 'basics.is_a', 
    'contact.location', 'contact.location.address', 'contact.location.landmarks',
    'contact.location.locality_1', 'contact.location.locality_2', 'offers']
});

function slugify(created_outlet) {
  return created_outlet.toLowerCase().replace(/\s+/g, '').replace(/\W/g, '');
}

module.exports = mongoose.model('Outlet', OutletSchema);