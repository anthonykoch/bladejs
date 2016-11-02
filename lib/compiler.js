'use strict';

// module.exports = Compiler;

const { parse: JSParse, walk } = require('blade-expression');
const assign = require('object-assign');

const Parser = require('./parser');

const { error,
		variable,
		replaceString } = require('./utils');

const { LOCALS_NAME,
		OPTIONS_NAME,
		HANDLERS_NAME,
		STACKS_NAME,
		FORLOOP_NAME,
		INTERP_NAME,
		HTML_NAME,
		HELPERS_NAME,
		REFERENCE_NAME,
		LOCAL_EXCLUDES,
		LOOP_OBJECT_NAME,
		PRIVATE_VAR_NAME } = require('./constants/runtime-vars');

const RE_NEWLINES          = /\n/g;
const MAX_WHILE_ITERATIONS = 100000;
const RE_QUOTE             = /(['"])/g;
const RE_BACKWARD_SLASH    = /\\/g;

const defaultIgnore = assign(Object.create(null), {
	locals:             true,
	[LOOP_OBJECT_NAME]: true,

	console,

	self:               true,

	Math:               true,
	NaN:                true,
	Infinity:           true,
	undefined:          true,

	isFinite:           true,
	isNaN:              true,
	parseFloat:         true,
	parseInt:           true,
	decodeURI:          true,
	decodeURIComponent: true,
	encodeURI:          true,
	encodeURIComponent: true,

	Object:             true,
	// Function:           true,
	Boolean:            true,
	Symbol:             true,
	Error:              true,
	// EvalError:          true,
	// InternalError:      true,
	RangeError:         true,
	ReferenceError:     true,
	SyntaxError:        true,
	TypeError:          true,
	URIError:           true,

	Number:             true,
	Math:               true,
	Date:               true,

	String:             true,
	RegExp:             true,

	Array:              true,
	// Int8Array:          true,
	// Uint8Array:         true,
	// Uint8ClampedArray:  true,
	// Int16Array:         true,
	// Uint16Array:        true,
	// Int32Array:         true,
	// Uint32Array:        true,
	// Float32Array:       true,
	// Float64Array:       true,

	Set:                true,
	Map:                true,

	// arguments:          true,

	Intl:               true,

	JSON:               true,
});

const Compiler = {

	/**
	 * Creates and returns a compiler object
	 */

	create(parser, options) {
		return Object.create(CompilerPrototype).init(parser, options);
	},

	getIdentifiers,

	debugLocals,

};

const CompilerPrototype = {

	/**
	 * Initializes the
	 *
	 * @param {Object}   parser
	 * @param {Function} parser.parse  - A function which returns an AST
	 * @param {Object}   options.debug - Whether or not we are in debug mode
	 */

	init(data, opts) {
		const options = assign({}, opts);

		const { ast,
				debug,
				cache,
				dependencies,
				conversions={},
				dependencyParsers={},
				parser: baseParser } = options;

		this.options       = options;
		this.variableIndex = 0;
		this.parser        = baseParser;
		this.filename      = baseParser.filename;
		this.viewPath      = baseParser.viewPath;
		this.debug         = !! debug;
		this.identifiers   = {};
		this.ignore        = Object.create(defaultIgnore);
		this.accumulator   = HTML_NAME;
		this.ast           = ast;
		this.excludes      = LOCAL_EXCLUDES;
		this.sections      = {};
		this.dependencies  = dependencies;
		this.conversions   = conversions;
		this.stack         = [];

		this.reservedError = reservedError.bind(this);
		this.sourceError   = this.sourceError.bind(this);

		return this;
	},

	/**
	 * Returns the inner function body for the generator
	 */

	compile(node) {
		return this.visitNode(node);
	},

	/**
	 * Generate an error message. If a node is passed, the error output will
	 * show the line where the error occured, otherwise defaults to the first
	 * line.
	 *
	 * @param {String}           message
	 * @param {Object|undefined} noed
	 */

	sourceError(message, node) {
		this.parser.error(message, node);
	},

	error,

	/**
	 * Helpers
	 */

	/**
	 * Adds expression `$__html = $__html + expr`.
	 *
	 * @param  {String} str - The expression to add to the accumulator
	 * @return {String}
	 */

	addHTML(str) {
		return `${this.accumulator} = ${this.accumulator} + "${str.replace(RE_NEWLINES, '\\n')}";\n`;
	},

	/**
	 * Returns an ternary expression that checks if the expression passed is
	 * undefined or null. If so, the resulting expression is an empty string.
	 *
	 * @param {String} expr   - The expression to be interpreted
	 * @param {Number} node   - The node currently being compiled
	 */

	expression(expr, node) {
		const e = this.transformLocals(expr.trim(), node);
		return `(null == (${INTERP_NAME} = (${e})) ? '' : ${INTERP_NAME})`;
	},

	/**
	 * Returns the expression
	 * `$__options.debugLine = ${line},options.filename = ${filename}`.
	 *
	 * @param  {Number} line
	 * @return {String}
	 */

	debugInfo(line) {
		const filename = this.filename.replace(RE_BACKWARD_SLASH, '\\\\');
		const debugFile = filename !== ''
			? `, ${OPTIONS_NAME}.debugFile = "${filename}"`
			: ', "[Unknown]"';

		return `${OPTIONS_NAME}.debugLine = ${line}${debugFile}`;
	},

	transformLocals(expr, begin) {
		const nodes =
			this.trackIdentifiers(expr, begin)
				.filter(node => ! node.isParentAssignment);

		return debugLocals(expr, nodes, this.ignore, this.debug);
	},

	/**
	 * Sets any global identifiers found into the compiler's identifiers map
	 * and returns the identifier AST nodes.
	 *
	 * @param  {String} source
	 * @param  {Object} begin - For error reporting purposes
	 * @return {String}
	 */

	trackIdentifiers(expr, begin) {
		const nodes = getIdentifiers(expr, this.excludes, this.reservedError, begin);

		for (var i = nodes.length - 1; i >= 0; i--) {
			const node = nodes[i];
			const name = node.name;

			if (node.isParentAssignment) {
				this.ignore[name]      = true;
				this.identifiers[name] = true;
			}

			if (this.ignore[name]) {
				continue;
			} else if ( ! this.identifiers.hasOwnProperty(name)) {
				this.identifiers[name] = true;
			}
		}

		return nodes;
	},

	getDependencyByViewPath(viewPath) {
		const filename = this.conversions[viewPath];

		// It shouldn't ever come to this, but just in case
		if ( ! this.dependencies.hasOwnProperty(filename)) {
			this.error(`Could not find dependency ${viewPath}`);
		}

		return this.dependencies[filename];
	},

	yieldContent(section) {
		if (this.sections.hasOwnProperty(section)) {
			return this.sections[section];
		}

		return '';
	},

	/**
	 * Visitor functions
	 */

	visitNode(node) {
		if (node == null) {
			this.error('Found undefined or null AST node');
		}

		const name = 'visit' + node.type;

		if (name in this) {
			return this[name](node);
		}

		this.error(`Unrecognized node ${node.type}`);
	},

	visitCommentNode() {
		return '';
	},

	visitIfStatement(node) {
		const line       = this.debug ? this.debugInfo(node.line) + ';\n' : '';
		const ifArgument = this.transformLocals(node.argument, node);
		let alternate    = node.alternate;
		let alternateArgument;

		let str =
			`\n${line}\nif (${ifArgument}) {\n\t${this.visitNode(node.consequent)}} `;

		while (alternate) {
			const consequent = this.visitNode(alternate.consequent);
			const line = this.debug ? this.debugInfo(alternate.line) : '0';

			if (alternate.argument) {
				alternateArgument = this.transformLocals(alternate.argument, node);
				const arg = this.debug ? `(${line}, 0) || ${alternateArgument}` : alternateArgument;
				str = str + `else if (${arg}) {\n\t${consequent}} `;
			} else {
				str = str + ` else {\n\t${line};\n\t${consequent}}`;
			}

			alternate = alternate.alternate;
		}

		return str;
	},

	visitUnlessStatement(node) {
		const argument = this.transformLocals(node.argument, node);
		const line     = this.debug ? this.debugInfo(node.line) + ';\n' : '';

		const str =
`
${line}

if ( ! (${argument})) {
	${this.visitNode(node.consequent)}
}\n\n
`;

		return str;
	},

	visitParentStatement() {
		return ``;
	},

	visitSectionStatement(node) {
		const content = this.visitNode(node.consequent);
		const section = node.argument;
		const str = this.visitNode(node.consequent);

		if (this.sections.hasOwnProperty(section)) {
			this.sections[sections] = '';
		}

		if (node.yields) {
			this.sections[section] = str;
			return this.yieldContent(section);
		} else if (node.appends) {
			this.sections[section] = this.sections[sections] + str;
		} else if (node.overwrites) {
			this.sections[section] = str;
		} else {
			this.sections[section] = str;
		}

		return '';
	},

	visitYieldStatement(node) {
		return this.yieldContent(node.argument)
	},

	visitExtendsStatement(node) {
		return '';
	},

	visitIncludeStatement(node) {
		const ast = this.getDependencyByViewPath(node.argument);
		const filename = this.filename;
		const viewPath = this.viewPath;

		this.filename = this.conversions[node.argument];
		this.viewPath = node.argument;

		if (this.stack.indexOf(this.filename) > -1) {
			this.error(`Circular dependency found from ${viewPath}`);
		}

		this.stack.push(this.filename);

		const line    = this.debug ? this.debugInfo(node.line) + ';\n' : '';
		const str     = `${line}\n${this.visitProgram(ast)}`;

		this.filename = filename;
		this.viewPath = viewPath;
		this.stack.pop();

		return str;
	},

	visitPushStatement(node) {
		const line        = this.debug ? this.debugInfo(node.line) + ';\n' : '';
		const argument    = node.argument;
		const accumulator = this.accumulator;

		this.accumulator  = PRIVATE_VAR_NAME;

		const str =
`
${STACKS_NAME}[${argument}] = (
	typeof ${STACKS_NAME}[${argument}] === 'string'
	? ${STACKS_NAME}[${argument}]
	: '') +
		(function () {
			var ${PRIVATE_VAR_NAME} = '';

			${this.visitNode(node.consequent)}
			return ${PRIVATE_VAR_NAME};
		}());
`;

		this.accumulator = accumulator;
		return str;
	},

	visitStackStatement(node) {
		const line     = this.debug ? this.debugInfo(node.line) + ';\n' : '';
		const argument = node.argument;
		const str =
`
${line}
${HTML_NAME} =
	${HTML_NAME} + (${STACKS_NAME}.hasOwnProperty(${argument}) ? ${STACKS_NAME}[${node.argument}] : '');
`;

		return str;
	},

	visitVerbatimStatement(node) {
		return this.addHTML(node.value.replace(RE_QUOTE, '\\$1'));
	},

	visitInterpolation(node) {
		const line = this.debug ? this.debugInfo(node.line) + ';\n' : '';
		const expr = this.expression(node.argument, node);

		return `${line}${this.accumulator} = ${this.accumulator} + ${HELPERS_NAME}.escape(${expr});\n`;
	},

	visitRawInterpolation(node) {
		const expr = this.expression(node.argument, node);
		const line = this.debug ? this.debugInfo(node.line) + ';\n' : '';

		return `${line}${this.accumulator} = ${this.accumulator} + ${expr};\n`;
	},

	visitTextNode(node) {
		if (node.value.length === 0) {
			return '';
		}

		return this.addHTML(node.value.replace(RE_QUOTE, '\\$1'));
	},

	visitWhileStatement(node) {
		const argument = this.transformLocals(node.argument, node);
		const index    = variable(this.variableIndex);
		const line     = this.debug ? this.debugInfo(node.line) + ';\n' : '';

		this.trackIdentifiers(node.argument, LOCAL_EXCLUDES, node);
		this.variableIndex++;

		const str =
`
${line}
var ${index} = 0;

while (${argument}) { ${index}++;
	if (${index} > ${MAX_WHILE_ITERATIONS}) {
		var err = new Error('Maximum while iterations exceeded');
		throw err;
	}
	${this.visitNode(node.consequent)}
}\n\n\n`;

		this.variableIndex--;

		return str;
	},

	visitCustomStatement(node) {
		const line =
			this.debug ? this.debugInfo(node.line) + ';\n' : '';

		const accumulator = this.accumulator;
		let contents      = 'void 0';
		let argument      = 'void 0';
		let str           = '';

		this.accumulator  = PRIVATE_VAR_NAME;

		if (node.consequent) {
			contents =
`(function () {
		${line}
		var ${PRIVATE_VAR_NAME} = '';

		${this.visitNode(node.consequent)}

		return ${PRIVATE_VAR_NAME};
	}())`;
		}

		if (node.argument) {
			argument = this.expression(node.argument, node);
		}

		str = str +
`
${INTERP_NAME} = ${HANDLERS_NAME}['${node.name}'](
	${argument},
	${contents}
);
${HTML_NAME} = ${HTML_NAME} + (null == ${INTERP_NAME} ? '' : ${INTERP_NAME});
`;

		this.accumulator = accumulator;

		return str;
	},

	visitForStatement(node) {
		this.error('@for has been deprecated, use @repeat instead');
	},

	visitForEachStatement:  visitForStatement,

	visitForElseStatement:  visitForStatement,

	visitEachStatement:     visitForStatement,

	visitContinueStatement: visitLoopStatement('continue'),

	visitBreakStatement:    visitLoopStatement('break'),

	visitBlockStatement:    visitBody,

	visitProgram:           visitBody

};

function visitLoopStatement(type) {
	return function (node) {
		const line   = this.debug ? this.debugInfo(node.line) + ';\n' : '';
		let argument = node.argument;

		if (argument) {
			argument = this.transformLocals(argument, node);

			return `\n\t${line}\nif (${argument}) { ${type}; }\n\n`;
		} else {
			return `\n\t${line}\t${type};\n`;
		}
	}
}

function visitBody(node) {
	const body   = node.body;
	const length = body.length;
	let str      = '';

	for (var i = 0; i < length; i++) {
		str = str + this.visitNode(body[i]);
	}

	return str;
}

/**
 * Returns a function meant to only visit foreach and forelse nodes.
 *
 * @return {Function}
 */

function visitForStatement(node) {
	const iter    = node.iterable;
	const localsCheck = this.transformLocals(node.iterable, node);
	const binding     = node.binding;
	const index       = variable(this.variableIndex);
	const line        = this.debug ? this.debugInfo(node.line) + ';\n' : '';

	this.identifiers[binding] = true;
	this.identifiers[iter]    = true;
	this.ignore[binding]      = true;

	this.variableIndex++;

	const ifstatement =
		node.alternate
			? `if (${iter} && typeof ${iter}.length === 'number' && ${iter}.length > 0) {\n`
			: '';

	const alternate =
		node.alternate
			? ` } else {\n\t${this.visitNode(node.alternate)}}`
			: '';

	const str =
`
${line}
${localsCheck}${localsCheck ? ';' : ''}

${ifstatement}
	${loop.object(node)}

	for (var ${index} = 0; ${index} < ${iter}.length; ${index}++) {
		loop = ${FORLOOP_NAME}${node.depth};

		var ${binding} = ${iter}[${index}];
		${loop.setup(node, index)}

		${this.visitNode(node.consequent)}}
${alternate}
`;

	this.variableIndex--;

	return str;
}

/**
 * FIXME: Need to keep track of assignment expressions as well
 *
 * Returns an array of all global identifiers. Duplicates are removed.
 *
 * @param  {String} expr - The JS expression to parse
 * @param  {Array}  excludes - Any identifier matched in exludes will throw an error
 * @param  {Array}  handleExcluded - Error handler for excluded identifiers
 * @param  {Object} begin - The blade AST node the expression came from
 * @return {Array}
 */

function getIdentifiers(expr, excludes, handleExcluded, begin) {
	const nodes = [];
	const names = [];
	const ast = JSParse(expr);
	let result = expr + '';

	walk(ast, {
		Identifier(node, parent) {
			if (parent.type === 'Property') {
				return;
			} else if (parent.type === 'AssignmentExpression') {
				node.isParentAssignment = true;
			} else if (parent.type === 'MemberExpression') {
				if (parent.object !== node) {
					return;
				}
			}

			if (names.indexOf(node.name) === -1) {
				nodes.push(node);
				names.push(node.name);
			}

			if (excludes && excludes.indexOf(node.name) > -1) {
				handleExcluded(node, begin);
			}
		}
	});

	return nodes;
}

/**
 * If `debug` is `true`, transforms an expression so that each identifier is
 * transformed into an check of whether it is defined. If it's not defined, a custom scope reference error is thrown. If debug is `false` the expression passed is returned.
 *
 * @example
 *   const expr = 'user';
 *   const nodes = getIdentifiers(expr, []);
 *   const str = debugLocals(expr, nodes, true);
 *   str;
 *   // ($__locals.hasOwnProperty('user')
 *   //    ? user
 *   //    : $__helpers.referr('user')
 *   // )
 *
 * @param  {String}        expr - The expr to transform
 * @param  {Array<Object>} nodes - An array of JS AST identifier nodes
 * @param  {Boolean}       debug - Whether or not to transform the expr
 * @return {String}
 */

function debugLocals(expr, nodes, ignore, debug) {
	let result = expr.toString();

	if ( ! debug) {
		return result;
	}

	for (var i = nodes.length - 1; i >= 0; i--) {
		const node = nodes[i];
		const name = node.name;

		if (ignore[name]) {
			continue;
		}

		const replacement =
			`(${LOCALS_NAME}.hasOwnProperty('${name}') ? ${name} : ${HELPERS_NAME}.${REFERENCE_NAME}('${name}'))`;

		result = replaceString(result, replacement, node.start, node.end);
	}

	return result;
}

function reservedError(node, begin) {
	this.sourceError(`${node.name} is reserved`, begin);
}

/**
 * https://github.com/illuminate/view/blob/master/Factory.php#L813
 */

const loop = {
	object(node) {
		const depth = node.depth;
		const iterable = node.iterable;
		const name = `${FORLOOP_NAME}${depth}`;
		const parentName = `${FORLOOP_NAME}${Math.max(depth - 1, 0)}`;
		const str =
`
var ${name} = {
	index: 0,
	iteration: 1,
	remaining: ${iterable}.length,
	first: true,
	last: false,
	depth: ${depth},
	count: ${iterable}.length,
	parent: (typeof ${parentName} === 'undefined') ? null : ${parentName}
};
`;

		return str;
	},

	setup(node, index) {
		const name = `${FORLOOP_NAME}${node.depth}`;
		const iterable = node.iterable;
		const str =
`
if (${index} !== 0) {
		${name}.first = false;
	}
	if (${index} === ${iterable}.length - 1) {
		${name}.last = true;
	}

	${name}.remaining = ${iterable}.length - ${index};
	${name}.iteration = ${index} + 1;
	${name}.index = ${index};
`;

		return str;
	}
};

module.exports = Compiler;
