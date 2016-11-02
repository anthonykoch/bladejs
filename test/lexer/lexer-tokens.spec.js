'use strict';

const test           = require('tape');

const Lexer          = require('../../lib/lexer');
const { lexerNext }  = require('../utils');
const { directives } = require('../../lib/constants/directives');

const acceptsArgs = [
	'yield',
	'section',
	'extends',
	'if',
	'elseif',
	'unless',
	'for',
	'foreach',
	'forelse',
	'while',
	'include',
	'each',
	'push',
	'stack',
];

const canAcceptArgs = [
	'continue',
	'break',
];

test('Lexer - unterminated args throw', (assert) => {
	assert.throws(() => lexerNext(`@each('jobs', jobs, 'empty'`), /Unclosed directive/);
	assert.throws(() => lexerNext(`@include('jobs'`), /Unclosed directive/);
	assert.throws(() => lexerNext(`@include(('jobs)'`), /Unclosed directive/);
	assert.end();
});

test('Lexer - directives array is not empty', (assert) => {
	assert.ok(Array.isArray(directives), 'directives is array');
	assert.ok(directives.length, 'There are directives');
	assert.end();
});

test('Lexer - tokenizes comments', (assert) => {
	assert.deepEquals(lexerNext('{{--   --}}'),
		{
			value: '{{--   --}}',
			type: 'comment',
			start: 0,
			end: 11,
			line: 1,
		},
		'comment with whitespace inside');

	assert.deepEquals(lexerNext('{{----}}'),
		{
			value: '{{----}}',
			type: 'comment',
			start: 0,
			end: 8,
			line: 1,
		},
		'empty comment');

	assert.deepEquals(Lexer.all('  {{--   awdawd   --}}  '),
		[
			{
				type: 'text',
				value: '  ',
				start: 0,
				end: 2,
				line: 1,
			},
			{
				type: 'comment',
				value: '{{--   awdawd   --}}',
				start: 2,
				end: 22,
				line: 1
			},
			{
				type: 'text',
				value: '  ',
				start: 22,
				end: 24,
				line: 1,
			},
		],
		'comment with whitespace and alpha characters inside');


	assert.deepEquals(Lexer.all('{{----}}{{----}}'),
		[
			{
				type: 'comment',
				value: '{{----}}',
				start: 0,
				end: 8,
				line: 1,
			},
			{
				type: 'comment',
				value: '{{----}}',
				start: 8,
				end: 16,
				line: 1,
			},
		],
		'double comments')

	assert.end();
});

canAcceptArgs.forEach(function (directive) {
	test(`Lexer - tokenizes @${directive} without args`, (assert) => {
		const expected = `@${directive}`;
		const token = lexerNext(expected);

		assert.equals(token.value, expected, 'is tokenized without args');
		assert.end();
	});

	test(`Lexer - tokenizes @${directive} with args`, (assert) => {
		const expected = `@${directive}()`;
		const token = lexerNext(expected);

		assert.equals(token.value, expected, 'is tokenized with args');
		assert.end();
	});

	test(`Lexer - tokenizes back to back @${directive} with args`, (assert) => {
		const expected = `@${directive}('daffy')`;
		const data = `@${directive}('daffy')`.repeat(2);
		const lexer = Lexer.create(data);
		const token1 = lexer.nextToken();
		const token2 = lexer.nextToken();

		assert.equals(token1.value, expected,
			'tokenizes back to back as single token');

		assert.equals(token2.value, expected,
			'tokenizes back to back as single token');

		assert.end();
	});
});

directives.forEach(function (directive) {
	test(`Lexer - tokenizes @${directive}`, (assert) => {
		const expected = `@${directive}`;
		const token = lexerNext(expected);

		assert.equals(token.value, expected);
		assert.end();
	});

	test(`Lexer - tokenizes back to back @${directive}`, (assert) => {
		const expected = `@${directive}`;
		const data = `@${directive}`.repeat(2);
		const lexer = Lexer.create(data);
		const token1 = lexer.nextToken();
		const token2 = lexer.nextToken();

		assert.deepEquals(token1, {
			value: expected,
			type: directive,
			line: 1,
			start: 0,
			end: expected.length
		});

		assert.deepEquals(token2, {
			value: expected,
			type: directive,
			line: 1,
			start: expected.length,
			end: expected.length * 2
		});

		assert.end();
	});
});
