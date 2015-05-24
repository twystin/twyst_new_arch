'use strict';
/*jslint mocha: true */
/*jslint node: true */
/*jslint expr: true*/

var faker = require('faker');
var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3000');
var token = '';
var saved_outlet = '';


describe('Auth Tests', function() {
  describe('Login', function() {
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

    it('Get a verification code - should pass');
    it('Verify an unused code - should pass');
  });

  describe('Logout', function() {
    it('Logout a user - should pass');
  });
});

describe('User Tests', function() {
  describe('Get user', function() {
    it('Get the logged in user - should pass', function(done) {
      api
        .get('/api/v4/users/0?token=' + token)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });

    it('Get my coupons - should pass');
  });
});

describe('Recommendation Tests', function() {
  describe('Get recos', function() {
    it('Get my recos - should pass');
    it('Get future recos - should pass');
    it('Get public recos - should pass');
    it('Get recos with lat/long - should pass');
    it('Search recos - should pass /q');
  });
});

describe('Event Tests', function() {
  describe('Checkin event', function() {
    it('Checkin - should pass');
  });

  describe('Follow event', function() {
    it('Follow - should pass');
  });

  describe('Gift event', function() {
    it('Gift - should pass');
  });

  describe('Pool event', function() {
    it('Pool - should pass');
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
          saved_outlet = res.body.data;
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });

    it('Updating an outlet - should pass', function(done) {
      saved_outlet.basics.name = 'Updated outlet';
      api.put('/api/v4/outlets/' + saved_outlet._id + '?token=' + token)
      .send(saved_outlet)
      .set('Accept', 'application/json')
      .end(function(err, res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
        if (err) return done(err);
        done();
      });
    });

    it('Get public outlets - should pass');
    it('Get all outlets I have access to - should pass', function(done) {
      api.get('/api/v4/outlets?token=' + token)
      .end(function(err,res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
        console.log(res.body.data);
        if (err) return done(err);
        done();
      });
    });
    it('Get a particular outlets details - should pass', function(done) {
      api.get('/api/v4/outlets/' + saved_outlet._id + '?token=' + token)
      .end(function(err, res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
        expect(res.body.data).eql(saved_outlet);
        if (err) return done(err);
        done();
      });
    });

    it('Deleting an outlet - should pass');
  });
});
