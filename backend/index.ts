import 'reflect-metadata';
import http from 'http';
import https from 'https';
import fs from 'fs';
import app from './app';

https
  .createServer(
    {
      key: fs.readFileSync('./cert/CA/localhost/localhost.decrypted.key'),
      cert: fs.readFileSync('./cert/CA/localhost/localhost.crt'),
      passphrase: 'YOUR PASSPHRASE HERE',
    },
    app
  )
  .listen(443, () => {
    console.log(
      `[blog-api]: Blog API Server is running at https://localhost:${443}`
    );
  });

// listen to http
http.createServer(app).listen(8000, () => {
  console.log(
    `[blog-api]: Blog API Server is running at http://localhost:${8000}`
  );
});

export default app;
