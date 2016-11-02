'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../../utils');

test('Renderer - rendered @push', (assert) => {
	const locals   = { user: 'Randall' };
	const options  = {};
	const expected = `START\nEND`;

	const data =
`START
@push('scripts')
	This is some text {{ user }}

	@if(false)
	@elseif(true)
		Hello all
	@endif

	@unless(false)
		That is cool!
	@endunless
@endpush
END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @push with one @stack before push', (assert) => {
	const options  = {};
	const locals   = { user: 'Randall' };
	const expected = `START\n\n\nEND`;
	const data =
`START

@stack('scripts')

@push('scripts')
	This is some text {{ user }}

	@if(false)
	@elseif(true)
		Hello all
	@endif

	@unless(false)
		That is cool!
	@endunless
@endpush

END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @push with one @stack after push', (assert) => {
	const options = {};
	const locals  = { user: 'Randall' };
	const data =
`START
@push('scripts')
	This is some text {{ user }}

	@if(false)
	@elseif(true)
		Hello all
	@endif

	@unless(false)
		That is cool!
	@endunless
@endpush

@stack('scripts')

END`;

const expected =
`START
	This is some text Randall

		Hello all
		That is cool!

END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});

test('Renderer - rendered @push with one @stack and multiple @push', (assert) => {
	const options = {};
	const locals  = { user: 'Randall' };
	const data =
`START

@stack('scripts')

@push('scripts')
	First push
@endpush

@stack('scripts')

@push('scripts')
	Second push
@endpush

@stack('scripts')

@if(0)
	@push('scripts')
		Third push
	@endpush
@endif

@stack('scripts')

END`;

const expected =
`START

	First push
	First push
	Second push
	First push
	Second push

END`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});
