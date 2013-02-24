var Sequelize = require('sequelize');

var attributes = {
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
	min: function(column, attributes, value) {
		attributes.validate = attributes.validate || {};
		attributes.min = value;
	},
	max: function(column, attributes, value) {
		attributes.validate = attributes.validate || {};
		attributes.max = value;
	},
	default: function(column, attributes, value) {
		if (column.dataType == 'date' && value == 'now') {
			value = Sequelize.NOW;
		}
		attributes.defaultValue = value;
	},
	fk: function(column, attributes, value) {
		var components = value.split('.');
		column.association = {
			foreignTable: components[0],
			foreignKey: components[1],
			localKey: column.name
		};
	}
};

module.exports = attributes;


