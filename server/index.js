import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import passport from 'passport';
import TwitterTokenStrategy from 'passport-twitter-token';
import { User } from './models';
import { twitter, publicfs } from './routes';
import { consumerKey, consumerSecret } from './twitterConfig';

mongoose.connect(
  `mongodb://${process.env.HOST}:${process.env.DB_PORT}/twit-twat_${process.env.NODE_ENV}`
);

passport.use(new TwitterTokenStrategy({
  consumerKey,
  consumerSecret,
}, User.upsertTwitterUser.bind(User)));

const app = express();

// Allow access only to our application
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.APP_URL);
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Expose-Headers', 'X-Auth-Token');

  next();
});

//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(morgan('combined'));
app.use(api);
app.use(twitter);

if (process.env.NODE_ENV == 'production') {
  app.use(publicfs);
}

app.listen(process.env.PORT, process.env.HOST, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  // In case this is a forked process
  if (process.send) {
    // Signify that the server has started
    process.send({ type: 'SERVER_START' });
  }
});
