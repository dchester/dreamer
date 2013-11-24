var http = require('http');
var path = require('path');
var Sequelize = require('sequelize');
var config = require('config');

var express = require('express');
var app = express();

var dreamer = require('../lib/dreamer');

var command = process.argv[2];
var parameter = process.argv[3];

var server = config.server || {};

app.configure(function(){
	app.set('port', process.env.PORT || server.port || 3000);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

console.log(config.database);

var dream = dreamer.initialize({
	app: app,
	database: config.database
});

var commands = require('./lib/commands').initialize({
	app: app,
	dream: dream
});

var usage = function() {
	var commandsList = '[' + Object.keys(commands).join('|') + ']';
	console.log("usage: dreamer " + commandsList);
	process.exit();
}

if (commands[command]) commands[command](parameter);
else usage();

