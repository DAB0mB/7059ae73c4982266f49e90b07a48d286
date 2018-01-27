import express from 'express';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import qs from 'qs';
import request from 'request';
import { User } from '../models';
import { consumerKey, consumerSecret } from '../twitterConfig';

const router = express.Router();
const SECRET = '123salty_fish!';

// Token handling middleware
const authenticate = expressJwt({
  secret: SECRET,
  requestProperty: 'auth',
  getToken: function(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

router.post('/request_oauth', (req, res) => {
  request.post({
    url: 'https://api.twitter.com/oauth/request_token',
    oauth: {
      oauth_callback: 'http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback',
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    }
  }, (err, r, body) => {
    if (err) {
      console.log(err);
      return res.send(500, { message: err.message });
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

    req.body['oauth_token'] = body.oauth_token;
    req.body['oauth_token_secret'] = body.oauth_token_secret;
    req.body['user_id'] = body.user_id;

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

  request.get(`https://api.twitter.com/1.1/search/tweets.json?${queryStr}`, (err, r, body) => {
    if (err) {
      return res.send(500, { message: err.message });
    }

    body = qs.parse(body);

    res.send(body);
  });
});

router.post('/disconnect', authenticate, (req, res) => {
  res.removeHeader('x-auth-token');

  User.findByIdAndRemove(req.auth.id, (err) => {
    if (err) {
      res.send(500, { message: err.message });
    }
    else {
      res.send(req.auth.id);
    }
  });
});

router.get('/me', authenticate, getCurrentUser, getOne);

function generateToken(req, res, next) {
  req.token = createToken(req.auth);

  next();
}

function createToken(auth) {
  return jwt.sign({
    id: auth.id
  }, SECRET, {
    expiresIn: 60 * 120
  });
};

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

  request.get(
    `https://api.twitter.com/1.1/users/show.json?user_id=${user.id}`,
  (err, r, body) => {
    if (err) {
      return res.send(500, { message: err.message });
    }

    body = qs.parse(body);

    Object.assign(user, body);

    res.send(user);
  });
}

export default router;
