var mustBe = require("mustbe");
module.exports = function(config) {

  config.userIdentity(function(id){

    // determine if this user is authenticated or not
    id.isAuthenticated(function(user, cb){
      // note that the "user" in this case, is the user
      // that was supplied by the routeHelpers.getUser function
      var isAuthenticated = false;
      if (user) {
        isAuthenticated = true;
      }
      cb(null, isAuthenticated);
    });

  });

  config.routeHelpers(function(rh) {
    // get the current user from the request object
    rh.getUser(function(req, cb) {
      if (req.query && req.query.token) {
        cb(null, req.query.token);
      } else {
        cb(null)
      }
      // cb(null, req.user);
    });

    // what do we do when the user is not authorized?
    rh.notAuthorized(function(req, res, next) {
      res.status(200).send({
        "status": false,
        "message": "not authorized"
      });
    });
  });

  config.activities(function(activities) {
    // configure an activity with an authorization check
    activities.can("view thing", function(identity, params, cb) {
      // identity.isAuthenticated();
      console.log("IDENTITY" + JSON.stringify(identity));
      cb(null, '1');
    });
  });

};
