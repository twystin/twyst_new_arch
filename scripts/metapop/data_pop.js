var db = db.getSiblingDB('retwyst');
// First update
db.outlets.update({'_id': ObjectId('540ea3d32f61834b5170eb10')},{$unset:{"offers":""}});
db.outlets.update(
    {'_id': ObjectId('540ea3d32f61834b5170eb10')},
    {
        $set: {
            'basics.featured': true
        },
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'checkin',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('8/31/2015'),
                        reward_hours: {
                            sunday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            monday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            tuesday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            wednesday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            thursday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            friday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            saturday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            }
                        },
                        applicability: null,
                        valid_days: null,
                        reward_meta: {
                            reward_type: 'flatoff'
                        },
                        header: 'Rs. 200 off',
                        line1: 'on a min spend of Rs. 800',
                        line2: 'weekdays only'
                    }
                },
                rule: {
                    event_type: 'checkin',
                    event_count: 2,
                    event_match: 'every'
                }
            }
        }
    }
);
// Second update
db.outlets.update({'_id': ObjectId('530ef84902bc583c21000004')},{$unset:{"offers":""}});
db.outlets.update(
    {'_id': ObjectId('530ef84902bc583c21000004')},
    {
        $set: {
            'basics.featured': true
        },
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'offer',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('9/30/2015'),
                        reward_hours: {
                            sunday: {
                                closed: true,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            monday: {
                                closed: false,
                                timings: [
                                    {
                                        open: {
                                            hr: 11,
                                            min: 30
                                        },
                                        close: {
                                            hr: 15,
                                            min: 00
                                        }
                                    },
                                    {
                                        open: {
                                            hr: 18,
                                            min: 00
                                        },
                                        close: {
                                            hr: 22,
                                            min: 00
                                        }
                                    }]
                            },
                            tuesday: {
                                closed: true,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            wednesday: {
                                closed: false,
                                timings: [
                                    {
                                        open: {
                                            hr: 11,
                                            min: 30
                                        },
                                        close: {
                                            hr: 15,
                                            min: 00
                                        }
                                    },
                                    {
                                        open: {
                                            hr: 18,
                                            min: 00
                                        },
                                        close: {
                                            hr: 22,
                                            min: 00
                                        }
                                    }]
                            },
                            thursday: {
                                closed: false,
                                timings: [
                                    {
                                        open: {
                                            hr: 11,
                                            min: 30
                                        },
                                        close: {
                                            hr: 15,
                                            min: 00
                                        }
                                    },
                                    {
                                        open: {
                                            hr: 18,
                                            min: 00
                                        },
                                        close: {
                                            hr: 22,
                                            min: 00
                                        }
                                    }]
                            },
                            friday: {
                                closed: false,
                                timings: [
                                    {
                                        open: {
                                            hr: 11,
                                            min: 30
                                        },
                                        close: {
                                            hr: 15,
                                            min: 00
                                        }
                                    },
                                    {
                                        open: {
                                            hr: 18,
                                            min: 00
                                        },
                                        close: {
                                            hr: 22,
                                            min: 00
                                        }
                                    }]
                            },
                            saturday: {
                                closed: true,
                                timings: [{
                                    open: {
                                        hr: 20,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            }
                        },
                        applicability: null,
                        reward_meta: {
                            reward_type: 'unlimited'
                        },
                        header: 'unlimited',
                        line1: 'thali (veg/non-veg)',
                        line2: 'at Rs 299 (v)/Rs 399 (nv)'
                    }
                }
            }
        }
    }
);

// Third update
db.outlets.update({'_id': ObjectId('540f29192f61834b5170ec5e')},{$unset:{"offers":""}});
db.outlets.update(
    {'_id': ObjectId('540f29192f61834b5170ec5e')},
    {
        $set: {
            'basics.featured': true
        },
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'offer',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('9/22/2015'),
                        reward_hours: {
                            sunday: {
                                closed: true,
                                timings: []
                            },
                            monday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 18,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            tuesday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 18,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            wednesday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 18,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            thursday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 18,
                                        min: 00
                                    },
                                    close: {
                                        hr: 22,
                                        min: 00
                                    }
                                }]
                            },
                            friday: {
                                closed: true,
                                timings: []
                            },
                            saturday: {
                                closed: true,
                                timings: []
                            }
                        },
                        applicability: null,
                        reward_meta: {
                            reward_type: 'happyhours'
                        },
                        header: '2 hours',
                        line1: 'extra happy hours',
                        line2: 'on all domestic liquor and starters'
                    }
                }
            }
        }
    }
);

// Fourth update
db.outlets.update({'_id': ObjectId('531435a01c33946a3d000090')},{$unset:{"offers":""}});
db.outlets.update(
    {'_id': ObjectId('531435a01c33946a3d000090')},
    {
        $set: {
            'basics.featured': true
        },
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'offer',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('8/31/2015'),
                        reward_hours: {
                            sunday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 12,
                                        min: 00
                                    },
                                    close: {
                                        hr: 15,
                                        min: 00
                                    }
                                }]
                            },
                            monday: {
                                closed: true,
                                timings: []
                            },
                            tuesday: {
                                closed: true,
                                timings: []
                            },
                            wednesday: {
                                closed: true,
                                timings: []
                            },
                            thursday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 12,
                                        min: 00
                                    },
                                    close: {
                                        hr: 15,
                                        min: 00
                                    }
                                }]
                            },
                            friday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 12,
                                        min: 00
                                    },
                                    close: {
                                        hr: 15,
                                        min: 00
                                    }
                                }]
                            },
                            saturday: {
                                closed: false,
                                timings: [{
                                    open: {
                                        hr: 12,
                                        min: 00
                                    },
                                    close: {
                                        hr: 15,
                                        min: 00
                                    }
                                }]
                            }
                        },
                        applicability: null,
                        reward_meta: {
                            reward_type: 'reducedprice'
                        },
                        header: 'only Rs 399 for',
                        line1: '3 course lunch',
                        line2: 'worth Rs 699'
                    }
                }
            }
        }
    }
);

// Fifth update
db.outlets.update({'_id': ObjectId('53d74fd8cb91a8f8497a660b')},{$unset:{"offers":""}});
db.outlets.update(
    {'_id': ObjectId('53d74fd8cb91a8f8497a660b')},
    {
        $set: {
            'basics.featured': true
        },
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'offer',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('8/10/2015'),
                        reward_hours: null,
                        applicability: null,
                        valid_days: null,
                        reward_meta: {
                            reward_type: 'buffet'
                        },
                        header: 'buffet',
                        line1: 'members\' dinner',
                        line2: 'at Rs 1599++'
                    }
                }
            }
        }
    }
);


// Sixth update
db.outlets.update(
    {'_id': ObjectId('540ea3d32f61834b5170eb10')},
    {
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'deal',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('9/10/2015'),
                        reward_hours: null,
                        applicability: null,
                        valid_days: null,
                        reward_meta: {
                            reward_type: 'combo'
                        },
                        header: '1 burger + 2 soft drinks',
                        line1: 'for Rs 209 only',
                        line2: null
                    }
                },
                rule: {
                    event_type: 'checkin',
                    event_count: 2,
                    event_match: 'every'
                }
            }
        }
    }
);
// Seventh update
db.outlets.update(
    {'_id': ObjectId('530ef84902bc583c21000004')},
    {
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'deal',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('9/18/2015'),
                        reward_hours: null,
                        applicability: null,
                        valid_days: null,
                        reward_meta: {
                            reward_type: 'unlimited'
                        },
                        header: 'unlimited',
                        line1: 'kebabs & 1 free drink',
                        line2: 'at Rs 445++'
                    }
                }
            }
        }
    }
);

// Eighth update
db.outlets.update(
    {'_id': ObjectId('540f29192f61834b5170ec5e')},
    {
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'deal',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('9/30/2015'),
                        reward_hours: null,
                        applicability: null,
                        valid_days: null,
                        reward_meta: {
                            reward_type: 'happyhours'
                        },
                        header: 'happy hours',
                        line1: 'get 1+1',
                        line2: 'on all domestic beer & imfl'
                    }
                }
            }
        }
    }
);

// Ninth update
db.outlets.update(
    {'_id': ObjectId('531435a01c33946a3d000090')},
    {
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'deal',
                offer_group: 'test_offer',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('9/1/2015'),
                        reward_hours: null,
                        applicability: null,
                        valid_days: null,
                        reward_meta: {
                            reward_type: 'buffet'
                        },
                        header: 'buffet',
                        line1: 'weekend lunches',
                        line2: 'at Rs 749++ per head'
                    }
                }
            }
        }
    }
);

// Tenth update
db.outlets.update(
    {'_id': ObjectId('53d74fd8cb91a8f8497a660b')},
    {
        $push: {
            offers: {
                _id: new ObjectId(),
                offer_status: 'active',
                offer_type: 'deal',
                offer_group: 'test_offer',
                offer_source: 'citibank',
                actions: {
                    reward: {
                        _id: new ObjectId(),
                        expiry: new Date('12/31/2015'),
                        reward_hours: null,
                        applicability: null,
                        valid_days: null,
                        reward_meta: {
                            reward_type: 'discount',
                        },
                        header: '15% off',
                        line1: 'on your bill',
                        line2: 'at Rs 1599++',
                    }
                }
            }
        }
    }
);

// User update = 1st
db.users.update(
    {_id: ObjectId("53158fabe1aba1724c00005b")},
    {
        $push: {
            coupons: {
                _id: new ObjectId(),
                code: 'TEST12',
                outlets: ObjectId('540ea3d32f61834b5170eb10'),
                header: '1+1',
                line1: 'on all classic pizzas',
                line2: '(chicken/veg only)',
                expiry: new Date('7/15/2015'),
                reward_meta: {
                    reward_type: 'buyonegetone'
                },
                status: 'active',
                issued: '6/23/15'
            },
        }
    }
);

// User update = 2nd
db.users.update(
    {_id: ObjectId("53158fabe1aba1724c00005b")},
    {
        $push: {
            coupons: {
                _id: new ObjectId(),
                code: 'TEST34',
                outlets: ObjectId('530ef84902bc583c21000004'),
                header: '2 hours',
                line1: 'extra happy hours',
                line2: 'on all weekdays',
                expiry: new Date('7/20/2015'),
                reward_meta: {
                    reward_type: 'happyhours'
                },
                status: 'active',
                issued: '6/23/15'
            },
        }
    }
);

db.users.update(
    {_id: ObjectId("53158fabe1aba1724c00005b")},
    {
        $push: {
            coupons: {
                _id: new ObjectId(),
                code: 'TEST12',
                outlets: ObjectId('540ea3d32f61834b5170eb10'),
                header: '1+1',
                line1: 'on all classic pizzas',
                line2: '(chicken/veg only)',
                expiry: new Date('7/15/2015'),
                reward_meta: {
                    reward_type: 'buyonegetone'
                },
                status: 'active',
                issued: '6/23/15'
            },
        }
    }
);

db.users.update(
    {_id: ObjectId("53158fabe1aba1724c00005b")},
    {
        $push: {
            coupons: {
                _id: new ObjectId(),
                code: 'TEST12',
                outlets: ObjectId('540ea3d32f61834b5170eb10'),
                header: '1+1',
                line1: 'on all classic pizzas',
                line2: '(chicken/veg only)',
                expiry: new Date('7/15/2015'),
                reward_meta: {
                    reward_type: 'buyonegetone'
                },
                status: 'active',
                issued: new Date('6/23/15')
            },
        }
    }
);

db.users.update(
    {_id: ObjectId("53158fabe1aba1724c00005b")},
    {
        $push: {
            coupons: {
                _id: new ObjectId(),
                code: 'TEST12',
                outlets: ObjectId('540ea3d32f61834b5170eb10'),
                header: '1+1',
                line1: 'on all classic pizzas',
                line2: '(chicken/veg only)',
                expiry: new Date('7/15/2015'),
                reward_meta: {
                    reward_type: 'buyonegetone'
                },
                status: 'active',
                issued: new Date('6/23/15')
            }
        }
    }
);
