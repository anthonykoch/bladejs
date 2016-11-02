'use strict';

const test = require('tape');

const { assertRenderedEquals,
		assertRenderedThrows } = require('../../utils');

function assertEquals(assert, expected, data, locals, options) {
	options = Object.assign({}, options, { baseDir: '/', files });

	assertRenderedEquals(assert, expected, data, locals, options);
}


test('Renderer - rendered @foreach', (assert) => {
	const data =
`START
@foreach(users as user)
	{{ user }}
@endforeach
END`;

	{
		const options  = {};
		const locals   = { users: ['Sally', 'Bob', 'Randall'] };
		const expected = `START\n\tSally\n\tBob\n\tRandall\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { users: [null, undefined] };
		const expected = `START\n\t\n\t\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const options  = {};
		const locals   = { users: 'OP' };
		const expected = `START\n\tO\n\tP\nEND`;

		assertRenderedEquals(assert, expected, data, locals, options);
	}

	{
		const locals   = { users: undefined };
		const options  = {};
		const expected = /of undefined/;

		assertRenderedThrows(assert, expected, data, locals, options);
	}

	{
		const locals   = { users: null };
		const options  = {};
		const expected = /of null/;

		assertRenderedThrows(assert, expected, data, locals, options);
	}

	assert.end();
});

test('Renderer - rendered @foreach $loop', (assert) => {
	const options = {};
	const locals  = { users: ['Sally', 'Bob', 'Randall'] };

	const data    =
`START
@foreach(users as user)
	HasParent: {{ loop.parent !== null }}; Count: {{ loop.count }}; Depth: {{ loop.depth }}; Index: {{ loop.index }}; Iteration: {{ loop.iteration }}; Remaining: {{ loop.remaining }}; First: {{ loop.first }}; Last: {{ loop.last }}; Item: {{ user }};
@endforeach
END`;

const expected =
`START
	HasParent: false; Count: 3; Depth: 0; Index: 0; Iteration: 1; Remaining: 3; First: true; Last: false; Item: Sally;
	HasParent: false; Count: 3; Depth: 0; Index: 1; Iteration: 2; Remaining: 2; First: false; Last: false; Item: Bob;
	HasParent: false; Count: 3; Depth: 0; Index: 2; Iteration: 3; Remaining: 1; First: false; Last: true; Item: Randall;
END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @foreach nested inner $loop', (assert) => {
	const options = {};
	const users   = ['Sally', 'Bob', 'Randall'];
	const drinks  = ['Juice', 'Soda', 'Beer'];
	const locals  = { users, drinks };

	const data =
`START
@foreach(users as user)
	HasParent: {{ loop.parent !== null }}; Count: {{ loop.count }}; Depth: {{ loop.depth }}; Index: {{ loop.index }}; Iteration: {{ loop.iteration }}; Remaining: {{ loop.remaining }}; First: {{ loop.first }}; Last: {{ loop.last }}; Item: {{ user }};
	@foreach(drinks as drink)
		ChildLoop - HasParent: {{ loop.parent !== null }}; Count: {{ loop.count }}; Depth: {{ loop.depth }}; Index: {{ loop.index }}; Iteration: {{ loop.iteration }}; Remaining: {{ loop.remaining }}; First: {{ loop.first }}; Last: {{ loop.last }}; Item: {{ drink }};
	@endforeach
@endforeach
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

test('Renderer - rendered @foreach nested parent $loop', (assert) => {
	const options = {};
	const users   = ['Sally', 'Bob', 'Randall'];
	const drinks  = ['Juice'];
	const locals  = { users, drinks };

	const data =
`START
@foreach(users as user)
	HasParent: {{ loop.parent !== null }}; Count: {{ loop.count }}; Depth: {{ loop.depth }}; Index: {{ loop.index }}; Iteration: {{ loop.iteration }}; Remaining: {{ loop.remaining }}; First: {{ loop.first }}; Last: {{ loop.last }}; Item: {{ user }};
	@foreach(drinks as drink)
		ParentLoop - HasParent: {{ loop.parent.parent !== null }}; Count: {{ loop.parent.count }}; Depth: {{ loop.parent.depth }}; Index: {{ loop.parent.index }}; Iteration: {{ loop.parent.iteration }}; Remaining: {{ loop.parent.remaining }}; First: {{ loop.parent.first }}; Last: {{ loop.parent.last }};
	@endforeach
@endforeach
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
