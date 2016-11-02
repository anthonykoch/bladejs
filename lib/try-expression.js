'use strict';

const Parser = require('blade-expression');

/**
 * Returns `null` if the data passed is not an expression else
 * returns the AST.
 *
 * @return {Object|null}
 */

function tryExpression(data, options) {
	if (data === '') {
		return null;
	}

	try {
		const parser = Parser.create(data, options);
		const ast = parser.parse();


		if (parser.hasMore) {
			return null;
		}

		return ast;
	} catch (err) {
		return null;
	}

	return null;
}

module.exports = tryExpression;
