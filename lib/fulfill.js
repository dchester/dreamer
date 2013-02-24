var lingo = require('lingo');
var dreamer = require('dreamer');
var async = require('async');

var fulfill = function(resource, template, instance, callback) {

	var queue = [];

	recurse(resource, template, instance, queue);
	async.parallel(queue, callback);
}

var recurse = function(resource, template, instance, queue) {

	if (template instanceof Array) {
		fulfillArray(resource, template, instance, queue);
	} else if (template instanceof Object) {
		fulfillObject(resource, template, instance, queue);
	} else {
		return;
	}
}

var fulfillArray = function(resource, template, instance, queue) {

	var templateElement = template[0];

	instance.forEach(function(element) {
		recurse(resource, templateElement, element, queue);
	});
};

var fulfillObject = function(resource, template, instance, queue) {

	var dream = dreamer.instance;

	Object.keys(template).forEach(function(key) {

		var model = dream.models[resource.model];
		var associations = model._dreamer.associations;

		if (!~Object.keys(instance).indexOf(key)) {

			var unfulfilled = true;

			if (template[key] instanceof Array) {

				Object.keys(dream.models).forEach(function(modelName) {
					var m = dream.models[modelName];
					if (!m.associations) return;	
					m._dreamer.associations.forEach(function(association) {
						if (association.foreignTable != model.tableName) return;
						var criteria = {};
						criteria[association.localKey] = instance.id;
						queue.push(function(callback) {
							m.findAll({ where: criteria })
								.success(function(data) {
									instance[key] = JSON.parse(JSON.stringify(data));
									callback();
								}) 
								.error(function(error) {
									callback(error);
								});
						});
					});
				});
				
			} else {

				var foreignTable = lingo.en.isPlural(key) ? key : lingo.en.pluralize(key);
				associations.forEach(function(association) {
					if (association.foreignTable != foreignTable) return;
					var model = dream.models[foreignTable];
					queue.push(function(callback) {
						model.find({ where: { id: instance[association.foreignKey] } })
							.success(function(data) {
								instance[key] = JSON.parse(JSON.stringify(data));
								callback();
							}) 
							.error(function(error) {
								callback(error);
							});
					});

				});
			}

		} else {
			recurse(resource, template[key], instance[key], queue);
		}
	});
};

module.exports = fulfill;
