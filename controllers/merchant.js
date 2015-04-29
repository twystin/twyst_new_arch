module.exports.login = function(req, res) {
  console.log("Merchant login got called");
  res.send(200, {
    'status': 'success',
    'message': 'Login successful',
    'info': req.user
  });
};
