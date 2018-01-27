import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import { twitter, publicfs } from './routes';

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
app.use('/api', twitter);

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
