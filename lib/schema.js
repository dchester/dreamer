var marked = require('marked');
var Sequelize = require('sequelize');

var Columns = require('./columns');

exports.parse = function(args) {

	args = args || {};

	var input = args.markdown;

	var lexer = new marked.Lexer();
	var tokens = lexer.lex(input);

	var tables = [];
	var activeTable = null;

	tokens.forEach(function(token, index) {

		if (token.type == 'heading' && token.depth == 3) {

			var name = token.text
				.split(/\s+/)
				.map(function(w) { return w.toLowerCase() })
				.join("_");

			activeTable = { name: name };

		} else if (activeTable && token.type == 'code') {

			var columnLines = token.text.split(/\n/m);
			activeTable.columns = [];

			columnLines.forEach(function(columnLine) {

				var matches = columnLine.match(/(\w+)(?:\s+([\w,]+))?/);

				var name = matches[1];
				var attributesString = matches[2];

				var attributes = attributesString ? attributesString.split(',') : [];

				activeTable.columns.push({
					name: name,
					dataType: Columns.guessDataType(name),
					attributes: attributes
				});
			});

			tables.push(activeTable);
			activeTable = null;
		}
	});

	return tables;
};

var attributesMap = {
	string: function(attributes) {
		attributes.type = Sequelize.STRING;
	},
	text: function(attributes) {
		attributes.type = Sequelize.TEXT;
	},
	integer: function(attributes) {
		attributes.type = Sequelize.INTEGER;
	},
	date: function(attributes) {
		attributes.type = Sequelize.DATETIME;
	},
	boolean: function(attributes) {
		attributes.type = Sequelize.BOOLEAN;
	},
	float: function(attributes) {
		attributes.type = Sequelize.FLOAT;
	},
	unique: function(attributes) {
		attributes.unique = true;
	},
	nullable: function(attributes) {
		attributes.allowNull = true;
	},
	email: function(attributes) {
		attributes.validate = attributes.validate || {};
		attributes.validate.isEmail = true;
	},
	url: function(attributes) {
		attributes.validate = attributes.validate || {};
		attributes.validate.isUrl = true;
	},
	default: function(attributes, value) {
		attributes.defaultValue = value;
	},
	min: function(attributes, value) {
		attributes.validate = attributes.validate || {};
		attributes.min = value;
	},
	max: function(attributes, value) {
		attributes.validate = attributes.validate || {};
		attributes.max = value;
	}
};

exports.models = function(args) {

	var schema = args.schema;
	var db = args.db;

	var models = {};

	schema.forEach(function(table) {

		var columns = {};

		table.columns.forEach(function(column) {

			var attributes = {
				type: Sequelize[column.dataType.toUpperCase()],
				allowNull: false
			};

			column.attributes.forEach(function(attribute) {

				var components = attribute.split('=');

				var attribute = components[0];
				var value = components[1];

				if (attributesMap[attribute]) {
					attributesMap[attribute](attributes, value);
				}
			});

			columns[column.name] = attributes;
			//console.log(column.name, attributes);
		});

		var model = db.define(table.name, columns);
		models[table.name] = model;
	});

	return models;
};

