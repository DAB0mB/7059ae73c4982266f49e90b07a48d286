import express from 'express';
import request from 'request';
import { User } from '../models';
import { consumerKey, consumerSecret } from '../twitterConfig';

const router = express.Router();

//token handling middleware
const authenticate = expressJwt({
  secret: 'my-secret',
  requestProperty: 'auth',
  getToken: function(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

router.get('/request_oauth', (req, res) => {
  request.post({
    url: 'https://api.twitter.com/oauth/request_token',
    oauth: {
      oauth_callback: "http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback",
      consumer_key: 'KEY',
      consumer_secret: 'SECRET'
    }
  }, (err, r, body) => {
    if (err) {
      return res.send(500, { message: e.message });
    }

    body = qs.parse(body);

    res.send(body);
  });
});

router.post('/connect', (req, res, next) => {
  request.post({
    url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
    oauth: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token: req.query.oauth_token
    },
    form: { oauth_verifier: req.query.oauth_verifier }
  }, (err, r, body) => {
    if (err) {
      return res.send(500, { message: err.message });
    }

    body = qs.parse(body);

    req.body['oauth_token'] = parsedBody.oauth_token;
    req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
    req.body['user_id'] = parsedBody.user_id;

    next();
  });
}, passport.authenticate('twitter-token', { session: false }), (req, res, next) => {
  if (!req.user) {
    return res.send(401, 'User Not Authenticated');
  }

  // prepare token for API
  req.auth = {
    id: req.user.id
  };

  next();
}, generateToken, sendToken);

router.get('/tweets', authenticate, getCurrentUser, getOne, (req, res) => {
  const queryStr = qs.stringify({
    q: `from:${req.user.name}`,
    count: 100,
  });

  request.get(`https://api.twitter.com/search/tweets.json?${queryStr}`, (err, r, body) => {
    if (err) {
      return res.send(500, { message: err.message });
    }

    body = qs.parse(body);

    res.send(body);
  });
});

router.post('/disconnect', authenticate, getCurrentUser, getOne, (req, res) => {
  if (req.headers['x-auth-token']) {
    delete req.headers['x-auth-token'];

    return res.send(req.user.id);
  }

  res.send(401, 'User Not Authenticated');
});

function generateToken(req, res, next) {
  req.token = createToken(req.auth);

  next();
}

function sendToken(req, res) {
  res.setHeader('x-auth-token', req.token);

  res.status(200).send(JSON.stringify(req.user));
}

function getCurrentUser(req, res, next) {
  User.findById(req.auth.id, function(err, user) {
    if (err) {
      next(err);
    }
    else {
      req.user = user;
      next();
    }
  });
}

function getOne(req, res) {
  var user = req.user.toObject();

  delete user['twitterProvider'];
  delete user['__v'];

  res.json(user);
}

export default router;
