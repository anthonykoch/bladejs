'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../utils');

test('Renderer - uses custom directive handler return value', (assert) => {
	const expected = 'hello';

	const customDirectives = {
		markdown: function (expression, contents) {
			return expected;
		}
	};

	const data = `@markdown`;
	const options = { customDirectives };

	assertRenderedEquals(assert, expected, data, {}, options);

	assert.end();
});

test(`Renderer - custom directive handler is passed the directive's argument`, (assert) => {
	const expected = `hello`;

	const customDirectives = {
		markdown: function (expression) {
			return expression;
		}
	};

	const data = `@markdown('${expected}')`;
	const options = { customDirectives };

	assertRenderedEquals(assert, expected, data, {}, options);

	assert.end();
});

test(`Renderer - custom directive handler is passed the directive's block contents`, (assert) => {
	const expected = `hello`;

	const customDirectives = {
		markdown: function (expression, contents) {
			return contents;
		}
	};

	const data = `@markdown${expected}@endmarkdown`;
	const options = { customDirectives };

	assertRenderedEquals(assert, expected, data, {}, options);

	assert.end();
});


test(`Renderer - custom directive handler return defaults to string`, (assert) => {
	const expected = ``;

	const customDirectives = {
		markdown: function (expression, contents) {
			return void 0;
		}
	};

	const data = `@markdown${expected}@endmarkdown`;
	const options = { customDirectives };

	assertRenderedEquals(assert, expected, data, {}, options);

	assert.end();
});
