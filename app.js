const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const resError = require('./service/resError');

const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const UploadRouter = require('./routes/upload');

const app = express();

require('./connections');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(postsRouter);
app.use(usersRouter);
app.use('/upload', UploadRouter);

app.use(function (req, res, next) {
  res.status(404).json({
    status: 'error',
    message: '無此路由資訊',
  });
});

app.use(function (err, req, res, next) {
  // dev
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return resError.resErrorDev(err, res);
  }
  // production
  if (err.name === 'ValidationError') {
    err.message = '資料欄位未填寫正確，請重新輸入！';
    err.isOperational = true;
    return resError.resErrorProd(err, res);
  }
  resError.resErrorProd(err, res);
});

module.exports = app;
