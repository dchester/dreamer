var http = require('http');
var Table = require('cli-table');

exports.initialize = function(args) {

	var app = args.app;
	var dream = args.dream;

	return {

		'run': function() {

			http.createServer(app).listen(app.get('port'), app.get('host'), function() {
				console.log("Server listening on port " + app.get('port') + "...");
			});
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
					.success(function() { console.log("success") })
					.error(function(error) { console.log("error: " + error) });
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
		}
	};
};

