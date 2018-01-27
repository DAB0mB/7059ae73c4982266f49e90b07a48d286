import express from 'express';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import qs from 'qs';
import request from 'request';
import { consumerKey, consumerSecret } from './config';

// This module contains Twitter related routes

const SECRET = '123salty_fish!';
const TWITTER_API_URL = 'https://api.twitter.com';

const router = express.Router();

// Token handling middleware.
// Should be used in every route that requires authentication
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

// Requests an oauth token from Twitter's API
router.post('/request_oauth', (req, res) => {
  request.post({
    url: `${TWITTER_API_URL}/oauth/request_token`,
    oauth: {
      oauth_callback: 'http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback',
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    }
  }, (err, r, body) => {
    if (err) {
      return res.send(500, { message: err.message });
    }

    res.send(qs.parse(body));
  });
});

// Connects to Twitter using the received token and responds with the user's profile info
router.post('/connect', (req, res, next) => {
  request.post({
    url: `${TWITTER_API_URL}/oauth/access_token?oauth_verifier`,
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

    const { user_id: userId } = qs.parse(body);

    const token = jwt.sign({ id: userId }, SECRET, {
      expiresIn: 60 * 120
    });

    res.setHeader('x-auth-token', token);

    request.get({
      url: `${TWITTER_API_URL}/users/show.json?user_id=${userId}`,
    }, (err, r, body) => {
      if (err) {
        return res.send(500, { message: err.message });
      }

      res.send(qs.parse(body));
    });
  });
});

// Gets all tweets from authenticated user
router.get('/tweets', authenticate, (req, res) => {
  request.get({
    url: `${TWITTER_API_URL}/statuses/user_timeline.json?user_id=${req.auth.id}`,
  }, (err, r, body) => {
    if (err) {
      return res.send(500, { message: err.message });
    }

    res.send(qs.parse(body));
  });
});

// Removes authentication token
router.post('/disconnect', authenticate, (req, res) => {
  res.removeHeader('x-auth-token');

  res.send(req.auth.id);
});

export default router;
