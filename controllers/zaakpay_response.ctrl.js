'use strict';
/*jslint node: true */

module.exports.get_zaakpay_response = function(req, res) {
	logger.log();
  	var zaakpay_response = {};
  	zaakpay_response = _.extend(order, req.body);

  	ChecksumHelper.calculate_checksum(zaakpay_response).then(function(data){
		HttpHelper.success(res, data );
	},	function(err) {
		HttpHelper.error(res, err );
  	});
    
};