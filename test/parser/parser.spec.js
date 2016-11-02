'use strict';

const test = require('tape');

const Parser = require('../../lib/parser');
const { endtags } = require('../../lib/constants/directives');

test('parser.source - parser has source data', (assert) => {
	const expected = 'Hello';
	const parser = Parser.create(expected);

	assert.equals(parser.source, expected,
		'Parser.source getter returns proper source')

	assert.equals(parser.lexer.source, parser.lexer.source,
		'Parser.source is the same as lexer.source')

	assert.end();
});

test('parser.filename - parser has filename', (assert) => {
	const expected = 'layout.blade';

	assert.equals(Parser.create('', { filename: expected }).filename,
		expected, 'filename is assigned')

	assert.equals(Parser.create('').filename, '[Source]', 'defaults to [Source]');
	assert.end();
});

test('parser.lexer - parser has lexer object', (assert) => {
	const expected = 'Hello';
	const lexer = Parser.create(expected).lexer;
	assert.ok(typeof lexer === 'object' && lexer, 'lexer is object')
	assert.equals(lexer.source, expected, 'lexer has correct source')
	assert.end();
});

test('parser.endtags - parser has endtags', (assert) => {
	const expected = endtags;
	const actual = Parser.create('').endtags;
	assert.deepEquals(actual, expected, 'endtags default')
	assert.end();
});

test('parser.expect - consumes next token or throws if it does not match', (assert) => {

	assert.doesNotThrow(() => Parser.create('Hello').expect('text'),
		'expect does not throw when correct type is available')

	{
		const data = 'hello';
		const type = 'text';
		const parser = Parser.create(data);
		parser.expect(type);
		assert.throws(() => parser.expect(type),
			/Unexpected end of input/,
			'throws for end of input')
	}

	{
		const data = '@unless@endif';
		const parser = Parser.create(data);
		assert.doesNotThrow(() => parser.expect('unless'));
		assert.throws(() => parser.expect('endunless'),
			/Expected @endunless/,
			'throws if next token is not of correct type')
	}

	assert.end();
});

test('parser.nextToken - consumes the next token', (assert) => {
	const data = 'hello';
	const parser = Parser.create(data);
	const expected = {
		type: 'text',
		line: 1,
		value: data,
		start: 0,
		end: 5
	};
	assert.deepEquals(parser.nextToken(), expected);
	assert.end();
});

test('parser.peek - returns the current token', (assert) => {
	const data = '@breakhello';
	const parser = Parser.create(data);
	const expected = {
		type: 'break',
		line: 1,
		value: '@break',
		start: 0,
		end: 6
	};
	assert.deepEquals(parser.peek(), expected,
		'peek returns next token');

	assert.deepEquals(parser.nextToken(), expected,
		'peek does not consume token');

	assert.end();
});

test('parser.lookahead - returns a token at an index', (assert) => {
	const data = '@breakhello';
	const parser = Parser.create(data);
	const expected = {
		type: 'break',
		line: 1,
		value: '@break',
		start: 0,
		end: 6
	};
	assert.deepEquals(parser.lookahead(1), expected,
		'lookahead returns next token');

	assert.deepEquals(parser.nextToken(), expected,
		'lookahead does not consume token');

	assert.end();
});

test('parser.assertArg - validates the argument as a valid JS expression', (assert) => {
	const data = '@breakhello';
	const parser = Parser.create(data);

	const tokenWithoutArgs = {
		type: 'yield',
		line: 1,
		value: '@yield',
		start: 0,
		end: 6
	};

	const tokenWithEmptyArgs = {
		type: 'yield',
		line: 1,
		value: '@yield()',
		start: 0,
		end: 6
	};

	const tokenWithInvalidArgs = {
		type: 'yield',
		line: 1,
		value: '@yield(class)',
		start: 0,
		end: 6
	};

	const tokenWithValidArgs = {
		type: 'yield',
		line: 1,
		value: '@yield(123)',
		start: 0,
		end: 6
	};

	assert.throws(() => parser.assertArg(tokenWithoutArgs),
		/Found @yield/, 'without args');

	assert.throws(() => parser.assertArg(tokenWithEmptyArgs),
		/Found @yield/, 'empty args');

	assert.throws(() => parser.assertArg(tokenWithInvalidArgs),
		/Invalid expression/, 'invalid args');

	assert.doesNotThrow(() => parser.assertArg(tokenWithInvalidArgs, false),
		'skip validation');

	assert.equals(parser.assertArg(tokenWithValidArgs), '123');

	assert.end();
});

test('parser.assertArgIsString - asserts the argument passed is a string', (assert) => {
	const data = '@breakhello';
	const parser = Parser.create(data);
	const tokenWithoutArgs = {
		type: 'yield',
		line: 1,
		value: '@yield',
		start: 0,
		end: 6
	};

	const tokenWithEmptyArgs = {
		type: 'yield',
		line: 1,
		value: '@yield()',
		start: 0,
		end: 6
	};

	const tokenWithValidArgs = {
		type: 'yield',
		line: 1,
		value: `@yield('views.index')`,
		start: 0,
		end: 21
	};

	assert.throws(() => parser.assertArgIsString(tokenWithoutArgs),
		/Found @yield with no arguments/,
		'lookahead returns next token');

	assert.throws(() => parser.assertArgIsString(tokenWithEmptyArgs),
		/Found @yield with no arguments/,
		'lookahead returns next token');

	['user', '123', '{}', '[]'].forEach(function (argument) {
		assert.throws(() => parser.assertArgIsString({
			type: 'yield',
			line: 1,
			value: `@yield(${argument})`,
			start: 0,
			end: 6
		}),
		/Argument to @.+? should be a string/,
		'lookahead returns next token');
	});

	assert.equals(parser.assertArg(tokenWithValidArgs), `'views.index'`);

	assert.end();
});

test('parser.getDirectiveArguments - returns arguments from directive', (assert) => {
	const parser = Parser.create('');
	const { getDirectiveArguments } = parser;

	assert.equals(getDirectiveArguments('@yield('), null,
		'unclosed bracket');

	assert.equals(getDirectiveArguments('@yield'), null,
		'no parens');

	assert.equals(getDirectiveArguments('@yield()'), '',
		'empty argument');

	assert.equals(getDirectiveArguments('@yield(hello)'), 'hello',
		'argument with one expression');

	assert.equals(
			getDirectiveArguments('@yield(hello, Date.now())'),
			'hello, Date.now()',
			'argument with multiple expressions'
		);

	assert.end();
});

test('parser.error - throws a source serror', (assert) => {
	const parser = Parser.create('');
	assert.throws(() => parser.error(), /\[Source\]/,
		'error throws when called');
	assert.end();
});
