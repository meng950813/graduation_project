var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session=require('express-session');


var engine = require("ejs-locals");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
/* render html */
// app.engine('.html',require('ejs').__express);
// app.set('view engine', 'html');

/* render ejs */
app.engine("ejs",engine);
app.set('view engine',"ejs");

/* use page cache */
app.set("view cache",true);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true}));

// 默认路由 ：登录跳转
var login = require('./routes/index');
// var student = require('./routes/student');


/* 设置路由 */
app.use('/', login);
// app.use('/stu', student);
app.use('/choose', require('./routes/stu_1_choose'));
app.use('/task', require('./routes/stu_2_task'));
app.use('/open', require('./routes/stu_3_open'));
app.use('/translate', require('./routes/stu_4_translate'));
app.use('/middle', require('./routes/stu_5_middle'));
app.use('/draft', require('./routes/stu_6_draft'));
app.use('/paper', require('./routes/stu_7_paper'));
app.use('/comments', require('./routes/commets_to_tutor'));
app.use('/reply', require('./routes/reply_group'));
app.use('/appraise', require('./routes/appraise_group'));
app.use('/score', require('./routes/score'));
// app.use('/upload', require('./routes/upload'));
app.use('/tutor', require('./routes/tutor'));
// app.use('/admin', require('./routes/admin'));

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

// app.listen(8000,function(req,res){
// 	console.log("server start");
// 	// res.send("test");
// })

module.exports = app;
