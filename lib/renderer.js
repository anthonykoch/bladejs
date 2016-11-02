'use strict';

// module.exports = Renderer;

const assign = require('object-assign');

const helpers        = require('./helpers');
const Lexer          = require('./lexer');
const Parser         = require('./parser');
const Compiler       = require('./compiler');
const Resolver       = require('./resolver');
const Cache          = require('./cache');

const { error,
		toViewPath } = require('./utils');

const { extend,
		transform } = require('./transform');

const { generateCode,
		createFunctionBody } = require('./generate');

const cache            = Cache.create();
const resolver         = Resolver.create();
const customDirectives = {};

const Renderer = {

	/**
	 * Creates a renderer with the specified options.
	 *
	 * @param {String} data - The data to be rendered
	 * @param {Object} options
	 * @param {Array}  [options.contentTags]
	 * @param {Array}  [options.rawTags]
	 * @param {Array}  [options.commentTags]
	 */

	create(data, options) {
		return Object.create(RendererPrototype).init(data, options);
	},

	/**
	 * Renders the template passed.
	 *
	 * @param  {String} data
	 * @param  {Object} options.locals  - Variables used for interpolation
	 * @param  {Object} options.options - Variables used for interpolation
	 * @return {String}
	 */

	render(data, locals, options) {
		return Renderer.create(data, options).render(locals);
	},

	renderFile(path, locals, opts) {
		const options = assign({}, opts);
		let contents;

		try {
			// TODO: Resolve path to filename
			//       const realPath = resolver.getPath(path);
			contents = resolver.getFile(path, options.cache).contents;
		} catch (error) {
			const message =
				error.code === 'ENOENT'
					? `File does not exist: '${path}'`
					: error.message;

			error(message);
		}

		return this.render(contents, locals, options);
	},

	template(data, options) {
		return createTemplate(data, assign({}, options));;
	},

	/**
	 * Returns the generated code for a given template
	 *
	 * @param  {String} data - A blade template
	 * @param  {Object} options
	 * @return {String}
	 */

	code(data, options) {
		const template = this.template(data, options);

		if (template && template.fn) {
			return template.fn.toString();
		}

		return null;
	},

	/**
	 * Returns the inner generated code for a given template.
	 *
	 * Meant for testing purposes only.
	 *
	 * @param  {String} data - A blade template
	 * @param  {Object} options
	 * @return {String}
	 */

	inner(data, options) {
		return getBody(data, options).body;
	},

	Parser,

	Lexer,

	Compiler,

	resolver,

};

const RendererPrototype = {

	init(data, opts) {
		const options = assign({}, opts)

		this.options = options;
		this.source  = data;

		return this;
	},

	/**
	 * Renders data.
	 *
	 * @param {Object} locals - The variables passed into the template
	 */

	render(locals) {
		const directives = this.options.customDirectives;

		if (this.template) {
			return this.template(locals, directives);
		}

		this.template = createTemplate(this.source, this.options);

		return this.template(locals, directives);
	},

	set(setting, value) {
		this.options[setting] = value;
		return this;
	},

};

/**
 * Generates a template function from the blade template and options passed.
 */

function createTemplate(data, options) {
	const { compiler, parsers, body } = getBody(data, options);

	return generateCode(body, {
		helpers,
		parsers,
		customDirectives,
		parser: compiler.parser,
		debug: !! options.debug
	});
}

/**
 * Returns the parser, compiler and body of the template function.
 *
 * @param  {String} data - A blade template
 * @param  {Object} options
 * @return {Object}
 */

function getBody(data, opts) {
	const options  = assign({}, opts);
	const _Parser  =
		typeof options.Parser === 'function'
			? options.Parser
			: Parser;

	const cwd =
		typeof process !== 'undefined' && process.cwd
			? process.cwd()
			: '/';

	options.baseDir =
		typeof options.baseDir !== 'string'
			? cwd
			: options.baseDir;

	options.viewPath =
		options.filename !== undefined
			? toViewPath(options.filename, options.baseDir)
			: undefined;

	// FIXME: There might be discrepancies blade path and filename
	const parser         = _Parser.create(data, options);
	const ast            = transform(parser.parse());
	const hasCustomFiles = Array.isArray(options.files);
	const dependencies   = parser.dependencies;

	const files =
		hasCustomFiles
			? options.files.slice(0)
			: resolver.resolveFiles(parser.dependencies, options);

	const info = {
		conversions: {},
		parsers:     {},
		resolved:    {}
	};

	const { resolved,
			parsers,
			conversions,
			stack
		} = parseDependencies(files, info, _Parser, ! hasCustomFiles, options);

	resolved[parser.filename] = ast;
	parsers[parser.filename]  = parser;

	let master;

	options.parser            = parser;
	options.dependencies      = resolved;
	options.dependencyParsers = parsers;
	options.conversions       = conversions;

	if (ast.extends) {
		master = extend(ast, resolved, conversions);
	} else {
		master = ast;
	}

	options.ast = master;

	const compiler    = Compiler.create(data, options);
	const code        = compiler.compile(master);
	const identifiers = compiler.identifiers;
	const debug       = options.debug;
	const standalone  = options.standalone;
	const body        = createFunctionBody(code, identifiers, standalone, debug);

	return {
		compiler,
		parsers,
		body
	};
}

/**
 * Returns an object mapping filenames to their associated AST.
 *
 * FIXME: The order of each resolved file might be incorrect
 *
 * @param  {Array<Object>} files - An array of pseudo Vinyl files
 * @param  {Object} _Parser - The parser factory
 * @param  {Object} opts - options for the parser
 * @return {Object}
 */

function parseDependencies(files, _info, _Parser, shouldResolveFile, opts) {
	return files.reduce((info, file) => {
		const { parsers,
				resolved,
				conversions } = info;

		if (file == null) {
			error(`Invalid file: ${file}`);
		} else if (typeof file.path !== 'string' || file.path === '') {
			error(`Invalid file path: "${file.path}"`);

		} else if (typeof file.contents !== 'string') {
			error(`Invalid file contents: "${file.contents}"`);
		}

		const filename = normalizePath(file.path);

		// Skip if it's already been parsed
		if (resolved.hasOwnProperty(filename)) {
			return info;
		}

		const viewPath = toViewPath(filename, opts.baseDir);
		const baseDir  = opts.baseDir;

		const options  = assign({}, opts, {
			filename,
			viewPath,
			baseDir
		});

		const parser  = _Parser.create(file.contents, options);
		const ast     = transform(parser.parse());
		let length    = parser.dependencies.length;

		if ( ! filename || typeof filename !== 'string') {
			error(`Found dependency without a path '${filename}'`);
		}

		conversions[viewPath] = filename;
		parsers[filename]     = parser;
		resolved[filename]    = ast;

		if (shouldResolveFile && parser.dependencies.length) {
			const newFiles = resolver.resolveFiles(parser.dependencies, options);
			parseDependencies(newFiles, info, _Parser, shouldResolveFile, options);
		}

		// Throw an error if the dependency is not found in files array
		const isDependencyDefined =
			parser.dependencies
				.forEach((dependency) => {
					const hasDependency =
						files.some((file) => {
							const dep = dependency.path.toLowerCase();
							const filePath = normalizePath(file.path);

							return dep === filePath;
						});

					const where = shouldResolveFile ? 'in file system' : 'in files';

					if ( ! hasDependency) {
						error(`Could not find file '${dependency.path}' (${dependency.viewPath}) ${where}`);
					}
				});

		return info;
	}, _info);
}

function normalizePath(filePath) {
	return filePath.replace(/\\/g, '/').toLowerCase();
}

module.exports = Renderer;
