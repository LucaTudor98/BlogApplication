/* eslint-disable class-methods-use-this */
import fs from 'fs';
import path from 'path';
import IImageService from './interfaces/IImageService';

export default class ImageService implements IImageService {
  update(
    oldImageFileName: string | undefined,
    newImageFileName: string | undefined
  ): void {
    if (
      newImageFileName !== oldImageFileName &&
      oldImageFileName !== undefined &&
      oldImageFileName !== ''
    ) {
      this.delete(oldImageFileName);
    }
  }

  delete(fileName: string | undefined): void {
    if (!fileName || fileName === '') {
      return;
    }

    const filePath = path.join(__dirname, '../images', fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(path.join(__dirname, '../images', fileName));
    }
  }
}
