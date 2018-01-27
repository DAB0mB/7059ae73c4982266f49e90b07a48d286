import express from 'express';
import fs from 'fs';
import * as _ from 'lodash';
import path from 'path';
import qs from 'qs';

/**
  Routes files according to asset manifest
 */

const router = express.Router();
const assetsManifestFile = path.resolve(process.cwd(), 'asset-manifest.json');

try {
  fs.statSync(assetsManifestFile);

  const assetsManifest = JSON.parse(fs.readFileSync(assetsManifestFile));

  Object.keys(assetsManifest).forEach((assetPath) => {
    const [alias, queryStr] = assetPath.split('?');
    const params = qs.parse(queryStr);
    const realPath = assetsManifest[alias];

    router.get(`/${alias}`, (req, res) => {
      if (_.isEqual(req.params, params)) {
        req.sendFile(realPath, { root: process.cwd() });
      }
      else {
        req.sendFile(alias, { root: process.cwd() });
      }
    });
  });
}
catch (err) {
  // Assets manifest doesn't exist
}

export default router;
