require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const routes = require('./routers/router');
const cors = require('cors');

const port = 3000;

app.set('trust proxy', 1);

app.use(
  session({
    secret: 'toDoLost',
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //   sameSite: 'none',
    //   secure: true,
    // },
  })
);

// app.use((req, res, next) => {
//   console.log(`指定路由${req.url}`);
//   console.log(req.sessionID);
//   next();
// });

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', routes);
app.get('/player/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//jian修改
//錯誤處理
app.use((err, req, res, next) => {
  console.log('無法解析內容', err);
  return res.status(400).json({ Status: false, error: '無法解析內容' });
});

// test pssh
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
