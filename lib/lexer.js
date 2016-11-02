'use strict';

// module.exports = Lexer;

const er = require('escape-string-regexp');
const assign = require('object-assign');

const { directives } = require('./constants/directives');

const {
	count,
	simpleStartsWith,
	createSourceError,
	getMatchingParen } = require('./utils');

const DEFAULT_CONTENT_TAGS = ['{{', '}}'];
const DEFAULT_RAW_TAGS     = ['{!!', '!!}'];
const DEFAULT_COMMENT_TAGS = ['{{--', '--}}'];

const RE_WHITESPACE = /\s/g;

const _slice = Array.prototype.slice;
const sortLongest = (a, b) => b.length - a.length;

function slice(arr, from=0, to=arr.length) {
	return _slice.call(arr, from, to)
}

const Lexer = {

	/**
	 * Creates a lexer object.
	 *
	 * @param  {Object} options
	 * @return {Object}
	 */

	create(data, options) {
		return Object.create(LexerPrototype).init(data, options);
	},

	/**
	 * Returns all tokens for a given string.
	 *
	 * @param  {String} data - The data to be tokenized
	 * @param  {String} options - Options to pass to lexer.init
	 * @return {Array.<Object>}
	 */

	all(data, options) {
		const lexer = Lexer.create(data, options);
		const tokens = [];
		let token;

		while (token = lexer.nextToken()) {
			tokens.push(token);
		}

		return tokens;
	}

};

const LexerPrototype = {

	/**
	 * Initiates a lexer object.
	 *
	 * @param {Object} options
	 * @param {String} options.data - The data to be lexed
	 * @param {String} options.directives - Custom directives lex
	 * @return {this}
	 */

	init(data, options={}) {
		const lexer = this;

		const {	customDirectives=[],
				rawTags=DEFAULT_RAW_TAGS,
				contentTags=DEFAULT_CONTENT_TAGS,
				commentTags=DEFAULT_COMMENT_TAGS } = options;

		let source = data.replace(/\r\n|[\r\n]/g, '\n');

		if (source.charAt(0) === '\uFEFF') {
			source = source.slice(1);
		}

		lexer.customDirectives = customDirectives;
		lexer.allDirectives    = directives.concat(customDirectives);
		lexer.directives       = directives;
		lexer.source           = source;
		lexer.line             = 1;
		lexer.position         = 0;
		lexer.inputLength      = lexer.source.length;
		lexer.stash            = [];
		lexer.directiveStash   = [];

		const [openRaw, endRaw]         = lexer.rawTags     = slice(rawTags);
		const [openContent, endContent] = lexer.contentTags = slice(contentTags);
		const [openComment, endComment] = lexer.commentTags = slice(commentTags);

		const newTags = [openRaw, endRaw,
						openContent, endContent,
						openComment, endComment];

		if (newTags.some((item) => typeof item !== 'string')) {
			this.error('Invalid custom tags');
		}

		const allDirectives = lexer.allDirectives
			.concat(
				directives.map((str) =>
						er(str).replace(RE_WHITESPACE, '')
					)
				)
			.sort(sortLongest)
			.join('|');

		// FIXME: This shouldn't be matching @sections('head')

		const regexString =
			  `${er(openComment)}[\\s\\S]*?${er(endComment)}`
			+ `|${er(openRaw)}[\\s\\S]*?${er(endRaw)}`
			+ `|${er(openContent)}[\\s\\S]*?${er(endContent)}`
			+ `|@(${allDirectives}) ?(?:\\(?)`;

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

	getType(str, match) {
		if (simpleStartsWith(str, this.commentTags[0])) {
			return 'comment';
		} else if (simpleStartsWith(str, this.contentTags[0])) {
			return 'interpolation';
		} else if (str[0] === '@') {
			return match[1];
		} else if (simpleStartsWith(str, this.rawTags[0])) {
			return 'rawinterpolation'
		}
	},

	getDirectiveToken() {
		const regex = this.regex;
		const match = regex.exec(this.source);
		let lastIndex = regex.lastIndex;

		if (match === null) {
			return null;
		}

		let { '0': str, index } = match;

		// Some hackery because matching brackets with balance is
		// a really difficult thing to do.
		if (str[0] === '@' && str[str.length -1] === '(') {
			// Since we are matching from the opening bracket position,
			// we need to do add 1
			let lastParenIndex = getMatchingParen(lastIndex - 1, this);

			if (lastParenIndex === -1) {
				this.error('Unclosed directive arguments', { line: this.line });
			}

			lastParenIndex = lastParenIndex + 1;

			str = this.source.substring(index, lastParenIndex);
			this.position = lastIndex = lastParenIndex;
		}

		const line = this.line;
		this.position = (lastIndex === 0) ? this.inputLength : lastIndex;

		return {
			type:  this.getType(str, match),
			value: str,
			line:  line,
			start: lastIndex - str.length,
			end:   lastIndex,
		};
	},

	getLastTextToken() {
		const position = this.position;

		if (position < this.inputLength) {
			const str = this.source.substring(position, this.inputLength);
			this.line = this.line + count(str, '\n');
			const end = str.length + position;;
			this.position = end;

			return {
				value: str,
				line:  this.line,
				type: 'text',
				start: position,
				end:   end,
			};
		}

		return null;
	},

	/**
	 * Returns a token from the input or `null` if no tokens can be found.
	 *
	 * @return {Object|null}
	 */

	lex() {
		const { position, line } = this;

		if (this.directiveStash.length) {
			const token = this.directiveStash.shift();
			token.line = line;
			return token;
		} else if (this.position >= this.inputLength) {
			return null;
		}

		let token = this.getDirectiveToken();

		if ( ! token) {
			return this.getLastTextToken();
		}

		// Checks to see if there is a string token betwixt the previous and
		// current regex match.
		const difference = this.position - token.value.length - position;

		if (difference > 0) {
			const end = this.position - token.value.length;

			if (position === end) {
				return token;
			}

			const str = this.source.substring(position, end);
			this.line = line + count(str, '\n');
			this.directiveStash.push(token);

			token = {
				value: str,
				type: 'text',
				line: line,
				start: position,
				end: this.position - token.value.length,
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

	nextToken() {
		let token;

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

	lookahead(index) {
		const { stash } = this;
		let times = index - stash.length;

		if (index < 0) {
			this.error('Lookahead index can not be less than 0');
			throw err;
		}

		if (stash[index - 1] !== undefined) {
			return stash[index - 1];
		}

		while (times-- > 0) {
			const token = this.lex();

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

	peek() {
		return this.lookahead(1);
	},

	/**
	 * The iterator is complete when there are no more tokens to be consumed.
	 *
	 * @return {Object}
	 */

	next() {
		const token = this.nextToken();
		const hasToken = token !== null;

		return {
			done: ! hasToken,
			value: hasToken ? token : undefined
		}
	},

	/**
	 * Throws an error with the message passed.
	 *
	 * @param {String} message
	 */

	error(message, { line }={}) {
		const err = createSourceError({
			name: 'LexerError',
			message,
			line,
			source: this.source,
		});
		throw err;
	},

};

if (typeof Symbol !== 'undefined') {
	LexerPrototype[Symbol.iterator] = function () {
		return this;
	};
}

module.exports = Lexer;
