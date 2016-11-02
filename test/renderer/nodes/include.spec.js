'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

function assertEquals(assert, expected, data, locals, options) {
	options = Object.assign({}, options, { baseDir: '/', files });

	assertRenderedEquals(assert, expected, data, locals, options);
}

const files = [
	{
		path: '/includes/user.blade',
		contents: 'Hello {{ user }}'
	},
	{
		path: '/pages/index.blade',
		contents: '\nHello {{ user }}\n'
	}
];

test('Renderer - rendered @include', (assert) => {
	const options = {};
	const locals   = { user: 'Randall' };
	const data     = `@include('includes.user')`;
	const expected = `Hello Randall`;

	assertEquals(assert, expected, data, locals, options);

	assert.end();
});


test('Renderer - rendered @include preserves whitespace', (assert) => {
	const options  = {};
	const locals   = { user: 'Randall' };
	const data     = `@include('pages.index')`;
	const expected = `Hello Randall\n`;

	assertEquals(assert, expected, data, locals, options);

	assert.end();
});
