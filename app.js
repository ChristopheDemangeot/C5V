var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var help = require('./routes/help');
var dashboard = require('./routes/dashboard');
var dataentry = require('./routes/dataentry');

var tribes = require('./routes/tribes');
var users = require('./routes/users');

var techinfo = require('./routes/techinfo');

var api = require('./routes/api');

var app = express();

var blockchain = require('./blockchain');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/index', index);
app.use('/help', help);
app.use('/dashboard', dashboard);
app.use('/dataentry', dataentry);

app.use('/tribes', tribes);
app.use('/users', users);

app.use('/techinfo', techinfo);

app.use('/api', api);

app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var dataFile = req.files.dataFile;
  
  var appDir = path.dirname(require.main.filename);

  // Use the mv() method to place the file somewhere on your server
  dataFile.mv('C:/CODE/Blockchain/C5V/public/upload/' + 'filename.jpg', function(err) {
    if (err)
      return res.status(500).send(err);
 
    res.send('File uploaded!');
  });
});

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