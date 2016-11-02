'use strict';

const test = require('tape');

const Blade = require('../../lib/index');

function setup(data, locals) {
	const options = { debug: true };
	return Blade.render(data, locals, options);
}

test('Renderer - using reserved words throws', (assert) => {
	assert.throws(() => setup(`{{ $__locals     }}`), /\$__locals is reserved/);
	assert.throws(() => setup(`{{ $__stacks     }}`), /\$__stacks is reserved/);
	assert.throws(() => setup(`{{ $__helpers    }}`), /\$__helpers is reserved/);
	assert.throws(() => setup(`{{ $__forLoop    }}`), /\$__forLoop is reserved/);
	assert.throws(() => setup(`{{ $__interp     }}`), /\$__interp is reserved/);
	assert.throws(() => setup(`{{ $__html       }}`), /\$__html is reserved/);
	assert.throws(() => setup(`{{ $__private    }}`), /\$__private is reserved/);
	assert.throws(() => setup(`{{ $__helpers    }}`), /\$__helpers is reserved/);
	assert.throws(() => setup(`{{ $__options    }}`), /\$__options is reserved/);

	assert.doesNotThrow(() => setup(`{{ loop   }}`, { loop: true }))
	assert.doesNotThrow(() => setup(`{{ locals }}`, { loop: true }))

	assert.end();
});
