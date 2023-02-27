import fs from 'fs';
import multer from 'multer';

const dir = '/images';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`);
  },
});

const saveAvatar = multer({ storage }).single('avatar');

export default saveAvatar;
