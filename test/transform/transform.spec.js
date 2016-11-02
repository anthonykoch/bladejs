'use strict';

const test = require('tape');

const Parser        = require('../../lib/parser');
const { transform } = require('../../lib/transform');

test('transform - trims the first node of ast if empty', (assert) => {
	['{{ user }}', '{!! user !!}'].forEach((interpolation) => {
		const ast = Parser.parse(` ${interpolation} `, { baseDir: '/' });

		assert.equals(ast.body.length, 3, 'starting nodes length');
		assert.equals(ast.body[0].value, ' ', 'first is whitespae');
		assert.equals(ast.body[2].value, ' ', 'last is whitespace');

		transform(ast);

		assert.equals(ast.body.length, 2);
		assert.equals(ast.body[0].argument, ' user ');
		assert.equals(ast.body[1].value, ' ',
			'does not trim whitespace after interpolation');

	});

	assert.end();
});

test('transform - trims the first and last text node if empty', (assert) => {
	const ast = Parser.parse(` @if(123)@endif `, { baseDir: '/' });

	assert.equals(ast.body.length, 2, 'starting nodes length');
	assert.equals(ast.body[0].value, ' ', 'first is whitespae');
	assert.equals(ast.body[1].type, 'IfStatement', 'last directive');

	transform(ast);

	assert.equals(ast.body.length, 1);
	assert.equals(ast.body[0].type, 'IfStatement');

	assert.end();
});

test('transform - trims the first and last text node if empty', (assert) => {
	const layout = `layout.master`;
	const ast = Parser.parse(`@extends('${layout}')`, { baseDir: '/' });

	assert.equals(ast.extends, undefined, 'extends is null');

	transform(ast);

	assert.equals(ast.extends, layout);

	assert.end();
});
