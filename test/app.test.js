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
var authcode = '';

describe('Auth Tests', function() {
  describe('Login', function() {
    it('Login a valid user - should pass', function(done) {
      api
        .post('/api/v4/accounts/login')
        .send({
          username: 'ablal',
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

    it('Get a verification code - should pass', function(done) {
      api.get('/api/v4/authcode/100000001')
      .end(function(err,res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
        authcode = res.body.data;
        if (err) return done(err);
        done();
      });
    });

    it('Verify an unused code - should pass', function(done) {
      api.post('/api/v4/authcode')
      .send({
        code: authcode.code,
        phone: authcode.phone
      })
      .set('Accept', 'application/json')
      .end(function(err, res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
        if (err) return done(err);
        done();
      });
    });
  });

  describe('Logout', function() {
    it('Logout a user - should pass', function(done) {
      api.get('/api/v4/logout?token=' + token)
      .end(function(err, res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
        if (err) return done(err);
        done();
      });
    });
  });
});

describe('User Tests', function() {
  before(function(done){
    api
      .post('/api/v4/accounts/login')
      .send({
        username: 'ablal',
        password: 'spam25'
      })
      .set('Accept', 'application/json')
      .end(function(err, res) {
        token = res.body.data.token;
        if (err) return done(err);
        done();
      });
  });

  describe('Get user', function() {
    it('Get the logged in user - should pass', function(done) {
      api
        .get('/api/v4/profile?token=' + token)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });

    it('Get my coupons - should pass', function(done) {
      api.get('/api/v4/coupons?token=' + token)
      .end(function(err, res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
        if (err) return done(err);
        done();
      });
    });
  });
});

describe('Recommendation Tests', function() {
  describe('Get recos', function() {
    it('Get my recos - should pass', function(done) {
      api
        .get('/api/v4/recos?token=' + token)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
    it('Get future recos - should pass', function(done) {
      api
        .get('/api/v4/recos?token=' + token + '&date=12-05-15&time=16:40')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
    it('Get public recos - should pass', function(done) {
      api
        .get('/api/v4/recos')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
    it('Get recos with lat/long - should pass', function(done) {
      api
        .get('/api/v4/recos?token=' + token + '&lat=123&long=342')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
    it('Search recos - should pass /q', function(done) {
      api
        .get('/api/v4/recos?token=' + token + '&q=cafe')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });

    it('Get recos with pagination', function(done) {
      api
        .get('/api/v4/recos?token=' + token + '&start=1&long=342')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
  });
});

describe('Event Tests', function() {
  before(function(done){
    api
      .post('/api/v4/accounts/login')
      .send({
        username: 'ablal',
        password: 'spam25'
      })
      .set('Accept', 'application/json')
      .end(function(err, res) {
        token = res.body.data.token;
        if (err) return done(err);
        done();
      });
  });

  describe('Checkin event', function() {
    it('Checkin - should pass', function(done) {
      api
        .post('/api/v4/checkin?token=' + token)
        .send({
          event_type: 'checkin',
          event_date: new Date(),
          event_meta: {
            'qr': '12345'
          },
          event_user: null,
          event_outlet: null
        })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
  });

  describe('Follow event', function() {
    it('Follow - should pass', function(done) {
      api
        .post('/api/v4/follow?token=' + token)
        .send({
          event_type: 'follow',
          event_date: new Date(),
          event_meta: {
          },
          event_user: null,
          event_outlet: null
        })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
  });

  describe('Gift event', function() {
    it('Gift - should pass', function(done) {
      api
        .post('/api/v4/gift?token=' + token)
        .send({
          event_type: 'gift',
          event_date: new Date(),
          event_meta: {
            'coupon_code': null,
            'gifted_to': null
          },
          event_user: null,
          event_outlet: null
        })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
  });

});

describe('Outlet Tests', function() {
  before(function(done){
    api
      .post('/api/v4/accounts/login')
      .send({
        username: 'ablal',
        password: 'spam25'
      })
      .set('Accept', 'application/json')
      .end(function(err, res) {
        token = res.body.data.token;
        if (err) return done(err);
        done();
      });
  });

  describe('Outlet workout - CRUD', function() {
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

    it('Get all outlets I have access to - should pass', function(done) {
      api.get('/api/v4/outlets?token=' + token)
      .end(function(err,res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
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

    it('Deleting an outlet - should pass', function(done) {
      api.delete('/api/v4/outlets/' + saved_outlet._id + '?token=' + token)
      .end(function(err, res) {
        res.status.should.equal(200);
        res.body.response.should.be.true;
        if (err) return done(err);
        done();
      });
    });
  });
});
