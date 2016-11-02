'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

test('Renderer - rendered @break inside @foreach', (assert) => {
	const options = {};
	const locals = { users: ['Sally', 'Bob', 'Randall'] };
	const data =
`START
@foreach(users as user)
	@break
	{{ user.name }}
@endforeach
END`;

	const expected = `START\nEND`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @break inside @foreach', (assert) => {
	const options = {};
	const locals = { users: ['Sally', 'Bob', 'Randall'] };
	const data =
`START
@foreach(users as user)
	@break(user === 'Bob')
	{{ user }}
@endforeach
END`;

	const expected = `START\n\tSally\nEND`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @break inside @forelse', (assert) => {
	const options = {};
	const locals = { users: ['Sally', 'Bob', 'Randall'] };
	const data =
`START
@forelse(users as user)
	@break(user === 'Bob')
	{{ user }}
@empty
@endforelse
END`;

	const expected = `START\n\tSally\nEND`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @break inside @while', (assert) => {
	const options = {};
	const locals = { users: ['Sally', 'Bob', 'Randall'] };
	const data =
`START{{ index = -1, '' }}
@while(++index < users.length)
	@break(users[index] === 'Bob')
	{{ users[index] }}
@endwhile
END`;

	const expected = `START\n\tSally\nEND`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});
