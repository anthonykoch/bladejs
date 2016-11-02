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

test('Renderer - rendered @each', (assert) => {
	const options  = {};
	const data     = `@each('includes.user', users, 'user')`;
	const iterable = ['Sally', 'Bob', 'Randall'];
	const locals   = { users: iterable };
	const expected = `Hello SallyHello BobHello Randall`;

	assertEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @each - preserved newlines', (assert) => {
	const options  = {};
	const data     = `@each('pages.index', users, 'user')`;
	const iterable = ['Sally', 'Bob', 'Randall'];
	const locals = { users: iterable };
	const expected =
`Hello Sally
Hello Bob
Hello Randall
`;

	assertEquals(assert, expected, data, locals, options);

	assert.end();
});
