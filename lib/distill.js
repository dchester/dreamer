var distill = function(template, instance) {

	if (template instanceof Array) {
		distillArray(template, instance);
	} else if (template instanceof Object) {
		distillObject(template, instance);
	} else {
		return;
	}
}

var distillArray = function(template, instance) {

	if (! template instanceof Array) throw new Error("template array is not an array");
	if (! instance instanceof Array) throw new Error("instance array is not an array");

	var templateElement = template[0];

	instance.forEach(function(element) {
		distill(templateElement, element);
	});

}

var distillObject = function(template, instance) {

	if (typeof template != 'object') throw new Error("template object is not an object");
	if (typeof instance != 'object') throw new Error("instance object is not an object");

	Object.keys(instance).forEach(function(key) {
		if (!~Object.keys(template).indexOf(key)) {
			delete instance[key];
		} else {
			distill(template[key], instance[key]);
		}
	});
}

module.exports = distill;
