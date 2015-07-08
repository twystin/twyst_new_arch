db.outlets.update({
    _id: ObjectId('53142d821c33946a3d000088')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'checkin',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'bogo'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on all classic pizzas'
                }
            }
        }
    }
});

db.outlets.update({
    _id: ObjectId('531ec1c05b2e10b974000006')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'checkin',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'happyhours'
                    },
                    header: 'happyhours',
                    line1: '2 hours',
                    line2: 'extra happy hours'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('534b82cb0a9281e4520001bf')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'socialpool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'bogo'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on main course dishes'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('540f29192f61834b5170ec5e')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'socialpool ',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/1/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'buy any 3 pizzas',
                    line2: 'get the 4th pizza free'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/20/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: 'pitcher of beer'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/25/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Discount'
                    },
                    header: 'discount',
                    line1: '15% off',
                    line2: 'on your bill'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/15/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'all day breakfast'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/10/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Reduced Price'
                    },
                    header: 'reducedprice',
                    line1: 'only Rs 599 for',
                    line2: 'lunch buffet (incl beer)'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5502780b5cfd36a03c11c989')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'thali (veg/non-veg)'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/22/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Extended happy hours'
                    },
                    header: 'happyhours',
                    line1: '2 hours',
                    line2: 'extra happy hours'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551023957ae0350f3fcde586')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Reduced Price'
                    },
                    header: 'reducedprice',
                    line1: 'only Rs 399 for',
                    line2: '3 course lunch'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551a8e7418b029f94a15d9af')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/10/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: 'members'
                    dinner '}}}}});
                    db.outlets.update({
                        _id: ObjectId('55228bc049698488313b3891')
                    }, {
                        $push: {
                            offers: {
                                _id: new ObjectId(),
                                offer_status: 'active',
                                offer_type: 'Walk-in Offer',
                                offer_group: 'test_offer',
                                actions: {
                                    reward: {
                                        _id: new ObjectId(),
                                        expiry: new Date('9/10/15'),
                                        reward_hours: null,
                                        reward_meta: {
                                            reward_type: 'Combo'
                                        },
                                        header: 'combo',
                                        line1: 'combo',
                                        line2: '1 burger + 2 soft drinks'
                                    }
                                }
                            }
                        }
                    });
db.outlets.update({
    _id: ObjectId('55320b21bf7795f9365cc01b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/18/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'kebabs & 1 free drink'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('555048cd13adc5643f1a09e3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Happy hours'
                    },
                    header: 'onlyhappyhours',
                    line1: 'happy hours',
                    line2: 'get 1+1'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5566c2773beb115426f04303')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/1/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: 'weekend lunch'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('552bba038b6abb7f0c9f46ae')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Bank / Credit Cards',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('12/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Discount'
                    },
                    header: 'discount',
                    line1: '15% off',
                    line2: 'on your bill'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('55324f36bf7795f9365cc725')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('11/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'croissant, preserve & coffee'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('530ef84902bc583c21000004')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'croissant, preserve & tea'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('53142d821c33946a3d000088')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/12/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'couples combo'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('531ec1c05b2e10b974000006')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Bank / Credit Cards',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('11/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Discount'
                    },
                    header: 'discount',
                    line1: '15% off',
                    line2: 'on your bill'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('534b82cb0a9281e4520001bf')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/22/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'click a selfie &',
                    line2: 'share to get 50% off'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('540f29192f61834b5170ec5e')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('11/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'free drinks for ladies'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'burst your belly'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'family combo'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: '5 shots Teacher'
                    s 50 '}}}}});
                        db.outlets.update({
                            _id: ObjectId('54e2d60d43b1aaf274a328c4')
                        }, {
                            $push: {
                                offers: {
                                    _id: new ObjectId(),
                                    offer_status: 'active',
                                    offer_type: 'Walk-in Offer',
                                    offer_group: 'test_offer',
                                    actions: {
                                        reward: {
                                            _id: new ObjectId(),
                                            expiry: new Date('7/31/15'),
                                            reward_hours: null,
                                            reward_meta: {
                                                reward_type: 'Combo'
                                            },
                                            header: 'combo',
                                            line1: 'combo',
                                            line2: '5 shots'
                                        }
                                    }
                                }
                            }
                        });
db.outlets.update({
    _id: ObjectId('5502780b5cfd36a03c11c989')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'veg starters, soup, main course'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('10/15/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: 'lunch'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551023957ae0350f3fcde586')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/25/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: '4-course lunch'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551a8e7418b029f94a15d9af')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/23/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'buy 1 chaap',
                    line2: 'and get 50% off on the 2nd chaap'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('55228bc049698488313b3891')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'add Rs 65 to your pizza/pasta',
                    line2: 'and upgrade to a meal combo'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('55320b21bf7795f9365cc01b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/10/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: 'chef'
                    s lunch '}}}}});
                        db.outlets.update({
                            _id: ObjectId('555048cd13adc5643f1a09e3')
                        }, {
                            $push: {
                                offers: {
                                    _id: new ObjectId(),
                                    offer_status: 'active',
                                    offer_type: 'Walk-in Offer',
                                    offer_group: 'test_offer',
                                    actions: {
                                        reward: {
                                            _id: new ObjectId(),
                                            expiry: new Date('10/5/15'),
                                            reward_hours: null,
                                            reward_meta: {
                                                reward_type: 'Happy hours'
                                            },
                                            header: 'onlyhappyhours',
                                            line1: 'happy hours',
                                            line2: 'get 1+1'
                                        }
                                    }
                                }
                            }
                        });
db.outlets.update({
    _id: ObjectId('5566c2773beb115426f04303')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/12/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Happy hours'
                    },
                    header: 'onlyhappyhours',
                    line1: 'happy hours',
                    line2: 'get 1+2'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('552bba038b6abb7f0c9f46ae')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('10/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Happy hours'
                    },
                    header: 'onlyhappyhours',
                    line1: 'happy hours',
                    line2: 'get 1+1'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('55324f36bf7795f9365cc725')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Happy hours'
                    },
                    header: 'onlyhappyhours',
                    line1: 'happy hours',
                    line2: 'get 1+1 on all drinks'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('530ef84902bc583c21000004')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('10/28/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'BOGO (1+1)'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on 12" pizzas'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('53142d821c33946a3d000088')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/6/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'BOGO (1+1)'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on 18" pizzas'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('531ec1c05b2e10b974000006')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: '1 piece chicken'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('534b82cb0a9281e4520001bf')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'BOGO (1+1)'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on medium &'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('540f29192f61834b5170ec5e')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('7/28/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: 'cheese garlic bread'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: '3 donuts'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('7/25/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: 'cookie'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('10/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: '1 classic cocktail'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'buy one large/medium pizza',
                    line2: 'get Rs 100 off on the 2nd pizza'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5502780b5cfd36a03c11c989')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Flat off'
                    },
                    header: 'flatoff',
                    line1: 'Rs 150 off',
                    line2: 'for Delhi Gourmet Club Members'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('7/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Flat off'
                    },
                    header: 'flatoff',
                    line1: 'Rs 100 off',
                    line2: 'on a min spend of Rs. 400'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551023957ae0350f3fcde586')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Bank / Credit Cards',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('11/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Discount'
                    },
                    header: 'discount',
                    line1: '20% off',
                    line2: 'on your bill'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Flat Off'
                    },
                    header: 'flatoff',
                    line1: 'Rs. 200 off',
                    line2: 'on a min spend of Rs. 800'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'BOGO (1+1)'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on all classic pizzas'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Extended happy hours'
                    },
                    header: 'happyhours',
                    line1: '2 hours',
                    line2: 'extra happy hours'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'BOGO (1+1)'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on main course dishes'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5502780b5cfd36a03c11c989')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/1/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'buy any 3 pizzas',
                    line2: 'get the 4th pizza free'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/20/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: 'pitcher of beer'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551023957ae0350f3fcde586')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/25/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Discount'
                    },
                    header: 'discount',
                    line1: '15% off',
                    line2: 'on your bill'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551a8e7418b029f94a15d9af')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/15/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'all day breakfast'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('55228bc049698488313b3891')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/10/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Reduced Price'
                    },
                    header: 'reducedprice',
                    line1: 'only Rs 599 for',
                    line2: 'lunch buffet (incl beer)'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('55320b21bf7795f9365cc01b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'thali (veg/non-veg)'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('555048cd13adc5643f1a09e3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/22/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Extended happy hours'
                    },
                    header: 'happyhours',
                    line1: '2 hours',
                    line2: 'extra happy hours'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5566c2773beb115426f04303')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Reduced Price'
                    },
                    header: 'reducedprice',
                    line1: 'only Rs 399 for',
                    line2: '3 course lunch'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('552bba038b6abb7f0c9f46ae')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/10/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: 'members'
                    dinner '}}}}});
                    db.outlets.update({
                        _id: ObjectId('55324f36bf7795f9365cc725')
                    }, {
                        $push: {
                            offers: {
                                _id: new ObjectId(),
                                offer_status: 'active',
                                offer_type: 'Walk-in Offer',
                                offer_group: 'test_offer',
                                actions: {
                                    reward: {
                                        _id: new ObjectId(),
                                        expiry: new Date('9/10/15'),
                                        reward_hours: null,
                                        reward_meta: {
                                            reward_type: 'Combo'
                                        },
                                        header: 'combo',
                                        line1: 'combo',
                                        line2: '1 burger + 2 soft drinks'
                                    }
                                }
                            }
                        }
                    });
db.outlets.update({
    _id: ObjectId('530ef84902bc583c21000004')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/18/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'kebabs & 1 free drink'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('53142d821c33946a3d000088')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Happy hours'
                    },
                    header: 'onlyhappyhours',
                    line1: 'happy hours',
                    line2: 'get 1+1'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('531ec1c05b2e10b974000006')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/1/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: 'weekend lunch'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('534b82cb0a9281e4520001bf')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Bank / Credit Cards',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('12/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Discount'
                    },
                    header: 'discount',
                    line1: '15% off',
                    line2: 'on your bill'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('540f29192f61834b5170ec5e')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('11/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'croissant, preserve & coffee'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'croissant, preserve & tea'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/12/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'couples combo'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Bank / Credit Cards',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('11/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Discount'
                    },
                    header: 'discount',
                    line1: '15% off',
                    line2: 'on your bill'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/22/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'click a selfie &',
                    line2: 'share to get 50% off'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5502780b5cfd36a03c11c989')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('11/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'free drinks for ladies'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'burst your belly'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551023957ae0350f3fcde586')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: 'family combo'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551a8e7418b029f94a15d9af')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Combo'
                    },
                    header: 'combo',
                    line1: 'combo',
                    line2: '5 shots Teacher'
                    s 50 '}}}}});
                        db.outlets.update({
                            _id: ObjectId('54ae3daa1e3fc78926eaeec3')
                        }, {
                            $push: {
                                offers: {
                                    _id: new ObjectId(),
                                    offer_status: 'active',
                                    offer_type: 'Walk-in Offer',
                                    offer_group: 'test_offer',
                                    actions: {
                                        reward: {
                                            _id: new ObjectId(),
                                            expiry: new Date('7/31/15'),
                                            reward_hours: null,
                                            reward_meta: {
                                                reward_type: 'Combo'
                                            },
                                            header: 'combo',
                                            line1: 'combo',
                                            line2: '5 shots'
                                        }
                                    }
                                }
                            }
                        });
db.outlets.update({
    _id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Unlimited'
                    },
                    header: 'unlimited',
                    line1: 'unlimited',
                    line2: 'veg starters, soup, main course'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('10/15/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: 'lunch'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/25/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: '4-course lunch'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5502780b5cfd36a03c11c989')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/23/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'buy 1 chaap',
                    line2: 'and get 50% off on the 2nd chaap'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'add Rs 65 to your pizza/pasta',
                    line2: 'and upgrade to a meal combo'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('551023957ae0350f3fcde586')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/10/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Buffet'
                    },
                    header: 'buffet',
                    line1: 'buffet',
                    line2: 'chef'
                    s lunch '}}}}});
                        db.outlets.update({
                            _id: ObjectId('551a8e7418b029f94a15d9af')
                        }, {
                            $push: {
                                offers: {
                                    _id: new ObjectId(),
                                    offer_status: 'active',
                                    offer_type: 'Walk-in Offer',
                                    offer_group: 'test_offer',
                                    actions: {
                                        reward: {
                                            _id: new ObjectId(),
                                            expiry: new Date('10/5/15'),
                                            reward_hours: null,
                                            reward_meta: {
                                                reward_type: 'Happy hours'
                                            },
                                            header: 'onlyhappyhours',
                                            line1: 'happy hours',
                                            line2: 'get 1+1'
                                        }
                                    }
                                }
                            }
                        });
db.outlets.update({
    _id: ObjectId('55228bc049698488313b3891')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/12/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Happy hours'
                    },
                    header: 'onlyhappyhours',
                    line1: 'happy hours',
                    line2: 'get 1+2'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('55320b21bf7795f9365cc01b')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('10/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Happy hours'
                    },
                    header: 'onlyhappyhours',
                    line1: 'happy hours',
                    line2: 'get 1+1'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('555048cd13adc5643f1a09e3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Happy hours'
                    },
                    header: 'onlyhappyhours',
                    line1: 'happy hours',
                    line2: 'get 1+1 on all drinks'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('5566c2773beb115426f04303')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('10/28/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'BOGO (1+1)'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on 12" pizzas'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('552bba038b6abb7f0c9f46ae')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('8/6/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'BOGO (1+1)'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on 18" pizzas'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('55324f36bf7795f9365cc725')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: '1 piece chicken'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('530ef84902bc583c21000004')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/11/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'BOGO (1+1)'
                    },
                    header: 'buyonegetone',
                    line1: '1+1',
                    line2: 'on medium &'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('53142d821c33946a3d000088')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('7/28/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: 'cheese garlic bread'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('531ec1c05b2e10b974000006')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: '3 donuts'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('534b82cb0a9281e4520001bf')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('7/25/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: 'cookie'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('540f29192f61834b5170ec5e')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Social Pool',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('10/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Free'
                    },
                    header: 'free',
                    line1: 'free',
                    line2: '1 classic cocktail'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Check-in',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date(''),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Custom'
                    },
                    header: 'custom',
                    line1: 'buy one large/medium pizza',
                    line2: 'get Rs 100 off on the 2nd pizza'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('9/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Flat off'
                    },
                    header: 'flatoff',
                    line1: 'Rs 150 off',
                    line2: 'for Delhi Gourmet Club Members'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Walk-in Offer',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('7/31/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Flat off'
                    },
                    header: 'flatoff',
                    line1: 'Rs 100 off',
                    line2: 'on a min spend of Rs. 400'
                }
            }
        }
    }
});
db.outlets.update({
    _id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
    $push: {
        offers: {
            _id: new ObjectId(),
            offer_status: 'active',
            offer_type: 'Bank / Credit Cards',
            offer_group: 'test_offer',
            actions: {
                reward: {
                    _id: new ObjectId(),
                    expiry: new Date('11/30/15'),
                    reward_hours: null,
                    reward_meta: {
                        reward_type: 'Discount'
                    },
                    header: 'discount',
                    line1: '20% off',
                    line2: 'on your bill'
                }
            }
        }
    }
});
