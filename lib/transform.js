'use strict';

// module.exports = {
// 	transform,
// 	extend
// };

const { error } = require('./utils');

/**
 * Returns a master AST, which represent the top extend.
 *
 * @param  {Object} ast
 * @param  {Object} dependencies
 * @return {Object}
 */
function extend(ast, dependencies, conversions) {
	const body = [];
	const master = {
		type: 'Program',
		isMaster: true,
		body
	};

	while (ast) {
		const viewPath = ast.extends;
		const filename = conversions[viewPath];

		body.push(ast);

		if (viewPath === null) {
			break;
		} else {
			ast = dependencies[filename];
		}

		if (ast === undefined) {
			error(`Could not find extend file '${viewPath}'`);
		}
	}

	return master;
}

/**
 * Marks the file as an extension of another file if the first
 * directive is an @extends statement. Trims the first and last
 * text node if they are whitespace.
 *
 * @param  {Object} ast
 * @return {Object}
 */

function transform(ast) {
	const body = ast.body;
	let extend = null;

	if (isTrimmable(body[0])) {
		body.shift();
	}

	const length = body.length - 1;
	const secondToLast = body[length - 1];

	if (isTrimmable(body[length], body[length - 1])) {
		body.pop();
	}

	for (let i = 0; i < body.length; i++) {
		let node = body[i];

		if (node.type === 'TextNode') {
			continue;
		} else if (node.type === 'ExtendsStatement') {
			extend = node.argument;
			break;
		} else {
			break;
		}
	}

	ast.extends = extend;

	return ast;
}

const interpolation = ['Interpolation', 'RawInterpolation'];

function isTrimmable(node, previous) {
	if (previous != null && interpolation.indexOf(previous.type) > -1) {
		return false;
	}

	if (node) {
		return node && node.type === 'TextNode' && node.value.trim() === '';
	}

	return false;
}

module.exports = {
	transform,
	extend
};
