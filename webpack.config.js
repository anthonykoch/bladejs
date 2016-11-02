'use strict';

const webpack = require('webpack');
const path    = require('path');

var vendors = {
	'path':                 'path',
	'blade-expression':     'blade-expression',
	'object-assign':        'object-assign',
	'pad-start':            'pad-start',
	'escape-string-regexp': 'escape-string-regexp',
};

const config = module.exports = {
	entry: {
		'app': './lib/index.js',
	},
	resolve: {
		alias: {}
	},
	output:
	{
		path: './dist',
		libraryTarget: 'umd',
		filename: 'blade.js',
	},
	module:
	{
		noParse: [],
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			}
		],
	},
	plugins: [
		new webpack.optimize.DedupePlugin(),
	],
	node: {
		fs: "empty",
		process: "empty"
	}
};

for (var name in vendors) {
	var file = vendors[name];
	config.resolve.alias[name] = file;
	config.module.noParse.push(new RegExp('^' + name + '$'));
}
