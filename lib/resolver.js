'use strict';

// module.exports = Resolver;

const fs = require('fs');

const Resolver = {

	create() {
		return Object.create(ResolverPrototype).init();
	}

};

const ResolverPrototype = {

	init(options={}) {
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

	getFile(filename, useCache) {
		if (fs == null) {
			const err = new Error(`File system unavailable`);
			throw err;
		}

		if (useCache && this.cache && this.cache.enabled) {
			throw 'caching not set up';

			if (this.cache.has(filename)) {
				return this.cache.get(filename);
			}
		}

		const contents = fs.readFileSync(filename, 'utf8');

		const file = {
			path: filename,
			contents
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

	resolveFiles(dependencies, options) {
		const files = [];

		for (let i = 0; i < dependencies.length; i++) {
			files.push(this.getFile(dependencies[i].path, options.cache));
		}

		return files;
	}

};

module.exports = Resolver;
