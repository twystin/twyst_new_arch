'use strict';
/*jslint node: true */

module.exports.new = function(req,res) {

  // CHECK THAT THE AUTH TOKEN IS THERE
  // CHECK THAT THE ROLE IS OK
  // SAVE THE Outlet
  console.log(req.query);
  res.status(200).send({'info':'ok'});
};
