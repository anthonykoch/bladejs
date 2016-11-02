'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

test('Renderer - rendered @continue inside @foreach', (assert) => {
	const options = {};
	const locals = { users: ['Sally', 'Bob', 'Randall'] };
	const data =
`START
@foreach(users as user)
	@continue
	{{ user.name }}
@endforeach
END`;

	const expected = `START\nEND`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @continue inside @foreach', (assert) => {
	const options = {};
	const locals = { users: ['Sally', 'Bob', 'Randall'] };
	const data =
`START
@foreach(users as user)
	@continue(user === 'Bob')
	{{ user }}
@endforeach
END`;

	const expected = `START\n\tSally\n\tRandall\nEND`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @continue inside @forelse', (assert) => {
	const options = {};
	const locals = { users: ['Sally', 'Bob', 'Randall'] };
	const data =
`START
@forelse(users as user)
	@continue(user === 'Bob')
	{{ user }}
@empty
@endforelse
END`;

	const expected = `START\n\tSally\n\tRandall\nEND`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});


test('Renderer - rendered @continue inside @while', (assert) => {
	const options = {};
	const locals = { users: ['Sally', 'Bob', 'Randall'] };
	const data =
`START{{ index = -1, '' }}
@while(++index < users.length)
	@continue(users[index] === 'Bob')
	{{ users[index] }}
@endwhile
END`;

	const expected = `START\n\tSally\n\tRandall\nEND`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});
