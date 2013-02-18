var dataTypes = [
	{
		name: 'integer',
		patterns: [
			'(^|_)id$',
			'(^|_)count$',
			'(^|_)quantity$'
		]
	}, {
		name: 'date',
		patterns: [
			'(^|_)date$',
			'(^|_)at$',
			'(^|_)time$',
			'(^|_)timestamp$'
		]
	}, {
		name: 'boolean',
		patterns: [
			'^is_'
		]
	}
];

exports.guessDataType = function(columnName) {

	var type;

	dataTypes.forEach(function(dataType) {

		if (type) return;

		dataType.patterns.forEach(function(pattern) {

			var re = new RegExp(pattern);
			if (re.exec(columnName)) {
				type = dataType.name;
			}
		});
	});

	return type || 'string';
};

