'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs');
const chalk = require('chalk');
const execa = require('execa');
const path = require('path');
const webpack = require('webpack');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  choosePort,
  createCompiler,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../config/paths');
const config = require('../config/webpack.config.dev');

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.serverIndexJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return;
    }
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name + ' server';
    const urls = prepareUrls(protocol, HOST, port);
    const compiler = createCompiler(webpack, config.server, appName, urls, useYarn);

    if (isInteractive) {
      clearConsole();
      console.log(chalk.cyan('Starting the development server...\n'));
    }

    let serverProcess, killingServerProcess;
    // Will be invoked whenever Webpack has finished recompiling the bundle
    compiler.watch({
      aggregateTimeout: 300,
      poll: true
    }, (err, stats) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      const serverOutputDir = stats.compilation.outputOptions.path;
      const serverOutputFileName = stats.compilation.outputOptions.filename;
      const serverOutputFile = path.resolve(serverOutputDir, serverOutputFileName);

      // Create symlink to node_modules if not yet created.
      // Once finished, start the server
      const symlinkPath = path.resolve(serverOutputDir, 'node_modules');
      fs.symlink(paths.appNodeModules, symlinkPath, (err) => {
        if (err && err.code != 'EEXIST') {
          console.error(err);
          process.exit(1);
        }

        // If server is already running, kill it, and run it again
        if (serverProcess) {
          killingServerProcess = new Promise((resolve) => {
            serverProcess.catch(() => resolve());
            serverProcess.kill('SIGHUP');
          });
        }
        else {
          killingServerProcess = Promise.resolve();
        }

        // We need to wait for the SIGHUP signal to be sent and only after we may proceed
        killingServerProcess.then(() => {
          serverProcess = execa('node', [serverOutputFile], {
            cwd: process.cwd(),
            stdio: 'inherit',
            env: Object.assign({
              WEBPACK_CONFIG: path.resolve(
                __dirname, '../config/webpack.config.dev.js'
              ) + '[app]',
              NODE_ENV: 'development',
              APP_URL: `http://${HOST}:3000`,
            }, process.env, {
              HOST: HOST,
              PORT: port,
            })
          });
        });
      });
    });

    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        if (serverProcess) {
          serverProcess.kill('SIGHUP');
        }

        process.exit();
      });
    });
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
