/* eslint-disable no-use-before-define */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import PostDB from './PostDB';
import UserDb from './userDb';

@Entity()
class CommentEntityDB {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  postId: number;

  @ManyToOne(() => PostDB, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post?: PostDB;

  @ManyToOne(() => CommentEntityDB, (comment) => comment.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  @Column('integer', { nullable: true })
  parentId: number;

  @Column('varchar', { length: 2500 })
  text: string;

  @ManyToOne(() => UserDb, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author' })
  user?: UserDb;

  @Column('integer')
  author: number;

  @CreateDateColumn()
  dateCreated?: Date;

  @UpdateDateColumn()
  dateModified?: Date;

  @ManyToOne(() => CommentEntityDB, (comment) => comment.children)
  parent?: CommentEntityDB;

  @OneToMany(() => CommentEntityDB, (comment) => comment.parent)
  children?: CommentEntityDB[];

  constructor(
    id: number,
    postId: number,
    parentId: number,
    text: string,
    author: number
  ) {
    this.id = id;
    this.postId = postId;
    this.parentId = parentId;
    this.text = text;
    this.author = author;
    this.dateCreated = new Date();
    this.dateModified = new Date();
  }
}
export default CommentEntityDB;
