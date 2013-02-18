var distill = require('../lib/distill');

exports.listOfObjects = function(test) {

	var template = [ { name: 'james', email: 'james@james.biz' } ];

	var instance = [
		{
			name: 'arthur',
			email: 'arthur@catz.org',
			password: 'markov'
		}, {
			name: 'buster',
			email: 'buster1999@catz.org',
			password: '12345'
		}
	];

	distill(template, instance);

	test.deepEqual(
		instance,
		[ { name: 'arthur', email: 'arthur@catz.org' }, { name: 'buster', email: 'buster1999@catz.org' } ],
		"extra fields in list of objects don't make it"
	);

	test.done();
}

exports.plainObjects = function(test) {

	var template = { name: 'james', email: 'james@james.biz' };
	var instance = { name: 'james', email: 'james@james.biz', password: 'secret' };

	distill(template, instance);

	test.deepEqual(instance, template, "extra fields in plain objects don't make it through");

	test.done();
}

exports.nestedObjects = function(test) {

	var template = { name: 'james', email: 'james@james.biz', address: { street: "123 Main", city: "Boston", state: "MA"} };
	var instance = { name: 'james', email: 'james@james.biz', address: { street: "123 Main", city: "Boston", state: "MA", doorman_passphrase: "bonkers" } };

	distill(template, instance);

	test.deepEqual(template, instance);

	test.done();
}

exports.passthrough = function(test) {

	test.doesNotThrow(function() { distill(1, 2) }, "comparing primitives goes fine");

	test.done();
}

