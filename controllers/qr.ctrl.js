'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var async = require('async');
var _ = require('lodash');
var Q = require('q');
var Cache = require('../common/cache.hlpr');
var AuthHelper = require('../common/auth.hlpr');
var HttpHelper = require('../common/http.hlpr');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Outlet = mongoose.model('Outlet');
var QrLib = require('qrpng');
var fs = require('fs');
var keygen = require("keygenerator");
var AdmZip = require('adm-zip');
var Qr = mongoose.model('QR');


module.exports.qr_create = function(req, res) {
  logger.log();
  var deferred = Q.defer();
  var token = req.query.token || null;

  if(!token) {
    HttpHelper.error(res, null, "Not authenticated");
  } else {
    AuthHelper.get_user(token).then(function(data) {
      var user = data.data;
      if(user.role>2) {
        HttpHelper.error(res, null, "Not authorized");
      } else {
        var req_obj = {};
        req_obj = _.extend(req_obj, req.body);
        var data = {};
        data.req_obj = req_obj;
        validateQrCreate(data)
          .then(function(data) {
            return generateQrs(data);
          })
          .then(function(data) {
            HttpHelper.success(res, data.qrs, data.message);
          })
          .fail(function(err) {
            logger.error(err.stack);
            HttpHelper.error(res, err.err, err.message);
          });
      }
    }, function(err) {
      HttpHelper.error(res, err.data, err.message);
    });
  }
  
}

var validateQrCreate = function(data) {
  logger.log();
  var deferred = Q.defer();

  if (!data.req_obj) {
    deferred.reject({
      err: false,
      message: 'Request object missing'
    });
  } else if (!data.req_obj.outlet) {
    deferred.reject({
      err: false,
      message: 'Outlet must be specified'
    });
  } else if (!data.req_obj.num) {
    deferred.reject({
      err: false,
      message: 'Number of QRs must be specified'
    });
  } else if (!data.req_obj.type || ['single', 'multi'].indexOf(data.req_obj.type)===-1) {
    deferred.reject({
      err: false,
      message: 'Valid QR type must be selected'
    });
  } else if (!data.req_obj.max_use_limit) {
    deferred.reject({
      err: false,
      message: 'Max QR usage limit must be specified'
    });
  } else if (!data.req_obj.validity || !data.req_obj.validity.start || !data.req_obj.validity.end) {
    deferred.reject({
      err: false,
      message: "validity info required"
    });
  } else {
    data.qr_obj = {
      outlet_id: data.req_obj.outlet,
      max_use_limit: data.req_obj.max_use_limit,
      type: data.req_obj.type,
      validity: {
        start: new Date(data.req_obj.validity.start),
        end: new Date(data.req_obj.validity.end)
      }
    }
    deferred.resolve(data);
  }

  return deferred.promise;
}

var generateQrs = function(data) {
  logger.log();
  var deferred = Q.defer();
  var gen_qrs = [];
  var qrs = _.range(data.req_obj.num).map(function(x) { return {}; });
  async.each(qrs, function(qr, callback) {
    var new_qr = new Qr(data.qr_obj);
    new_qr.code = keygen._({forceUppercase: true, length: 6, exclude:['O', '0', 'L', '1']});
    new_qr.save(function(err) {
      if(err) {
        logger.error(err);
      }
      gen_qrs.push(new_qr);
      callback();
    });
  }, function() {
    data.qrs = gen_qrs;
    deferred.resolve(data);
  })
  return deferred.promise;
}

module.exports.qr_list = function(req, res) {
  logger.log();

  var token = req.query.token || null;
  var outlet_id = req.query.outlet || null

  if(!token) {
    HttpHelper.error(res, null, "Not authenticated");
  } else if (!outlet_id) {
    HttpHelper.error(res, null, "Please specify the outlet")
  } else {
    AuthHelper.get_user(token).then(function(data) {
      var user = data.data;
      if(user.role > 2) {
        HttpHelper.error(res, null, "Unauthorized access");
      } else {
        var today = new Date();
        Qr.find({
          outlet_id: outlet_id
        }).sort({'validity.end': -1, 'validity.start': -1}).exec(function(err, qrs) { //populate('outlet_id', 'basics.name contact.location.locality_1 contact.location.locality_2')
          if(err || !qrs) {
            HttpHelper.error(res, null, "Unable to load QRs");
          } else {
            var valid_qrs = _.filter(qrs, function(qr) {
              return qr.outlet_id;
            })
            HttpHelper.success(res, valid_qrs, "Found the QRs");
          }
        });
      }
    }, function(err) {
      console.log('negative');
      HttpHelper.error(res, null, "Unable to authorize")
    })
  }
}