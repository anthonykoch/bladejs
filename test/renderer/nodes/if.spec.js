'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

test('Renderer - rendered @if all paths', (assert) => {
	const data =
`START
@if(user.name) {{ user.name }}
@elseif(user.age) {{ user.age }}
@elseif(user.health) {{ user.health }}
@else {{ user.id }}
@endif
END`;

	{
		const options  = {};
		const locals   = { user: { name: 'Randall' } };
		const expected = `START\n Randall\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals = { user: { age: 20 } };
		const expected = `START\n 20\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { user: { health: 84 } };
		const expected = `START\n 84\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals = { user: { id: 42 } };
		const expected = `START\n42\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	assert.end();
});

