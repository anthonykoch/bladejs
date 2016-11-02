'use strict';

const test = require('tape');

const Lexer = require('../../lib/lexer');
const { lexerNext } = require('../utils');

test('Lexer.create', (assert) => {
	const lexer = Lexer.create('');
	assert.ok(typeof lexer === 'object' && !! lexer, 'lexer is object');
	assert.end();
});

test(`lexer strips BOM`, (assert) => {
	const data = '\uFEFFhi';
	const expected = 'hi';
	assert.equal(lexerNext(data).value, expected, 'strips bom');
	assert.end();
});

test('lexer.all returns all tokens', (assert) => {
	const NUMBER_TOKENS = 5;
	const expected = '@break';
	const data = expected.repeat(NUMBER_TOKENS);
	const lexer = Lexer.create(data);
	const tokens = Array.from(lexer);
	assert.equals(tokens.length, NUMBER_TOKENS, 'returns all tokens');
	assert.ok(tokens.every((token) => token.value === expected),
		'all token types values are correct');
	assert.end();
});

test('lexer.peek returns the next token', (assert) => {
	const expected = '@break';
	const token = Lexer.create(expected).peek();
	assert.equals(token.value, expected, 'token value is "@break"')
	assert.end();
});

test('lexer.next returns iteration object', (assert) => {
	const expected = '@break';
	const iterationObject = Lexer.create(expected).next();
	assert.equals(typeof iterationObject.done === 'boolean', true, 'done is boolean');
	assert.equals(iterationObject.hasOwnProperty('value'), true, 'value is defined');
	assert.end();
});

test('Lexer implements the iterator protocol', (assert) => {
	const NUMBER_TOKENS = 5;
	const data = '@break'.repeat(NUMBER_TOKENS);
	const test = [...Lexer.create(data)];

	assert.equal(test.length, NUMBER_TOKENS, 'iterator spread');
	assert.end();
});

test('lexer.lookahead returns a token at an index', (assert) => {
	const NUMBER_TOKENS = 5;
	const tokenParts = ['@break', '@continue', '@yield', '@stack', '@each'];
	const lexer = Lexer.create(tokenParts.join(''));
	const token = lexer.lookahead(NUMBER_TOKENS - 1);
	const expected = '@stack';

	assert.equal(token.value, expected, 'token is @stack');
	assert.equal(tokenParts.length, NUMBER_TOKENS, 'array has five items');

	assert.throws(() => lexer.lookahead(-1),
		/Lookahead index can not be less than 0/,
		'index can not be less than 0');

	assert.end();
});

test(`lexer.lookahead doesn't cause tokens to be skipped`, (assert) => {
	const NUMBER_TOKENS = 5;
	const data = '@break'.repeat(NUMBER_TOKENS);
	const lexer = Lexer.create(data);
	lexer.lookahead(NUMBER_TOKENS + 1);
	const tokens = [...lexer];
	assert.equal(tokens.length, NUMBER_TOKENS);
	assert.end();
});

test(`lexer.lookahead doesn't cause tokens to be skipped`, (assert) => {
	const NUMBER_TOKENS = 5;
	const data = '@break'.repeat(NUMBER_TOKENS);
	const lexer = Lexer.create(data);
	lexer.lookahead(NUMBER_TOKENS + 1);
	const tokens = [...lexer];
	assert.equal(tokens.length, NUMBER_TOKENS);
	assert.end();
});
