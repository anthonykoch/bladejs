'use strict';

const test = require('tape');

const Renderer = require('../../lib/renderer');
const utils = require('../utils');

const { VIEW_SIMPLE } = utils.views;

test('Renderer.renderFile', (assert) => {
	const locals = { user: 'Randall' };
	const actual = Renderer.renderFile(VIEW_SIMPLE, locals);
	const expected = `\tBlade is really cool Randall\n`;
	assert.equals(actual, expected);
	assert.end();
});

test.skip('Renderer.renderFile - custom directives', (assert) => {
	const options = {
		customDirectives: { markdown: true }
	};

	const locals = { user: 'Randall' };

	const actual = Renderer.renderFile(VIEW_SIMPLE, locals, options);
	const expected = ``;
	assert.equals(actual, expected);
	assert.end();
});

test('Renderer.template', (assert) => {
	const locals = { user: 'Randall' };
	const data = `@if(user === 'Randall')Hello {{ user }} @endif`;
	assert.equals(Renderer.template(data)(locals), `Hello Randall `);
	assert.end();
});

test('Renderer - accepts passing in files through options', (assert) => {
	const files = [
		{
			path: '/user.blade',
			contents: `Hello {{ user }}`
		}
	];
	const locals   = { user: 'Randall' };
	const data     = `@extends('user')`;
	const options  = { files, baseDir: '/' };
	const renderer = Renderer.create(data, options);
	const expected = 'Hello Randall';

	assert.throws(() => Renderer.template(data, {
		files: [{ path: '' }]
	}), /Invalid file path: ""/, 'path empty string');

	assert.throws(() => Renderer.template(data, {
		files: [{ path: null }]
	}), /Invalid file path: "null"/, 'path null');

	assert.throws(() => Renderer.template(data, {
		files: [{ path: files[0].path, contents: null }]
	}), /Invalid file contents: "null"/, 'contents null');

	assert.equals(renderer.render(locals), expected, 'first');
	assert.equals(renderer.render(locals), expected, 'second');
	assert.equals(renderer.render(locals), expected, 'third');

	assert.end();
});

test('Renderer.code - renders the code of a template', (assert) => {
	const data = `@if(user === 'Randall')Hello {{ user }} @endif`;
	const code = Renderer.code(data);
	assert.equals(typeof code, 'string');
	assert.throws(() => Renderer.code('@if(123)'), /Unclosed @if/);
	assert.end();
});

test('renderer.render - renders a template', (assert) => {
	const locals = { user: 'Randall' };
	const data = `@if(user === 'Randall')Hello {{ user }} @endif`;
	const renderer = Renderer.create(data);
	const expected = 'Hello Randall ';
	assert.equals(renderer.render(locals), expected, 'first');
	assert.equals(renderer.render(locals), expected, 'second');
	assert.equals(renderer.render(locals), expected, 'third');
	assert.end();
});

test('renderer.set', (assert) => {
	const data = `Hello {{ user.getName() }}`;
	const renderer = Renderer.create(data, { debug: true });
	const filename  = 'randall.blade';
	const expected = 'Hello Randall';

	const locals = {
		user: {
			getName() {
				return 'Randall';
			}
		}
	};

	assert.equals(renderer.render(locals), expected);

	assert.throws(() => renderer.render(), /\[Source\]/);
	renderer.set('filename', filename);

	assert.equals(renderer.render(locals), expected);

	assert.end();
});
