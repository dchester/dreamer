var fs = require('fs');
var path = require('path');
var config = require('config');
var Sequelize = require('sequelize');

var Schema = require('./schema');
var Resources = require('./resources');

var instance;

var Dreamer = function(args) {

	this.initialize = function(args) {

		this.models = args.models;
		this.schema = args.schema;
		this.resources = args.resources;
		this.db = args.db;
		this.cwd = args.cwd || process.cwd();

		this.app = args.app || this._error("dreamer needs an app");

		this.db = this._loadDatabase(args);
		this.schema = this._loadSchema(args);
		this.models = this._loadModels(args);
		this.resources = this._loadResources(args);

		this._loadHooks();

		Resources.route({
			resources: this.resources,
			models: this.models,
			app: this.app
		});
	};

	this._loadDatabase = function(args) {
		if (this.database) return this.database;

		if (!config.database) {
			console.warn("coudn't find database config");
			return;
		}

		var db = new Sequelize(
			config.database.database,
			config.database.username,
			config.database.password,
			{
				dialect: process.env.DATABASE_DIALECT || config.database.dialect,
				storage: config.database.storage,
				define: { underscored: true, timestamps: false, freezeTableName: true }
			}
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
		if (this.schema) return this.schema;
		var schemaFile = args.schemaFile || path.join(this.cwd, '/docs/schema.md');
		var schemaMarkdown = fs.readFileSync(schemaFile, 'utf8');
		var schema = Schema.parse({ markdown: schemaMarkdown });
		return schema;
	};

	this._loadResources = function(args) {
		if (this.resources) return this.resources;
		var resourcesFile = args.resourcesFile || path.join(this.cwd, '/docs/resources.md');
		resourcesMarkdown = fs.readFileSync(resourcesFile, 'utf8');
		var resources = Resources.parse({ markdown: resourcesMarkdown });
		return resources;
	};

	this._loadHooks = function(args) {

		var extensionsDir = 'extensions';
		var hooksDir = path.join(this.cwd, extensionsDir);

		if (!fs.existsSync(hooksDir)) return;

		fs.readdir(hooksDir, function(err, files) {
			files.forEach(function(file) {
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
	instance = new Dreamer(args);
	return instance;
}

exports.Dreamer = Dreamer;
exports.Resources = Resources;
exports.Schema = Schema;

