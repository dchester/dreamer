var fs = require('fs');
var fixtures = require('../lib/fixtures');

exports.parse = function(test) {

	fs.readFile(__dirname + "/data/fixtures.md", 'utf8', function(err, contents) {

		var tables = fixtures.parse({ markdown: contents });

		test.equal(tables.length, 3);

		var table = tables[0];
		var row = table.rows[0];

		test.equal(table.tableName, 'users');
		test.equal(row.username, 'bob');
		test.equal(row.is_superuser, '1');

		test.done();
	});
};

