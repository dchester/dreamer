var http = require('http');
var Table = require('cli-table');
var Fixtures = require('./fixtures');

exports.initialize = function(args) {

	var app = args.app;
	var dream = args.dream;

	return {

		'run': function() {

			var server = http.createServer(app);

			server.listen(app.get('port'), app.get('host'), function() {
				console.log("Server listening on port " + app.get('port') + "...");
			});

			return server;
		},

		'resources': function(prefix) {

			var table = new Table({
				head: ['method', 'path', 'action', 'model']
			});

			dream.resources.forEach(function(resource) {
				if (prefix && !resource.path.match(new RegExp("^" + prefix))) return;
				table.push([resource.method, resource.path, resource.action, resource.model]);
			});

			console.log(table.toString());
		},

		'resources-config': function() {
			console.log(JSON.stringify(dream.resources, null, 4));
		},

		'schema': function(tableName) {

			dream.schema.forEach(function(scheme) {

				var table = new Table({
					head: [scheme.name, 'type', 'extra'],
					style: { compact: true, 'padding-left': 1, 'padding-right': 1 }
				});

				scheme.columns.forEach(function(column) {
					table.push([column.name, column.dataType, column.attributes.join(',')]);
				});

				console.log(table.toString());
			})
		},

		'schema-config': function() {
			console.log(JSON.stringify(dream.schema, null, 4));
		},

		'schema-sync': function(tableName) {

			if (tableName) {
				var tables = dream.db.daoFactoryManager.daos;
				var table = tables.filter(function(t) { return t.tableName == tableName }).shift();
				if (table) {
					table.sync()
						.success(function() { console.log("success") })
						.error(function(error) { console.log("error: " + error) });
				} else {
					console.log("couldn't find table: " + tableName);
				}

			} else {

				dream.db.sync()
					.success(function() { addIndexes() })
					.error(function(error) { console.log("error: " + error) });

				function addIndexes() {
					var queryInterface = dream.db.getQueryInterface();

					dream.schema.forEach(function(scheme) {
						if (!scheme.attributes) return;
						scheme.attributes.forEach(function(pair) {
							var key = Object.keys(pair)[0];
							var value = pair[key];
							if (key == 'unique' || key == 'index') {
								var columnNames = value.split(/\s*,\s*/);
								var options = {};
								if (key == 'unique') options.indicesType = 'UNIQUE';
								queryInterface.addIndex(scheme.name, columnNames, options)
									.error(function(err) { console.warn("error adding index: " + err) })
							}
						});
					});

				}
			}
		},

		'schema-dump': function(tableName) {

			var tables = dream.db.daoFactoryManager.daos;

			if (tableName) {
				tables = tables.filter(function(t) { return t.tableName == tableName });
			}

			tables.forEach(function(table) {

				var sql = dream.db.queryInterface.QueryGenerator.createTableQuery(
					table.tableName,
					table.attributes
				);

				// format for bkovacevich!
				sql = sql.replace(/\, /g, ",\n    ");
				sql = sql.replace(/\((`\w+` )/g, "(\n    \$1");
				sql = sql.replace(/\)[^)]*;/g, "\n);");

				console.log(sql);
			});
		},

		'fixtures': function(tableName) {

			var fixtures = dream.fixtures
				.filter(function(t) { return !tableName || t.tableName == tableName });

			fixtures.forEach(function(scheme) {

				var tableName = scheme.tableName;

				var columnNames = Object.keys(scheme.rows[0]);

				var table = new Table({
					head: columnNames,
					style: { compact: true, 'padding-left': 1, 'padding-right': 1 }
				});

				scheme.rows.forEach(function(row) {
					var values = [];
					columnNames.forEach(function(name) {
						values.push(row[name]);
					});
					table.push(values);
				});

				console.log(tableName);
				console.log(table.toString());
			});
		},

		'fixtures-config': function(tableName) {

			var fixtures = dream.fixtures
				.filter(function(t) { return !tableName || t.tableName == tableName });

			console.log(fixtures);
		},

		'fixtures-sync': function(tableName) {

			var fixtures = dream.fixtures
				.filter(function(t) { return !tableName || t.tableName == tableName });

			Fixtures.sync(dream, fixtures);

		}
	};
};

