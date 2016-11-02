'use strict';

const js = [
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'export',
	'extends',
	'finally',
	'for',
	'function',
	'if',
	'import',
	'in',
	'instanceof',
	'new',
	'return',
	'super',
	'switch',
	'throw',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
];

const reserved = js
	.reduce(function (result, word) {
		result[word] = true;
		return result;
	}, {});

module.exports = {
	reserved
};
