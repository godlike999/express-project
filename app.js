var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 引入sessoin模块
var session = require('express-session');
/*
1.静态资源
2.路由
3.模板
4.错误提示
*/

// 引入了路由
var index = require('./routes/index');
var users = require('./routes/users');
var comment = require('./routes/comment');
var music = require('./routes/music');
// 创建一个express的app对象
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); // path路径，指定了视图的模板页就在views目录下
app.set('view engine', 'ejs'); //指定模板的类型是ejs类型,jade...

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //设置public静态资源文件路径

// session配置
app.use(session({
  secret: 'recommend 128 bytes random string',
  cookie: {
    maxAge: 20 * 60 * 1000
  }, // 20分钟 ,毫秒为单位
  resave: true, // 如果来了一个新的请求，不管原来存在不存在，重新存储一个
  saveUninitialized: true // 存储一些未初始化的session内容
}))

// 使用路由
app.use('/', index);
app.use('/users', users);
app.use('/comment', comment);
app.use('/music', music);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;