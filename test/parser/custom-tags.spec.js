'use strict';

const test = require('tape');

const { parserSetup: setup } = require('../utils');

const RE_INVALID_TAGS = /Invalid custom tags/;

test('Parser.parse - parses default content tags', (assert) => {
	const expected = 'Interpolation';
	const actual = setup('{{ cool }}').type;
	assert.equal(actual, expected);
	assert.end();
});

test('Parser.parse - parses custom content tag', (assert) => {
	const [open, end] = ['123', '123'];
	const data = `${open} cool ${end}`;
	const actual = setup(data, {
		data,
		contentTags: [`${open}`, `${end}`]
	});

	assert.equal(actual.type, 'Interpolation', 'has correct type');
	assert.equal(actual.argument, ' cool ', 'has correct value');
	assert.end();
});

test('Parser.parse - parses default comment tags', (assert) => {
	const actual = setup('{{-- cool --}}');
	assert.equal(actual.type, 'CommentNode');
	assert.equal(actual.value, '{{-- cool --}}');
	assert.end();
});

test('Parser.parse - parses custom comment tag', (assert) => {
	const [open, end] = ['123', '123'];
	const data = `${open} cool ${end}`;
	const actual = setup(data, {
		data,
		commentTags: [`${open}`, `${end}`]
	});

	assert.equal(actual.type, 'CommentNode', 'has correct type');
	assert.equal(actual.value, data, 'has correct value');
	assert.end();
});

test('Parser.parse - parses default raw tags parse', (assert) => {
	const expected = 'RawInterpolation';
	const actual = setup('{!! cool !!}}').type;
	assert.equal(actual, expected);
	assert.end();
});

test('Parser.parse - parses custom raw tag', (assert) => {
	const [open, end] = ['123', '123'];
	const data = `${open} cool ${end}`;
	const actual = setup(data, {
		data,
		rawTags: [`${open}`, `${end}`]
	});

	assert.equal(actual.type, 'RawInterpolation', 'has correct type');
	assert.equal(actual.argument, ' cool ', 'has correct value');
	assert.end();
});

test('Lexer - throws for invalid custom tags', (assert) => {
	const data = '';

	['contentTags', 'rawTags', 'commentTags']
		.map(function (tag) {
			assert.throws(() => setup(data, {
					data,
					[tag]: ['123']
				}),
				RE_INVALID_TAGS,
				`throws for missing tags for ${tag}`);

			assert.throws(() => setup(data, {
					data,
					[tag]: [123, '123']
				}),
				RE_INVALID_TAGS,
				`throws for invalid type for ${tag}`);

			assert.throws(() => setup(data, {
					data,
					[tag]: [undefined, '123']
				}),
				RE_INVALID_TAGS,
				`throws for invalid type for ${tag}`);
		});

	assert.end();
});
