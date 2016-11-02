'use strict';

const test = require('tape');

const { assertRenderedEquals,
		assertRenderedThrows } = require('../../utils');

test('Renderer - rendered @while throws when max iterations is exceeded', (assert) => {
	const options  = {};
	const locals   = {};
	const expected = /Maximum while iterations exceeded/i;
	const data =
`
@while(true)@endwhile
`;

	assertRenderedThrows(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @while', (assert) => {
	const options  = {};
	const locals   = {};
	const expected = `START\nEND`;

	const data =
`
START
@while(false)
	Hello
@endwhile
END
`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});
