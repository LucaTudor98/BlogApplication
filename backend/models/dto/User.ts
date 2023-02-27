export default class User {
  id: number;

  name: string;

  email: string;

  isAdmin: boolean;

  password: string;

  dateCreated: Date;

  dateModified: Date;

  imgPath?: string;

  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    isAdmin: boolean,
    imgPath?: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isAdmin = isAdmin;
    this.password = password;
    this.dateCreated = new Date();
    this.dateModified = new Date();
    this.imgPath = imgPath;
  }
}
