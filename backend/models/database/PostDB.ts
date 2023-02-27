import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import UserDb from './userDb';
import CommentDB from './CommentDB';

@Entity()
class PostDB {
  @PrimaryGeneratedColumn()
  id?: number;

  @OneToMany(() => CommentDB, (comment) => comment.post)
  comments?: CommentDB[];

  @Column('text')
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => UserDb, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author' })
  user?: UserDb;

  @Column('integer')
  author: number;

  @Column('text', { nullable: true })
  image?: string;

  @CreateDateColumn()
  dateCreated?: Date;

  @UpdateDateColumn()
  dateModified?: Date;

  constructor(id: number, title: string, content: string, author: number) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
  }
}

export default PostDB;
