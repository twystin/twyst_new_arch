'use strict';
/*jslint node: true */

var should = require('chai').should();
var supertest = require('supertest');
var api = supertest('http://localhost:3000');

describe('Auth Tests', function() {
  describe("Login", function() {
    it('Login a valid user - should pass', function(done) {
      api
        .post('/api/v4/accounts/login')
        .send({
          username: '9779456097',
          password: '9779456097'
        })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.response.should.be.true;
          // console.log(res.body.data.);
          res.body.data.token.should.be.a('string');
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
        .post('/api/v4/outlets?token=9IFNsPRwkivfYKkAzItwKFAwTshhmI4S')
        .send({})
        .set('Accept', 'application/json')
        .end(function(err, res) {
          res.status.should.equal(200);
          console.log(res.body);
          res.body.response.should.be.false;
          if (err) return done(err);
          done();
        });
    });


    var outlet = {
      publicUrl: 'abc',
      basics: {
        name: 'abc',
        is_a: 'bakery',
        icon: 'bakery'
      },
      contact: {
        location: {
          coords: {
            longitude: '12',
            latitude: '70'
          },
          address: 'abc',
          landmarks: [],
          locality_1: [],
          locality_2: [],
          city: 'abc',
          pin: 'abc'
        },
        phones: {
          mobile: [],
          reg_mobile: [],
        }
      },
      links: {
        website_url: 'abc',
        facebook_url: 'abc',
        twitter_url: 'abc',
        youtube_url: 'abc',
        zomato_url: 'abc',
        foodpanda_url: 'abc'
      },
      business_hours: {},
      attributes: {
        delivery: {
          delivery_area: 'abc',
          delivery_estimated_time: 'abc',
          delivery_timings: {},
          delivery_conditions: 'abc'
        },
        home_delivery: false,
        dine_in: false,
        veg: false,
        alcohol: false,
        outdoor: false,
        foodcourt: false,
        smoking: false,
        chain: false,
        air_conditioning: 'Available',
        parking: 'Available',
        reservation: 'Recommended',
        wifi: 'Free',
        cost_for_two: {
          min: 0,
          max: 0
        },
        cuisines: [],
        payment_options: [],
        tags: []
      },
      photos: {
        logo: 'abc',
        logo_gray: 'abc',
        background: 'abc',
        others: []
      },
      offers: [],
      jobs: [],
      menu: []
    };

    it('Saving an filled outlet - should pass', function(done) {
      api
        .post('/api/v4/outlets')
        .send(outlet)
        .set('Accept', 'application/json')
        .end(function(err, res) {
          console.log(res.body);
          res.status.should.equal(200);
          res.body.response.should.be.true;
          if (err) return done(err);
          done();
        });
    });
  });
});
