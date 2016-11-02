'use strict';

// module.exports = Parser;

const assign = require('object-assign');
const { StringLiteral: _StringLiteral } = require('blade-expression/constants/regex');

const tryExpression = require('./try-expression');
const Lexer         = require('./lexer');

const { endtags,
		directives,
		statements } = require('./constants/directives');

const { unwrapString,
		replaceString,
		viewPathToFile,
		createSourceError } = require('./utils');

const RE_FOREACH = /([\w_$](?:.+?)?) +as *([$_\w](?:[$_\w\d]+)?)/u;
const RE_START_SPACING = /^\s*?\n/;
const RE_END_SPACING = /\n[\t ]*$/;

const StringLiteral = new RegExp('^(?:' + _StringLiteral.source + ')$');

/**
 * Formats the type for error printing
 */

function fType(type) {
	if (directives.indexOf(type) > -1) {
		return '@' + type;
	}

	return type;
}

function MessageExpectedToken(expected, actual) {
	const types = Array.isArray(expected)
					? expected.map(fType).join(' or ')
					: fType(expected);

	return `Expected ${types} got ${fType(actual)}`;
}

function MessageInvalidStatement(type) {
	return `Invalid ${fType(type)} statement`;
}

function MessageInvalidExpression(type) {
	return `Invalid expression in @${type}`;
}

function MessageInvalidArguments(type) {
	return `Invalid arguments in ${fType(type)}`;
}

function MessageNoArguments(type) {
	return `Found @${type} with no arguments`;
}

function MessageUnclosed(type) {
	return `Unclosed @${type}`;
}

function MessageUnexpectedToken(type) {
	return `Unexpected token ${fType(type)}`;
}

function MessageTakesNoArguments(type) {
	return `${fType(type)} takes no arguments`;
}

function MessageArgumentShouldBeString(type) {
	return `Argument to ${fType(type)} should be a string`;
}

const Parser = {

	create(data, options) {
		return Object.create(ParserPrototype).init(data, options);
	},

	parse(data, options) {
		return Parser.create(data, options).parse();
	},

};

const sourceDescriptor = {

	get() {
		return this.lexer.source;
	},

	set() {
		return this.lexer.source;
	}

};

const ParserPrototype = {

	init(data, options={}) {
		const parser = this;

		const {	rawTags,
				contentTags,
				commentTags,
				customDirectives={},
				baseDir,
				viewPath='[Source]',
				filename='[Source]' } = options;


		const customStartTags = Object.keys(customDirectives);

		const customEndTags = endtags.concat(
				customStartTags.map(str => 'end' + str)
			);

		parser.lexer = Lexer.create(data, {
			customDirectives: customEndTags.concat(customStartTags),
			contentTags,
			commentTags,
			rawTags
		});

		parser.customDirectives        = customDirectives;
		parser.endtags                 = customEndTags;
		parser.loopStack               = 0;
		parser.forLoopStack            = 0;
		parser.isPreviousDirective     = false;
		parser.isPreviousInterpolation = false;
		parser.viewPath                = viewPath;
		parser.filename                = String(filename);
		parser.dependencies            = [];
		parser.baseDir                 = baseDir;

		Object.defineProperty(parser, 'source', sourceDescriptor);

		return parser;
	},

	addDependency(type, viwePath) {
		this.dependencies.push({
			type,
			from: this.filename,
			viewPath: viwePath,
			path: viewPathToFile(viwePath, this.baseDir).toLowerCase()
		});
	},

	/**
	 * Asserts that the current token is the same type passed, and consumes
	 * the next token. If the assertion fails, an EXPECTED error is thrown.
	 *
	 * @param {String} type - The expected token type
	 */

	expect(type) {
		let token = this.peek();

		if (token === null) {
			this.error('Unexpected end of input');
		} else if (type === token.type) {
			return this.nextToken(token);
		} else {
			const expected = this.formatType(type);
			const actual = this.formatType(token.type);

			this.error(MessageExpectedToken(expected, actual), token);
		}
	},

	formatType(type) {
		const _type =
			this.lexer.allDirectives.indexOf(type) > -1
				? '@' + type
				: type;

		return _type;
	},

	/**
	 * Returns the next token.
	 *
	 * @return {Object|null}
	 */

	nextToken(token) {
		const now = token != null ? token : this.peek();
		const next = this.lexer.nextToken();
		this.isPreviousDirective = !! now && now.value[0] === '@';
		this.isPreviousInterpolation =
			(!! now) && (now.type === 'interpolation' || now.type === 'rawinterpolation')

		return next;
	},

	/**
	 * Peeks the next token.
	 *
	 * @return {Object|null}
	 */

	peek() {
		return this.lexer.peek();
	},

	/**
	 * Peeks the lexer's nth token.
	 *
	 * @param  {Number} index
	 * @return {Object|null}
	 */

	lookahead(index) {
		return this.lexer.lookahead(index);
	},

	/**
	 * Asserts that the (directive) has arguments. If the token's arguments
	 * list can't be found, or if the arguments list is empty, a NO_ARGUMENTS
	 * error is thrown.
	 *
	 * If the `validate` argument is passed as true, the arguments
	 * as a whole will be validated as an expression.
	 *
	 * @param  {Object}  token
	 * @param  {Boolean} validate
	 * @return {String} - The arguments list as a string
	 */

	assertArg(token, validate=true) {
		const args = getDirectiveArguments(token.value);

		if (args === '' || args === null) {
			return this.error(MessageNoArguments(token.type), token);
		}

		if (validate && ! tryExpression(args)) {
			this.error(MessageInvalidExpression(token.type), token);
		}

		return args;
	},

	assertArgIsString(token) {
		const args = getDirectiveArguments(token.value);

		if (args === '' || args === null) {
			return this.error(MessageNoArguments(token.type), token);
		}

		if ( ! StringLiteral.test(args)) {
			this.error(MessageArgumentShouldBeString(token.type))
		}

		return args;
	},

	/**
	 * Generate an error message. If a token is passed, the error output will
	 * show the line where the error occured, otherwise defaults to the first
	 * line.
	 *
	 * @param {String}           message
	 * @param {Object|undefined} token
	 */

	error(message, token) {
		const err = createSourceError({
			name: 'ParseError',
			message,
			line: (token) ? token.line : 1,
			source: this.lexer.source,
		});

		throw err;
	},

	getDirectiveArguments,

	/**
	 * Parsing functions
	 */

	parse() {
		const body = [];
		let token;

		while (token = this.peek()) {
			const node = this.parseNode(token);

			if (node !== null) {
				body.push(node);
			}
		}

		return {
			type: 'Program',
			body
		};
	},

	/**
	 * Token should only be passed through the call in `parse()`.
	 * It's used to avoid the extra function call to this.peek.
	 */

	parseNode(token) {
		if (token === undefined) {
			token = this.peek();
		}

		if (token == null) {
			this.error('Unexpected end of input');
		}

		const name = 'parse' + token.type;

		if (name in this) {
			return this[name]();
		}

		if (token.type in this.customDirectives) {
			return this.parseCustomDirective(token.type);
		}

		this.error(MessageUnexpectedToken(this.formatType(token.type)), token);
	},

	parsecomment() {
		const { value, line, start, end } = this.expect('comment');
		return {
			type: 'CommentNode',
			value,
			line,
			start,
			end
		};
	},

	parsesection() {
		const beginToken = this.expect('section');
		const { value, line, start, end } = beginToken;
		const argument   = this.assertArgIsString(beginToken, false);
		const consequent = this.block(beginToken);
		const endToken   = this.peek();

		if ( ! endToken) {
			this.error(MessageUnclosed(token.type), beginToken);
		}

		const type       = endToken.type;
		const show       = type === 'show';
		const overwrites = type === 'overwrite';
		const appends    = type === 'append';

		if (   show || overwrites || appends
			|| type === 'endsection' || type === 'stop') {
			this.expect(type);
		} else {
			const message = MessageExpectedToken('@section closing directive', type);
			this.error(message, beginToken);
		}

		return {
			type: 'SectionStatement',
			argument,
			consequent,
			appends,
			overwrites,
			yields: show,
			line,
			start,
			end: endToken.end,
		};
	},

	parseverbatim() {
		const beginToken = this.expect('verbatim');
		const { type, value, line, start } = beginToken;
		let token;
		let str = '';
		let found = false;
		let end;

		if (typeof getDirectiveArguments(value) === 'string') {
			this.error(ParserErrors.MessageTakesNoArguments(type), beginToken);
		}

		while (token = this.nextToken()) {
			if (token.type === 'endverbatim') {
				found = true;
				end = token.end;
				break;
			}

			str = str + token.value;
		}

		if (token === null || ! found) {
			this.error(MessageUnclosed(beginToken.type), beginToken);
		}

		return {
			type: 'VerbatimStatement',
			value: str,
			line,
			start,
			end
		};
	},

	parseif() {
		const parser = this;
		const beginToken = this.expect('if');
		const argument = this.assertArg(beginToken);
		let alternate = null;
		let consequent = this.block(beginToken);
		let token;
		let topAlternate = null;

		const types = {'elseif': 'IfStatement', 'else': 'ElseStatement'};

		while (token = this.peek()) {
			const value = token.type;
			let alt;

			if (value === 'elseif' || value === 'else') {

				const expected = this.nextToken();
				const block = this.block(beginToken);

				const end =
					block.body.length > 0
						? block.body[block.body.length - 1].end
						: expected.end;

				const argument =
					value === 'elseif'
						? this.assertArg(token)
						: null;

				alt = {
					type: 'IfStatement',
					argument,
					consequent: block,
					line: token.line,
					start: token.start,
					end
				};

				if ( ! alternate) {
					topAlternate = alternate = alt;
				} else {
					alternate = alternate.alternate = alt;
				}
			} else {
				break;
			}

			if (value === 'else') {
				break;
			}
		}

		const endBlock = this.expect('endif', beginToken);

		return {
			type: 'IfStatement',
			consequent,
			argument,
			alternate: topAlternate,
			line : beginToken.line,
			start: beginToken.start,
			end: endBlock.end,
		};
	},

	parseunless() {
		const beginToken = this.expect('unless');
		const { line, start } = beginToken;
		const argument = this.assertArg(beginToken);
		const consequent = this.block(beginToken);
		const end = this.expect('endunless').end;

		return {
			type: 'UnlessStatement',
			consequent,
			argument,
			line,
			start,
			end
		};
	},

	parseFor() {
		this.error(
				'@for has been deprecated use @repeat instead',
				this.expect('for')
			);
	},

	parseforeach: parseFor('foreach', 'ForEachStatement'),

	parseforelse: parseFor('forelse', 'ForElseStatement', 'empty'),

	parsewhile() {
		const beginToken = this.expect('while');
		const { value, line, start, end } = beginToken;
		const argument = this.assertArg(beginToken);

		this.loopStack++;

		const consequent = this.block(beginToken);
		const endToken = this.expect('endwhile');

		this.loopStack--;

		return {
			type: 'WhileStatement',
			argument,
			consequent,
			line,
			start,
			end: endToken.end,
		};
	},

	parsepush() {
		const beginToken = this.expect('push');
		const { value, line, start, end } = beginToken;
		const argument = this.assertArgIsString(beginToken);
		const consequent = this.block(beginToken);
		const endToken = this.expect('endpush');

		return {
			type: 'PushStatement',
			argument,
			consequent,
			line,
			start,
			end: endToken.end
		};
	},

	parseinterpolation:
		interpolation('interpolation', 'Interpolation', 'contentTags'),

	parserawinterpolation:
		interpolation('rawinterpolation', 'RawInterpolation', 'rawTags'),

	/**
	 * This also replaces whitespace, which is a performance optimization
	 * so that we don't end up with `html = html + '\n\n\t';` in between
	 * directives, which has a big impact on performance.
	 */

	parsetext() {
		const { isPreviousDirective,
				isPreviousInterpolation } = this;

		const token = this.expect('text');

		const nextToken = this.peek();
		const isNextDirective = !! nextToken && nextToken.value[0] === '@';
		const value = token.value;
		const length = value.length;
		const startSpacing = ! isPreviousInterpolation ? value.match(RE_START_SPACING) : null;
		const endSpacing = isNextDirective || nextToken === null ? value.match(RE_END_SPACING) : null;
		const start = startSpacing ? startSpacing[0].length : 0;
		const eraseEndingNewline = nextToken === null ? 0 : 1;
		let end = endSpacing ? length - endSpacing[0].length + eraseEndingNewline : length;
		let str = value;

		if (isPreviousDirective && isNextDirective && value.trim() === '') {
			return null;
		} else if (startSpacing || endSpacing) {
			if (value === '\n') {
				str = '\n';
			} else {
				str = value.substring(start, end);
			}
		}
		return {
			type: 'TextNode',
			value: str,
			line: token.line,
			start: token.start,
			end: token.end
		};
	},

	parseeach() {
		const token = this.expect('each');
		const { value, line, start, end } = token;
		const argument = getDirectiveArguments(token.value);
		const directiveLength = 6;
		let alternate = null;

		if ( ! argument) {
			this.error(MessageNoArguments(token.type));
		}

		const ast = tryExpression(argument);

		if (ast === null) {
			this.error(MessageInvalidArguments(token.type))
		}

		const expressionStatement = ast.body[0];

		const expr = expressionStatement !== null
			? expressionStatement.expression
			: null;


		if (expr === null
			|| expr.type !== 'SequenceExpression'
			|| expr.expressions.length < 3) {
			this.error(`Missing arguments to @each`, token);
		}

		const expressions = expr.expressions;

		const first  = expressions[0];
		const second = expressions[1];
		const third  = expressions[2];
		const fourth = expressions[3];

		if (   ! isStringNode(first)
			|| ! isStringNode(third)
			|| fourth !== undefined && ! isStringNode(fourth)
			|| second === undefined) {
			this.error(MessageInvalidArguments(token.type), token);
		}

		const eachPath        = unwrapString(first.value);
		const binding         = unwrapString(third.value);
		const iterable        = argument.substring(second.start, second.end);
		const consequentStart = start + first.start + directiveLength;
		const consequentEnd   = start + first.end + directiveLength;
		const consequent      = new IncludeStatement(eachPath, line, consequentStart, consequentEnd);

		this.addDependency('each', eachPath);

		if (fourth) {
			const emptyPath    = unwrapString(fourth.value);
			const includeStart = start + fourth.start + directiveLength;
			const includeEnd   = start + fourth.end + directiveLength;
			alternate          = new IncludeStatement(emptyPath, line, includeStart, includeEnd);

			this.addDependency('include', emptyPath);
		}

		const statement = new ForStatement('ForElseStatement', this.forLoopStack, iterable, binding, consequent, alternate, line, start, end);

		return statement;
	},

	parseinclude:
		singleDirective('include', 'IncludeStatement', true, 'assertArgIsString', true),

	parseextends:
		singleDirective('extends', 'ExtendsStatement', true, 'assertArgIsString', true),

	parsestack:
		singleDirective('stack',   'StackStatement',   true, 'assertArg',         false),

	parseyield:
		singleDirective('yield',   'YieldStatement',   true, 'assertArgIsString', false),

	parseparent:
		singleDirective('parent', 'ParentStatement', false, '', false),

	parsecontinue: loopDirective('continue', 'ContinueStatement'),

	parsebreak:    loopDirective('break', 'BreakStatement'),

	parseCustomDirective(tokenType) {
		const endTokenType = 'end' + tokenType;
		const beginToken   = this.expect(tokenType);
		const args         = getDirectiveArguments(beginToken.value);
		let index          = 1;
		let end            = beginToken.end;
		let token          = this.peek();
		let consequent     = null;
		let argument       = null;
		let length;
		let endToken;

		if (args) {
			argument = this.assertArg(beginToken);
		}

		while (token) {
			if (this.endtags.indexOf(token.type) > -1) {
				if (token.type === endTokenType) {
					consequent = this.block(beginToken);
					endToken = this.expect(endTokenType);
					length = consequent.body.length;

					end =
						length
							? consequent.body[length - 1].end
							: endToken.end;

					break;
				}
			}

			token = this.lookahead(index);
			index = index + 1;
		}

		return {
			type: 'CustomStatement',
			name: tokenType,
			consequent,
			argument,
			line: beginToken.line,
			start: beginToken.start,
			end
		};
	},

	block(beginBlock) {
		const body = [];
		let token;
		let type;

		while (true) {
			token = this.peek()

			if (token === null) {
				this.error(MessageUnclosed(beginBlock.type), beginBlock);
			}

			type = token.type;

			// MUST CALL this.expect(type) RIGHT AFTER RETURN
			// TO CONSUME THE ENDING BLOCK!
			if (this.endtags.indexOf(type) > -1) {
				break;
			}

			const node = this.parseNode();

			if (node !== null) {
				body.push(node);
			}
		}

		return {
			type: 'BlockStatement',
			body
		};
	}

};

/**
 * Returns the argument list from a directive.
 *
 * @example
 *   getDirectiveArguments('@yield()');        // ''
 *   getDirectiveArguments('@yield("hello")'); // '"hello"'
 *   getDirectiveArguments('@yield(user.name, Date.now())'); // '"hello", Date.now()'
 *
 * @param  {String}      value
 * @return {String|null} - Returns string if found else null
 */

function getDirectiveArguments(value) {
	const openParenIndex = value.indexOf('(');
	const closeParenIndex = value.lastIndexOf(')');

	if (openParenIndex > -1 && closeParenIndex > -1) {
		return value.substring(openParenIndex + 1, value.length - 1);
	}

	return null;
}

/**
 * Returns a for parsing parsing a directive which may only be declared
 * inside a loop. The args for the directive are optional but if they
 * are present, must result in a valid JavaScript expression as defined
 * by tryExpression.
 *
 * @param  {String}   tokenType
 * @param  {String}   nodeType
 * @return {Function}
 */

function loopDirective(tokenType, nodeType) {
	return function () {
		const token = this.expect(tokenType);
		const { value, line, start, end } = token;
		const argument = getDirectiveArguments(token.value);

		if (argument === '') {
			this.error(MessageNoArguments(token.type))
		}

		if (argument && ! tryExpression(argument)) {
			this.error(MessageInvalidExpression(token.type), token);
		}

		if (this.loopStack < 1) {
			this.error(`Found ${tokenType} outside of loop`, token);
		}

		return {
			type: nodeType,
			argument,
			line,
			start,
			end
		};
	}
}

/**
 * Returns a function for parsing interpolation.
 *
 * @param {String}   tokenType
 * @param {String}   nodeType
 * @param {String}   tags      - The tags that designate the start and end of
 *                               interplation e.g. `['{{', '}}']`
 * @return {Function}
 */

function interpolation(tokenType, nodeType, tags) {
	return function () {
		const token = this.expect(tokenType);
		const [open, end] = this.lexer[tags];
		const tokenValue = token.value;
		const argument = tokenValue.slice(open.length, tokenValue.length - end.length);

		if ( ! tryExpression(argument)) {
			this.error('Interpolation does not yield an expression', token);
		}

		return {
			type: nodeType,
			argument,
			line: token.line,
			start: token.start,
			end: token.end
		};
	}
}

/**
 * Returns a parsing function for a single tag directive e.g. `@yield`.
 *
 * @param  {String}   tokenType   - The name of the directive
 * @param  {String}   nodeType    - Its resulting AST node type
 * @param  {Boolean}  hasArgument - Whether or not to capture the args
 * @param  {Boolean}  validate    - Whether or not to validate the args as an expression
 * @return {Function}
 */

function singleDirective(tokenType, nodeType, hasArgument, validation, isArgDependency) {
	return function () {
		const token  = this.expect(tokenType);
		let argument = null;

		if (hasArgument) {
			argument = this[validation](token, true);

			if (isArgDependency) {
				argument = unwrapString(argument);
				this.addDependency(tokenType, argument);
			}

			argument = argument;
		}

		return {
			type: nodeType,
			argument,
			line: token.line,
			start: token.start,
			end: token.end
		}
	};
}

/**
 * Returns a function for parsing forelse and foreach.
 *
 * @param  {String}   tokenType
 * @param  {String}   nodeType
 * @param  {String}   alternateType
 * @return {Function}
 */
function parseFor(tokenType, nodeType, alternateType) {
	return function () {
		const beginToken = this.expect(tokenType);
		const { value, line, start, end } = beginToken;
		const argument = getDirectiveArguments(beginToken.value);
		const depth = this.forLoopStack;
		let alternate = null;
		let consequent;
		let endToken;
		let match;
		let iterable;
		let binding;

		this.loopStack++;
		this.forLoopStack++;

		if ( ! argument || ! (match = argument.match(RE_FOREACH))) {
			this.error(MessageInvalidStatement(beginToken.type), beginToken);
		}

		iterable = match[1];
		binding = match[2];

		if ( ! tryExpression(`${iterable} || ${binding}`)) {
			this.error(MessageInvalidExpression(beginToken.type), beginToken);
		}

		iterable = iterable;
		consequent = this.block(beginToken);

		if (typeof alternateType === 'string') {
			this.expect(alternateType);
			alternate = this.block(beginToken);
		}

		endToken = this.expect(`end${tokenType}`);

		const statement = new ForStatement(nodeType, depth, iterable, binding, consequent, alternate, line, start, endToken.end);

		this.loopStack--;
		this.forLoopStack--;

		return statement;
	}
};

/**
 * Returns true if the node passed is a string literal
 *
 * @param  {Object} node - An JS expression ast node
 * @return {Boolean}
 */

function isStringNode(node) {
	return !! (
			node
			&& node.type === 'Literal'
			&& StringLiteral.test(node.value)
		);
}

function ForStatement(type, depth, iterable, binding, consequent, alternate, line, start, end) {
	this.type       = type;
	this.depth      = depth;
	this.iterable   = iterable;
	this.binding    = binding;
	this.consequent = consequent;
	this.alternate  = alternate;
	this.line       = line;
	this.start      = start;
	this.end        = end;
}

function IncludeStatement(argument, line, start, end) {
	this.type     = 'IncludeStatement';
	this.argument = argument;
	this.line     = line;
	this.start    = start;
	this.end      = end;
}

module.exports = Parser;
