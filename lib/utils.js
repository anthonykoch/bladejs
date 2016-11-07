'use strict';

module.exports = {
	createSourceError: require('blade-expression/utils').createSourceError,
	count,
	variable,
	replaceString,
	getMatchingParen,
	unwrapString,
	error,
	toViewPath,
	viewPathToFile,
	simpleStartsWith,
};

const path = require('path');

const repeatString = require('repeat-string');

const ERROR_LINE_START = '> ';
const ASCII_A = 97;

/**
 * Counts the number of occurences of a string.
 *
 * @param {String} str The string to count the occurrences.
 */

function count(str, substr) {
  let index = str.indexOf(substr);
  let count = 0;

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
	let i = Math.max(index, 0);
	const repeat = Math.floor(i / 26);
	const letter =
		repeatString(
				String.fromCodePoint(ASCII_A + i++ % 26),
				repeat + 1
			);


	return `$__${letter}`;
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

function getMatchingParen(position=0, { source }) {
	const length = source.length;
	let stack = 0;
	let char;

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
	const err = new Error(message);

	if (name != null) {
		err.name = name;
	}

	throw err;
}

function simpleStartsWith(str, search) {
	return str.substring(0, search.length) === search;
}

function isNotAbsolute(name, path) {
	error(`${name} is not an absolute path '${path}'`);
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
	if (typeof filename !== 'string' || ! path.isAbsolute(filename)) {
		isNotAbsolute('Path', filename);
	} else if ( ! path.extname(filename)) {
		error(`Path should have an extension '${filename}'`);
	} else if (typeof baseDir !== 'string' || ! path.isAbsolute(baseDir)) {
		isNotAbsolute('baseDir', baseDir);
	} else if (path.extname(baseDir)) {
		error(`baseDir is not a valid directory ${baseDir}`)
	}

	const name = path.basename(filename, path.extname(filename));
	let dir = path.dirname(filename);

	let index = 0;

	dir = dir.replace(/\\/g, '/');
	baseDir = baseDir.replace(/\\/g, '/');

	const relative = path
		.relative(baseDir, dir)
		.replace(/\\/g, '/')
		.toLowerCase();

	const parts = path
		.join(relative, name)
		.replace(/\\/g, '/')
		.split('/')

	for (let i = 0; i < parts.length; i++) {
		index = i;

		if (parts[0][0] !== '.') {
			break;
		}
	}

	const viewPath =
		parts[0][0] === '.'
			? parts.slice(0, index).join('/') + '/' + parts.slice(index).join('.')
			: parts.join('.')

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
		error(`Path is not a string '${viewPath}'`);
	} else if (viewPath === '') {
		error(`Path can not be zero-length '${viewPath}'`);
	} else if (typeof baseDir !== 'string' || ! path.isAbsolute(baseDir)) {
		isNotAbsolute('baseDir', baseDir);
	} else if (path.extname(baseDir)) {
		error(`baseDir is not a valid directory '${baseDir}'`);
	}

	viewPath = viewPath
		.replace(/\.blade$/, '')
		.replace(/([^.])\.([^.])/g, '$1/$2');

	if (path.isAbsolute(viewPath)) {
		baseDir = '';
	}

	const filePath = path
		.join(baseDir, viewPath + '.blade')
		.replace(/\\/g, '/');

	return filePath;
}
