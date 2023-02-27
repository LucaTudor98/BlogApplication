class Post {
  id: number;

  title: string;

  content: string;

  author: number;

  dateCreated: Date;

  dateModified: Date;

  authorName?: string;

  numberOfComments?: number;

  image?: string;

  constructor(
    id: number,
    title: string,
    content: string,
    author: number,
    dateCreated: Date,
    dateModified: Date,
    image?: string
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
    this.dateCreated = dateCreated;
    this.dateModified = dateModified;
    this.image = image;
  }
}

export default Post;
