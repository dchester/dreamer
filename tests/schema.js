var fs = require('fs');
var schema = require('../lib/schema');

exports.parse = function(test) {

	fs.readFile(__dirname + "/data/schema.md", 'utf8', function(err, contents) {

		var tables = schema.parse({ markdown: contents });

		var table = tables.shift();

		test.equal(table.name, 'collection_fields');
		test.equal(table.columns.length, 7);

		test.equal(table.columns[0].name, "title");
		test.equal(table.columns[0].dataType, "string");

		test.equal(table.columns[1].name, "create_time");
		test.equal(table.columns[1].dataType, "date");
		test.equal(table.columns[1].attributes[0], "default=now");

		test.equal(table.columns[2].name, "status");
		test.equal(table.columns[2].dataType, "string");
		test.equal(table.columns[2].attributes[0], "enum=(draft|published|deleted)");

		test.equal(table.attributes.length, 2);
		test.deepEqual(table.attributes, [{ unique: 'title,index' }, { charset: 'utf-8' }]);

		test.done();
	});
};

