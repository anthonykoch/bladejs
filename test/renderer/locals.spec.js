'use strict';

const test = require('tape');

const Blade = require('../../lib/index');

function setup(data, locals) {
	const options = { debug: true };
	return Blade.render(data, locals, options);
}

test('Renderer - Reserved words', (assert) => {
	assert.throws(() => setup(`{{ toString }}`),
		/\[Source\]: toString/, 'does not access prototype');

	assert.end();
});
