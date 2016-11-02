'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

test('Renderer - rendered @unless', (assert) => {
	const data =
`START
@unless(user)
	{{ user }}
@endunless
END`;

	{
		const options  = {};
		const locals   = { user: 'Randall' };
		const expected = `START\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { user: [] };
		const expected = `START\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { user: null };
		const expected = `START\n\t\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { user: undefined  };
		const expected = `START\n\t\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { user: 0 };
		const expected = `START\n\t0\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { user: '' };
		const expected = `START\n\t\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { user: NaN };
		const expected = `START\n\tNaN\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	assert.end();
});

test('Renderer - rendered @unless complex', (assert) => {
	const data =
`START
@unless(false || true)
	{{ user }}
@endunless
END`;

const expected = `START\nEND`;

	{
		const options = {};
		const locals  = { user: 'Randall' };

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options = {};
		const locals  = {  user: ['Hello'] };

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options = {};
		const locals  = {  user: null };

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options = {};
		const locals  = {  user: undefined };

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options = {};
		const locals  = {  user: 0 };

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options = {};
		const locals  = {  user: '' };

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options = {};
		const locals  = {  user: NaN };

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	assert.end();
});
