'use strict';

const test = require('tape');

test('Testname', (assert) => {
	const actual = true;
	const expected = false;
	assert.equals(actual, expected);
	assert.end();
});
