'use strict';

const path = require('path');

const Blade  = require('../lib/index');
const Lexer  = require('../lib/lexer');
const Parser = require('../lib/parser');

exports.lexerNext = function next(data, options) {
	return Lexer.create(data, options).nextToken();
};

exports.parserSetup = function setup(str, options) {
	return Parser.parse(str, options).body[0];
};

exports.views = {
	VIEW_SIMPLE: path.join(__dirname, './files/views/simple.blade'),
	VIEW_INCLUDE: path.join(__dirname, './files/views/include.blade')
};

exports.assertRenderedEquals = assertRenderedEquals;
exports.assertRenderedThrows = assertRenderedThrows;

const newOptionsList = [
	{ debug: true,  standalone: true },
	{ debug: false, standalone: true },
	{ debug: true  },
	{ debug: false },
	{}
];

const newOptionsListDescriptions = [
	 'options standalone: true, debug: true;',
	 'options standalone: true, debug: false',
	 'options debug: true',
	 'options debug: false',
	 'options empty options'
];

function assertRenderedThrows(assert, expected, data, locals, options) {
	newOptionsList.forEach((newOptions, index) => {
		assert.throws((newOptions) =>
			Blade.render(data,
				Object.assign({}, locals),
				Object.assign({}, options, newOptions)
			),
			expected,
			newOptionsListDescriptions[index]
		);
	});
}

function assertRenderedEquals(assert, expected, data, locals, options) {
	newOptionsList.forEach((newOptions, index) => {
		assert.equals(
			Blade.render(data,
				Object.assign({}, locals),
				Object.assign({}, options, newOptions)
			),
			expected,
			newOptionsListDescriptions[index]
		);
	});
}
