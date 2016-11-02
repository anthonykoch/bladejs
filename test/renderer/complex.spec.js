'use strict';

const test = require('tape');

const { assertRenderedEquals } = require('../utils');

const master = {
	path: '/layouts/master.blade',
	contents:
`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
</head>
<body>
	@foreach(users as user)
		{{ user }}
	@endforeach

	@foreach(users as user)
		@include('includes.user')
	@endforeach

	@stack('scripts')
</body>
</html>`
};

const home = {
	path: '/pages/home.blade',
	contents:
`
@extends('layouts.master')

@push('scripts')
	<script src="scripts/home.js"></script>
@endpush
`
};

const user = {
	path: '/includes/user.blade',
	contents: `Hello {{ user }}\n`
};

const files = [
	master,
	user,
];

test('Rendered - complex template renders properly', (assert) => {
	const options = { baseDir: '/', files };

	const locals = {
		users: ['Sally', 'Bob', 'Randall']
	};

	const data   = home.contents

	const expected =
`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
</head>
<body>
		Sally
		Bob
		Randall
Hello Sally
Hello Bob
Hello Randall
	<script src="scripts/home.js"></script>
</body>
</html>`;

	assertRenderedEquals(assert, expected, data, locals, options);

	assert.end();
});
