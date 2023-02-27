import express from 'express';
import multer from 'multer';
import path from 'path';
import checkDbConfig from '../middleware/databaseConfig';

const routerImages = express.Router();
routerImages.use(checkDbConfig);

const storage = multer.diskStorage({
  destination: 'images/',
  filename(req, file, cb) {
    cb(null, `Image-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100000000 },
});

routerImages.post('/upload', upload.single('image'), async (req, res) => {
  console.log(req.file);
  if (req.file) {
    if (!req.file.mimetype.includes('image')) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    return res
      .status(200)
      .json({ message: 'File saved successfully', path: req.file.filename });
  }

  return res.status(400).json({ message: 'Could not save file' });
});

export default routerImages;
