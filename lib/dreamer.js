var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var armrest = require('armrest');

var Fixtures = require('./fixtures');
var Schema = require('./schema');
var Resources = require('./resources');
var Commands = require('./commands');

var defaultPort = 3000;
var defaultHost = '0.0.0.0';

var Dreamer = function(args) {

	this.initialize = function(args) {

		this.models = args.models;
		this.schema = args.schema;
		this.resources = args.resources;
		this.db = args.db;
		this.cwd = args.cwd || process.cwd();

		this.app = args.app || this._error("dreamer needs an app");

		this.db = this._loadDatabase(args.database);
		this.schema = this._loadSchema(args);
		this.models = this._loadModels(args);
		this.resources = this._loadResources(args);
		this.fixtures = this._loadFixtures(args);

		this._loadExtensions();
		this._loadAPI();

		Resources.route({
			resources: this.resources,
			models: this.models,
			app: this.app
		});

		this.commands = Commands.initialize({
			app: this.app,
			dream: this
		});
	};

	this.dream = function() {

		var command = process.argv[2];
		var parameter = process.argv[3];

		var usage = function() {
			var commandsList = '[' + Object.keys(this.commands).join('|') + ']';
			console.log("usage: dreamer " + commandsList);
			process.exit();
		}.bind(this);

		if (this.commands[command]) {
			this.commands[command](parameter);
		} else {
			usage();
		}
	};

	this._loadAPI = function() {

		if (!this.app.get('host')) this.app.set('host', defaultHost);
		if (!this.app.get('port')) this.app.set('port', defaultPort);

		var host = this.app.get('host');
		var port = this.app.get('port');

		this.api = armrest.client( host + ':' + port );
	};

	this._loadDatabase = function(args) {

		if (this.database) return this.database;

		if (!args) {
			console.warn("coudn't find database config");
			return;
		}

		var db_opts = {
			dialect: process.env.DATABASE_DIALECT || args.dialect,
			storage: args.storage,
			define: { underscored: true, timestamps: false, freezeTableName: true }
		};

		/* allow for custom db host and port */
		["port", "host", "logging"].map(function(db_arg) {
			if (db_arg in args) {
				db_opts[db_arg] = args[db_arg];
			}
		});

		if (typeof args.define == 'object') {
			Object.keys(args.define).forEach(function(key) {
				db_opts.define[key] = args.define[key];
			});
		}

		var db = new Sequelize(
			args.database,
			args.username,
			args.password,
			db_opts
		);
		return db;
	};

	this._loadModels = function(args) {
		if (this.models) return this.models;
		var schema = this._loadSchema(args);
		var models = Schema.models({ schema: schema, db: this.db });
		return models;
	};

	this._loadSchema = function(args) {

		if (typeof this.schema == 'object') {
			return this.schema;
		} else if (typeof this.schema == 'string') {
			var schemaFile = this.schema;
		} else {
			var schemaFile = path.join(this.cwd, '/spec/schema.md');
		}

		var schemaMarkdown = fs.readFileSync(schemaFile, 'utf8');
		var schema = Schema.parse({ markdown: schemaMarkdown });
		return schema;
	};

	this._loadFixtures = function(args) {

		if (typeof this.fixtures == 'object') {
			return this.fixtures;
		} else if (typeof this.fixtures == 'string') {
			var fixturesFile = this.fixtures;
			var fixturesFileProvided = true;
		} else {
			var fixturesFile = path.join(this.cwd, '/spec/fixtures.md');
		}

		try {
			var fixturesMarkdown = fs.readFileSync(fixturesFile, 'utf8');
			var fixtures = Fixtures.parse({ markdown: fixturesMarkdown });
		} catch (e) {
			if (fixturesFileProvided) console.warn("couldn't read fixtures file: " + fixturesFile);
		}

		return fixtures || [];
	};

	this._loadResources = function(args) {

		if (typeof this.resources == 'object') {
			return this.resources;
		} else if (typeof this.resources == 'string') {
			var resourcesFile = this.resources;
		} else {
			var resourcesFile = path.join(this.cwd, '/spec/resources.md');
		}

		var resourcesMarkdown = fs.readFileSync(resourcesFile, 'utf8');
		var resources = Resources.parse({ markdown: resourcesMarkdown });
		return resources;
	};

	this._loadExtensions = function(args) {

		var extensionsDir = 'extensions';
		var hooksDir = path.join(this.cwd, extensionsDir);

		if (!fs.existsSync(hooksDir)) return;

		fs.readdir(hooksDir, function(err, files) {
			files.forEach(function(file) {
				if (!file.match(/\.js$/)) return;
				try {
					console.log("loading extension " + file);
					var f = require(path.join(this.cwd, extensionsDir, file));
					f(this);

				} catch(e) {
					console.warn("error requiring " + file + ":" + e)
				}

			}.bind(this));

		}.bind(this));
	};

	this._error = function(message) {
		throw new Error(message);
	};

	this.initialize(args);
};

exports.initialize = function(args) {
	var instance = new Dreamer(args);
	exports.instance = instance;
	return instance;
}

exports.Dreamer = Dreamer;
exports.Resources = Resources;
exports.Schema = Schema;
exports.Fixtures = Fixtures;

