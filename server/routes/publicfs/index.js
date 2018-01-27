import express from 'express';
import assets from './assets'
import dirs from './dirs';

// This plug-in should be used in production only when we want to serve files generated
// in the 'build' dir.

const router = express.Router();

router.use(assets);
router.use(dirs);

router.get('/', (req, res) => {
  res.sendFile('index.html', { root: process.cwd() });
});

export default router;
