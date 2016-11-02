'use strict';

const test = require('tape');

const Compiler = require('../../lib/compiler');
const Parser = require('../../lib/parser');

test('Compiler.create - returns a compiler object', (assert) => {
	const data            = '';
	const parser          = Parser.create(data);
	const ast             = parser.parse();
	const compiler        = Compiler.create(data, { parser: Parser.create(data) });
	const compilerWithAST = Compiler.create(data, { parser, ast });
	const actual          = '';

	assert.equals(compiler.ast,  undefined, 'has no ast by default')

	assert.throws(() => Compiler.create(),
		/Cannot read property 'filename' of undefined/, 'throws for no parser');

	assert.equals(compiler.filename,        '[Source]', 'has default filename')
	assert.equals(compiler.parser.filename, '[Source]', 'parser has default filename');

	assert.end();
});

test('compiler.compile - compiles an ast to code', (assert) => {
	const data     = '';
	const parser   = Parser.create(data);
	const ast      = parser.parse();
	const compiler = Compiler.create(data, { parser, ast });

	assert.equals(typeof compiler.compile(compiler.ast), 'string',
		'compiles ast to string');

	assert.end();
});

test('compiler.error - throws an error', (assert) => {
	const data = '';
	const parser = Parser.create(data);

	assert.throws(() => Compiler.create(data, { parser }).error('This is a message'),
		/This is a message/, 'compiler.error throws');

	assert.end();
});

test('compiler.sourceError - throws an error from the compiler\'s parser', (assert) => {
	const data = '';
	const parser = Parser.create(data);

	assert.throws(() => Compiler.create(data, { parser }).sourceError('This is a message'),
		/\[Source\]: This is a message/, 'compiler.sourceError throws');

	assert.end();
});

test('compiler.getIdentifiers - returns array of identifiers from an expression', (assert) => {
	assert.plan(3);

	const getIdentifiers = Compiler.getIdentifiers;
	const begin = {};

	assert.deepEquals(getIdentifiers('greeting + user.name'),
		[
			{
				type: 'Identifier',
				name: 'greeting',
				start: 0,
				end: 8
			},
			{
				type: 'Identifier',
				name: 'user',
				start: 11,
				end: 15
			}
		], 'gets identifiers');

	getIdentifiers('users', ['users'], function handleExclude(node, start) {
		assert.equal(start, begin, 'passes back last param');
		assert.deepEquals(node, {
			type: 'Identifier',
			name: 'users',
			start: 0,
			end: 5
		});
	}, begin, 'fires callback for exclude')

	assert.end();
});
