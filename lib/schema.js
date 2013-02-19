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
	string: function(column) {
		column.dataType = 'string';
	},
	text: function(column) {
		column.dataType = 'text';
	},
	integer: function(column) {
		column.dataType = 'integer';
	},
	date: function(column) {
		column.dataType = 'date';
	},
	boolean: function(column) {
		column.dataType = 'boolean';
	},
	float: function(column) {
		column.dataType = 'float';
	},
	unique: function(column, attributes) {
		attributes.unique = true;
	},
	nullable: function(column, attributes) {
		attributes.allowNull = true;
	},
	alpha: function(column, attributes) {
		attributes.validate = attributes.validate || {};
		attributes.validate.isAlpha = true;
	},
	email: function(column, attributes) {
		attributes.validate = attributes.validate || {};
		attributes.validate.isEmail = true;
	},
	url: function(column, attributes) {
		attributes.validate = attributes.validate || {};
		attributes.validate.isUrl = true;
	},
	default: function(column, attributes, value) {
		attributes.defaultValue = value;
	},
	min: function(column, attributes, value) {
		attributes.validate = attributes.validate || {};
		attributes.min = value;
	},
	max: function(column, attributes, value) {
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
				allowNull: false
			};

			var errorAttributes = [];

			column.attributes.forEach(function(attribute, index) {

				var components = attribute.split('=');

				var attribute = components[0];
				var value = components[1];

				if (attributesMap[attribute]) {
					attributesMap[attribute](column, attributes, value);
				} else {
					errorAttributes.push(attribute);
					console.warn("couldn't handle extra column attribute: " + attribute);
				}
			});

			column.attributes = column.attributes
				.filter(function(a) { return errorAttributes.indexOf(a) == -1 });

			attributes.type = Sequelize[column.dataType.toUpperCase()],

			columns[column.name] = attributes;
		});

		var model = db.define(table.name, columns);
		models[table.name] = model;
	});

	return models;
};

