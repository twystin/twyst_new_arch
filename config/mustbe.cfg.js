var mustBe = require("mustbe");
module.exports = function(config) {

  config.routeHelpers(function(rh) {
    // get the current user from the request object
    rh.getUser(function(req, cb) {
      // return cb(err); if there is an error
      cb(null, req.user);
    });

    // what do we do when the user is not authorized?
    rh.notAuthorized(function(req, res, next) {
      res.redirect("/login?msg=you are not authorized");
    });
  });

  config.activities(function(activities) {
    // configure an activity with an authorization check
    activities.can("view thing", function(identity, params, cb) {
      cb(null, '1');
    });
  });

};
