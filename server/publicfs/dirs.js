import express from 'express';
import fs from 'fs';

const router = express.Router();

fs.readdirSync(process.cwd())
  .filter((fsname) => {
    return fs.statSync(`${process.cwd()}/${fsname}`).isDirectory();
  })
  .forEach((dirname) => {
    router.get(`/${dirname}/*`, (req, res) => {
      router.use(express.static(`${process.cwd()}/${dirname}`));
    });
  });

export default router;
