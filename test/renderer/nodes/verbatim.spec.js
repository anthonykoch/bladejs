'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

test('Renderer - rendered @verbatim', (assert) => {
	const options = {};
	const locals  = {};

	const data =
`@verbatim
	@if(user)
		{{ user.name }}
	@endif
@endverbatim`;

	const expected =
`
	@if(user)
		{{ user.name }}
	@endif
`;
	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});
