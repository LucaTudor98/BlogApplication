import express from 'express';
import cors from 'cors';
import routerUsers from './routing/UsersRouting';
import routerComments from './routing/CommentsRouting';
import routerPosts from './routing/PostsRouting';
import routerSetupDb from './routing/SetupRouting';
import routerAuth from './routing/AuthRouting';
import routerImages from './routing/ImageRouting';
import 'reflect-metadata';
import Services from './services/services';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.use(express.json());

const db = Services.getDBService();

if (db.isConfigured()) {
  db.connect();
}

app.get('/', (req, res, next) => {
  if (!db.isConfigured()) {
    res.redirect('setup');
  }
  next();
});

app.use('/api/images', express.static('images'));
app.use('/api/auth', routerAuth);
app.use('/setup', routerSetupDb);
app.use('/api/images', routerImages);
app.use('/api/comments/', routerComments);
app.use('/api/users/', routerUsers);
app.use('/api/posts/', routerPosts);

export default app;
