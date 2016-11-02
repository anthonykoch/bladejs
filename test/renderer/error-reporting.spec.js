'use strict';

const test = require('tape');

const Blade = require('../../lib/index');

function setup(data, locals, options) {
	return Blade.render(data, locals, options);
}

const files = [
	{
		path: '/layout/master.blade',
		contents: 'This is the master {{ user }}'
	},
	{
		path: '/pages/home.blade',
		contents: 'This is the home page {{ user }}'
	},
	{
		path: '/pages/empty.blade',
		contents: 'This view is empty {{ user }}'
	}
];

test('Renderer - @include reports correct filename', (assert) => {
	const options =  { debug: true, files, baseDir: '/' };

	assert.throws(() =>
		setup(`@include('layout.master')`, {}, options),
		/\/layout\/master.blade: user/, 'only');

	assert.throws(() =>
		setup(`{{ user }} @include('layout.master')`, {}, options),
		/\[Source\]: user/, 'before');

	assert.throws(() =>
		setup(`@include('layout.master') {{ hello }}`, { user: '' }, options),
		/\[Source\]: hello/, 'after');

	assert.end();
});

test('Renderer - @extends reports correct name', (assert) => {
	const options = { debug: true, files, baseDir: '/' };

	assert.throws(() =>
		setup(`@extends('layout.master')`, {}, options),
		/\[Source\]: user/, 'only');

	assert.throws(() =>
		setup(`{{ user }} @extends('layout.master')`, {}, options),
		/\[Source\]: user/, 'before');

	assert.throws(() =>
		setup(`@extends('layout.master') {{ hello }}`, {}, options),
		/\[Source\]: hello/, 'after');

	assert.end();
});

test('Renderer - @each reports correct name', (assert) => {
	const options = { debug: true, files, baseDir: '/' };
	const locals = { users: [] };

	assert.throws(() =>
		setup(`@each('pages.home', users, 'person', 'pages.empty')`, locals, options),
		/\/pages\/empty.blade: user/, 'only');

	assert.throws(() =>
		setup(`{{ user }} @each('pages.home', users, 'user', 'pages.empty')`, locals, options),
		/\[Source\]: user/, 'before');

	assert.throws(() =>
		setup(`@each('pages.home', users, 'person', 'pages.empty') {{ user }}`, locals, options),
		/\/pages\/empty.blade: user/, 'before');

	assert.doesNotThrow(() =>
		setup(`@each('pages.home', users, 'user')`, locals, options));

	assert.throws(() =>
		setup(`{{ hello }} @each('pages.home', users, 'user')`, locals, options),
		/\[Source\]: hello/, 'before');

	assert.throws(() =>
		setup(`@each('pages.home', users, 'user') {{ hello }}`, locals, options),
		/\[Source\]: hello/, 'after');

	assert.end();
});
