var marked = require('marked');
var Sequelize = require('sequelize');

var attributesMap = require('./attributes');
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

				var matches = columnLine.match(/(\w+)(?:\s+([()\w,=\.\|]+))?/);

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

		} else if (activeTable && tokens[index-1].type == 'blockquote_start') {

			var attributes = [];
			var attributeLines = token.text.split(/\n/m);

			attributeLines.forEach(function(line) {
				var pair = line.split(/\s*\:\s*/);
				var attribute = {};
				attribute[pair[0]] = pair[1];
				attributes.push(attribute);
			});

			activeTable.attributes = attributes;
		}
	});

	return tables;
};


exports.models = function(args) {

	var schema = args.schema;
	var db = args.db;

	var models = {};

	schema.forEach(function(table) {

		var columns = {};
		var associations = [];

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

			attributes.type = Sequelize[column.dataType.toUpperCase()];

			if (column.association) {
				associations.push(column.association);
			}

			columns[column.name] = attributes;

		});

		var model = db.define(table.name, columns);
		model._dreamer = { associations: associations };
		models[table.name] = model;

	});

	return models;
};

