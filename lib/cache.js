'use strict';

// module.exports = Cache;

const Cache = {

	create(options) {
		return Object.create(CachePrototype).init(options);
	},

};

const CachePrototype = {

	init() {
	},

};

module.exports = Cache;
