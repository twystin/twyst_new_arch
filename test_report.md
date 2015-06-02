# TOC
   - [Auth Tests](#auth-tests)
     - [Login](#auth-tests-login)
     - [Logout](#auth-tests-logout)
   - [User Tests](#user-tests)
     - [Get user](#user-tests-get-user)
   - [Recommendation Tests](#recommendation-tests)
     - [Get recos](#recommendation-tests-get-recos)
   - [Event Tests](#event-tests)
     - [Checkin event](#event-tests-checkin-event)
     - [Follow event](#event-tests-follow-event)
     - [Gift event](#event-tests-gift-event)
   - [Outlet Tests](#outlet-tests)
     - [Outlet workout - CRUD](#outlet-tests-outlet-workout---crud)
<a name=""></a>
 
<a name="auth-tests"></a>
# Auth Tests
<a name="auth-tests-login"></a>
## Login
Login a valid user - should pass.

```js
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
```

Get a verification code - should pass.

```js
api.get('/api/v4/authcode/100000001')
.end(function(err,res) {
  res.status.should.equal(200);
  res.body.response.should.be.true;
  authcode = res.body.data;
  if (err) return done(err);
  done();
});
```

Verify an unused code - should pass.

```js
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
```

<a name="auth-tests-logout"></a>
## Logout
Logout a user - should pass.

```js
api.get('/api/v4/logout?token=' + token)
.end(function(err, res) {
  res.status.should.equal(200);
  res.body.response.should.be.true;
  if (err) return done(err);
  done();
});
```

<a name="user-tests"></a>
# User Tests
<a name="user-tests-get-user"></a>
## Get user
Get the logged in user - should pass.

```js
api
  .get('/api/v4/profile?token=' + token)
  .end(function(err, res) {
    res.status.should.equal(200);
    res.body.response.should.be.true;
    user = res.body.data.data;
    if (err) return done(err);
    done();
  });
```

Update the logged in user - should pass.

```js
var updated_user = user;
updated_user.first_name = 'Abhimanyu';
api.put('/api/v4/profile?token=' + token)
.send(updated_user)
.set('Accept', 'application/json')
.end(function(err,res) {
  res.status.should.equal(200);
  res.body.response.should.be.true;
  if (err) return done(err);
  done();
});
```

Get my coupons - should pass.

```js
api.get('/api/v4/coupons?token=' + token)
.end(function(err, res) {
  res.status.should.equal(200);
  res.body.response.should.be.true;
  if (err) return done(err);
  done();
});
```

<a name="recommendation-tests"></a>
# Recommendation Tests
<a name="recommendation-tests-get-recos"></a>
## Get recos
Get my recos - should pass.

```js
api
  .get('/api/v4/recos?token=' + token)
  .end(function(err, res) {
    res.status.should.equal(200);
    res.body.response.should.be.true;
    if (err) return done(err);
    done();
  });
```

Get future recos - should pass.

```js
api
  .get('/api/v4/recos?token=' + token + '&date=12-05-15&time=16:40')
  .end(function(err, res) {
    res.status.should.equal(200);
    res.body.response.should.be.true;
    if (err) return done(err);
    done();
  });
```

Get public recos - should pass.

```js
api
  .get('/api/v4/recos')
  .end(function(err, res) {
    res.status.should.equal(200);
    res.body.response.should.be.true;
    if (err) return done(err);
    done();
  });
```

Get recos with lat/long - should pass.

```js
api
  .get('/api/v4/recos?token=' + token + '&lat=123&long=342')
  .end(function(err, res) {
    res.status.should.equal(200);
    res.body.response.should.be.true;
    if (err) return done(err);
    done();
  });
```

Search recos - should pass /q.

```js
api
  .get('/api/v4/recos?token=' + token + '&q=cafe')
  .end(function(err, res) {
    res.status.should.equal(200);
    res.body.response.should.be.true;
    if (err) return done(err);
    done();
  });
```

Get recos with pagination.

```js
api
  .get('/api/v4/recos?token=' + token + '&start=1&long=342')
  .end(function(err, res) {
    res.status.should.equal(200);
    res.body.response.should.be.true;
    if (err) return done(err);
    done();
  });
```

<a name="event-tests"></a>
# Event Tests
<a name="event-tests-checkin-event"></a>
## Checkin event
Checkin - should pass.

```js
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
```

<a name="event-tests-follow-event"></a>
## Follow event
Follow - should pass.

```js
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
```

<a name="event-tests-gift-event"></a>
## Gift event
Gift - should pass.

```js
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
```

<a name="outlet-tests"></a>
# Outlet Tests
<a name="outlet-tests-outlet-workout---crud"></a>
## Outlet workout - CRUD
Saving an empty outlet - should fail.

```js
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
```

Saving an filled outlet - should pass.

```js
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
```

Updating an outlet - should pass.

```js
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
```

Get all outlets I have access to - should pass.

```js
api.get('/api/v4/outlets?token=' + token)
.end(function(err,res) {
  res.status.should.equal(200);
  res.body.response.should.be.true;
  if (err) return done(err);
  done();
});
```

Get a particular outlets details - should pass.

```js
api.get('/api/v4/outlets/' + saved_outlet._id + '?token=' + token)
.end(function(err, res) {
  res.status.should.equal(200);
  res.body.response.should.be.true;
  expect(res.body.data).eql(saved_outlet);
  if (err) return done(err);
  done();
});
```

Deleting an outlet - should pass.

```js
api.delete('/api/v4/outlets/' + saved_outlet._id + '?token=' + token)
.end(function(err, res) {
  res.status.should.equal(200);
  res.body.response.should.be.true;
  if (err) return done(err);
  done();
});
```

