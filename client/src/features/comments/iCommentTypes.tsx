export default interface IComment {
  id: number;

  postId: number;

  parentId: number;

  text: string;

  author: number;

  authorName?: string;

  dateCreated: Date;

  dateModified: Date;

  replies?: IComment[];

  replyCount?: string;

  authorAvatarPath?: string;
}

export interface ICommentGetAll {
  postId: number;
  page: number;
  limit: number;
  search: string;
}

export interface IPaginatedComments {
  hasNext: boolean;

  hasPrevious: boolean;

  result: IComment[];
}

export interface ICommentAdd {
  postId: number;

  parentId: number | null;

  text: string;

  authorName?: string;

  authorAvatarPath?: string;

  replyCount?: string;
}

export interface ICommentUpdate {
  id: number;

  text: string;

  postId: number;

  parentId: number;
}

export interface ICommentPostAndParent {
  postId: number;

  parentId: number;

  page: number;

  limit: number;
}

export interface ICommentPostAndName {
  postId: number;

  name: string;

  page: number;

  limit: number;
}

export interface ICommentDelete {
  id: number;

  parentId: number | null;
}
