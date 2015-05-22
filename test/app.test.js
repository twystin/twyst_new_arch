'use strict';
/*jslint node: true */

var should = require('chai').should();
var supertest = require('supertest');
var api = supertest('http://localhost:3000');

describe('Auth Tests', function() {
  describe("Login", function() {
    it('Should be able to login a valid user', function(done) {
      api
        .post('/api/v4/accounts/login')
        .send({
          username: 'arunr',
          password: 'spam25'
        })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          res.body.data.should.be.a('string');
          if (err) return done(err);
          done();
        });
    });
  });
});
