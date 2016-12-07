(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	// module.exports = Renderer;

	var assign = __webpack_require__(3);

	var helpers = __webpack_require__(4);
	var Lexer = __webpack_require__(5);
	var Parser = __webpack_require__(13);
	var Compiler = __webpack_require__(22);
	var Resolver = __webpack_require__(24);
	var Cache = __webpack_require__(25);

	var _require = __webpack_require__(8),
	    error = _require.error,
	    toViewPath = _require.toViewPath;

	var _require2 = __webpack_require__(26),
	    extend = _require2.extend,
	    transform = _require2.transform;

	var _require3 = __webpack_require__(27),
	    generateCode = _require3.generateCode,
	    createFunctionBody = _require3.createFunctionBody;

	var cache = Cache.create();
	var resolver = Resolver.create();
	var customDirectives = {};

	var Renderer = {

		/**
	  * Creates a renderer with the specified options.
	  *
	  * @param {String} data - The data to be rendered
	  * @param {Object} options
	  * @param {Array}  [options.contentTags]
	  * @param {Array}  [options.rawTags]
	  * @param {Array}  [options.commentTags]
	  */

		create: function create(data, options) {
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

		render: function render(data, locals, options) {
			return Renderer.create(data, options).render(locals);
		},
		renderFile: function renderFile(path, locals, opts) {
			var options = assign({}, opts);
			var contents = void 0;

			try {
				// TODO: Resolve path to filename
				//       const realPath = resolver.getPath(path);
				contents = resolver.getFile(path, options.cache).contents;
			} catch (error) {
				var message = error.code === 'ENOENT' ? 'File does not exist: \'' + path + '\'' : error.message;

				error(message);
			}

			return this.render(contents, locals, options);
		},
		template: function template(data, options) {
			return createTemplate(data, assign({}, options));;
		},


		/**
	  * Returns the generated code for a given template
	  *
	  * @param  {String} data - A blade template
	  * @param  {Object} options
	  * @return {String}
	  */

		code: function code(data, options) {
			var template = this.template(data, options);

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

		inner: function inner(data, options) {
			return getBody(data, options).body;
		},


		Parser: Parser,

		Lexer: Lexer,

		Compiler: Compiler,

		resolver: resolver

	};

	var RendererPrototype = {
		init: function init(data, opts) {
			var options = assign({}, opts);

			this.options = options;
			this.source = data;

			return this;
		},


		/**
	  * Renders data.
	  *
	  * @param {Object} locals - The variables passed into the template
	  */

		render: function render(locals) {
			var directives = this.options.customDirectives;

			if (this.template) {
				return this.template(locals, directives);
			}

			this.template = createTemplate(this.source, this.options);

			return this.template(locals, directives);
		},
		set: function set(setting, value) {
			this.options[setting] = value;
			return this;
		}
	};

	/**
	 * Generates a template function from the blade template and options passed.
	 */

	function createTemplate(data, options) {
		var _getBody = getBody(data, options),
		    compiler = _getBody.compiler,
		    parsers = _getBody.parsers,
		    body = _getBody.body;

		return generateCode(body, {
			helpers: helpers,
			parsers: parsers,
			customDirectives: customDirectives,
			parser: compiler.parser,
			debug: !!options.debug
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
		var options = assign({}, opts);
		var _Parser = typeof options.Parser === 'function' ? options.Parser : Parser;

		var cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '/';

		options.baseDir = typeof options.baseDir !== 'string' ? cwd : options.baseDir;

		options.viewPath = options.filename !== undefined ? toViewPath(options.filename, options.baseDir) : undefined;

		// FIXME: There might be discrepancies blade path and filename
		var parser = _Parser.create(data, options);
		var ast = transform(parser.parse());
		var hasCustomFiles = Array.isArray(options.files);
		var dependencies = parser.dependencies;

		var files = hasCustomFiles ? options.files.slice(0) : resolver.resolveFiles(parser.dependencies, options);

		var info = {
			conversions: {},
			parsers: {},
			resolved: {}
		};

		var _parseDependencies = parseDependencies(files, info, _Parser, !hasCustomFiles, options),
		    resolved = _parseDependencies.resolved,
		    parsers = _parseDependencies.parsers,
		    conversions = _parseDependencies.conversions,
		    stack = _parseDependencies.stack;

		resolved[parser.filename] = ast;
		parsers[parser.filename] = parser;

		var master = void 0;

		options.parser = parser;
		options.dependencies = resolved;
		options.dependencyParsers = parsers;
		options.conversions = conversions;

		if (ast.extends) {
			master = extend(ast, resolved, conversions);
		} else {
			master = ast;
		}

		options.ast = master;

		var compiler = Compiler.create(data, options);
		var code = compiler.compile(master);
		var identifiers = compiler.identifiers;
		var debug = options.debug;
		var standalone = options.standalone;
		var body = createFunctionBody(code, identifiers, standalone, debug);

		return {
			compiler: compiler,
			parsers: parsers,
			body: body
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
		return files.reduce(function (info, file) {
			var parsers = info.parsers,
			    resolved = info.resolved,
			    conversions = info.conversions;


			if (file == null) {
				error('Invalid file: ' + file);
			} else if (typeof file.path !== 'string' || file.path === '') {
				error('Invalid file path: "' + file.path + '"');
			} else if (typeof file.contents !== 'string') {
				error('Invalid file contents: "' + file.contents + '"');
			}

			var filename = normalizePath(file.path);

			// Skip if it's already been parsed
			if (resolved.hasOwnProperty(filename)) {
				return info;
			}

			var viewPath = toViewPath(filename, opts.baseDir);
			var baseDir = opts.baseDir;

			var options = assign({}, opts, {
				filename: filename,
				viewPath: viewPath,
				baseDir: baseDir
			});

			var parser = _Parser.create(file.contents, options);
			var ast = transform(parser.parse());
			var length = parser.dependencies.length;

			if (!filename || typeof filename !== 'string') {
				error('Found dependency without a path \'' + filename + '\'');
			}

			conversions[viewPath] = filename;
			parsers[filename] = parser;
			resolved[filename] = ast;

			if (shouldResolveFile && parser.dependencies.length) {
				var newFiles = resolver.resolveFiles(parser.dependencies, options);
				parseDependencies(newFiles, info, _Parser, shouldResolveFile, options);
			}

			// Throw an error if the dependency is not found in files array
			var isDependencyDefined = parser.dependencies.forEach(function (dependency) {
				var hasDependency = files.some(function (file) {
					var dep = dependency.path.toLowerCase();
					var filePath = normalizePath(file.path);

					return dep === filePath;
				});

				var where = shouldResolveFile ? 'in file system' : 'in files';

				if (!hasDependency) {
					error('Could not find file \'' + dependency.path + '\' (' + dependency.viewPath + ') ' + where);
				}
			});

			return info;
		}, _info);
	}

	function normalizePath(filePath) {
		return filePath.replace(/\\/g, '/').toLowerCase();
	}

	module.exports = Renderer;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {

	  referr: referr,

	  escape: escape

	};

	/**
	 * Throws a reference error for the variable name passed
	 *
	 * @param {String} name - The variable name
	 */

	function referr(name) {
	  var err = new Error(name + ' is not in locals');
	  err.name = 'ScopeError';
	  throw err;
	}

	/**
	 * Copyright (c) 2014 Forbes Lindesay
	 *
	 * https://github.com/pugjs/pug-runtime
	 */

	function escape(_html) {
	  var html = '' + _html;
	  var regexResult = /["&<>]/.exec(html);
	  if (!regexResult) return _html;

	  var result = '';
	  var i, lastIndex, escape;
	  for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
	    switch (html.charCodeAt(i)) {
	      case 34:
	        escape = '&quot;';break;
	      case 38:
	        escape = '&amp;';break;
	      case 60:
	        escape = '&lt;';break;
	      case 62:
	        escape = '&gt;';break;
	      default:
	        continue;
	    }
	    if (lastIndex !== i) result += html.substring(lastIndex, i);
	    lastIndex = i + 1;
	    result += escape;
	  }
	  if (lastIndex !== i) return result + html.substring(lastIndex, i);else return result;
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// module.exports = Lexer;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var er = __webpack_require__(6);
	var assign = __webpack_require__(3);

	var _require = __webpack_require__(7),
	    directives = _require.directives;

	var _require2 = __webpack_require__(8),
	    count = _require2.count,
	    simpleStartsWith = _require2.simpleStartsWith,
	    createSourceError = _require2.createSourceError,
	    getMatchingParen = _require2.getMatchingParen;

	var DEFAULT_CONTENT_TAGS = ['{{', '}}'];
	var DEFAULT_RAW_TAGS = ['{!!', '!!}'];
	var DEFAULT_COMMENT_TAGS = ['{{--', '--}}'];

	var RE_WHITESPACE = /\s/g;

	var _slice = Array.prototype.slice;
	var sortLongest = function sortLongest(a, b) {
		return b.length - a.length;
	};

	function slice(arr) {
		var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : arr.length;

		return _slice.call(arr, from, to);
	}

	var Lexer = {

		/**
	  * Creates a lexer object.
	  *
	  * @param  {Object} options
	  * @return {Object}
	  */

		create: function create(data, options) {
			return Object.create(LexerPrototype).init(data, options);
		},


		/**
	  * Returns all tokens for a given string.
	  *
	  * @param  {String} data - The data to be tokenized
	  * @param  {String} options - Options to pass to lexer.init
	  * @return {Array.<Object>}
	  */

		all: function all(data, options) {
			var lexer = Lexer.create(data, options);
			var tokens = [];
			var token = void 0;

			while (token = lexer.nextToken()) {
				tokens.push(token);
			}

			return tokens;
		}
	};

	var LexerPrototype = {

		/**
	  * Initiates a lexer object.
	  *
	  * @param {Object} options
	  * @param {String} options.data - The data to be lexed
	  * @param {String} options.directives - Custom directives lex
	  * @return {this}
	  */

		init: function init(data) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			var lexer = this;

			var _options$customDirect = options.customDirectives,
			    customDirectives = _options$customDirect === undefined ? [] : _options$customDirect,
			    _options$rawTags = options.rawTags,
			    rawTags = _options$rawTags === undefined ? DEFAULT_RAW_TAGS : _options$rawTags,
			    _options$contentTags = options.contentTags,
			    contentTags = _options$contentTags === undefined ? DEFAULT_CONTENT_TAGS : _options$contentTags,
			    _options$commentTags = options.commentTags,
			    commentTags = _options$commentTags === undefined ? DEFAULT_COMMENT_TAGS : _options$commentTags;


			var source = data.replace(/\r\n|[\r\n]/g, '\n');

			if (source.charAt(0) === '\uFEFF') {
				source = source.slice(1);
			}

			lexer.customDirectives = customDirectives;
			lexer.allDirectives = directives.concat(customDirectives);
			lexer.directives = directives;
			lexer.source = source;
			lexer.line = 1;
			lexer.position = 0;
			lexer.inputLength = lexer.source.length;
			lexer.stash = [];
			lexer.directiveStash = [];

			var _lexer$rawTags = lexer.rawTags = slice(rawTags),
			    _lexer$rawTags2 = _slicedToArray(_lexer$rawTags, 2),
			    openRaw = _lexer$rawTags2[0],
			    endRaw = _lexer$rawTags2[1];

			var _lexer$contentTags = lexer.contentTags = slice(contentTags),
			    _lexer$contentTags2 = _slicedToArray(_lexer$contentTags, 2),
			    openContent = _lexer$contentTags2[0],
			    endContent = _lexer$contentTags2[1];

			var _lexer$commentTags = lexer.commentTags = slice(commentTags),
			    _lexer$commentTags2 = _slicedToArray(_lexer$commentTags, 2),
			    openComment = _lexer$commentTags2[0],
			    endComment = _lexer$commentTags2[1];

			var newTags = [openRaw, endRaw, openContent, endContent, openComment, endComment];

			if (newTags.some(function (item) {
				return typeof item !== 'string';
			})) {
				this.error('Invalid custom tags');
			}

			var allDirectives = lexer.allDirectives.concat(directives.map(function (str) {
				return er(str).replace(RE_WHITESPACE, '');
			})).sort(sortLongest).join('|');

			// FIXME: This shouldn't be matching @sections('head')

			var regexString = er(openComment) + '[\\s\\S]*?' + er(endComment) + ('|' + er(openRaw) + '[\\s\\S]*?' + er(endRaw)) + ('|' + er(openContent) + '[\\s\\S]*?' + er(endContent)) + ('|@(' + allDirectives + ') ?(?:\\(?)');

			lexer.regex = new RegExp(regexString, 'g');

			return lexer;
		},


		/**
	  * Returns the type of a token based on initial starting characters.
	  *
	  * @param {String} str
	  * @param {Object} match - The regex match
	  * @return {String}
	  */

		getType: function getType(str, match) {
			if (simpleStartsWith(str, this.commentTags[0])) {
				return 'comment';
			} else if (simpleStartsWith(str, this.contentTags[0])) {
				return 'interpolation';
			} else if (str[0] === '@') {
				return match[1];
			} else if (simpleStartsWith(str, this.rawTags[0])) {
				return 'rawinterpolation';
			}
		},
		getDirectiveToken: function getDirectiveToken() {
			var regex = this.regex;
			var match = regex.exec(this.source);
			var lastIndex = regex.lastIndex;

			if (match === null) {
				return null;
			}

			var str = match['0'],
			    index = match.index;


			var start = lastIndex - str.length;

			// Some hackery because matching brackets with balance is
			// a really difficult thing to do.
			if (str[0] === '@' && str[str.length - 1] === '(') {
				// Since we are matching from the opening bracket position,
				// we need to do add 1
				var lastParenIndex = getMatchingParen(lastIndex - 1, this);

				if (lastParenIndex === -1) {
					var betwixt = this.source.substring(this.position, start);
					var line = this.line + count(betwixt, '\n');

					this.error('Unclosed directive arguments', { line: line });
				}

				lastParenIndex = lastParenIndex + 1;

				str = this.source.substring(index, lastParenIndex);
				this.position = lastIndex = lastParenIndex;
			}

			this.line = this.line + count(str, '\n');
			this.position = lastIndex === 0 ? this.inputLength : lastIndex;

			return {
				type: this.getType(str, match),
				value: str,
				line: this.line,
				start: start,
				end: lastIndex
			};
		},
		getLastTextToken: function getLastTextToken() {
			var position = this.position;

			if (position < this.inputLength) {
				var str = this.source.substring(position, this.inputLength);
				var end = str.length + position;;
				this.line = this.line + count(str, '\n');
				this.position = end;

				return {
					value: str,
					line: this.line,
					type: 'text',
					start: position,
					end: end
				};
			}

			return null;
		},


		/**
	  * Returns a token from the input or `null` if no tokens can be found.
	  *
	  * @return {Object|null}
	  */

		lex: function lex() {
			var position = this.position,
			    line = this.line;


			if (this.directiveStash.length) {
				var _token = this.directiveStash.shift();
				_token.line = line;
				return _token;
			} else if (this.position >= this.inputLength) {
				return null;
			}

			var token = this.getDirectiveToken();

			if (!token) {
				return this.getLastTextToken();
			}

			// Checks to see if there is a string token betwixt the previous and
			// current regex match.
			var difference = this.position - token.value.length - position;

			if (difference > 0) {
				var end = this.position - token.value.length;

				if (position === end) {
					return token;
				}

				var str = this.source.substring(position, end);
				this.line = line + count(str, '\n');
				this.directiveStash.push(token);

				token = {
					value: str,
					type: 'text',
					line: line,
					start: position,
					end: this.position - token.value.length
				};
			}

			return token;
		},


		/**
	  * Returns and consumes the next token or `null` if there are no more
	  * tokens to be consumed from the input.
	  *
	  * @return {Object|null}
	  */

		nextToken: function nextToken() {
			var token = void 0;

			if (this.stash.length) {
				token = this.stash.shift();
			} else {
				token = this.lex();
			}

			return token;
		},


		/**
	  * Returns the token at `index` or `null` if there are no more tokens.
	  *
	  * @param  {Number} index - The number of tokens to look ahead
	  * @return {Object|null}
	  */

		lookahead: function lookahead(index) {
			var stash = this.stash;

			var times = index - stash.length;

			if (index < 0) {
				this.error('Lookahead index can not be less than 0');
				throw err;
			}

			if (stash[index - 1] !== undefined) {
				return stash[index - 1];
			}

			while (times-- > 0) {
				var token = this.lex();

				if (token) {
					stash.push(token);
				}
			}

			return stash[index - 1] || null;
		},


		/**
	  * Returns the next token without consuming the token or null if no
	  * tokens can be found.
	  *
	  * @return {Object|null}
	  */

		peek: function peek() {
			return this.lookahead(1);
		},


		/**
	  * The iterator is complete when there are no more tokens to be consumed.
	  *
	  * @return {Object}
	  */

		next: function next() {
			var token = this.nextToken();
			var hasToken = token !== null;

			return {
				done: !hasToken,
				value: hasToken ? token : undefined
			};
		},


		/**
	  * Throws an error with the message passed.
	  *
	  * @param {String} message
	  */

		error: function error(message) {
			var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
			    line = _ref.line;

			var err = createSourceError({
				name: 'LexerError',
				message: message,
				line: line,
				source: this.source
			});
			throw err;
		}
	};

	if (typeof Symbol !== 'undefined') {
		LexerPrototype[Symbol.iterator] = function () {
			return this;
		};
	}

	module.exports = Lexer;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

	module.exports = function (str) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected a string');
		}

		return str.replace(matchOperatorsRe, '\\$&');
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * All tags, both opening and ending.
	 */

	var directives = ['yield', 'section', 'show', 'stop', 'overwrite', 'append', 'endsection', 'parent', 'extends', 'if', 'elseif', 'else', 'endif', 'verbatim', 'endverbatim', 'unless', 'endunless', 'for', 'endfor', 'foreach', 'endforeach', 'forelse', 'empty', 'endforelse', 'while', 'endwhile', 'continue', 'break', 'include', 'each', 'push', 'endpush', 'stack'];

	/**
	 * Tags which denote the end of the preceding block.
	 */

	var endtags = ['show', 'overwrite', 'append', 'stop', 'endsection', 'elseif', 'else', 'endif', 'endverbatim', 'endunless', 'endfor', 'endforeach', 'empty', 'endforelse', 'endwhile', 'endpush'];

	var statements = ['YieldStatement', 'SectionStatement', 'ShowStatement', 'ParentStatement', 'ExtendsStatement', 'IfStatement', 'ElseIfStatement', 'ElseStatement', 'VerbatimStatement', 'UnlessStatement', 'ForStatement', 'ForEachStatement', 'ForElseStatement', 'WhileStatement', 'ContinueStatement', 'BreakStatement', 'IncludeStatement', 'EachStatement', 'PushStatement', 'StackStatement'];

	module.exports = {
		directives: directives,
		endtags: endtags,
		statements: statements
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		createSourceError: __webpack_require__(9).createSourceError,
		count: count,
		variable: variable,
		replaceString: replaceString,
		getMatchingParen: getMatchingParen,
		unwrapString: unwrapString,
		error: error,
		toViewPath: toViewPath,
		viewPathToFile: viewPathToFile,
		simpleStartsWith: simpleStartsWith
	};

	var path = __webpack_require__(12);

	var repeatString = __webpack_require__(11);

	var ERROR_LINE_START = '> ';
	var ASCII_A = 97;

	/**
	 * Counts the number of occurences of a string.
	 *
	 * @param {String} str The string to count the occurrences.
	 */

	function count(str, substr) {
		var index = str.indexOf(substr);
		var count = 0;

		while (index !== -1) {
			index = str.indexOf(substr, index + 1);
			count += 1;
		}

		return count;
	}

	/**
	 * Returns a variable name in the form of $__{letter} where `letter` is
	 * a letter of the alphabet.
	 *
	 * @param {Number} index
	 */

	function variable(index) {
		var i = Math.max(index, 0);
		var repeat = Math.floor(i / 26);
		var letter = repeatString(String.fromCodePoint(ASCII_A + i++ % 26), repeat + 1);

		return '$__' + letter;
	}

	/**
	 * Replaces a portion of the source string from the specified start and end
	 * with the string replacement passed.
	 *
	 * @param  {String} source
	 * @param  {String} replacement
	 * @param  {Number} start
	 * @param  {Number} end
	 * @return {String}
	 */

	function replaceString(source, replacement, start, end) {
		return source.substring(0, start) + replacement + source.substring(end);
	}

	/**
	 * Returns the index of the last matching bracket or
	 * -1 if it is not found.
	 *
	 * @param {Number} positoin - Where to start in the source
	 * @param {String} source - The string to search
	 */

	function getMatchingParen() {
		var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		var _ref = arguments[1];
		var source = _ref.source;

		var length = source.length;
		var stack = 0;
		var char = void 0;

		while (position < length) {
			char = source[position];

			if (char === '(') {
				stack = stack + 1;
			} else if (char === ')') {
				stack = stack - 1;
			}

			if (stack === 0) {
				return position;
			}

			position = position + 1;
		}

		return -1;
	}

	/**
	 * Unwraps a JSON string e.g. "'Hello'"
	 */

	function unwrapString(str) {
		return str.substring(1, str.length - 1);
	}

	/**
	 * Throw a generic error message
	 */

	function error(message, name) {
		var err = new Error(message);

		if (name != null) {
			err.name = name;
		}

		throw err;
	}

	function simpleStartsWith(str, search) {
		return str.substring(0, search.length) === search;
	}

	function isNotAbsolute(name, path) {
		error(name + ' is not an absolute path \'' + path + '\'');
	}

	/**
	 * Converts a raw path to an absolute file path.
	 *
	 * An error is thrown if neither the filename or baseDir is not a string
	 * or an absolute path.
	 *
	 * @example
	 * 	 const baseDir = 'C:/website/resources/views';
	 * 	 const filename = 'C:/website/resources/views/layouts/master.blade';
	 *   toRawPath(filename, baseDir); // 'layouts.master'
	 *
	 * @param  {String} filename
	 * @param  {String} baseDir
	 * @return {String}
	 */

	function toViewPath(filename, baseDir) {
		if (typeof filename !== 'string' || !path.isAbsolute(filename)) {
			isNotAbsolute('Path', filename);
		} else if (!path.extname(filename)) {
			error('Path should have an extension \'' + filename + '\'');
		} else if (typeof baseDir !== 'string' || !path.isAbsolute(baseDir)) {
			isNotAbsolute('baseDir', baseDir);
		} else if (path.extname(baseDir)) {
			error('baseDir is not a valid directory ' + baseDir);
		}

		var name = path.basename(filename, path.extname(filename));
		var dir = path.dirname(filename);

		var index = 0;

		dir = dir.replace(/\\/g, '/');
		baseDir = baseDir.replace(/\\/g, '/');

		var relative = path.relative(baseDir, dir).replace(/\\/g, '/').toLowerCase();

		var parts = path.join(relative, name).replace(/\\/g, '/').split('/');

		for (var i = 0; i < parts.length; i++) {
			index = i;

			if (parts[0][0] !== '.') {
				break;
			}
		}

		var viewPath = parts[0][0] === '.' ? parts.slice(0, index).join('/') + '/' + parts.slice(index).join('.') : parts.join('.');

		return viewPath;
	}

	/**
	 * Converts a view path to an absolute filepath.
	 *
	 * If the path is not a string or is empty, an error is thrown. Likewise,
	 * an error will be thrown if the baseDir is not a string, is empty, or
	 * is not absolute.
	 *
	 * @example
	 *   viewPathToFile('layouts/master', '/home/tony');
	 *   // /home/tony/layouts/master.blade
	 *
	 * @param  {String} viewPath - e.g. 'layouts.master'
	 * @param  {String} baeDir - an absolute path to a directory
	 * @return {String}
	 */

	function viewPathToFile(viewPath, baseDir) {
		if (typeof viewPath !== 'string') {
			error('Path is not a string \'' + viewPath + '\'');
		} else if (viewPath === '') {
			error('Path can not be zero-length \'' + viewPath + '\'');
		} else if (typeof baseDir !== 'string' || !path.isAbsolute(baseDir)) {
			isNotAbsolute('baseDir', baseDir);
		} else if (path.extname(baseDir)) {
			error('baseDir is not a valid directory \'' + baseDir + '\'');
		}

		viewPath = viewPath.replace(/\.blade$/, '').replace(/([^.])\.([^.])/g, '$1/$2');

		if (path.isAbsolute(viewPath)) {
			baseDir = '';
		}

		var filePath = path.join(baseDir, viewPath + '.blade').replace(/\\/g, '/');

		return filePath;
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		createSourceError: createSourceError,
		replace: replace,
		count: count
	};

	var padStart = __webpack_require__(10);
	var repeat = __webpack_require__(11);

	var POINTER = '> ';

	/**
	 * An alternate to template strings.
	 *
	 * @example
	 *   replace('Unexpected token "{token}"', { token: 'for' });
	 *   // 'Unexpected token "for"'
	 *
	 * @param  {String} data
	 * @param  {Object} replacers
	 * @return {String}
	 */

	function replace(data, replacers) {
		for (var str in replacers) {
			data = data.replace(new RegExp('{' + str + '}', 'g'), replacers[str]);
		}

		return data;
	}

	/**
	 * Creates an error that points to the line and column the error occured.
	 * If the `line` option is not passed, only the error message passed will
	 * be shown.
	 *
	 * @param  {Object} options
	 * @param  {Object} options.name - The error objects name
	 * @param  {Object} [options.line]
	 * @param  {Object} [options.column]
	 * @param  {Object} [options.filename]
	 * @return {Error}
	 */

	var toLine = function toLine(num) {
		return num + 1;
	};

	function createSourceError(options) {
		var name = options.name;
		var _line = options.line;
		var column = options.column;
		var source = options.source;
		var _options$message = options.message;
		var message = _options$message === undefined ? '' : _options$message;
		var _options$filename = options.filename;
		var filename = _options$filename === undefined ? '[Source]' : _options$filename;


		var isLineDefined = typeof _line === 'number' && isFinite(_line);
		var isColumnNumber = typeof column === 'number' && column === column;
		var tolerance = 3;
		var errorMessage = void 0;

		if (isLineDefined) {
			(function () {
				// TODO: Might want to optimize this in case the string is large
				var lines = source.split('\n');
				var length = lines.length;

				// Restrict the line to be between 0 and the total number of lines
				var line = Math.min(lines.length, Math.max(_line, 1));

				var _start = Math.min(length - tolerance, Math.max(line - tolerance - 1));
				var start = Math.max(_start, 0);
				var end = Math.min(length, line + tolerance);

				// Pointer line can not be more or less than the start
				var pointerLine = Math.max(start, Math.min(line, end));

				var linecol = isLineDefined ? ' (' + pointerLine + ':1)' : '';
				var header = filename + ': ' + message + linecol + '\n';
				var padding = lines.length.toString().length + POINTER.length;

				errorMessage = header + lines.slice(start, end).map(function (text, index) {
					var currentLine = start + index + 1;
					var beginning = String(currentLine);
					var leadingSpace = void 0;
					var arrowSpacing = void 0;

					if (currentLine === pointerLine) {
						beginning = POINTER + beginning;

						if (isColumnNumber) {
							leadingSpace = repeat(' ', padding + 1);
							arrowSpacing = repeat(' ', Math.max(0, column));
							text = text + '\n' + leadingSpace + ' ' + arrowSpacing + '^';
						}
					}

					return padStart(beginning, padding, ' ') + ' | ' + text + '\n';
				}).join('');
			})();
		} else {
			errorMessage = message;
		}

		var err = new Error(errorMessage);
		err.message = errorMessage;
		err.name = name;
		return err;
	}

	/**
	 * Counts the number of occurences of a string.
	 *
	 * @param {String} str The string to count the occurrences.
	 */

	function count(str, substr) {
		var index = str.indexOf(substr);
		var occurrences = 0;

		while (index !== -1) {
			index = str.indexOf(substr, index + 1);
			occurrences = occurrences + 1;
		}

		return occurrences;
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (string, maxLength, fillString) {

	  if (string == null || maxLength == null) {
	    return string;
	  }

	  var result    = String(string);
	  var targetLen = typeof maxLength === 'number'
	    ? maxLength
	    : parseInt(maxLength, 10);

	  if (isNaN(targetLen) || !isFinite(targetLen)) {
	    return result;
	  }


	  var length = result.length;
	  if (length >= targetLen) {
	    return result;
	  }


	  var fill = fillString == null ? '' : String(fillString);
	  if (fill === '') {
	    fill = ' ';
	  }


	  var fillLen = targetLen - length;

	  while (fill.length < fillLen) {
	    fill += fill;
	  }

	  var truncated = fill.length > fillLen ? fill.substr(0, fillLen) : fill;

	  return truncated + result;
	};


/***/ },
/* 11 */
/***/ function(module, exports) {

	/*!
	 * repeat-string <https://github.com/jonschlinkert/repeat-string>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	'use strict';

	/**
	 * Results cache
	 */

	var res = '';
	var cache;

	/**
	 * Expose `repeat`
	 */

	module.exports = repeat;

	/**
	 * Repeat the given `string` the specified `number`
	 * of times.
	 *
	 * **Example:**
	 *
	 * ```js
	 * var repeat = require('repeat-string');
	 * repeat('A', 5);
	 * //=> AAAAA
	 * ```
	 *
	 * @param {String} `string` The string to repeat
	 * @param {Number} `number` The number of times to repeat the string
	 * @return {String} Repeated string
	 * @api public
	 */

	function repeat(str, num) {
	  if (typeof str !== 'string') {
	    throw new TypeError('expected a string');
	  }

	  // cover common, quick use cases
	  if (num === 1) return str;
	  if (num === 2) return str + str;

	  var max = str.length * num;
	  if (cache !== str || typeof cache === 'undefined') {
	    cache = str;
	    res = '';
	  } else if (res.length >= max) {
	    return res.substr(0, max);
	  }

	  while (max > res.length && num > 1) {
	    if (num & 1) {
	      res += str;
	    }

	    num >>= 1;
	    str += str;
	  }

	  res += str;
	  res = res.substr(0, max);
	  return res;
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// module.exports = Parser;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var assign = __webpack_require__(3);

	var _require = __webpack_require__(14),
	    _StringLiteral = _require.StringLiteral;

	var tryExpression = __webpack_require__(15);
	var Lexer = __webpack_require__(5);

	var _require2 = __webpack_require__(7),
	    endtags = _require2.endtags,
	    directives = _require2.directives,
	    statements = _require2.statements;

	var _require3 = __webpack_require__(8),
	    unwrapString = _require3.unwrapString,
	    replaceString = _require3.replaceString,
	    viewPathToFile = _require3.viewPathToFile,
	    createSourceError = _require3.createSourceError;

	var RE_FOREACH = /([\$0-9A-Z_a-z](?:(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+?)?) +as *([\$0-9A-Z_a-z](?:[\$0-9A-Z_a-z]+)?)/;
	var RE_START_SPACING = /^\s*?\n/;
	var RE_END_SPACING = /\n[\t ]*$/;

	var StringLiteral = new RegExp('^(?:' + _StringLiteral.source + ')$');

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
		var types = Array.isArray(expected) ? expected.map(fType).join(' or ') : fType(expected);

		return 'Expected ' + types + ' got ' + fType(actual);
	}

	function MessageInvalidStatement(type) {
		return 'Invalid ' + fType(type) + ' statement';
	}

	function MessageInvalidExpression(type) {
		return 'Invalid expression in @' + type;
	}

	function MessageInvalidArguments(type) {
		return 'Invalid arguments in ' + fType(type);
	}

	function MessageNoArguments(type) {
		return 'Found @' + type + ' with no arguments';
	}

	function MessageUnclosed(type) {
		return 'Unclosed @' + type;
	}

	function MessageUnexpectedToken(type) {
		return 'Unexpected token ' + fType(type);
	}

	function MessageTakesNoArguments(type) {
		return fType(type) + ' takes no arguments';
	}

	function MessageArgumentShouldBeString(type) {
		return 'Argument to ' + fType(type) + ' should be a string';
	}

	var Parser = {
		create: function create(data, options) {
			return Object.create(ParserPrototype).init(data, options);
		},
		parse: function parse(data, options) {
			return Parser.create(data, options).parse();
		}
	};

	var sourceDescriptor = {
		get: function get() {
			return this.lexer.source;
		},
		set: function set() {
			return this.lexer.source;
		}
	};

	var ParserPrototype = {
		init: function init(data) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			var parser = this;

			var rawTags = options.rawTags,
			    contentTags = options.contentTags,
			    commentTags = options.commentTags,
			    _options$customDirect = options.customDirectives,
			    customDirectives = _options$customDirect === undefined ? {} : _options$customDirect,
			    baseDir = options.baseDir,
			    _options$viewPath = options.viewPath,
			    viewPath = _options$viewPath === undefined ? '[Source]' : _options$viewPath,
			    _options$filename = options.filename,
			    filename = _options$filename === undefined ? '[Source]' : _options$filename;


			var customStartTags = Object.keys(customDirectives);

			var customEndTags = endtags.concat(customStartTags.map(function (str) {
				return 'end' + str;
			}));

			parser.lexer = Lexer.create(data, {
				customDirectives: customEndTags.concat(customStartTags),
				contentTags: contentTags,
				commentTags: commentTags,
				rawTags: rawTags
			});

			parser.customDirectives = customDirectives;
			parser.endtags = customEndTags;
			parser.loopStack = 0;
			parser.forLoopStack = 0;
			parser.isPreviousDirective = false;
			parser.isPreviousInterpolation = false;
			parser.viewPath = viewPath;
			parser.filename = String(filename);
			parser.dependencies = [];
			parser.baseDir = baseDir;

			Object.defineProperty(parser, 'source', sourceDescriptor);

			return parser;
		},
		addDependency: function addDependency(type, viwePath) {
			this.dependencies.push({
				type: type,
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

		expect: function expect(type) {
			var token = this.peek();

			if (token === null) {
				this.error('Unexpected end of input');
			} else if (type === token.type) {
				return this.nextToken(token);
			} else {
				var expected = this.formatType(type);
				var actual = this.formatType(token.type);

				this.error(MessageExpectedToken(expected, actual), token);
			}
		},
		formatType: function formatType(type) {
			var _type = this.lexer.allDirectives.indexOf(type) > -1 ? '@' + type : type;

			return _type;
		},


		/**
	  * Returns the next token.
	  *
	  * @return {Object|null}
	  */

		nextToken: function nextToken(token) {
			var now = token != null ? token : this.peek();
			var next = this.lexer.nextToken();
			this.isPreviousDirective = !!now && now.value[0] === '@';
			this.isPreviousInterpolation = !!now && (now.type === 'interpolation' || now.type === 'rawinterpolation');

			return next;
		},


		/**
	  * Peeks the next token.
	  *
	  * @return {Object|null}
	  */

		peek: function peek() {
			return this.lexer.peek();
		},


		/**
	  * Peeks the lexer's nth token.
	  *
	  * @param  {Number} index
	  * @return {Object|null}
	  */

		lookahead: function lookahead(index) {
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

		assertArg: function assertArg(token) {
			var validate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

			var args = getDirectiveArguments(token.value);

			if (args === '' || args === null) {
				return this.error(MessageNoArguments(token.type), token);
			}

			if (validate && !tryExpression(args)) {
				this.error(MessageInvalidExpression(token.type), token);
			}

			return args;
		},
		assertArgIsString: function assertArgIsString(token) {
			var args = getDirectiveArguments(token.value);

			if (args === '' || args === null) {
				return this.error(MessageNoArguments(token.type), token);
			}

			if (!StringLiteral.test(args)) {
				this.error(MessageArgumentShouldBeString(token.type));
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

		error: function error(message, token) {
			var err = createSourceError({
				name: 'ParseError',
				message: message,
				line: token ? token.line : 1,
				source: this.lexer.source
			});

			throw err;
		},


		getDirectiveArguments: getDirectiveArguments,

		/**
	  * Parsing functions
	  */

		parse: function parse() {
			var body = [];
			var token = void 0;

			while (token = this.peek()) {
				var node = this.parseNode(token);

				if (node !== null) {
					body.push(node);
				}
			}

			return {
				type: 'Program',
				body: body
			};
		},


		/**
	  * Token should only be passed through the call in `parse()`.
	  * It's used to avoid the extra function call to this.peek.
	  */

		parseNode: function parseNode(token) {
			if (token === undefined) {
				token = this.peek();
			}

			if (token == null) {
				this.error('Unexpected end of input');
			}

			var name = 'parse' + token.type;

			if (name in this) {
				return this[name]();
			}

			if (token.type in this.customDirectives) {
				return this.parseCustomDirective(token.type);
			}

			this.error(MessageUnexpectedToken(this.formatType(token.type)), token);
		},
		parsecomment: function parsecomment() {
			var _expect = this.expect('comment'),
			    value = _expect.value,
			    line = _expect.line,
			    start = _expect.start,
			    end = _expect.end;

			return {
				type: 'CommentNode',
				value: value,
				line: line,
				start: start,
				end: end
			};
		},
		parsesection: function parsesection() {
			var beginToken = this.expect('section');
			var value = beginToken.value,
			    line = beginToken.line,
			    start = beginToken.start,
			    end = beginToken.end;

			var argument = this.assertArgIsString(beginToken, false);
			var consequent = this.block(beginToken);
			var endToken = this.peek();

			if (!endToken) {
				this.error(MessageUnclosed(token.type), beginToken);
			}

			var type = endToken.type;
			var show = type === 'show';
			var overwrites = type === 'overwrite';
			var appends = type === 'append';

			if (show || overwrites || appends || type === 'endsection' || type === 'stop') {
				this.expect(type);
			} else {
				var message = MessageExpectedToken('@section closing directive', type);
				this.error(message, beginToken);
			}

			return {
				type: 'SectionStatement',
				argument: argument,
				consequent: consequent,
				appends: appends,
				overwrites: overwrites,
				yields: show,
				line: line,
				start: start,
				end: endToken.end
			};
		},
		parseverbatim: function parseverbatim() {
			var beginToken = this.expect('verbatim');
			var type = beginToken.type,
			    value = beginToken.value,
			    line = beginToken.line,
			    start = beginToken.start;

			var token = void 0;
			var str = '';
			var found = false;
			var end = void 0;

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

			if (token === null || !found) {
				this.error(MessageUnclosed(beginToken.type), beginToken);
			}

			return {
				type: 'VerbatimStatement',
				value: str,
				line: line,
				start: start,
				end: end
			};
		},
		parseif: function parseif() {
			var parser = this;
			var beginToken = this.expect('if');
			var argument = this.assertArg(beginToken);
			var alternate = null;
			var consequent = this.block(beginToken);
			var token = void 0;
			var topAlternate = null;

			var types = { 'elseif': 'IfStatement', 'else': 'ElseStatement' };

			while (token = this.peek()) {
				var value = token.type;
				var alt = void 0;

				if (value === 'elseif' || value === 'else') {

					var expected = this.nextToken();
					var block = this.block(beginToken);

					var end = block.body.length > 0 ? block.body[block.body.length - 1].end : expected.end;

					var _argument = value === 'elseif' ? this.assertArg(token) : null;

					alt = {
						type: 'IfStatement',
						argument: _argument,
						consequent: block,
						line: token.line,
						start: token.start,
						end: end
					};

					if (!alternate) {
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

			var endBlock = this.expect('endif', beginToken);

			return {
				type: 'IfStatement',
				consequent: consequent,
				argument: argument,
				alternate: topAlternate,
				line: beginToken.line,
				start: beginToken.start,
				end: endBlock.end
			};
		},
		parseunless: function parseunless() {
			var beginToken = this.expect('unless');
			var line = beginToken.line,
			    start = beginToken.start;

			var argument = this.assertArg(beginToken);
			var consequent = this.block(beginToken);
			var end = this.expect('endunless').end;

			return {
				type: 'UnlessStatement',
				consequent: consequent,
				argument: argument,
				line: line,
				start: start,
				end: end
			};
		},
		parseFor: function parseFor() {
			this.error('@for has been deprecated use @repeat instead', this.expect('for'));
		},


		parseforeach: parseFor('foreach', 'ForEachStatement'),

		parseforelse: parseFor('forelse', 'ForElseStatement', 'empty'),

		parsewhile: function parsewhile() {
			var beginToken = this.expect('while');
			var value = beginToken.value,
			    line = beginToken.line,
			    start = beginToken.start,
			    end = beginToken.end;

			var argument = this.assertArg(beginToken);

			this.loopStack++;

			var consequent = this.block(beginToken);
			var endToken = this.expect('endwhile');

			this.loopStack--;

			return {
				type: 'WhileStatement',
				argument: argument,
				consequent: consequent,
				line: line,
				start: start,
				end: endToken.end
			};
		},
		parsepush: function parsepush() {
			var beginToken = this.expect('push');
			var value = beginToken.value,
			    line = beginToken.line,
			    start = beginToken.start,
			    end = beginToken.end;

			var argument = this.assertArgIsString(beginToken);
			var consequent = this.block(beginToken);
			var endToken = this.expect('endpush');

			return {
				type: 'PushStatement',
				argument: argument,
				consequent: consequent,
				line: line,
				start: start,
				end: endToken.end
			};
		},


		parseinterpolation: interpolation('interpolation', 'Interpolation', 'contentTags'),

		parserawinterpolation: interpolation('rawinterpolation', 'RawInterpolation', 'rawTags'),

		/**
	  * This also replaces whitespace, which is a performance optimization
	  * so that we don't end up with `html = html + '\n\n\t';` in between
	  * directives, which has a big impact on performance.
	  */

		parsetext: function parsetext() {
			var isPreviousDirective = this.isPreviousDirective,
			    isPreviousInterpolation = this.isPreviousInterpolation;


			var token = this.expect('text');

			var nextToken = this.peek();
			var isNextDirective = !!nextToken && nextToken.value[0] === '@';
			var value = token.value;
			var length = value.length;
			var startSpacing = !isPreviousInterpolation ? value.match(RE_START_SPACING) : null;
			var endSpacing = isNextDirective || nextToken === null ? value.match(RE_END_SPACING) : null;
			var start = startSpacing ? startSpacing[0].length : 0;
			var eraseEndingNewline = nextToken === null ? 0 : 1;
			var end = endSpacing ? length - endSpacing[0].length + eraseEndingNewline : length;
			var str = value;

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
		parseeach: function parseeach() {
			var token = this.expect('each');
			var value = token.value,
			    line = token.line,
			    start = token.start,
			    end = token.end;

			var argument = getDirectiveArguments(token.value);
			var directiveLength = 6;
			var alternate = null;

			if (!argument) {
				this.error(MessageNoArguments(token.type));
			}

			var ast = tryExpression(argument);

			if (ast === null) {
				this.error(MessageInvalidArguments(token.type));
			}

			var expressionStatement = ast.body[0];

			var expr = expressionStatement !== null ? expressionStatement.expression : null;

			if (expr === null || expr.type !== 'SequenceExpression' || expr.expressions.length < 3) {
				this.error('Missing arguments to @each', token);
			}

			var expressions = expr.expressions;

			var first = expressions[0];
			var second = expressions[1];
			var third = expressions[2];
			var fourth = expressions[3];

			if (!isStringNode(first) || !isStringNode(third) || fourth !== undefined && !isStringNode(fourth) || second === undefined) {
				this.error(MessageInvalidArguments(token.type), token);
			}

			var eachPath = unwrapString(first.value);
			var binding = unwrapString(third.value);
			var iterable = argument.substring(second.start, second.end);
			var consequentStart = start + first.start + directiveLength;
			var consequentEnd = start + first.end + directiveLength;
			var consequent = new IncludeStatement(eachPath, line, consequentStart, consequentEnd);

			this.addDependency('each', eachPath);

			if (fourth) {
				var emptyPath = unwrapString(fourth.value);
				var includeStart = start + fourth.start + directiveLength;
				var includeEnd = start + fourth.end + directiveLength;
				alternate = new IncludeStatement(emptyPath, line, includeStart, includeEnd);

				this.addDependency('include', emptyPath);
			}

			var statement = new ForStatement('ForElseStatement', this.forLoopStack, iterable, binding, consequent, alternate, line, start, end);

			return statement;
		},


		parseinclude: singleDirective('include', 'IncludeStatement', true, 'assertArgIsString', true),

		parseextends: singleDirective('extends', 'ExtendsStatement', true, 'assertArgIsString', true),

		parsestack: singleDirective('stack', 'StackStatement', true, 'assertArg', false),

		parseyield: singleDirective('yield', 'YieldStatement', true, 'assertArgIsString', false),

		parseparent: singleDirective('parent', 'ParentStatement', false, '', false),

		parsecontinue: loopDirective('continue', 'ContinueStatement'),

		parsebreak: loopDirective('break', 'BreakStatement'),

		parseCustomDirective: function parseCustomDirective(tokenType) {
			var endTokenType = 'end' + tokenType;
			var beginToken = this.expect(tokenType);
			var args = getDirectiveArguments(beginToken.value);
			var index = 1;
			var end = beginToken.end;
			var token = this.peek();
			var consequent = null;
			var argument = null;
			var length = void 0;
			var endToken = void 0;

			if (args) {
				argument = this.assertArg(beginToken);
			}

			while (token) {
				if (this.endtags.indexOf(token.type) > -1) {
					if (token.type === endTokenType) {
						consequent = this.block(beginToken);
						endToken = this.expect(endTokenType);
						length = consequent.body.length;

						end = length ? consequent.body[length - 1].end : endToken.end;

						break;
					}
				}

				token = this.lookahead(index);
				index = index + 1;
			}

			return {
				type: 'CustomStatement',
				name: tokenType,
				consequent: consequent,
				argument: argument,
				line: beginToken.line,
				start: beginToken.start,
				end: end
			};
		},
		block: function block(beginBlock) {
			var body = [];
			var token = void 0;
			var type = void 0;

			while (true) {
				token = this.peek();

				if (token === null) {
					this.error(MessageUnclosed(beginBlock.type), beginBlock);
				}

				type = token.type;

				// MUST CALL this.expect(type) RIGHT AFTER RETURN
				// TO CONSUME THE ENDING BLOCK!
				if (this.endtags.indexOf(type) > -1) {
					break;
				}

				var node = this.parseNode();

				if (node !== null) {
					body.push(node);
				}
			}

			return {
				type: 'BlockStatement',
				body: body
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
		var openParenIndex = value.indexOf('(');
		var closeParenIndex = value.lastIndexOf(')');

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
			var token = this.expect(tokenType);
			var value = token.value,
			    line = token.line,
			    start = token.start,
			    end = token.end;

			var argument = getDirectiveArguments(token.value);

			if (argument === '') {
				this.error(MessageNoArguments(token.type));
			}

			if (argument && !tryExpression(argument)) {
				this.error(MessageInvalidExpression(token.type), token);
			}

			if (this.loopStack < 1) {
				this.error('Found ' + tokenType + ' outside of loop', token);
			}

			return {
				type: nodeType,
				argument: argument,
				line: line,
				start: start,
				end: end
			};
		};
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
			var token = this.expect(tokenType);

			var _lexer$tags = _slicedToArray(this.lexer[tags], 2),
			    open = _lexer$tags[0],
			    end = _lexer$tags[1];

			var tokenValue = token.value;
			var argument = tokenValue.slice(open.length, tokenValue.length - end.length);

			if (!tryExpression(argument)) {
				this.error('Interpolation does not yield an expression', token);
			}

			return {
				type: nodeType,
				argument: argument,
				line: token.line,
				start: token.start,
				end: token.end
			};
		};
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
			var token = this.expect(tokenType);
			var argument = null;

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
				argument: argument,
				line: token.line,
				start: token.start,
				end: token.end
			};
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
			var beginToken = this.expect(tokenType);
			var value = beginToken.value,
			    line = beginToken.line,
			    start = beginToken.start,
			    end = beginToken.end;

			var argument = getDirectiveArguments(beginToken.value);
			var depth = this.forLoopStack;
			var alternate = null;
			var consequent = void 0;
			var endToken = void 0;
			var match = void 0;
			var iterable = void 0;
			var binding = void 0;

			this.loopStack++;
			this.forLoopStack++;

			if (!argument || !(match = argument.match(RE_FOREACH))) {
				this.error(MessageInvalidStatement(beginToken.type), beginToken);
			}

			iterable = match[1];
			binding = match[2];

			if (!tryExpression(iterable + ' || ' + binding)) {
				this.error(MessageInvalidExpression(beginToken.type), beginToken);
			}

			iterable = iterable;
			consequent = this.block(beginToken);

			if (typeof alternateType === 'string') {
				this.expect(alternateType);
				alternate = this.block(beginToken);
			}

			endToken = this.expect('end' + tokenType);

			var statement = new ForStatement(nodeType, depth, iterable, binding, consequent, alternate, line, start, endToken.end);

			this.loopStack--;
			this.forLoopStack--;

			return statement;
		};
	};

	/**
	 * Returns true if the node passed is a string literal
	 *
	 * @param  {Object} node - An JS expression ast node
	 * @return {Boolean}
	 */

	function isStringNode(node) {
		return !!(node && node.type === 'Literal' && StringLiteral.test(node.value));
	}

	function ForStatement(type, depth, iterable, binding, consequent, alternate, line, start, end) {
		this.type = type;
		this.depth = depth;
		this.iterable = iterable;
		this.binding = binding;
		this.consequent = consequent;
		this.alternate = alternate;
		this.line = line;
		this.start = start;
		this.end = end;
	}

	function IncludeStatement(argument, line, start, end) {
		this.type = 'IncludeStatement';
		this.argument = argument;
		this.line = line;
		this.start = start;
		this.end = end;
	}

	module.exports = Parser;

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	/* Generated from ./regex.js */

	exports.Punctuator = /(?:>>>=|>>>|===|!==|\.\.\.|\*\*=|<<=|>>=|\*\*|\+\+|--|<<|>>|&&|>=|\+=|-=|\*=|==|%=|!=|\/=|<=|&=|\|=|\^=|=>|\|\||\||\^|!|~|\]|\.|\?|:|=|\{|;|\+|-|\*|,|%|<|>|\)|\[|\(|\/|&|\})/;

	exports.NumericLiteral = /(?:(?:0x[0-9A-Fa-f]+|0X[0-9A-Fa-f]+)|(?:0[Oo][0-7]+)|(?:0[Bb][01]+)|(?:(?:0|[1-9](?:[0-9]+)?)\.(?:[0-9]+)?|\.[0-9]+|(?:0|[1-9](?:[0-9]+)?))(?:[Ee](?:[\+\-][0-9]+))?)/;

	exports.StringLiteral = /(?:'(?:(?:\\(?:(?:["'\\bfnrtv]|(?:[\0-\t\x0B\f\x0E-!#-&\(-/:-\[\]-ac-eg-mo-qswy-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))|x[0-9A-Fa-f]{2}|(?:u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]{4}\}))|(?:(?:[\0-\t\x0B\f\x0E-&\(-\[\]-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])|\\(?:(?:["'\\bfnrtv]|(?:[\0-\t\x0B\f\x0E-!#-&\(-/:-\[\]-ac-eg-mo-qswy-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))|x[0-9A-Fa-f]{2}|(?:u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]{4}\}))|\\(?:\r\n|[\n\r]))|\\(?:\r\n|[\n\r]))+)?')|(?:"(?:(?:\\(?:(?:["'\\bfnrtv]|(?:[\0-\t\x0B\f\x0E-!#-&\(-/:-\[\]-ac-eg-mo-qswy-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))|x[0-9A-Fa-f]{2}|(?:u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]{4}\}))|(?:(?:[\0-\t\x0B\f\x0E-!#-\[\]-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])|\\(?:(?:["'\\bfnrtv]|(?:[\0-\t\x0B\f\x0E-!#-&\(-/:-\[\]-ac-eg-mo-qswy-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))|x[0-9A-Fa-f]{2}|(?:u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]{4}\}))|\\(?:\r\n|[\n\r]))|\\(?:\r\n|[\n\r]))+)?")/;

	// exports.Template        = /(?:`(?:(?:\$(?!\{)|\\(?:(?:['"\\bfnrtv]|[^'"\\bfnrtv0-9ux\n\r])|x[0-9a-fA-F]{2}|(?:u[0-9a-fA-F]{4}|u\{[0-9a-fA-F]{4}\}))|\\(?:\r\n|[\r\n])|(?:\r\n|[\r\n])|[^`\\$\n\r])+)?`|`(?:(?:\$(?!\{)|\\(?:(?:['"\\bfnrtv]|[^'"\\bfnrtv0-9ux\n\r])|x[0-9a-fA-F]{2}|(?:u[0-9a-fA-F]{4}|u\{[0-9a-fA-F]{4}\}))|\\(?:\r\n|[\r\n])|(?:\r\n|[\r\n])|[^`\\$\n\r])+)?\$\{)/u;

	exports.ReservedWord = /(?:(?:instanceof|function|debugger|continue|default|extends|finally|delete|export|import|typeof|return|switch|const|throw|while|yield|catch|super|class|break|case|void|this|with|else|var|new|for|try|if|do|in)|null|(?:true|false))/;

	exports.IdentifierName = /(?:(?:[\$A-Z_a-z]|\\(?:u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]{4}\}))(?:[\$0-9A-Z_a-z\u200C\u200D]|\\(?:u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]{4}\}))*)/;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Parser = __webpack_require__(16);

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
			var parser = Parser.create(data, options);
			var ast = parser.parse();

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

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Parser = __webpack_require__(17);

	module.exports = Parser;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// module.exports = Parser;

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var assign = __webpack_require__(3);

	var Lexer = __webpack_require__(18);

	var _require = __webpack_require__(19);

	var TokenKeyword = _require.TokenKeyword;
	var TokenIdentifier = _require.TokenIdentifier;
	var TokenPunctuator = _require.TokenPunctuator;
	var TokenStringLiteral = _require.TokenStringLiteral;
	var TokenNumericLiteral = _require.TokenNumericLiteral;

	var _require2 = __webpack_require__(20);

	var assignment = _require2.assignment;

	var _require3 = __webpack_require__(9);

	var replace = _require3.replace;
	var count = _require3.count;
	var createSourceError = _require3.createSourceError;

	/**
	 * Error messages
	 */

	var StrictDelete = 'Delete of an unqualified identifier in strict mode.';
	var UnexpectedEnd = 'Unexpected end of input';
	var UnexpectedToken = 'Unexpected token {token}';
	var UnexpectedType = 'Unexpected {type}';
	var InvalidLHSAssignment = 'Invalid left-hand side in assignment';
	var InvalidLHSAssignmentPrefix = 'Invalid left-hand side expression in prefix operation';
	var InvalidLHSAssignmentPostfix = 'Invalid left-hand side expression in postfix operation';
	var UnexpectedStrictReservedWord = 'Unexpected strict mode reserved word';
	var UnexpectedStrictEvalOrArguments = 'Unexpected eval or arguments in strict mode';
	var UnexpectedExpression = 'Unexpected {expression}';

	var UnsupportedFunctionBody = 'Unsupported function body';
	var UnsupportedClass = 'Class expressions are not supported';
	var UnsupportedFunction = 'Function expressions are not supported';
	var UnsupportedMeta = 'Meta expressions are not supported';
	var UnsupportedSuper = '"super" expressions are not supported';

	/**
	 * Features
	 */

	var ES7_TRAILING_COMMA = 'es7_trailing_comma';

	/**
	 * Little helper functions
	 */

	var toLowerCase = function toLowerCase(s) {
		return s.toLowerCase();
	};

	var operatorPrecedence = {
		'!': 15,
		'~': 15,
		'++': 15,
		'--': 15,
		'typeof': 15,
		'void': 15,
		'delete': 15,

		'**': 14,
		'*': 14,
		'/': 14,
		'%': 14,

		'+': 13,
		'-': 13,

		'<<': 12,
		'>>': 12,
		'>>>': 12,

		'<': 11,
		'<=': 11,
		'>': 11,
		'>=': 11,
		'in': 11,
		'instanceof': 11,

		'==': 10,
		'!=': 10,
		'===': 10,
		'!==': 10,

		'&': 9,
		'^': 8,
		'|': 7,

		'&&': 6,
		'||': 5
	};

	var simpleop = {

		'**': 14,
		'*': 14,
		'/': 14,
		'%': 14,

		'+': 13,
		'-': 13,

		'<<': 12,
		'>>': 12,
		'>>>': 12,

		'<': 11,
		'<=': 11,
		'>': 11,
		'>=': 11,
		'in': 11,
		'instanceof': 11,

		'==': 10,
		'!=': 10,
		'===': 10,
		'!==': 10,

		'&': 9,
		'^': 8,
		'|': 7,

		'&&': 6,
		'||': 5
	};

	function isUnaryOperator(token) {
		var value = void 0;

		if (token) {
			value = token.value;
		} else {
			return false;
		}

		if (TokenPunctuator !== token.type && TokenKeyword !== token.type) {
			return false;
		}

		return '+' === value || '-' === value || '!' === value || 'void' === value || '~' === value || 'delete' === value || 'typeof' === value;
	}

	/**
	 * Returns the precedence of the operator passed or 0 if the
	 * token is not an operator.
	 *
	 * @param  {Object} token
	 * @return {Number}
	 */

	function precedence(token, accept_IN) {
		if (token === null) {
			return 0;
		}

		// FIXME: Not sure when accept_IN is supposed to be false
		// if (token.value === 'in' && ! accept_IN) {
		// 	return 0;
		// }

		return operatorPrecedence[token.value];
	}

	/**
	 * Semantic checks
	 */

	/**
	 * Returns true if the string passed is an assignment operator.
	 *
	 * @param  {String} punc
	 * @return {Boolean}
	 */

	function isAssignment(punc) {
		return !!assignment[punc];
	}

	/**
	 * Returns true if the token is a valid property name.
	 *
	 * @param  {Object}  token
	 * @return {Boolean}
	 */

	function isValidPropertyName(token) {
		var type = token.type;
		var value = token.value;

		if (TokenIdentifier === type) {
			return true;
		} else if (TokenKeyword === type) {
			return value === 'null' || value === 'false' || value === 'true';
		}

		return false;
	}

	function isValidSimpleAssignmentTarget_Assign(node, strict) {
		if ('Identifier' === node.type) {
			if (strict && isValdSimpleAssignmentTarget_Identifier(node.name)) {
				return false;
			}

			return true;
		} else if ('MemberExpression' === node.type) {
			return true;
		}

		return false;
	}

	function isValidSimpleAssignmentTarget_Update(node) {
		var isObject = 'ArrayExpression' === node.type || 'ObjectExpression' === node.type;
		return isValidSimpleAssignmentTarget_Assign(node);
	}

	function isValidSimpleAssignmentTarget_Arguments(node) {
		return isValidSimpleAssignmentTarget_Assign(node);
	}

	/**
	 * #sec-identifiers-static-semantics-early-errors
	 */

	function isValdSimpleAssignmentTarget_Identifier(name) {
		return name === 'eval' || name === 'arguments';
	}

	/**
	 * Returns true if the expression possibly has binding identifiers.
	 */

	function isBinding(expr) {
		var type = expr.type;

		return 'Identifier' === type || 'SpreadElement' === type || 'ArrayExpression' === type || 'ObjectExpression' === type;
	}

	var CONDITIONAL_PRECEDENCE = 4;
	var WHILE_FAILSAFE = 1000000;

	function Literal(value, start, end) {
		this.type = 'Literal';
		this.value = value;
		this.start = start;
		this.end = end;
	}

	function Identifier(name, start, end) {
		this.type = 'Identifier';
		this.name = name;
		this.start = start;
		this.end = end;
	}

	function SpreadElement(expr, start, end) {
		this.type = 'SpreadElement';
		this.argument = expr;
		this.start = start;
		this.end = end;
	}

	function ThisExpression(start, end) {
		this.type = 'ThisExpression';
		this.start = start;
		this.end = end;
	}

	function SequenceExpression(body, start, end) {
		this.type = 'SequenceExpression';
		this.expressions = body;
		this.start = start;
		this.end = end;
	}

	function NewExpression(callee, args, start, end) {
		this.type = 'NewExpression';
		this.callee = callee;
		this.arguments = args;
		this.start = start;
		this.end = end;
	}

	function CallExpression(callee, args, start, end) {
		this.type = 'CallExpression';
		this.callee = callee;
		this.arguments = args;
		this.start = start;
		this.end = end;
	}

	function MemberExpression(object, property, computed, start, end) {
		this.type = 'MemberExpression';
		this.object = object;
		this.property = property;
		this.computed = computed;
		this.start = start;
		this.end = end;
	}

	function YieldExpression(argument, delegates, start, end) {
		this.type = 'YieldExpression';
		this.argument = argument;
		this.delegates = delegates;
		this.start = start;
		this.end = end;
	}

	function ArrayExpression(elements, start, end) {
		this.type = 'ArrayExpression';
		this.elements = elements;
		this.start = start;
		this.end = end;
	}

	function Property(shorthand, kind, computed, method, key, value, start, end) {
		this.type = Property.name;
		this.shorthand = shorthand;
		this.kind = kind;
		this.computed = computed;
		this.method = method;
		this.key = key;
		this.value = value;
		this.start = start;
		this.end = end;
	}

	function ObjectExpression(properties, start, end) {
		this.type = 'ObjectExpression';
		this.properties = properties;
		this.start = start;
		this.end = end;
	}

	function UpdateExpression(operator, argument, isPrefix, start, end) {
		this.type = 'UpdateExpression';
		this.operator = operator;
		this.argument = argument;
		this.prefix = isPrefix;
		this.start = start;
		this.end = end;
	}

	function UnaryExpression(operator, argument, start, end) {
		this.type = 'UnaryExpression';
		this.operator = operator;
		this.argument = argument;
		this.prefix = true;
		this.start = start;
		this.end = end;
	}

	function LogicalExpression(operator, left, right, start, end) {
		this.type = 'LogicalExpression';
		this.operator = operator;
		this.left = left;
		this.right = right;
		this.start = start;
		this.end = end;
	}

	function BinaryExpression(operator, left, right, start, end) {
		this.type = 'BinaryExpression';
		this.operator = operator;
		this.left = left;
		this.right = right;
		this.start = start;
		this.end = end;
	}

	function ArrowExpression(parameters, defaults, rest, body, generator, start, end) {
		this.type = 'ArrowExpression';
		this.parameters = parameters;
		this.defaults = defaults;
		this.rest = rest;
		this.body = body;
		this.generator = generator;
		this.expression = true;
		this.start = start;
		this.end = end;
	}

	function ConditionalExpression(test, consequent, alternate, start, end) {
		this.type = 'ConditionalExpression';
		this.test = test;
		this.consequent = consequent;
		this.alternate = alternate;
		this.start = start;
		this.end = end;
	}

	function AssignmentExpression(operator, left, right, start, end) {
		this.type = 'AssignmentExpression';
		this.operator = operator;
		this.left = left;
		this.right = right;
		this.start = start;
		this.end = end;
	}

	function ExpressionStatement(expr) {
		this.type = 'ExpressionStatement';
		this.expression = expr;
	}

	function Program(body) {
		this.type = 'Program';
		this.body = body;
	}

	var Parser = {

		/**
	  * Creates a lexer object.
	  *
	  * @param  {Object} options
	  * @return {Object}
	  */

		create: function create(data, options) {
			return Object.create(ParserPrototype).init(data, options);
		},


		walk: __webpack_require__(21).walk

	};

	var ParserPrototype = {
		init: function init(data, opts) {
			var options = opts || {};
			var useStickyRegex = options.useStickyRegex;

			var lexerOptions = {
				useStickyRegex: useStickyRegex
			};

			this.context = assign({}, options.context);
			this.lexer = Lexer.create(data);
			this.hasMore = false;
			return this;
		},


		/**
	  * Parses the data string and returns the AST.
	  */

		parse: function parse(data, options) {
			return Parser.create(data, options).parse();
		},


		/**
	  * Consumes the next token and returns it if the token value is the
	  * same as the value passed. If it does not match, the parser throws
	  * an error. If there are no more tokens in the stream, the parser
	  * throws for unexpected end of input.
	  *
	  * @param {String} value
	  */

		expect: function expect(value) {
			var token = this.nextToken();

			if (token === null) {
				this.error(UnexpectedEnd);
			} else if (token.value !== value) {
				this.error(UnexpectedToken, token);
			}

			return token;
		},


		/**
	  * Asserts that there are tokens up to the index specified and returns
	  * the token else throws an UnexpectedEnd error.
	  *
	  * @param  {Number} index - The token index
	  * @param  {Object} last  - The last know token (used for error reporting)
	  * @return {Object}
	  */

		ensure: function ensure(index, last) {
			var token = this.lexer.lookahead(index);

			if (token === null) {
				this.error(UnexpectedEnd, last);
			}

			return token;
		},
		peek: function peek() {
			return this.lexer.peek();
		},
		nextToken: function nextToken() {
			return this.lexer.nextToken();
		},


		/**
	  * Consumes tokens until the type is found.
	  *
	  * @param {String} type
	  * @param {Token} begin - Used for error reporting
	  */

		consumeUntil: function consumeUntil(value, begin) {
			var token = void 0;

			while (true) {
				token = this.peek();

				if (!token) {
					this.error(UnexpectedEnd, begin);
				} else if (value === token.value) {
					return;
				}

				token = this.nextToken();
			}
		},


		/**
	  * Returns true if the current token value matches the one passed.
	  *
	  * @param {String} value
	  */

		match: function match(value) {
			var token = this.peek();
			return token !== null && token.value === value;
		},


		/**
	  * Returns true if all arguments passed have their respective placement
	  * in the lexer's token stream.
	  *
	  * @example
	  *   const parser = Parser.create('() => 123');
	  *
	  *   parser.matches('(', ')', '=>'); // true
	  *   parser.matches('(', '=>');      // false
	  *
	  * @param {...String} args
	  * @return {Boolean}
	  */

		matches: function matches() {
			var lexer = this.lexer;
			var length = arguments.length;
			var token = void 0;

			for (var i = 0; i < length; i = i + 1) {
				token = lexer.lookahead(i + 1);

				if (!token || token.value !== arguments[i]) {
					return false;
				}
			}

			return true;
		},


		/**
	  * Returns the number of newlines between the two nodes or tokens.
	  *
	  * @param {Object} before
	  * @param {Object} after
	  * @return {Number}
	  */

		hasNewlineBetween: function hasNewlineBetween(before, after) {
			return count(this.source.substring(before.end, after.start), '\n');
		},


		/**
	  * Returns true if a feature (e.g. strict or es7 trailing comma) is enabled.
	  *
	  * @return {Boolean}
	  */

		feature: function feature(name) {
			return this.context[name] === true;
		},


		/**
	  * Throws an error from the message passed
	  */

		error: function error(message, _token, expr) {
			var _typeTranslation;

			var typeTranslation = (_typeTranslation = {}, _defineProperty(_typeTranslation, TokenNumericLiteral, 'number'), _defineProperty(_typeTranslation, TokenStringLiteral, 'string'), _typeTranslation);
			var token = _token || {};
			var value = token.value;
			var column = undefined;
			var name = 'ParseError';
			var type = void 0;

			if (token && token.column && token.value) {
				column = token.column - token.value.length + 1;

				if (message === UnexpectedToken && typeTranslation[token.type]) {
					message = UnexpectedType;
					type = typeTranslation[token.type];
				}
			}

			var err = createSourceError({
				name: name,
				line: token.line,
				column: column,
				source: this.source,
				message: replace(message, {
					token: value,
					expression: expr,
					type: type
				})
			});
			throw err;
		},


		get source() {
			return this.lexer.source;
		}

	};

	var ParsingFunctions = {

		/**
	  * Rewrites object and array expressions as destructuring.
	  */

		rewriteNonPattern: function rewriteNonPattern(body) {
			for (var i = 0; i < body.length; i++) {
				var expr = body[i];

				if ('ArrayExpression' === expr.type || 'ObjectExpression' === expr.type) {
					this.error('Destructuring not yet supported');
				}
			}

			return body;
		},
		parseArrowRemains: function parseArrowRemains(parameters, defaults, rest, start) {
			// The expression was arrow parameters
			var token = this.nextToken();
			var body = this.parseFunctionBody(true);

			if (parameters.length) {
				parameters = this.rewriteNonPattern(parameters);
			}

			return new ArrowExpression(parameters, null, rest, body, false, start, body.end);
		},
		parseSequenceExpression: function parseSequenceExpression() {
			var token = this.expect('(');
			var defaults = null;
			var body = [];
			var restToken = void 0;
			var rest = null;
			var node = void 0;
			var expr = void 0;

			while (!this.match(')')) {
				if (this.match('...')) {
					restToken = this.peek();
					rest = this.parseSpreadElement(true).argument;
					body.push(rest);
					break;
				}

				expr = this.parseAssignmentExpression();
				body.push(expr);

				if (this.match(',')) {
					var _token2 = this.nextToken();

					if (_token2 && ')' === _token2.valule && !this.feature(ES7_TRAILING_COMMA)) {
						this.error('UnexpectedToken', this.peek());
					}
				} else {
					break;
				}
			}

			var end = this.expect(')').end;
			var hasArrow = this.match('=>');

			if (!hasArrow && rest) {
				this.error(UnexpectedToken, restToken);
			}

			if (hasArrow) {
				return this.parseArrowRemains(body, defaults, rest, token.start);
			} else {
				if (body.length > 1) {
					node = new SequenceExpression(body, start, end);
				} else {
					node = expr;
				}
			}

			return node;
		},
		parsePrimaryExpression: function parsePrimaryExpression() {
			var token = this.peek();
			var _context = this.context;
			var strict = _context.strict;
			var inGenerator = _context.inGenerator;

			var node = null;

			if (!token) {
				this.error(UnexpectedEnd);
			}

			var value = token.value;
			var start = token.start;
			var end = token.end;

			switch (token.type) {
				case TokenIdentifier:
					if (strict && isValdSimpleAssignmentTarget_Identifier(value)) {
						this.error(UnexpectedStrictEvalOrArguments, token);
					}

					node = new Identifier(value, start, end);
					this.nextToken();
					break;
				case TokenNumericLiteral:
				case TokenStringLiteral:
					node = new Literal(value, start, end);
					this.nextToken();
					break;
				case TokenKeyword:
					switch (value) {
						case 'this':
							node = new ThisExpression(start, end);
							this.nextToken();
							break;
						case 'null':
						case 'true':
						case 'false':
							node = new Literal(value, start, end);
							this.nextToken();
							break;
						case 'function':
							this.error(UnsupportedFunction, token);
							break;
						case 'class':
							this.error(UnsupportedClass, token);
							break;
						case 'yield':
							if (strict) {
								// NOTE: Shouldn't parseAssignment catch this?
								//       Maybe we should just throw.
								if ('yield' === value && !inGenerator) {
									this.error(UnexpectedStrictReservedWord, token);
								}

								this.error(UnexpectedStrictReservedWord, token);
							}
							node = new Identifier(value, start, end);
							this.nextToken();
							break;
						default:
							this.error(UnexpectedToken);
							break;
					}

					break;
				case TokenPunctuator:
					switch (value) {
						case '(':
							node = this.parseSequenceExpression();
							break;
						case '{':
							node = this.parseObjectLiteral();
							break;
						case '[':
							node = this.parseArrayLiteral();
							break;
						default:
							break;
					}

					break;
				default:
					this.error(UnexpectedToken, token);
					break;
			}

			if (null == node) {
				this.error(UnexpectedToken, token);
			}

			return node;
		},
		parseSpreadElement: function parseSpreadElement(assertIdentifier) {
			var token = this.expect('...');
			var expr = this.parseAssignmentExpression();
			var start = token.start;
			var end = expr.end;

			if (assertIdentifier) {
				if ('Identifier' !== expr.type) {
					this.error(UnexpectedToken, token);
				} else if (this.context.strict && isValdSimpleAssignmentTarget_Identifier(expr.name)) {
					this.error(UnexpectedStrictEvalOrArguments, token);
				}
			}

			return new SpreadElement(expr, start, end);
		},
		parseArrayLiteral: function parseArrayLiteral() {
			var begin = this.expect('[');
			var elements = [];
			var end = void 0;

			while (!this.match(']')) {
				var token = this.peek();
				var value = void 0;

				if (!token) {
					this.error(UnexpectedEnd, begin);
				}

				value = token.value;

				if (',' === value) {
					this.nextToken();
					elements.push(null);
				} else {
					if ('...' === value) {
						elements.push(this.parseSpreadElement(false));
					} else {
						var expr = this.parseAssignmentExpression();
						elements.push(expr);
					}

					if (!this.match(']')) {
						this.expect(',');
					}
				}
			}

			end = this.expect(']').end;

			return new ArrayExpression(elements, begin.start, end);
		},
		parseObjectLiteral: function parseObjectLiteral() {
			var begin = this.expect('{');
			var properties = [];

			while (!this.match('}')) {
				var token = this.peek();
				var _start = token.start;
				var shorthand = false;
				var computed = false;
				var method = false;
				var value = null;
				var key = void 0;
				var _end = void 0;
				var kind = 'init';

				if (!token) {
					this.error(UnexpectedEnd, begin);
				}

				if ('[' === token.value) {
					this.nextToken();
					key = this.parseAssignmentExpression();
					computed = true;
					this.expect(']');
					this.expect(':');
					value = this.parseAssignmentExpression();
					_end = value.end;
				} else if (TokenIdentifier === token.type) {
					this.nextToken();
					var token2 = this.peek();

					if (token2) {
						if ('=' === token2.value) {
							this.error('Initializer is not supported');
						} else if ('(' === token2.value) {
							this.error('Method definitions are not supported');
						} else if (':' === token2.value) {
							this.nextToken();
							key = new Identifier(token.value, token.start, token.end);
							value = this.parseAssignmentExpression();
							_end = value.end;
						} else {
							// FIXME: This is probably a semantic error if the
							//        key is not na identifier
							shorthand = true;
							key = value = new Identifier(token.value, token.start, token.end);
							_end = token.end;
						}
					}
				} else if (token && token.type === TokenStringLiteral || token.type === TokenNumericLiteral) {
					key = new Literal(token.value, token.start, token.end);
					this.nextToken();
					this.expect(':');
					value = this.parseAssignmentExpression();
					_end = value.end;
				} else {
					this.error(UnexpectedToken, begin);
				}

				var property = new Property(shorthand, kind, computed, method, key, value, _start, _end);
				properties.push(property);

				if (!this.match('}')) {
					this.expect(',');
				}
			}

			var end = this.expect('}').end;

			return new ObjectExpression(properties, begin.start, end);
		},
		parseFunctionExpression: function parseFunctionExpression() {
			this.error(UnsupportedFunction);
		},
		parseFunctionBody: function parseFunctionBody(isArrow) {
			if (this.match('{')) {
				this.error(UnsupportedFunctionBody, this.peek());
			}

			if (isArrow) {
				return this.parseAssignmentExpression();
			}

			this.error(UnexpectedToken, this.peek());
		},
		parseArguments: function parseArguments() {
			var begin = this.expect('(');
			var args = [];
			var token = this.peek();

			if (token && ')' !== token.value) {
				while (true) {
					if (this.match('...')) {
						var expr = this.parseAssignmentExpression();
						args.push(new SpreadElement(expr));
						this.expect(')');
						break;
					} else {
						args.push(this.parseAssignmentExpression());
					}

					if (!this.match(')')) {
						this.expect(',');
					} else {
						break;
					}
				}
			}

			return args;
		},
		parseNewExpression: function parseNewExpression() {
			var begin = this.expect('new');
			var start = begin.start;

			if (this.match('.')) {
				this.error(UnsupportedMeta);
			}

			var callee = this.parseLHSExpression();
			var matches = this.match('(');
			var args = matches ? this.parseArguments() : [];
			var end = matches ? this.expect(')').end : callee.end;

			return new NewExpression(callee, args, start, end);
		},
		parseNonComputedProperty: function parseNonComputedProperty() {
			var token = this.nextToken();

			if (token === null) {
				this.error(UnexpectedEnd);
			} else if (TokenIdentifier !== token.type && TokenKeyword !== token.type) {
				this.error(UnexpectedToken, token);
			}

			return new Identifier(token.value, token.start, token.end);
		},
		parseMemberExpression: function parseMemberExpression(object, withArguments) {
			var token = void 0;

			while (token = this.peek()) {
				var value = token.value;

				if ('.' === value) {
					this.nextToken();
					var property = this.parseNonComputedProperty();
					object = new MemberExpression(object, property, false, object.start, property.end);
				} else if ('[' === value) {
					this.nextToken();
					var argument = this.parseExpression();
					var end = this.expect(']').end;
					object = new MemberExpression(object, argument, true, object.start, end);
				} else if (withArguments && '(' === value) {
					var args = this.parseArguments();
					var _end2 = this.expect(')').end;
					object = new CallExpression(object, args, object.start, _end2);
				} else {
					break;
				}

				// TODO: Parse template literals
			}

			return object;
		},
		parseLHSExpressionWithArgs: function parseLHSExpressionWithArgs() {
			var token = this.peek();
			var expr = void 0;

			if (!token) {
				this.error(UnexpectedEnd);
			}

			if ('new' === token.value) {
				expr = this.parseNewExpression();
			} else if (this.match('super')) {
				this.error(UnsupportedSuper, token);
			} else {
				expr = this.parsePrimaryExpression();
			}

			var node = this.parseMemberExpression(expr, true);
			return node;
		},
		parseLHSExpression: function parseLHSExpression() {
			var token = this.peek();
			var expr = void 0;

			if (this.match('new')) {
				expr = this.parseNewExpression();
			} else if (this.match('super')) {
				this.error(UnsupportedSuper, token);
			} else {
				expr = this.parsePrimaryExpression();
			}

			var node = this.parseMemberExpression(expr, false);
			return node;
		},
		parseUpdateExpression: function parseUpdateExpression() {
			var begin = this.peek();
			var token = void 0;
			var node = void 0;

			if (!begin) {
				this.error(UnexpectedEnd);
			}

			if ('++' === begin.value || '--' === begin.value) {
				this.nextToken();
				var expr = this.parseUnaryExpression();
				node = new UpdateExpression(begin.value, expr, true, begin.start, expr.end);
			} else {
				node = this.parseLHSExpressionWithArgs();
			}

			while (token = this.peek()) {
				if ('++' === token.value || '--' === token.value) {
					if (this.hasNewlineBetween(node, token)) {
						return node;
					}

					this.nextToken();
					node = new UpdateExpression(token.value, node, false, node.start, token.end);

					if (!isValidSimpleAssignmentTarget_Update(node.argument)) {
						this.error(InvalidLHSAssignmentPostfix, token);
					}
				} else {
					break;
				}
			}

			return node;
		},
		checkSimplePrimary: function checkSimplePrimary(token, skipOperatorCheck) {
			var lookahead = this.lexer.lookahead(2);

			if (skipOperatorCheck || lookahead && simpleop[lookahead.value]) {
				var fn = void 0;

				if (!token) {
					return;
				}

				switch (token.type) {
					case TokenStringLiteral:
					case TokenNumericLiteral:
						fn = Literal;
						break;
					case TokenIdentifier:
						fn = Identifier;

						if (this.context.strict && isValdSimpleAssignmentTarget_Identifier(token.value)) {
							this.error(UnexpectedStrictEvalOrArguments, token);
						}

						break;
					default:
						break;
				}

				if (fn) {
					this.nextToken();
					return new fn(token.value, token.start, token.end);
				}
			}
		},
		parseUnaryExpression: function parseUnaryExpression() {
			var token = this.peek();
			var node = void 0;
			var value = void 0;
			var type = void 0;

			var primary = this.checkSimplePrimary(token);

			if (primary) {
				return primary;
			}

			// FIXME: I think this should error out in parsePrimaryExpression
			//        Maybe change this.error to this.parseUpdateExpression();
			if (token) {
				value = token.value;
				type = token.type;
			}

			if (TokenPunctuator === type && '++' === value || '--' === value) {
				// token is prefixed update expression
				var expr = this.parseUpdateExpression();

				if (!isValidSimpleAssignmentTarget_Update(expr.argument)) {
					this.error(InvalidLHSAssignmentPrefix, token);
				}

				return expr;
			} else if (isUnaryOperator(token)) {
				this.nextToken();
				var _expr = this.parseUnaryExpression();

				if ('delete' === value) {
					if (this.context.strict && 'delete' === value && 'Identifier' == _expr.type) {
						// #sec-delete-operator-static-semantics-early-errors
						this.error(StrictDelete, token);
					}
				}

				return new UnaryExpression(value, _expr, token.start, _expr.end);
			} else {
				return this.parseUpdateExpression();
			}
		},


		/**
	  * Copyright 2014, the V8 project authors. All rights reserved.
	  *
	  * https://github.com/nodejs/node/blob/91b40944a41f8ab1e499ed5bebeed520a215b9a5/deps/v8/src/parsing/parser-base.h#L2675
	  */

		parseBinaryExpression: function parseBinaryExpression(prec) {
			var left = this.parseUnaryExpression();
			var token = this.peek();
			var right = void 0;
			var fn = void 0;

			// NOTE: Not sure if this is the best way to do this
			// Catch JS keywords that are not valid

			if (token && TokenKeyword === token.type && !(token.value in operatorPrecedence)) {
				this.error(UnexpectedToken, token);
			}

			for (var prec1 = precedence(this.peek()); prec1 >= prec; prec1--) {

				while (precedence(this.peek()) === prec1) {
					var operator = this.nextToken();
					var op = operator.value;
					var nextPrec = '**' === op ? prec1 : prec1 + 1;
					var _start2 = left.start;
					right = this.parseBinaryExpression(nextPrec);

					if ('||' === op || '&&' === op) {
						fn = LogicalExpression;
					} else {
						fn = BinaryExpression;
					}

					left = new fn(op, left, right, left.start, right.end);
				}
			}

			return left;
		},
		parseConditionalExpression: function parseConditionalExpression() {
			var begin = this.peek();
			var node = this.parseBinaryExpression(CONDITIONAL_PRECEDENCE);
			var token = this.peek();

			if (token && '?' === token.value) {
				this.nextToken();
				var consequent = this.parseAssignmentExpression();
				this.expect(':');
				var alternate = this.parseAssignmentExpression();
				node = new ConditionalExpression(node, consequent, alternate, node.start, alternate.end);
			} else if (token && '=>' === token.value) {
				if ('Identifier' !== node.type) {
					this.error(UnexpectedToken, begin);
				}

				node = this.parseArrowRemains([node], null, null, node.start);
			}

			return node;
		},


		// #sec-generator-function-definitions

		parseYieldExpression: function parseYieldExpression() {
			var token = this.expect('yield');
			var nextToken = this.peek();
			var start = token.start;
			var delegates = false;
			var argument = null;

			if (nextToken && nextToken.line === token.line) {
				delegates = '*' === nextToken.value;
				argument = this.parseAssignmentExpression();
			}

			var end = argument ? argument.end : token.end;

			return new YieldExpression(argument, delegates, start, end);
		},


		/**
	  * TODO: #sec-assignment-operators-static-semantics-early-errors
	  */

		parseAssignmentExpression: function parseAssignmentExpression() {
			var token = this.peek();
			var node = null;

			if (this.match('yield') && this.context.inGenerator) {
				node = this.parseYieldExpression();
			} else {
				node = this.parseConditionalExpression(CONDITIONAL_PRECEDENCE);
				var _token3 = this.peek();

				if (_token3 && TokenPunctuator === _token3.type && isAssignment(_token3.value)) {

					if (!isValidSimpleAssignmentTarget_Assign(node, this.context.strict)) {
						this.error(InvalidLHSAssignment);
					}

					this.nextToken();
					var rhs = this.parseAssignmentExpression();
					node = new AssignmentExpression(_token3.value, node, rhs, node.start, rhs.end);
				}
			}

			return node;
		},


		/**
	  * #sec-expressions
	  */

		parseExpression: function parseExpression() {
			var lookahead = this.lexer.lookahead(2);
			var begin = this.peek();

			if (null === lookahead && begin) {
				var node = this.checkSimplePrimary(begin, true);

				if (node) {
					return node;
				}
			}

			var expr = this.parseAssignmentExpression();
			var nextToken = this.peek();
			var start = expr.start;
			var end = void 0;

			if (nextToken && TokenPunctuator === nextToken.type && ',' === nextToken.value) {
				var body = [expr];

				while (this.match(',')) {
					this.nextToken();
					var _expr2 = this.parseAssignmentExpression();
					body.push(_expr2);
				}

				return new SequenceExpression(body, start, body[body.length - 1].end);
			}

			return expr;
		},
		parseExpressionStatement: function parseExpressionStatement() {
			var first = this.peek();
			var expr = this.parseExpression();
			var second = this.peek();
			var lookahead = this.lexer.lookahead(2);
			var hasMore = lookahead !== null;

			if (second && ';' === second.value) {
				this.hasMore = true;
				this.nextToken();
			} else if (hasMore) {
				this.hasMore = true;
			} else if (second && this.hasNewlineBetween(expr, second)) {
				this.hasMore = true;
			} else if (second) {
				this.error(UnexpectedToken, second);
			}

			return new ExpressionStatement(expr);
		},
		parse: function parse() {
			var expr = void 0;

			if (this.peek() === null) {
				return new Program([]);
			} else {
				expr = this.parseExpressionStatement();
			}

			return new Program([expr]);
		}
	};

	assign(ParserPrototype, {
		nodes: {
			Literal: Literal,
			Identifier: Identifier,
			SpreadElement: SpreadElement,
			ThisExpression: ThisExpression,
			SequenceExpression: SequenceExpression,
			NewExpression: NewExpression,
			CallExpression: CallExpression,
			MemberExpression: MemberExpression,
			YieldExpression: YieldExpression,
			ArrayExpression: ArrayExpression,
			Property: Property,
			ObjectExpression: ObjectExpression,
			UpdateExpression: UpdateExpression,
			UnaryExpression: UnaryExpression,
			LogicalExpression: LogicalExpression,
			BinaryExpression: BinaryExpression,
			ArrowExpression: ArrowExpression,
			ConditionalExpression: ConditionalExpression,
			AssignmentExpression: AssignmentExpression,
			ExpressionStatement: ExpressionStatement,
			Program: Program
		}
	});

	assign(ParserPrototype, ParsingFunctions);

	function parse(data, options) {
		return Parser.create(data, options).parse();
	}

	Parser.parse = parse;

	module.exports = Parser;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// module.exports = Lexer;

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var assign = __webpack_require__(3);

	var _require = __webpack_require__(9);

	var count = _require.count;
	var createSourceError = _require.createSourceError;

	var _require2 = __webpack_require__(14);

	var Punctuator = _require2.Punctuator;
	var NumericLiteral = _require2.NumericLiteral;
	var StringLiteral = _require2.StringLiteral;
	var ReservedWord = _require2.ReservedWord;
	var IdentifierName = _require2.IdentifierName;

	var _require3 = __webpack_require__(19);

	var TokenKeyword = _require3.TokenKeyword;
	var TokenIdentifier = _require3.TokenIdentifier;
	var TokenPunctuator = _require3.TokenPunctuator;
	var TokenStringLiteral = _require3.TokenStringLiteral;
	var TokenNumericLiteral = _require3.TokenNumericLiteral;


	var keywords = {
		'break': true,
		'do': true,
		'in': true,
		'typeof': true,
		'case': true,
		'else': true,
		'instanceof': true,
		'var': true,
		'catch': true,
		'export': true,
		'new': true,
		'void': true,
		'class': true,
		'extends': true,
		'return': true,
		'while': true,
		'const': true,
		'finally': true,
		'super': true,
		'with': true,
		'continue': true,
		'for': true,
		'switch': true,
		'yield': true,
		'debugger': true,
		'function': true,
		'this': true,
		'default': true,
		'if': true,
		'throw': true,
		'delete': true,
		'import': true,
		'try': true,
		'null': true,
		'true': true,
		'false': true
	};

	var _SUPPORTS_STICKY = void 0;

	try {
		(function checkStickySupport() {
			_SUPPORTS_STICKY = eval('/pls/y').sticky === true;
		})();
	} catch (err) {
		_SUPPORTS_STICKY = false;
	}

	var SUPPORTS_STICKY = _SUPPORTS_STICKY;
	var RE_IDENTIFIER_NAME = new RegExp('^' + IdentifierName.source);

	var Lexer = {

		/**
	  * Creates a lexer object.
	  *
	  * @param  {Object} options
	  * @return {Object}
	  */

		create: function create(data, options) {
			return Object.create(LexerPrototype).init(data, options);
		},


		/**
	  * Returns all tokens for a given string.
	  *
	  * @param  {String} data - The data to be tokenized
	  * @param  {String} options - Options to pass to lexer.init
	  * @return {Array.<Object>}
	  */

		all: function all(data, options) {
			var lexer = Lexer.create(data, options);
			var tokens = [];
			var token = void 0;

			while (token = lexer.nextToken()) {
				tokens.push(token);
			}

			return tokens;
		}
	};

	var regexes = getRegexes.call(Object.create(null), SUPPORTS_STICKY);

	var LexerPrototype = {};

	assign(LexerPrototype, {

		/**
	  * Initiates a lexer object.
	  *
	  * @param {Object} options
	  * @param {String} options.data - The data to be lexed
	  * @param {String} options.customDirectives - Custom directives lex
	  * @return {this}
	  */

		init: function init(data, opts) {
			var options = opts || {};
			var _options$useStickyReg = options.useStickyRegex;
			var useStickyRegex = _options$useStickyReg === undefined ? true : _options$useStickyReg;


			var source = data.replace(/\r\n|[\n\r]/g, '\n');

			if (source.charAt(0) === '\uFEFF') {
				source = source.slice(1);
			}

			this.line = 1;
			this.column = 0;
			this.position = 0;
			this.stash = [];
			this.source = this.input = source;
			this.inputLength = this.source.length;
			this.ended = false;
			this.useStickyRegex = useStickyRegex && SUPPORTS_STICKY;

			var regs = void 0;

			if (!this.useStickyRegex) {
				regs = getRegexes.call(this, false);
			} else {
				regs = regexes;
			}

			this.Punctuator = regs.Punctuator;
			this.NumericLiteral = regs.NumericLiteral;
			this.StringLiteral = regs.StringLiteral;
			this.ReservedWord = regs.ReservedWord;
			this.IdentifierName = regs.IdentifierName;

			if (this.useStickyRegex) {
				this.resetLastIndex(0);
			}

			return this;
		},


		/**
	  * Returns a token from the input or `null` if no tokens can be found.
	  *
	  * @return {Object|null}
	  */

		lex: function lex() {
			var token = null || this.getNumericLiteraloken() || this.getStringLiteralToken() || this.getPunctuatorToken() || this.getIdentifierNameToken();

			if (token == null) {
				this.lexError();
			}

			if (this.useStickyRegex) {
				this.resetLastIndex(token.end);
			}

			return token;
		},
		lexError: function lexError() {
			var position = this.position;
			var char = this.source[position];

			var errorInfo = {
				line: this.line,
				column: this.column
			};

			if (/^['"]/.test(char)) {
				errorInfo.column = this.column + 1;
				this.error('Unterminated string literal', errorInfo);
			}

			this.error('Unexpected token "' + char + '"', errorInfo);
		},


		/**
	  * Resets the last index, which only needs to be done when we are
	  * using the sticky flag for indexes.
	  */

		resetLastIndex: function resetLastIndex(lastIndex) {
			this.Punctuator.lastIndex = lastIndex;
			this.NumericLiteral.lastIndex = lastIndex;
			this.StringLiteral.lastIndex = lastIndex;
			this.ReservedWord.lastIndex = lastIndex;
			this.IdentifierName.lastIndex = lastIndex;
		},


		/**
	  * Handles whitespace for when regex uses sticky flag
	  */

		skipWhitespace: function skipWhitespace() {
			var column = this.column;
			var line = this.line;
			var start = this.position;
			var pos = this.position;
			var times = 0;
			var previousLine = line;
			var char = void 0;

			while (char = this.source[pos]) {
				if ('\n' === char) {
					line = line + 1;
				} else if (' ' === char || '\t' === char) {} else {
					break;
				}

				pos = pos + 1;
				times = times + 1;

				if (line > previousLine) {
					column = 0;
				} else {
					column = column + 1;
				}

				previousLine = line;
			}

			if (!this.useStickyRegex) {
				this.input = this.input.substring(times, this.inputLength);
			}

			this.position = pos;
			this.line = line;
			this.column = column;
		},
		handleWhitespace: function handleWhitespace() {
			this.skipWhitespace();

			if (this.useStickyRegex) {
				this.resetLastIndex(this.position);
			}

			if (!this.useStickyRegex) {
				if (this.input.length === 0) {
					this.ended = true;
				}
			} else {
				if (this.position >= this.inputLength) {
					this.ended = true;
				}
			}
		},


		/**
	  * Returns the token at `index` or `null` if there are no more tokens.
	  *
	  * @param  {Number} index - The number of tokens to look ahead
	  * @return {Object|null}
	  */

		lookahead: function lookahead(index) {
			var stash = this.stash;

			var times = index - stash.length;
			var token = void 0;

			if (index < 0) {
				this.error('Lookahead index can not be less than 0');
			}

			if (stash[index - 1] !== undefined) {
				return stash[index - 1];
			}

			while (times-- > 0) {
				this.handleWhitespace();

				if (this.ended) {
					break;
				}

				token = this.lex();

				if (token) {
					stash.push(token);
				}
			}

			return stash[index - 1] || null;
		},


		/**
	  * Returns the next token without consuming the token or null if no
	  * tokens can be found.
	  *
	  * @return {Object|null}
	  */

		peek: function peek() {
			return this.lookahead(1);
		},


		/**
	  * Returns and consumes the next token or `null` if there are no more
	  * tokens to be consumed from the input.
	  *
	  * @return {Object|null}
	  */

		nextToken: function nextToken() {
			var token = void 0;

			if (this.stash.length) {
				// Even if we've ended we need to return from the stash
				return this.stash.shift();
			} else if (this.ended) {
				// If we've already ended, return null
				return null;
			}

			this.handleWhitespace();

			if (this.ended) {
				return null;
			}

			token = this.lex();

			return token;
		},


		/**
	  * Implementation of the iterator protocol.
	  *
	  * The iterator is complete when there are no more tokens to be consumed.
	  *
	  * @return {Object}
	  */

		next: function next() {
			var token = this.nextToken();

			if (token === null) {
				return {
					done: true,
					value: undefined
				};
			}

			return {
				done: false,
				value: token
			};
		},


		/**
	  * Throws an error with the message passed.
	  *
	  * @param {String} message
	  */

		error: function error(message) {
			var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			var line = _ref.line;
			var column = _ref.column;

			var err = createSourceError({
				name: 'LexerError',
				message: message,
				line: line,
				column: column,
				source: this.source
			});
			throw err;
		}
	});

	if (typeof Symbol !== 'undefined') {

		/**
	  * Implements the iterable protocol.
	  */

		LexerPrototype[Symbol.iterator] = function () {
			return this;
		};
	}

	function createLex(accessor, tokenType) {
		return function lexing() {
			var position = this.position;
			var regex = this[accessor];
			var match = void 0;

			if (!this.useStickyRegex) {
				regex.lastIndex = 0;
			}

			if (match = regex.exec(this.input)) {
				var _match = match;
				var str = _match['0'];


				this.forward(position, str.length, regex.lastIndex);

				return {
					type: tokenType !== undefined ? tokenType : str,
					value: str,
					line: this.line,
					column: this.column,
					start: position,
					end: this.position
				};
			}

			return null;
		};
	}

	assign(LexerPrototype, _defineProperty({

		/**
	  * Advances the lexer's position  and column based on whether or
	  * not the lexer is using sticky regex.
	  *
	  * @param {Number} start     - The starting position before lexing
	  * @param {Number} length    - The length of the matched string
	  * @param {Number} lastIndex - The lastIndex of the regex that matched
	  */

		forward: function forward(start, length, lastIndex) {
			if (!this.useStickyRegex) {
				this.input = this.input.substring(length, this.inputLength);
				this.position = start + length;
			} else {
				this.position = lastIndex;
			}

			this.column = this.column + length;
		},


		getNumericLiteraloken: createLex('NumericLiteral', TokenNumericLiteral),

		getStringLiteralToken: createLex('StringLiteral', TokenStringLiteral),

		getIdentifierNameToken: createLex('IdentifierName', TokenIdentifier),

		getPunctuatorToken: createLex('Punctuator', TokenPunctuator)

	}, 'getIdentifierNameToken', function getIdentifierNameToken() {
		var position = this.position;
		var regex = this.IdentifierName;
		var match = void 0;

		if (!this.useStickyRegex) {
			regex.lastIndex = 0;
		}

		if (match = regex.exec(this.input)) {
			var _match2 = match;
			var str = _match2['0'];


			this.forward(position, str.length, regex.lastIndex);

			return {
				type: keywords.hasOwnProperty(str) ? TokenKeyword : TokenIdentifier,
				value: str,
				line: this.line,
				column: this.column,
				start: position,
				end: this.position
			};
		}

		return null;
	}));

	/**
	 * Constructs regular expressions on a given object
	 *
	 * @param {Boolean} useStickyRegex
	 * @return {this}
	 */

	function getRegexes(useStickyRegex) {
		var prefix = !useStickyRegex ? '^' : '';
		var flags = useStickyRegex ? 'y' : 'g';

		this.Punctuator = new RegExp(prefix + Punctuator.source, flags);
		this.NumericLiteral = new RegExp(prefix + NumericLiteral.source, flags);
		this.StringLiteral = new RegExp(prefix + StringLiteral.source, flags);
		this.ReservedWord = new RegExp(prefix + ReservedWord.source, flags);
		this.IdentifierName = new RegExp(prefix + IdentifierName.source, flags);

		return this;
	}

	module.exports = Lexer;

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	var a = 0;
	var id = function id() {
	  return a++;
	};

	exports.TokenNumericLiteral = id();
	exports.TokenStringLiteral = id();
	exports.TokenIdentifier = id();
	exports.TokenKeyword = id();
	exports.TokenPunctuator = id();

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	var sortLongest = function sortLongest(a, b) {
		return b.length - a.length;
	};

	var punctuators = ['{', '(', ')', '[', ']', '.', '...', ';', ',', '<', '>', '<=', '>=', '==', '!=', '===', '!==', '+', '-', '*', '**', '%', '++', '--', '<<', '>>', '>>>', '&', '|', '^', '!', '~', '&&', '||', '?', ':', '=', '+=', '-=', '*=', '**=', '%=', '<<=', '>>=', '>>>=', '&=', '|=', '^=', '=>', '/', '/=', '}'].sort(sortLongest);

	var keywords = ['break', 'do', 'in', 'typeof', 'case', 'else', 'instanceof', 'var', 'catch', 'export', 'new', 'void', 'class', 'extends', 'return', 'while', 'const', 'finally', 'super', 'with', 'continue', 'for', 'switch', 'yield', 'debugger', 'function', 'this', 'default', 'if', 'throw', 'delete', 'import', 'try'].sort(sortLongest);

	var assignment = {
		'=': true,
		'*=': true,
		'/=': true,
		'%=': true,
		'+=': true,
		'-=': true,
		'<<=': true,
		'>>=': true,
		'>>>=': true,
		'&=': true,
		'^=': true,
		'|=': true,
		'**=': true
	};

	module.exports = {
		keywords: keywords,
		punctuators: punctuators,
		assignment: assignment
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	function walk(ast) {
		var handlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		recurse(ast, null);

		function recurse(node, parent, override) {
			if (node === null && parent && 'ArrayExpression' === parent.type) {
				return;
			}

			var type = override || node.type;
			var handler = handlers[type];

			if (visitors[type] === undefined) {
				throw new Error('Unrecogenized node ' + type);
			}

			visitors[type](node, recurse);

			if (handler) {
				handler(node, parent);
			}
		}
	}

	var visitors = {

		ThisExpression: noop,

		Literal: noop,

		Identifier: noop,

		SequenceExpression: loop('expressions'),

		SpreadElement: function SpreadElement(node, recurse) {
			recurse(node.argument, node);
		},
		NewExpression: function NewExpression(node, recurse) {
			recurse(node.callee, node);
			visitors.Arguments(node.arguments, node, recurse);
		},
		CallExpression: function CallExpression(node, recurse) {
			recurse(node.callee, node);
			visitors.Arguments(node.arguments, node, recurse);
		},
		MemberExpression: function MemberExpression(node, recurse) {
			recurse(node.object, node);
			recurse(node.property, node);
		},
		YieldExpression: function YieldExpression(node, recurse) {
			recurse(node.argument, node);
		},


		ArrayExpression: loop('elements'),

		// ArrayExpression(node, recurse) {
		// 	const elements = node.elements;
		// 	for (var i = 0; i < elements.length; i++) {
		// 		if (elements[i] !== null) {

		// 		}
		// 	}
		// },

		Property: function Property(node, recurse) {
			recurse(node.key, node);

			if (node.value) {
				recurse(node.value, node);
			}
		},


		ObjectExpression: loop('properties'),

		UpdateExpression: function UpdateExpression(node, recurse) {
			recurse(node.argument, node);
		},
		UnaryExpression: function UnaryExpression(node, recurse) {
			recurse(node.argument, node);
		},
		LogicalExpression: function LogicalExpression(node, recurse) {
			recurse(node.left, node);
			recurse(node.right, node);
		},
		BinaryExpression: function BinaryExpression(node, recurse) {
			recurse(node.left, node);
			recurse(node.right, node);
		},
		Arguments: function Arguments(items, parent, recurse) {
			for (var i = 0; i < items.length; i++) {
				recurse(items[i], parent);
			}
		},
		ArrowExpression: function ArrowExpression(node, recurse) {
			visitors.Arguments(node.parameters, node, recurse);
			recurse(node.body, node);
		},
		ConditionalExpression: function ConditionalExpression(node, recurse) {
			recurse(node.test, node);
			recurse(node.consequent, node);
			recurse(node.alternate, node);
		},
		AssignmentExpression: function AssignmentExpression(node, recurse) {
			recurse(node.left, node);
			recurse(node.right, node);
		},
		ExpressionStatement: function ExpressionStatement(node, recurse) {
			recurse(node.expression, node);
		},


		Program: loop('body')

	};

	function loop(prop) {
		return function (node, recurse) {
			var items = node[prop];
			var length = items.length;

			for (var i = 0; i < length; i++) {
				recurse(items[i], node);
			}
		};
	}

	function noop() {}

	module.exports = {
		walk: walk,
		visitors: visitors
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// module.exports = Compiler;

	var _assign;

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var _require = __webpack_require__(16),
	    JSParse = _require.parse,
	    walk = _require.walk;

	var assign = __webpack_require__(3);

	var Parser = __webpack_require__(13);

	var _require2 = __webpack_require__(8),
	    error = _require2.error,
	    variable = _require2.variable,
	    replaceString = _require2.replaceString;

	var _require3 = __webpack_require__(23),
	    LOCALS_NAME = _require3.LOCALS_NAME,
	    OPTIONS_NAME = _require3.OPTIONS_NAME,
	    HANDLERS_NAME = _require3.HANDLERS_NAME,
	    STACKS_NAME = _require3.STACKS_NAME,
	    FORLOOP_NAME = _require3.FORLOOP_NAME,
	    INTERP_NAME = _require3.INTERP_NAME,
	    HTML_NAME = _require3.HTML_NAME,
	    HELPERS_NAME = _require3.HELPERS_NAME,
	    REFERENCE_NAME = _require3.REFERENCE_NAME,
	    LOCAL_EXCLUDES = _require3.LOCAL_EXCLUDES,
	    LOOP_OBJECT_NAME = _require3.LOOP_OBJECT_NAME,
	    PRIVATE_VAR_NAME = _require3.PRIVATE_VAR_NAME;

	var RE_NEWLINES = /\n/g;
	var MAX_WHILE_ITERATIONS = 100000;
	var RE_QUOTE = /(['"])/g;
	var RE_BACKWARD_SLASH = /\\/g;

	var defaultIgnore = assign(Object.create(null), (_assign = {
		locals: true
	}, _defineProperty(_assign, LOOP_OBJECT_NAME, true), _defineProperty(_assign, 'console', console), _defineProperty(_assign, 'self', true), _defineProperty(_assign, 'Math', true), _defineProperty(_assign, 'NaN', true), _defineProperty(_assign, 'Infinity', true), _defineProperty(_assign, 'undefined', true), _defineProperty(_assign, 'isFinite', true), _defineProperty(_assign, 'isNaN', true), _defineProperty(_assign, 'parseFloat', true), _defineProperty(_assign, 'parseInt', true), _defineProperty(_assign, 'decodeURI', true), _defineProperty(_assign, 'decodeURIComponent', true), _defineProperty(_assign, 'encodeURI', true), _defineProperty(_assign, 'encodeURIComponent', true), _defineProperty(_assign, 'Object', true), _defineProperty(_assign, 'Boolean', true), _defineProperty(_assign, 'Symbol', true), _defineProperty(_assign, 'Error', true), _defineProperty(_assign, 'RangeError', true), _defineProperty(_assign, 'ReferenceError', true), _defineProperty(_assign, 'SyntaxError', true), _defineProperty(_assign, 'TypeError', true), _defineProperty(_assign, 'URIError', true), _defineProperty(_assign, 'Number', true), _defineProperty(_assign, 'Math', true), _defineProperty(_assign, 'Date', true), _defineProperty(_assign, 'String', true), _defineProperty(_assign, 'RegExp', true), _defineProperty(_assign, 'Array', true), _defineProperty(_assign, 'Set', true), _defineProperty(_assign, 'Map', true), _defineProperty(_assign, 'Intl', true), _defineProperty(_assign, 'JSON', true), _assign));

	var Compiler = {

		/**
	  * Creates and returns a compiler object
	  */

		create: function create(parser, options) {
			return Object.create(CompilerPrototype).init(parser, options);
		},


		getIdentifiers: getIdentifiers,

		debugLocals: debugLocals

	};

	var CompilerPrototype = {

		/**
	  * Initializes the
	  *
	  * @param {Object}   parser
	  * @param {Function} parser.parse  - A function which returns an AST
	  * @param {Object}   options.debug - Whether or not we are in debug mode
	  */

		init: function init(data, opts) {
			var options = assign({}, opts);

			var ast = options.ast,
			    debug = options.debug,
			    cache = options.cache,
			    dependencies = options.dependencies,
			    _options$conversions = options.conversions,
			    conversions = _options$conversions === undefined ? {} : _options$conversions,
			    _options$dependencyPa = options.dependencyParsers,
			    dependencyParsers = _options$dependencyPa === undefined ? {} : _options$dependencyPa,
			    baseParser = options.parser;


			this.options = options;
			this.variableIndex = 0;
			this.parser = baseParser;
			this.filename = baseParser.filename;
			this.viewPath = baseParser.viewPath;
			this.debug = !!debug;
			this.identifiers = {};
			this.ignore = Object.create(defaultIgnore);
			this.accumulator = HTML_NAME;
			this.ast = ast;
			this.excludes = LOCAL_EXCLUDES;
			this.sections = {};
			this.dependencies = dependencies;
			this.conversions = conversions;
			this.stack = [];

			this.reservedError = reservedError.bind(this);
			this.sourceError = this.sourceError.bind(this);

			return this;
		},


		/**
	  * Returns the inner function body for the generator
	  */

		compile: function compile(node) {
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

		sourceError: function sourceError(message, node) {
			this.parser.error(message, node);
		},


		error: error,

		/**
	  * Helpers
	  */

		/**
	  * Adds expression `$__html = $__html + expr`.
	  *
	  * @param  {String} str - The expression to add to the accumulator
	  * @return {String}
	  */

		addHTML: function addHTML(str) {
			return this.accumulator + ' = ' + this.accumulator + ' + "' + str.replace(RE_NEWLINES, '\\n') + '";\n';
		},


		/**
	  * Returns an ternary expression that checks if the expression passed is
	  * undefined or null. If so, the resulting expression is an empty string.
	  *
	  * @param {String} expr   - The expression to be interpreted
	  * @param {Number} node   - The node currently being compiled
	  */

		expression: function expression(expr, node) {
			var e = this.transformLocals(expr.trim(), node);
			return '(null == (' + INTERP_NAME + ' = (' + e + ')) ? \'\' : ' + INTERP_NAME + ')';
		},


		/**
	  * Returns the expression
	  * `$__options.debugLine = ${line},options.filename = ${filename}`.
	  *
	  * @param  {Number} line
	  * @return {String}
	  */

		debugInfo: function debugInfo(line) {
			var filename = this.filename.replace(RE_BACKWARD_SLASH, '\\\\');
			var debugFile = filename !== '' ? ', ' + OPTIONS_NAME + '.debugFile = "' + filename + '"' : ', "[Unknown]"';

			return OPTIONS_NAME + '.debugLine = ' + line + debugFile;
		},
		transformLocals: function transformLocals(expr, begin) {
			var nodes = this.trackIdentifiers(expr, begin).filter(function (node) {
				return !node.isParentAssignment;
			});

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

		trackIdentifiers: function trackIdentifiers(expr, begin) {
			var nodes = getIdentifiers(expr, this.excludes, this.reservedError, begin);

			for (var i = nodes.length - 1; i >= 0; i--) {
				var node = nodes[i];
				var name = node.name;

				if (node.isParentAssignment) {
					this.ignore[name] = true;
					this.identifiers[name] = true;
				}

				if (this.ignore[name]) {
					continue;
				} else if (!this.identifiers.hasOwnProperty(name)) {
					this.identifiers[name] = true;
				}
			}

			return nodes;
		},
		getDependencyByViewPath: function getDependencyByViewPath(viewPath) {
			var filename = this.conversions[viewPath];

			// It shouldn't ever come to this, but just in case
			if (!this.dependencies.hasOwnProperty(filename)) {
				this.error('Could not find dependency ' + viewPath);
			}

			return this.dependencies[filename];
		},
		yieldContent: function yieldContent(section) {
			if (this.sections.hasOwnProperty(section)) {
				return this.sections[section];
			}

			return '';
		},


		/**
	  * Visitor functions
	  */

		visitNode: function visitNode(node) {
			if (node == null) {
				this.error('Found undefined or null AST node');
			}

			var name = 'visit' + node.type;

			if (name in this) {
				return this[name](node);
			}

			this.error('Unrecognized node ' + node.type);
		},
		visitCommentNode: function visitCommentNode() {
			return '';
		},
		visitIfStatement: function visitIfStatement(node) {
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';
			var ifArgument = this.transformLocals(node.argument, node);
			var alternate = node.alternate;
			var alternateArgument = void 0;

			var str = '\n' + line + '\nif (' + ifArgument + ') {\n\t' + this.visitNode(node.consequent) + '} ';

			while (alternate) {
				var consequent = this.visitNode(alternate.consequent);
				var _line = this.debug ? this.debugInfo(alternate.line) : '0';

				if (alternate.argument) {
					alternateArgument = this.transformLocals(alternate.argument, node);
					var arg = this.debug ? '(' + _line + ', 0) || ' + alternateArgument : alternateArgument;
					str = str + ('else if (' + arg + ') {\n\t' + consequent + '} ');
				} else {
					str = str + (' else {\n\t' + _line + ';\n\t' + consequent + '}');
				}

				alternate = alternate.alternate;
			}

			return str;
		},
		visitUnlessStatement: function visitUnlessStatement(node) {
			var argument = this.transformLocals(node.argument, node);
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';

			var str = '\n' + line + '\n\nif ( ! (' + argument + ')) {\n\t' + this.visitNode(node.consequent) + '\n}\n\n\n';

			return str;
		},
		visitParentStatement: function visitParentStatement() {
			return '';
		},
		visitSectionStatement: function visitSectionStatement(node) {
			var content = this.visitNode(node.consequent);
			var section = node.argument;
			var str = this.visitNode(node.consequent);

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
		visitYieldStatement: function visitYieldStatement(node) {
			return this.yieldContent(node.argument);
		},
		visitExtendsStatement: function visitExtendsStatement(node) {
			return '';
		},
		visitIncludeStatement: function visitIncludeStatement(node) {
			var ast = this.getDependencyByViewPath(node.argument);
			var filename = this.filename;
			var viewPath = this.viewPath;

			this.filename = this.conversions[node.argument];
			this.viewPath = node.argument;

			if (this.stack.indexOf(this.filename) > -1) {
				this.error('Circular dependency found from ' + viewPath);
			}

			this.stack.push(this.filename);

			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';
			var str = line + '\n' + this.visitProgram(ast);

			this.filename = filename;
			this.viewPath = viewPath;
			this.stack.pop();

			return str;
		},
		visitPushStatement: function visitPushStatement(node) {
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';
			var argument = node.argument;
			var accumulator = this.accumulator;

			this.accumulator = PRIVATE_VAR_NAME;

			var str = '\n' + STACKS_NAME + '[' + argument + '] = (\n\ttypeof ' + STACKS_NAME + '[' + argument + '] === \'string\'\n\t? ' + STACKS_NAME + '[' + argument + ']\n\t: \'\') +\n\t\t(function () {\n\t\t\tvar ' + PRIVATE_VAR_NAME + ' = \'\';\n\n\t\t\t' + this.visitNode(node.consequent) + '\n\t\t\treturn ' + PRIVATE_VAR_NAME + ';\n\t\t}());\n';

			this.accumulator = accumulator;
			return str;
		},
		visitStackStatement: function visitStackStatement(node) {
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';
			var argument = node.argument;
			var str = '\n' + line + '\n' + HTML_NAME + ' =\n\t' + HTML_NAME + ' + (' + STACKS_NAME + '.hasOwnProperty(' + argument + ') ? ' + STACKS_NAME + '[' + node.argument + '] : \'\');\n';

			return str;
		},
		visitVerbatimStatement: function visitVerbatimStatement(node) {
			return this.addHTML(node.value.replace(RE_QUOTE, '\\$1'));
		},
		visitInterpolation: function visitInterpolation(node) {
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';
			var expr = this.expression(node.argument, node);

			return '' + line + this.accumulator + ' = ' + this.accumulator + ' + ' + HELPERS_NAME + '.escape(' + expr + ');\n';
		},
		visitRawInterpolation: function visitRawInterpolation(node) {
			var expr = this.expression(node.argument, node);
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';

			return '' + line + this.accumulator + ' = ' + this.accumulator + ' + ' + expr + ';\n';
		},
		visitTextNode: function visitTextNode(node) {
			if (node.value.length === 0) {
				return '';
			}

			return this.addHTML(node.value.replace(RE_QUOTE, '\\$1'));
		},
		visitWhileStatement: function visitWhileStatement(node) {
			var argument = this.transformLocals(node.argument, node);
			var index = variable(this.variableIndex);
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';

			this.trackIdentifiers(node.argument, LOCAL_EXCLUDES, node);
			this.variableIndex++;

			var str = '\n' + line + '\nvar ' + index + ' = 0;\n\nwhile (' + argument + ') { ' + index + '++;\n\tif (' + index + ' > ' + MAX_WHILE_ITERATIONS + ') {\n\t\tvar err = new Error(\'Maximum while iterations exceeded\');\n\t\tthrow err;\n\t}\n\t' + this.visitNode(node.consequent) + '\n}\n\n\n';

			this.variableIndex--;

			return str;
		},
		visitCustomStatement: function visitCustomStatement(node) {
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';

			var accumulator = this.accumulator;
			var contents = 'void 0';
			var argument = 'void 0';
			var str = '';

			this.accumulator = PRIVATE_VAR_NAME;

			if (node.consequent) {
				contents = '(function () {\n\t\t' + line + '\n\t\tvar ' + PRIVATE_VAR_NAME + ' = \'\';\n\n\t\t' + this.visitNode(node.consequent) + '\n\n\t\treturn ' + PRIVATE_VAR_NAME + ';\n\t}())';
			}

			if (node.argument) {
				argument = this.expression(node.argument, node);
			}

			str = str + ('\n' + INTERP_NAME + ' = ' + HANDLERS_NAME + '[\'' + node.name + '\'](\n\t' + argument + ',\n\t' + contents + '\n);\n' + HTML_NAME + ' = ' + HTML_NAME + ' + (null == ' + INTERP_NAME + ' ? \'\' : ' + INTERP_NAME + ');\n');

			this.accumulator = accumulator;

			return str;
		},
		visitForStatement: function visitForStatement(node) {
			this.error('@for has been deprecated, use @repeat instead');
		},


		visitForEachStatement: visitForStatement,

		visitForElseStatement: visitForStatement,

		visitEachStatement: visitForStatement,

		visitContinueStatement: visitLoopStatement('continue'),

		visitBreakStatement: visitLoopStatement('break'),

		visitBlockStatement: visitBody,

		visitProgram: visitBody

	};

	function visitLoopStatement(type) {
		return function (node) {
			var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';
			var argument = node.argument;

			if (argument) {
				argument = this.transformLocals(argument, node);

				return '\n\t' + line + '\nif (' + argument + ') { ' + type + '; }\n\n';
			} else {
				return '\n\t' + line + '\t' + type + ';\n';
			}
		};
	}

	function visitBody(node) {
		var body = node.body;
		var length = body.length;
		var str = '';

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
		var iter = node.iterable;
		var localsCheck = this.transformLocals(node.iterable, node);
		var binding = node.binding;
		var index = variable(this.variableIndex);
		var line = this.debug ? this.debugInfo(node.line) + ';\n' : '';

		this.identifiers[binding] = true;
		this.identifiers[iter] = true;
		this.ignore[binding] = true;

		this.variableIndex++;

		var ifstatement = node.alternate ? 'if (' + iter + ' && typeof ' + iter + '.length === \'number\' && ' + iter + '.length > 0) {\n' : '';

		var alternate = node.alternate ? ' } else {\n\t' + this.visitNode(node.alternate) + '}' : '';

		var str = '\n' + line + '\n' + localsCheck + (localsCheck ? ';' : '') + '\n\n' + ifstatement + '\n\t' + loop.object(node) + '\n\n\tfor (var ' + index + ' = 0; ' + index + ' < ' + iter + '.length; ' + index + '++) {\n\t\tloop = ' + FORLOOP_NAME + node.depth + ';\n\n\t\tvar ' + binding + ' = ' + iter + '[' + index + '];\n\t\t' + loop.setup(node, index) + '\n\n\t\t' + this.visitNode(node.consequent) + '}\n' + alternate + '\n';

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
		var nodes = [];
		var names = [];
		var ast = JSParse(expr);
		var result = expr + '';

		walk(ast, {
			Identifier: function Identifier(node, parent) {
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
		var result = expr.toString();

		if (!debug) {
			return result;
		}

		for (var i = nodes.length - 1; i >= 0; i--) {
			var node = nodes[i];
			var name = node.name;

			if (ignore[name]) {
				continue;
			}

			var replacement = '(' + LOCALS_NAME + '.hasOwnProperty(\'' + name + '\') ? ' + name + ' : ' + HELPERS_NAME + '.' + REFERENCE_NAME + '(\'' + name + '\'))';

			result = replaceString(result, replacement, node.start, node.end);
		}

		return result;
	}

	function reservedError(node, begin) {
		this.sourceError(node.name + ' is reserved', begin);
	}

	/**
	 * https://github.com/illuminate/view/blob/master/Factory.php#L813
	 */

	var loop = {
		object: function object(node) {
			var depth = node.depth;
			var iterable = node.iterable;
			var name = '' + FORLOOP_NAME + depth;
			var parentName = '' + FORLOOP_NAME + Math.max(depth - 1, 0);
			var str = '\nvar ' + name + ' = {\n\tindex: 0,\n\titeration: 1,\n\tremaining: ' + iterable + '.length,\n\tfirst: true,\n\tlast: false,\n\tdepth: ' + depth + ',\n\tcount: ' + iterable + '.length,\n\tparent: (typeof ' + parentName + ' === \'undefined\') ? null : ' + parentName + '\n};\n';

			return str;
		},
		setup: function setup(node, index) {
			var name = '' + FORLOOP_NAME + node.depth;
			var iterable = node.iterable;
			var str = '\nif (' + index + ' !== 0) {\n\t\t' + name + '.first = false;\n\t}\n\tif (' + index + ' === ' + iterable + '.length - 1) {\n\t\t' + name + '.last = true;\n\t}\n\n\t' + name + '.remaining = ' + iterable + '.length - ' + index + ';\n\t' + name + '.iteration = ' + index + ' + 1;\n\t' + name + '.index = ' + index + ';\n';

			return str;
		}
	};

	module.exports = Compiler;

/***/ },
/* 23 */
/***/ function(module, exports) {

	'use strict';

	exports.HANDLERS_NAME = '$__handlers';
	exports.LOCALS_NAME = '$__locals';
	exports.STACKS_NAME = '$__stacks';
	exports.FORLOOP_NAME = '$__forLoop';
	exports.INTERP_NAME = '$__interp';
	exports.HTML_NAME = '$__html';
	exports.PRIVATE_VAR_NAME = '$__private';
	exports.HELPERS_NAME = '$__helpers';
	exports.OPTIONS_NAME = '$__options';
	exports.REFERENCE_NAME = 'referr';
	exports.LOOP_OBJECT_NAME = 'loop';

	exports.LOCAL_EXCLUDES = Object.keys(exports).filter(function (key) {
		return !(['REFERENCE_NAME', 'LOOP_OBJECT_NAME'].indexOf(key) > -1);
	}).map(function (key) {
		return exports[key];
	});

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// module.exports = Resolver;

	var fs = __webpack_require__(2);

	var Resolver = {
		create: function create() {
			return Object.create(ResolverPrototype).init();
		}
	};

	var ResolverPrototype = {
		init: function init() {
			var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			this.cache = options.cache;
			return this;
		},


		/**
	  * Returns a promise which resolves with the file contents or rejects
	  * if the file is not found.
	  *
	  * @param  {String}  filename
	  * @param  {Object}  options
	  * @return {Promise}
	  */

		getFile: function getFile(filename, useCache) {
			if (fs == null) {
				var err = new Error('File system unavailable');
				throw err;
			}

			if (useCache && this.cache && this.cache.enabled) {
				throw 'caching not set up';

				if (this.cache.has(filename)) {
					return this.cache.get(filename);
				}
			}

			var contents = fs.readFileSync(filename, 'utf8');

			var file = {
				path: filename,
				contents: contents
			};

			return file;
		},


		/**
	  * Resolves the file contents for each file passed.
	  *
	  * @param  {Array<Object>} dependencies
	  * @param  {Object} options
	  * @return {Array}
	  */

		resolveFiles: function resolveFiles(dependencies, options) {
			var files = [];

			for (var i = 0; i < dependencies.length; i++) {
				files.push(this.getFile(dependencies[i].path, options.cache));
			}

			return files;
		}
	};

	module.exports = Resolver;

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	// module.exports = Cache;

	var Cache = {
		create: function create(options) {
			return Object.create(CachePrototype).init(options);
		}
	};

	var CachePrototype = {
		init: function init() {}
	};

	module.exports = Cache;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// module.exports = {
	// 	transform,
	// 	extend
	// };

	var _require = __webpack_require__(8),
	    error = _require.error;

	/**
	 * Returns a master AST, which represent the top extend.
	 *
	 * @param  {Object} ast
	 * @param  {Object} dependencies
	 * @return {Object}
	 */


	function extend(ast, dependencies, conversions) {
		var body = [];
		var master = {
			type: 'Program',
			isMaster: true,
			body: body
		};

		while (ast) {
			var viewPath = ast.extends;
			var filename = conversions[viewPath];

			body.push(ast);

			if (viewPath === null) {
				break;
			} else {
				ast = dependencies[filename];
			}

			if (ast === undefined) {
				error('Could not find extend file \'' + viewPath + '\'');
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
		var body = ast.body;
		var extend = null;

		if (isTrimmable(body[0])) {
			body.shift();
		}

		var length = body.length - 1;
		var secondToLast = body[length - 1];

		if (isTrimmable(body[length], body[length - 1])) {
			body.pop();
		}

		for (var i = 0; i < body.length; i++) {
			var node = body[i];

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

	var interpolation = ['Interpolation', 'RawInterpolation'];

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
		transform: transform,
		extend: extend
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	module.exports = {
		createFunctionBody: createFunctionBody,
		generateCode: generateCode
	};

	var _require = __webpack_require__(23),
	    STACKS_NAME = _require.STACKS_NAME,
	    HANDLERS_NAME = _require.HANDLERS_NAME,
	    INTERP_NAME = _require.INTERP_NAME,
	    LOOP_OBJECT_NAME = _require.LOOP_OBJECT_NAME,
	    REFERENCE_NAME = _require.REFERENCE_NAME,
	    HTML_NAME = _require.HTML_NAME,
	    DEBUG_LINE = _require.DEBUG_LINE,
	    LOCALS_NAME = _require.LOCALS_NAME,
	    HELPERS_NAME = _require.HELPERS_NAME,
	    OPTIONS_NAME = _require.OPTIONS_NAME;

	var _require2 = __webpack_require__(8),
	    createSourceError = _require2.createSourceError;

	var inlineHelpers = function () {
		var helpers = __webpack_require__(4);
		var str = '{\n\t' + REFERENCE_NAME + ': ' + helpers[REFERENCE_NAME].toString() + ',\n\n\tescape: ' + helpers.escape.toString() + ',\n};\n';

		return str;
	}();

	function createFunctionBody(code, identifiers, standalone, debug) {
		var keys = Object.keys(identifiers);
		var locals = keys.map(function (id) {
			return LOCALS_NAME + '["' + id + '"]';
		});

		keys.unshift(HANDLERS_NAME, STACKS_NAME, HTML_NAME);
		locals.unshift(HANDLERS_NAME, '{}', '""');

		var body = '\'use strict\';\n\nvar locals = ' + LOCALS_NAME + ' =\n\t' + LOCALS_NAME + ' == null\n\t\t? {}\n\t\t: ' + LOCALS_NAME + ';\n\n' + HELPERS_NAME + ' =\n\t' + (!!standalone ? inlineHelpers : HELPERS_NAME) + '\n\nreturn (function (' + keys.join(', ') + ') {\nvar ' + INTERP_NAME + ';\nvar ' + LOOP_OBJECT_NAME + ';\n\n' + (debug ? code : code.replace(/\n/g, '')) + '\n\nreturn ' + HTML_NAME + ';\n}(' + locals.join(', ') + '));\n';

		return body;
	}

	function generateCode(body, opts) {
		var parser = opts.parser,
		    parsers = opts.parsers;
		var debug = opts.debug,
		    helpers = opts.helpers,
		    customDirectives = opts.customDirectives;


		var debugInfo = {
			debug: debug,
			debugLine: -1,
			debugFile: parser.filename
		};

		var handlers = Object.keys(customDirectives).reduce(function (result, key) {
			result[key] = customDirectives[key].handler;
			return result;
		}, {});

		var fn = void 0;

		if (!debug) {
			// Avoid memory leak
			parser = null;
			parsers = null;
		}

		fn = new Function(
		// Change to use a single object
		LOCALS_NAME, HANDLERS_NAME, HELPERS_NAME, OPTIONS_NAME, undefined, body);

		function template(locals, _handlers) {
			var h = (typeof _handlers === 'undefined' ? 'undefined' : _typeof(_handlers)) === 'object' && _handlers ? _handlers : handlers;

			try {
				return fn(locals, h, helpers, debugInfo);
			} catch (error) {
				var line = debugInfo.debugLine;
				var source = debug ? parsers[debugInfo.debugFile].source : undefined;

				var name = error.name;

				if (['ReferenceError', 'ScopeError'].indexOf(error.name) === -1) {
					name = 'CompilationError';
				}

				var err = createSourceError({
					name: name,
					filename: debugInfo.debugFile,
					message: error.message,
					line: line === -1 ? undefined : line,
					source: source
				});

				throw err;
			}
		};

		template.fn = fn;

		return template;
	}

/***/ }
/******/ ])
});
;