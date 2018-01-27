import express from 'express';
import morgan from 'morgan';
import api from './api';
import publicfs from './publicfs';

const appUrl = process.env.APP_URL;
const host = process.env.HOST;
const nodeEnv = process.env.NODE_ENV;
const port = process.env.PORT;

const app = express();

app.use(morgan('combined'));
app.use(api);

if (nodeEnv == 'production') {
  app.use(publicfs);
}

// Allow access only to our application
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', appUrl);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');

  next();
});

app.listen(port, host, (err) => {
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
