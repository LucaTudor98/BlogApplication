export default interface IPaginatedUsers {
  hasNext: boolean;

  hasPrevious: boolean;

  result: IUser[];
}

export interface IUser {
  id: number;

  name: string;

  email: string;

  password?: string;

  dateCreated: Date;

  dateModified: Date;

  isAdmin: boolean;

  imgPath?: string;
}

export interface IUserGetAll {
  page: number;

  limit: number;

  name: string;
}

export interface IUserAdd {
  name: string;

  email: string;

  password: string;

  isAdmin: boolean;

  avatar?: File | null;
}

export interface IUserAddImg {
  id: number;

  avatar: FormData;
}

export interface IUserUpdate {
  id: number;

  name: string;

  email: string;

  password: string | undefined;

  isAdmin: boolean;
}
