'use strict';

const path = require('path');
const glob = require('glob');

glob
	.sync('./**/*.spec.js')
	.forEach((file) => {
		require(path.resolve(file));
	});
