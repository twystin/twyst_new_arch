'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
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


module.exports.qr_create = function (req, res) {
    logger.log();
    var deferred = Q.defer();
  var zip = new AdmZip();

  validateQrCreate();
  var qr;
  var num;
  var outlet;
  var count = 0;
  

  function validateQrCreate() {
    if(req.body) {
      if(req.body.outlet) {
        outlet = req.body.outlet;
        if(req.body.num) {
          num = Number(req.body.num);
          if(req.body.max_use_limit) {
            if(req.body.validity.start && req.body.validity.end) {
              if(req.body.type) {
                qr = {};
                qr.outlet_id = req.body.outlet;
                qr.max_use_limit = req.body.max_use_limit;
                qr.validity = req.body.validity;
                qr.type = req.body.type;
                generateQrCode(num, qr);
              }
              else {
                deferred.reject('QR code type not selected');
                
              }
            }
            else {
                deferred.reject('validity field not selected');
              
          }
        }
          else {
            deferred.reject('Max use limit not filled');
            
        }
      }
        else {
            deferred.reject('Add number of QR to be generated');
         
      }
    }
      else {
        deferred.reject('Please select Outlet');
        
    }
  }
    else {
        deferred.reject('Request body empty')
     
  }
}

  function generateQrCode (num, qr_n) {
    var qr = {};
    qr = _.extend(qr, qr_n);

    for (var i = 0; i < num; i++) {
      var qrcode = keygen._({forceUppercase: true, length: 6, exclude:['O', '0', 'L', '1']});

      qr.code = qrcode;
      saveQr(qr, i);
    };
  }

  function saveQr (qr, lim) {
    var qr = new Qr(qr);
    qr.save(function (err, qr) {
      if(err) {
        // Do nothing
        console.log(err);
        ++count;    
        if(count === num) {
          writeOnDisk(zip);
        }
      }
      else {
        qr.code = twyst_url + qr.code;
        getZipped(qr.code, lim);
      }
    })
  }

  function getZipped(qrcode, lim) {
    QrLib(qrcode, 1.5, function(err, png) {
      zip.addFile(qrcode.toLowerCase() +".png", png);
      ++count;    
      if(count === num) {
        writeOnDisk(zip);
      }
    });
  }

  function writeOnDisk(zip) {

    var time = Date.now();
    zip.writeZip(__dirname + '/../../Twyst-Web-Apps/common/'+outlet+"_"+time+".zip");
    deferred.resolve({
      data: "/common/"+outlet+"_"+time+".zip",
      message: 'Successfully saved QR code for Outlet'
    });
  }
}