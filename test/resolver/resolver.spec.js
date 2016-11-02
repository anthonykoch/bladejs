'use strict';

const test = require('tape');

const utils = require('../utils');
const Resolver = require('../../lib/resolver');
const { VIEW_SIMPLE } = utils.views;

const RE_ENOENT = /no such file or directory, open/;
const RE_INVALID_PATH = /path must be a string or Buffer/;
const CONTENTS  =

`
@if(true)
	Blade is really cool {{ user }}
@endif
`

test('Resolver.create - creates a resolver', (assert) => {
	const resolver = Resolver.create();
	assert.ok(typeof resolver === 'object');
	assert.ok(typeof resolver.getFile === 'function');
	assert.end();
});

test('resolver.getFile - resolves file contents', (assert) => {
	const resolver = Resolver.create();
	const expected = {
		contents: CONTENTS,
		path: VIEW_SIMPLE
	};

	const actual = resolver.getFile(VIEW_SIMPLE);

	assert.throws(() => resolver.getFile(''),   RE_ENOENT);
	assert.throws(() => resolver.getFile(),     RE_INVALID_PATH);
	assert.throws(() => resolver.getFile(null), RE_INVALID_PATH);

	assert.deepEquals(actual, expected);

	assert.end();
});

test('resolver.resolve - rejects with non-existant file', (assert) => {
	const resolver = Resolver.create();
	assert.throws(() => resolver.getFile('./thisshouldnotexist.txt'), RE_ENOENT);
	assert.end();
});
