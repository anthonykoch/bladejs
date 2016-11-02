'use strict';

const test = require('tape');

const Parser = require('../../lib/parser');

test.skip('parser.dependencies - ', (assert) => {
	const data = `
		@extends('layouts.master')

		@include('partials.user')

		@each('partials.friends', 'friends', 'friend', 'pages.empty')
	`;

	const parser = Parser.create(data);

	parser.parse();

	const { dependencies } = parser;

	const expected = [
		{ type: 'extends', path: 'layouts.master' },
		{ type: 'include', path: 'partials.user' },
		{ type: 'each', path: 'partials.friends' },
		{ type: 'include', path: 'pages.empty' }
	];

	assert.deepEquals(dependencies, expected);
	console.log(dependencies);

	assert.end();
});
