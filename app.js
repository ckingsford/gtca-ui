
/**
 * Module dependencies.
 */

add_ids = function(h) {
  for (var id in h) {
    h[id]['id'] = id
  }
  return h;
}

to_a = function(h) {
  var l = []
  for (var id in h) {
    l.push(h[id]);
  }
  return l;
}

var express = require('express')
  , routes = require('./routes')
  , patient = require('./routes/patient')
  , patient_mysql = require('./routes/patient_mysql.js')
  , disease_prediction = require('./routes/disease_prediction')
  , disease_prediction_mysql = require('./routes/disease_prediction_mysql')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
// app.get('/patients', patient.list);
app.get('/patients', patient_mysql.list);
//app.get('/patients/:id', patient.get);
app.get('/patients/:id', patient_mysql.get);
//app.get('/disease_predictions', disease_prediction.list);
app.get('/disease_predictions', disease_prediction_mysql.list);
//app.get('/disease_predictions/:id', disease_prediction.get);
app.get('/disease_predictions/:id', disease_prediction_mysql.get);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


//"C:\Program Files\nodejs\node.exe" app.js

// Server runs at: http://127.0.0.1:3000/#

// dependencies:
//npm install express
//npm install mysql@2.0.0-alpha7  (https://github.com/felixge/node-mysql)

//for debugging purposes:
//npm install -g node-inspector  (https://github.com/dannycoates/node-inspector)

//debugging:
//1.start application in debug mode:
//node --debug your/node/program.js
//2. start the node-inspector
//node-inspector
//3. go to http://127.0.0.1:8080/debug?port=5858

