'use strict';

const test = require('tape');

const Parser = require('../../lib/parser');
const { reserved } = require('../../lib/constants/reserved');

function makeDirective(name) {
	return {
		name: name,
		handler: function () {}
	};
}

test('Parser.parse - custom directive is parsed into to ast', (assert) => {
	const directive = 'markdown';
	const options = {
		customDirectives: {
			[directive]: makeDirective(directive)
		}
	};

	const expected = {
		type: 'CustomStatement',
		name: 'markdown',
		argument: '$content',
		consequent: {
			type: 'BlockStatement',
			body: [
				{
					type: 'TextNode',
					value: 'Hello',
					line: 1,
					start: 19,
					end: 24
				}
			]
		},
		line: 1,
		start: 0,
		end: 24,
	};

	const data = `@markdown($content)Hello@endmarkdown`;
	const { body: [actual] } = Parser.parse(data, options);

	assert.deepEquals(actual, expected, 'directive matches');

	assert.end();
});

test('Parser.parse - custom directive closing directive is optional', (assert) => {
	const directive = 'markdown';
	const options = {
		customDirectives: {
			[directive]: makeDirective(directive)
		}
	};

	const expected = {
		type: 'CustomStatement',
		name: 'markdown',
		argument: '$content',
		consequent: null,
		line: 1,
		start: 0,
		end: 19,
	};

	const data = `@markdown($content)`;
	const { body: [actual] } = Parser.parse(data, options);

	assert.deepEquals(actual, expected, 'captures argument')

	assert.end();
});

test('Parser.parse - custom directive opening directive is not optional', (assert) => {
	const directive = 'markdown';
	const options = {
		customDirectives: {
			[directive]: makeDirective(directive)
		}
	};

	const data = `@endmarkdown`;

	assert.throws(() => Parser.parse(data, options), /Unexpected token @endmarkdown/);

	assert.end();
});


test('Parser.parse - custom directive validates expression', (assert) => {
	const directive = 'markdown';
	const options = {
		customDirectives: {
			[directive]: makeDirective(directive)
		}
	};

	assert.throws(() =>
			Parser.parse(`@markdown(%)`, options),
			/Invalid expression in @markdown/,
			'invalid expression'
		);

	assert.doesNotThrow(() =>
			Parser.parse(`@markdown`, options),
			/Invalid expression in @markdown/,
			'directive without argument doesn not throw'
		);

	assert.end();
});
