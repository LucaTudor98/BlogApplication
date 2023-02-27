export default interface IImageService {
  update(
    oldImageFileName: string | undefined,
    newImageFileName: string | undefined
  ): void;

  delete(path: string | undefined): void;
}
