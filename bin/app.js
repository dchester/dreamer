var fs = require('fs');
var path = require('path');
var util = require('util');
var http = require('http');
var marked = require('marked');
var Sequelize = require('sequelize');
var config = require('config');
var express = require('express');

var dreamer = require('../lib/dreamer');

var app = express();

var db = new Sequelize(config.db.database, config.db.username, config.db.password, {
	dialect: config.db.dialect,
	storage: config.db.storage
});

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('__SECRET__'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

dreamer.initialize({ db: db, app: app });

http.createServer(app).listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});
