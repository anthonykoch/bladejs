'use strict';

const test = require('tape');

const { count,
		variable,
		replaceString,
		getMatchingParen } = require('../../lib/utils');

const { escape } = require('../../lib/helpers');

test(`utils.escape escapes characters`, (assert) => {
	const expected = '&lt;&gt;&amp;&quot;';
	const actual = escape('<>&"');
	assert.equal(actual, expected);
	assert.end();
});

test(`utils.getMatchingParen - empty string`, (assert) => {
	const expected = -1;
	const actual   = getMatchingParen(0, { source: `` });
	assert.equal(actual, expected, 'returns -1');
	assert.end();
});

test(`utils.getMatchingParen - 1 open`, (assert) => {
	const expected = -1;
	const actual   = getMatchingParen(0, { source: `(` });
	assert.equal(actual, expected, 'returns -1');
	assert.end();
});

test('utils.getMatchingParen - 2 open', (assert) => {
	const expected = -1;
	const actual   = getMatchingParen(0, { source: `((` });
	assert.equal(actual, expected, 'returns -1');
	assert.end();
});

test(`utils.getMatchingParen - 3 open, 2 close`, (assert) => {
	const expected = -1;
	const actual   = getMatchingParen(0, { source: `((())` });
	assert.equal(actual, expected, 'returns -1');
	assert.end();
});

test(`utils.getMatchingParen - 2 open, 2 close (balanced)`, (assert) => {
	const expected = 3;
	const actual   = getMatchingParen(0, { source: `(())` });
	assert.equal(actual, expected, 'balanced');
	assert.end();
});

test(`utils.getMatchingParen - 2 open, 2 close (balanced) with identifier`,
	(assert) => {
		const expected = 7;
		const actual   = getMatchingParen(0, { source: `((user))` });
		assert.equal(actual, expected, 'wrapped identifier');
		assert.end();
	});

test(`utils.getMatchingParen - 2 open, 5 close (balanced) with identifier`,
	(assert) => {
		const expected = 7;
		const actual   = getMatchingParen(0, { source: `((user)))))` });
		assert.equal(actual, expected, 'wrapped identifier many closing');
		assert.end();
	});

test(`utils.getMatchingParen - 2 open, 5 close (balanced) with wrapped function call`,
	 (assert) => {
		const expected = 9;
		const actual   = getMatchingParen(0, { source: `((user())))))` });
		assert.equal(actual, expected, 'wrapped function call');
		assert.end();
	});

test(`utils.replaceString - replaces a portion of a string with another`, (assert) => {
	const expected = 'JavaScript is awesome';
	const actual = replaceString('JavaScript is good', 'awesome', 14, 18);
	assert.equal(actual, expected, 'replaced');
	assert.end();
});

test(`utils.variable - returns variable name from number`, (assert) => {
	assert.equal(variable(-1), '$__a',  'ouputs correct var name');
	assert.equal(variable(0),  '$__a',  'ouputs correct var name');
	assert.equal(variable(1),  '$__b',  'ouputs correct var name');
	assert.equal(variable(25), '$__z',  'ouputs correct var name');
	assert.equal(variable(26), '$__aa', 'ouputs correct var name');
	assert.end();
});
