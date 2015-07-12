db.outlets.update({
	_id: ObjectId('5502780b5cfd36a03c11c989')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'thali (veg/non-veg)',
					line2:'at Rs 299 (v)/Rs 399 (nv)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/22/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'happyhours'},
					header:'2 hours',
					line1:'extra happy hours',
					line2:'on all domestic liquor and starters'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551023957ae0350f3fcde586')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'reducedprice'},
					header:'only Rs 399 for',
					line1:'3 course lunch',
					line2:'worth Rs 699'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551a8e7418b029f94a15d9af')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/10/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'members\' dinner',
					line2:'at Rs 1599++ '
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55228bc049698488313b3891')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/10/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'1 burger + 2 soft drinks',
					line2:'for Rs 209 only'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55320b21bf7795f9365cc01b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/18/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'kebabs & 1 free drink',
					line2:'at Rs 445++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('555048cd13adc5643f1a09e3')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+1',
					line2:'on all domestic beer & imfl'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5566c2773beb115426f04303')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/1/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'weekend lunch',
					line2:'at Rs 749++ per head'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('552bba038b6abb7f0c9f46ae')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('12/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'discount'},
					header:'15% off',
					line1:'on your bill',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('53142d821c33946a3d000088')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'checkin',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/12/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'couples combo',
					line2:'at Rs 399 (v), Rs 449 (nv)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('531ec1c05b2e10b974000006')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('11/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'discount'},
					header:'15% off',
					line1:'on your bill',
					line2:'for Citibank card holders'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('534b82cb0a9281e4520001bf')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/22/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'custom'},
					header:'click a selfie &',
					line1:'share to get 50% off',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('540f29192f61834b5170ec5e')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('11/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'free drinks for ladies',
					line2:'every wed'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('7/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'5 shots',
					line2:'at Rs 699++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5502780b5cfd36a03c11c989')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'veg starters, soup, main course',
					line2:'and more at Rs 199'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'checkin',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/15/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'lunch',
					line2:'at Rs 449++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551023957ae0350f3fcde586')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'checkin',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/25/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'4-course lunch',
					line2:'at Rs 399++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551a8e7418b029f94a15d9af')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/23/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'custom'},
					header:'buy 1 chaap',
					line1:'and get 50% off on the 2nd chaap',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55228bc049698488313b3891')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/11/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'custom'},
					header:'add Rs 65 to your pizza/pasta',
					line1:'and upgrade to a meal combo',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('555048cd13adc5643f1a09e3')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/5/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+1',
					line2:'on fresh beer & imfl'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5566c2773beb115426f04303')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/12/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+2',
					line2:'on all domestic spirits'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('552bba038b6abb7f0c9f46ae')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/11/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+1',
					line2:'on all domestic beer & imfl'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('530ef84902bc583c21000004')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'checkin',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/28/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buyonegetone'},
					header:'1+1',
					line1:'on 12" pizzas',
					line2:'classic veg/chicken'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('53142d821c33946a3d000088')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/6/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buyonegetone'},
					header:'1+1',
					line1:'on 18" pizzas',
					line2:'from premium range'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('540f29192f61834b5170ec5e')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('7/28/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'free'},
					header:'free',
					line1:'cheese garlic bread',
					line2:'with any large pizza'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('7/25/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'free'},
					header:'free',
					line1:'cookie',
					line2:'with every hot beverage'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5502780b5cfd36a03c11c989')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'flatoff'},
					header:'Rs 150 off',
					line1:'for Delhi Gourmet Club Members',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'offer',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('7/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'flatoff'},
					header:'Rs 100 off',
					line1:'on a min spend of Rs. 400',
					line2:'for students only'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551023957ae0350f3fcde586')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: 'deal',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('11/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'discount'},
					header:'20% off',
					line1:'on your bill',
					line2:'Axis Bank customers'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'flatoff'},
					header:'Rs. 200 off',
					line1:'on a min spend of Rs. 800',
					line2:'weekdays only'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date(''),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buyonegetone'},
					header:'1+1',
					line1:'on all classic pizzas',
					line2:'(chicken/veg only)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date(''),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'happyhours'},
					header:'2 hours',
					line1:'extra happy hours',
					line2:'on all weekdays'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/11/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buyonegetone'},
					header:'1+1',
					line1:'on main course dishes',
					line2:'(chicken/veg only)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5502780b5cfd36a03c11c989')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/1/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'custom'},
					header:'buy any 3 pizzas',
					line1:'get the 4th pizza free',
					line2:'(classic pizzas only)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/20/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'free'},
					header:'free',
					line1:'pitcher of beer',
					line2:'on a bill of Rs 1000'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551023957ae0350f3fcde586')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/25/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'discount'},
					header:'15% off',
					line1:'on your bill',
					line2:'max discount Rs 500'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551a8e7418b029f94a15d9af')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/15/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'all day breakfast',
					line2:'for Rs 399++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55228bc049698488313b3891')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/10/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'reducedprice'},
					header:'only Rs 599 for',
					line1:'lunch buffet (incl beer)',
					line2:'worth Rs 1099'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55320b21bf7795f9365cc01b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'thali (veg/non-veg)',
					line2:'at Rs 299 (v)/Rs 399 (nv)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('555048cd13adc5643f1a09e3')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/22/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'happyhours'},
					header:'2 hours',
					line1:'extra happy hours',
					line2:'on all domestic liquor and starters'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5566c2773beb115426f04303')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'reducedprice'},
					header:'only Rs 399 for',
					line1:'3 course lunch',
					line2:'worth Rs 699'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('552bba038b6abb7f0c9f46ae')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/10/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'members\' dinner',
					line2:'at Rs 1599++ '
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55324f36bf7795f9365cc725')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/10/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'1 burger + 2 soft drinks',
					line2:'for Rs 209 only'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('530ef84902bc583c21000004')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/18/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'kebabs & 1 free drink',
					line2:'at Rs 445++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('53142d821c33946a3d000088')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+1',
					line2:'on all domestic beer & imfl'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('531ec1c05b2e10b974000006')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/1/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'weekend lunch',
					line2:'at Rs 749++ per head'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('534b82cb0a9281e4520001bf')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('12/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'discount'},
					header:'15% off',
					line1:'on your bill',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('540f29192f61834b5170ec5e')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('11/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'croissant, preserve & coffee',
					line2:'at Rs180'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date(''),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'croissant, preserve & tea',
					line2:'at Rs170 per head'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/12/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'couples combo',
					line2:'at Rs 399 (v), Rs 449 (nv)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('11/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'discount'},
					header:'15% off',
					line1:'on your bill',
					line2:'for Citibank card holders'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/22/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'custom'},
					header:'click a selfie &',
					line1:'share to get 50% off',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5502780b5cfd36a03c11c989')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('11/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'free drinks for ladies',
					line2:'every wed'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date(''),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'burst your belly',
					line2:'at Rs 299 (v) / Rs 349 (nv)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551023957ae0350f3fcde586')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'family combo',
					line2:'at Rs 710 (v), Rs 845 (nv)'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551a8e7418b029f94a15d9af')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/11/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'5 shots Teacher\'s 50',
					line2:'at Rs 799 '
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('7/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'combo'},
					header:'combo',
					line1:'5 shots',
					line2:'at Rs 699++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'unlimited'},
					header:'unlimited',
					line1:'veg starters, soup, main course',
					line2:'and more at Rs 199'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/15/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'lunch',
					line2:'at Rs 449++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/25/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'4-course lunch',
					line2:'at Rs 399++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5502780b5cfd36a03c11c989')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/23/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'custom'},
					header:'buy 1 chaap',
					line1:'and get 50% off on the 2nd chaap',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5505d1535cfd36a03c11f18b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/11/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'custom'},
					header:'add Rs 65 to your pizza/pasta',
					line1:'and upgrade to a meal combo',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551023957ae0350f3fcde586')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/10/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buffet'},
					header:'buffet',
					line1:'chef\'s lunch',
					line2:'at only Rs 425++'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('551a8e7418b029f94a15d9af')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/5/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+1',
					line2:'on fresh beer & imfl'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55228bc049698488313b3891')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/12/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+2',
					line2:'on all domestic spirits'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55320b21bf7795f9365cc01b')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/11/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+1',
					line2:'on all domestic beer & imfl'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('555048cd13adc5643f1a09e3')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date(''),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'onlyhappyhours'},
					header:'happy hours',
					line1:'get 1+1 on all drinks',
					line2:'& 1 free starter, before 6 pm'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('5566c2773beb115426f04303')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/28/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buyonegetone'},
					header:'1+1',
					line1:'on 12" pizzas',
					line2:'classic veg/chicken'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('552bba038b6abb7f0c9f46ae')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('8/6/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buyonegetone'},
					header:'1+1',
					line1:'on 18" pizzas',
					line2:'from premium range'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('55324f36bf7795f9365cc725')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date(''),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'free'},
					header:'free',
					line1:'1 piece chicken',
					line2:'with a qtr chicken'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('530ef84902bc583c21000004')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/11/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'buyonegetone'},
					header:'1+1',
					line1:'on medium &',
					line2:'large pizzas'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('53142d821c33946a3d000088')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('7/28/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'free'},
					header:'free',
					line1:'cheese garlic bread',
					line2:'with any large pizza'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('531ec1c05b2e10b974000006')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date(''),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'free'},
					header:'free',
					line1:'3 donuts',
					line2:'on buying 3 donuts'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('534b82cb0a9281e4520001bf')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('7/25/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'free'},
					header:'free',
					line1:'cookie',
					line2:'with every hot beverage'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('540f29192f61834b5170ec5e')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('10/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'free'},
					header:'free',
					line1:'1 classic cocktail',
					line2:'on a bill of Rs 1500'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54ae3daa1e3fc78926eaeec3')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date(''),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'custom'},
					header:'buy one large/medium pizza',
					line1:'get Rs 100 off on the 2nd pizza',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54d0b4a6ea25f3200dfe124a')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('9/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'flatoff'},
					header:'Rs 150 off',
					line1:'for Delhi Gourmet Club Members',
					line2:''
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54dcf6c319ed8ba23a4ebff2')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('7/31/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'flatoff'},
					header:'Rs 100 off',
					line1:'on a min spend of Rs. 400',
					line2:'for students only'
				}
			}
		}
	}
});

db.outlets.update({
	_id: ObjectId('54e2d60d43b1aaf274a328c4')
}, {
	$push:{
		offers: {
			_id: new ObjectId(),
			offer_status: 'active',
			offer_type: '',
			offer_group: 'test_offer',
			actions: {
				 reward: {
					_id: new ObjectId(),
					expiry: new Date('11/30/15'),
					reward_hours:    {sunday: {        closed: true,            timings: []    },    monday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    tuesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    wednesday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    thursday: {        closed: false,            timings: [{            open: {                hr: 18,                min: 00            },            close: {                hr: 22,                min: 00            }        }]    },    friday: {        closed: true,            timings: []    },    saturday: {        closed: true,            timings: []    }},
					reward_meta: { reward_type:'discount'},
					header:'20% off',
					line1:'on your bill',
					line2:'Axis Bank customers'
				}
			}
		}
	}
});

