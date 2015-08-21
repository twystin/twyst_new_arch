'use strict';
/*jslint node: true */

module.exports.values = {
  'env': 'LOCAL',
  'config': {
    'LOCAL': {
      'server': 'http://localhost',
      'port': 3000,
      'db_uri': 'mongodb://localhost/retwyst',
      'clear_interval': 3600
    },
    'TEST': {
    	'server': 'http://retwyst.twyst.in',
    	'port': 80,
    	'db_uri': 'mongodb://retwyst.twyst.in/retwyst',
    	'clear_interval': 3600
    },
    'PROD': {
    	'server': 'http://twyst.in',
    	'port': 80,
    	'db_uri': 'mongodb://db.twyst.in/retwyst',
    	'clear_interval': 3600
    }
  }
};
