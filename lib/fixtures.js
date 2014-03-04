var marked = require('marked');
var Sequelize = require('sequelize');
var async = require('async');

exports.parse = function(args) {

	args = args || {};

	var input = args.markdown;

	var lexer = new marked.Lexer;
	var tokens = lexer.lex(input);

	var rows = [];
	var activeTable = null;

	tokens.forEach(function(token, index) {

		if (token.type == 'heading' && token.depth == 3) {

			var name = token.text
				.split(/\s+/)
				.map(function(w) { return w.toLowerCase() })
				.join("_");

			activeTable = { name: name };

		} else if (token.type == 'table') {

			var table = token;
			var header = table.header;

			table.cells.forEach(function(cell) {
				var row = {
					tableName: activeTable.name,
					values: {}
				};
				cell.forEach(function(value, index) {
					row.values[header[index]] = value;
				});
				rows.push(row);
			});
		}
	});

	var tablesMap = {};

	rows.forEach(function(row) {
		tablesMap[row.tableName] = tablesMap[row.tableName] || [];
		tablesMap[row.tableName].push(row.values);
	});

	var tables = [];

	Object.keys(tablesMap).forEach(function(tableName) {
		tables.push({
			rows: tablesMap[tableName],
			tableName: tableName
		});
	});

	return tables;
};

exports.sync = function(dream, fixtures, callback) {

	callback = callback || function() {};

	var models = dream.models;
	var fixtures = dream.fixtures;

	async.each(fixtures, function(table, callback) {

		var tableName = table.tableName;
		var model = models[tableName];

		model.count().success(function(count) {
			if (count) {
				console.warn("skipping fixtures for already populated table " + tableName);
				return;
			}
			model.bulkCreate(table.rows)
				.error(console.warn)
				.success(function() {
					console.log("inserted fixtures for table " + tableName);
					callback();
				});
		});

	}, callback);
};

