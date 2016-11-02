'use strict';

const test = require('tape');

const Blade = require('../../../lib/index');
const { assertRenderedEquals } = require('../../utils');

function assertEquals(assert, expected, data, locals, options) {
	options = Object.assign({}, options, { baseDir: '/', files });

	assertRenderedEquals(assert, expected, data, locals, options);
}

const files = [
	{
		path: '/layouts/master.blade',
		contents: 'Hello {{ user }}'
	},
	{
		path: '/pages/index.blade',
		contents: `@extends('layouts.master')\nThis is the home page`
	}
];

test('Renderer - rendered @extends', (assert) => {
	const options  = {};
	const data     = `@extends('layouts.master')`;
	const expected = `Hello Randall`;
	const locals   = { user: 'Randall' };

	assertEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @extends with text around', (assert) => {
	const options  = {};
	const data     =
`START
@extends('layouts.master')
END
`;
	const expected = `START\nENDHello Randall`;
	const locals   = { user: 'Randall' };

	assertEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @extends contiguous extends', (assert) => {
	const options = {};
	const data    =
`START
@extends('layouts.master')
@extends('layouts.master')
END
`;
	const expected = `START\nENDHello Randall`;
	const locals   = { user: 'Randall' };

	assertEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @extends multiple extends', (assert) => {
	const options = {};
	const data    =
`START
@extends('pages.index')
END
`;
	const expected = `START\nENDThis is the home pageHello Randall`;
	const locals   = { user: 'Randall' };

	assertEquals(assert, expected, data, locals, options);

	assert.end();
});
