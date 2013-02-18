var fs = require('fs');
var util = require('util');
var marked = require('marked');
var Sequelize = require('sequelize');
var config = require('config');

var schema = require('../lib/schema');

var inputFile = process.argv[2];
var input = String(fs.readFileSync(inputFile));

var db = new Sequelize(config.db.database, config.db.username, config.db.password, {
	dialect: config.db.dialect,
	storage: config.db.storage
});

var tables = schema.parse(input);
var models = schema.models({ schema: tables, db: db });

db.sync()
	.success( function() { console.log("success") } )
	.error( function(error) { console.log("error: " + error) } );

