## API CODE REVIEW
### arunr, 20.8.15

### AUTH RELATED APIs
1. Login: POST /api/v4/accounts/login
    + Logs the user in using passport.
    + Creates an auth token for the user & account
    + Populates the cache with checkin data for the user

2. Create an OTP code: GET /api/v4/authcode/:phone
    + Get the phone number of the user who wants an auth code
    + Check if there is an authcode for this phone number
    + If there isnt, create a new code in the DB for the phone number and send it back.
    + If there is, either re-send the existing auth code or send back an error

3. Verify an authcode: POST /api/v4/authcode
    + Get the phone number & auth code sent for verification.
    + Check if the authcode & phone exist in the DB.
    + If it doesnt, send back an error.
    + If it does - the authcode is verified! So, create an account + user combination for this phone number.
    + Login the user after creating the user & account.
    + NOTE: No need to populate the cache after this, since the user is new.

4. Logout the user: GET /api/v4/accounts/logout
    + Get the token for the user to logout
    + Delete the auth token for the user

### OTHER APIs
1. Location: GET /api/v4/locations
    + Returns the locations loaded into the cache at startup