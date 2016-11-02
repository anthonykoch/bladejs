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
		'vendor.js': []
	},
	resolve: {
		alias: {}
	},
	output:
	{
		path: './build',
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
		new webpack.optimize.CommonsChunkPlugin('vendor.js', 'vendor.js'),
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
	config.entry['vendor.js'].push(name);
}
