/**
* twyst.store Module
*
* Description: A module to get and set data into the local storage
* Author: Arun Rajappa
* EMail: ar@twyst.in
* Version: 1.0
* Date: 17th Sept 2014
*/
angular.module('twyst.store', [])

.factory('storageSvc', function($window) {
  var storageSvc = {};
  var store = $window.localStorage;

  var STORAGE_NAME = 'TWYST';
  var data = JSON.parse(store.getItem(STORAGE_NAME)) || {};

  var isJSON = function(str) {
    try {
      JSON.parse(str);
    } catch(e) {
      return false;
    }
    return true;
  };

  storageSvc.set = function(key, value) {
    data[key] = value;
    store.setItem(STORAGE_NAME, JSON.stringify(data));
  };

  storageSvc.get = function(key) {
    var value = data[key];

    if (value === null || value === undefined)
      return null;

    if (isJSON(value)) {
      return JSON.parse(value);
    } else {
      return value;
    }
  };

  storageSvc.remove = function(key) {
    delete data[key];
    store.setItem(STORAGE_NAME, JSON.stringify(data));
  };

  storageSvc.clear = function() {
    store.removeItem(STORAGE_NAME);
    data = JSON.parse(store.getItem(STORAGE_NAME)) || {};
  };

  return storageSvc;
});