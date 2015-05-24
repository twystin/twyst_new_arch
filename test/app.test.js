'use strict';
/*jslint mocha: true */
/*jslint node: true */
/*jslint expr: true*/

var faker = require('faker');
var should = require('chai').should();
var supertest = require('supertest');
var api = supertest('http://localhost:3000');
var token = "";
var saved_outlet = "";


describe('Auth Tests', function() {
  describe("Login", function() {
    it('Login a valid user - should pass', function(done) {
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
          token = res.body.data.token;
          res.body.data.token.should.be.a('string');
          if (err) return done(err);
          done();
        });
    });
  });
});

describe('User Tests', function() {
  describe("Get user", function() {
    it('Get the logged in user', function(done) {
      // console.log(token);
      api
        .get('/api/v4/users/0?token=' + token)
        .end(function(err, res) {
          // console.log(res.body);
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
  });
});

describe('Outlet Tests', function() {
  describe('Create an Outlet', function() {
    it('Saving an empty outlet - should fail', function(done) {
      api
        .post('/api/v4/outlets?token=' + token)
        .send({})
        .set('Accept', 'application/json')
        .end(function(err, res) {
          res.status.should.equal(200);
          // console.log(res.body);
          res.body.response.should.be.false;
          if (err) return done(err);
          done();
        });
    });


    var outlet = {
        basics : {
            name: 'Test Outlet',
            main_type: 'fnb',
        },
        contact: {
            location: {
                address: faker.address.streetAddress(),
                locality_1: ['Sector 34'],
                locality_2: ['Sector 34C'],
                city : 'Gurgaon',
                pin : '160022'
            },
            phones: {
                mobile: ['9779456097']
            }
        }
    };
    it('Saving an filled outlet - should pass', function(done) {

      api
        .post('/api/v4/outlets?token=' + token)
        .send(outlet)
        .set('Accept', 'application/json')
        .end(function(err, res) {
          // console.log(err);
          // console.log(res.body);
          saved_outlet = res.body.data;
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });

    it('Updating an outlet - should pass', function(done) {
      saved_outlet.basics.name = "Updated outlet";
      api.put('/api/v4/outlets/' + saved_outlet._id + '?token=' + token)
      .send(saved_outlet)
      .set('Accept', 'application/json')
      .end(function(err, res) {
        console.log(err);
        console.log(res.body);
        res.status.should.equal(200);
        res.body.response.should.be.true;
        if (err) return done(err);
        done();
      });
    });
  });
});
