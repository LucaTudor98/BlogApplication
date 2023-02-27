export default interface IPost {
  id: number;

  title: string;

  content: string;

  dateCreated: Date;

  dateModified: Date;

  authorName: string;

  numberOfComments: number;

  image?: string;
}

export interface PostAddInput {
  title: string;

  content: string;

  fileName?: string;
}

export interface PostUpdateInput {
  id: number;

  title: string;

  content: string;

  fileName?: string;
}

export interface PostsGetInput {
  page: number;

  limit: number;

  search: string;
}

export interface PaginatedPosts {
  hasNext: boolean;

  hasPrevious: boolean;

  result: IPost[];
}
