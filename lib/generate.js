'use strict';

module.exports = {
	createFunctionBody,
	generateCode
};

const { STACKS_NAME,
		HANDLERS_NAME,
		INTERP_NAME,
		LOOP_OBJECT_NAME,
		REFERENCE_NAME,
		HTML_NAME,
		DEBUG_LINE,
		LOCALS_NAME,
		HELPERS_NAME,
		OPTIONS_NAME } = require('./constants/runtime-vars');

const { createSourceError } = require('./utils');

const inlineHelpers = (function () {
	const helpers = require('./helpers');
	const str =
`{
	${REFERENCE_NAME}: ${helpers[REFERENCE_NAME].toString()},

	escape: ${helpers.escape.toString()},
};\n`;

	return str;
}());

function createFunctionBody(code, identifiers, standalone, debug) {
	const keys = Object.keys(identifiers);
	const locals = keys.map(id => `${LOCALS_NAME}["${id}"]`);

	keys.unshift(HANDLERS_NAME, STACKS_NAME, HTML_NAME);
	locals.unshift(HANDLERS_NAME, `{}`, `""`);

	const body =
`'use strict';

var locals = ${LOCALS_NAME} =
	${LOCALS_NAME} == null
		? {}
		: ${LOCALS_NAME};

${HELPERS_NAME} =
	${!! standalone ? inlineHelpers : HELPERS_NAME}

return (function (${keys.join(', ')}) {
var ${INTERP_NAME};
var ${LOOP_OBJECT_NAME};

${debug ? code : code.replace(/\n/g, '')}

return ${HTML_NAME};
}(${locals.join(', ')}));
`;

	return body;
}

function generateCode(body, opts) {
	let { parser, parsers } = opts;

	const { debug,
			helpers,
			customDirectives } = opts;

	const debugInfo = {
		debug,
		debugLine: -1,
		debugFile: parser.filename
	};

	const handlers =
		Object
			.keys(customDirectives)
			.reduce((result, key) => {
				result[key] = customDirectives[key].handler;
				return result;
			}, {});

	let fn;

	if ( ! debug) {
		// Avoid memory leak
		parser = null;
		parsers = null;
	}

	fn = new Function(
		// Change to use a single object
		LOCALS_NAME,
		HANDLERS_NAME,
		HELPERS_NAME,
		OPTIONS_NAME,
		undefined,
		body
	);

	function template(locals, _handlers) {
		let h =
			typeof _handlers === 'object' && _handlers
				? _handlers
				: handlers;

		try {
			return fn(locals, h, helpers, debugInfo);
		} catch (error) {
			const line = debugInfo.debugLine;
			const source =
				debug
					? parsers[debugInfo.debugFile].source
					: undefined;

			let name = error.name;

			if (['ReferenceError', 'ScopeError'].indexOf(error.name) === -1) {
				name = 'CompilationError'
			}

			const err = createSourceError({
				name,
				filename: debugInfo.debugFile,
				message: error.message,
				line: line === -1 ? undefined : line,
				source
			});

			throw err;
		}
	};

	template.fn = fn;

	return template;
}
