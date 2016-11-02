'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

test('Renderer - rendered @forelse', (assert) => {
	const data =
`START
@forelse(users as user)
	{{ user }}
@empty
	Empty
@endforelse
END`;

	{

		const options  = {};
		const locals   = { users: ['Sally', 'Bob', 'Randall'] };
		const expected =
`START
	Sally
	Bob
	Randall
END`;
		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { users: undefined };
		const expected = `START\n\tEmpty\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { users: null };
		const expected = `START\n\tEmpty\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { users: 0 };
		const expected = `START\n\tEmpty\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { users: 'COOL' };
		const expected = `START\n\tC\n\tO\n\tO\n\tL\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { users: { length: 2, 0: 'O', 1: 'P' } };
		const expected = `START\n\tO\n\tP\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	assert.end();
});

test('Renderer - rendered @forelse nested inner $loop', (assert) => {
	const options = {};
	const users   = ['Sally', 'Bob', 'Randall'];
	const drinks  = ['Juice', 'Soda', 'Beer'];
	const locals  = { users, drinks };

	const data =
`START
@forelse(users as user)
	HasParent: {{ loop.parent !== null }}; Count: {{ loop.count }}; Depth: {{ loop.depth }}; Index: {{ loop.index }}; Iteration: {{ loop.iteration }}; Remaining: {{ loop.remaining }}; First: {{ loop.first }}; Last: {{ loop.last }}; Item: {{ user }};
	@forelse(drinks as drink)
		ChildLoop - HasParent: {{ loop.parent !== null }}; Count: {{ loop.count }}; Depth: {{ loop.depth }}; Index: {{ loop.index }}; Iteration: {{ loop.iteration }}; Remaining: {{ loop.remaining }}; First: {{ loop.first }}; Last: {{ loop.last }}; Item: {{ drink }};
	@empty
	@endforelse
@empty
@endforelse
END`;

const expected =
`START
	HasParent: false; Count: 3; Depth: 0; Index: 0; Iteration: 1; Remaining: 3; First: true; Last: false; Item: Sally;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 0; Iteration: 1; Remaining: 3; First: true; Last: false; Item: Juice;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 1; Iteration: 2; Remaining: 2; First: false; Last: false; Item: Soda;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 2; Iteration: 3; Remaining: 1; First: false; Last: true; Item: Beer;
	HasParent: false; Count: 3; Depth: 0; Index: 1; Iteration: 2; Remaining: 2; First: false; Last: false; Item: Bob;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 0; Iteration: 1; Remaining: 3; First: true; Last: false; Item: Juice;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 1; Iteration: 2; Remaining: 2; First: false; Last: false; Item: Soda;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 2; Iteration: 3; Remaining: 1; First: false; Last: true; Item: Beer;
	HasParent: false; Count: 3; Depth: 0; Index: 2; Iteration: 3; Remaining: 1; First: false; Last: true; Item: Randall;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 0; Iteration: 1; Remaining: 3; First: true; Last: false; Item: Juice;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 1; Iteration: 2; Remaining: 2; First: false; Last: false; Item: Soda;
		ChildLoop - HasParent: true; Count: 3; Depth: 1; Index: 2; Iteration: 3; Remaining: 1; First: false; Last: true; Item: Beer;
END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @forelse nested parent $loop', (assert) => {
	const options = {};
	const users   = ['Sally', 'Bob', 'Randall'];
	const drinks  = ['Juice'];
	const locals  = { users, drinks };

	const data =
`START
@forelse(users as user)
	HasParent: {{ loop.parent !== null }}; Count: {{ loop.count }}; Depth: {{ loop.depth }}; Index: {{ loop.index }}; Iteration: {{ loop.iteration }}; Remaining: {{ loop.remaining }}; First: {{ loop.first }}; Last: {{ loop.last }}; Item: {{ user }};
	@forelse(drinks as drink)
		ParentLoop - HasParent: {{ loop.parent.parent !== null }}; Count: {{ loop.parent.count }}; Depth: {{ loop.parent.depth }}; Index: {{ loop.parent.index }}; Iteration: {{ loop.parent.iteration }}; Remaining: {{ loop.parent.remaining }}; First: {{ loop.parent.first }}; Last: {{ loop.parent.last }};
	@empty
	@endforelse
@empty
@endforelse
END`;

const expected =
`START
	HasParent: false; Count: 3; Depth: 0; Index: 0; Iteration: 1; Remaining: 3; First: true; Last: false; Item: Sally;
		ParentLoop - HasParent: false; Count: 3; Depth: 0; Index: 0; Iteration: 1; Remaining: 3; First: true; Last: false;
	HasParent: false; Count: 3; Depth: 0; Index: 1; Iteration: 2; Remaining: 2; First: false; Last: false; Item: Bob;
		ParentLoop - HasParent: false; Count: 3; Depth: 0; Index: 1; Iteration: 2; Remaining: 2; First: false; Last: false;
	HasParent: false; Count: 3; Depth: 0; Index: 2; Iteration: 3; Remaining: 1; First: false; Last: true; Item: Randall;
		ParentLoop - HasParent: false; Count: 3; Depth: 0; Index: 2; Iteration: 3; Remaining: 1; First: false; Last: true;
END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});
